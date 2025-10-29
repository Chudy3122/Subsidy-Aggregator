import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function POST() {
  try {
    console.log('🧹 Starting deduplication...')

    // Znajdź wszystkie nabory
    const allNabory = await prisma.nabor.findMany({
      orderBy: { scrapedAt: 'desc' }, // Najnowsze pierwsze
    })

    console.log(`📊 Total nabory in database: ${allNabory.length}`)

    // Grupuj po contentHash
    const hashMap = new Map<string, string[]>()

    for (const nabor of allNabory) {
      if (!nabor.contentHash) continue

      if (!hashMap.has(nabor.contentHash)) {
        hashMap.set(nabor.contentHash, [])
      }
      hashMap.get(nabor.contentHash)!.push(nabor.id)
    }

    // Znajdź duplikaty (więcej niż 1 nabór z tym samym hashem)
    let duplicatesRemoved = 0

    for (const [hash, ids] of hashMap.entries()) {
      if (ids.length > 1) {
        // Zachowaj pierwszy (najnowszy), usuń resztę
        const toDelete = ids.slice(1)

        await prisma.nabor.deleteMany({
          where: {
            id: {
              in: toDelete,
            },
          },
        })

        duplicatesRemoved += toDelete.length
        console.log(`🗑️  Removed ${toDelete.length} duplicates for hash: ${hash.substring(0, 10)}...`)
      }
    }

    const remaining = await prisma.nabor.count()

    console.log('✅ Deduplication completed')
    console.log(`   Removed: ${duplicatesRemoved} duplicates`)
    console.log(`   Remaining: ${remaining} unique nabory`)

    return NextResponse.json({
      success: true,
      duplicatesRemoved,
      remainingNabory: remaining,
    })
  } catch (error) {
    console.error('❌ Deduplication error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}