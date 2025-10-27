import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { AiScraper } from '@/lib/scrapers/AiScraper'
import { generateNaborHash } from '@/lib/utils/hash'

export async function scrapeBatch(batchNumber: number, skip: number, take: number) {
  console.log(`⏰ Batch ${batchNumber} started: skip=${skip}, take=${take}`)
  console.log(`📅 Timestamp: ${new Date().toISOString()}`)

  try {
    const sources = await prisma.source.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      skip,
      take,
    })

    console.log(`📊 Processing ${sources.length} sources in batch ${batchNumber}`)

    const results = []

    for (const source of sources) {
      try {
        console.log(`🔍 [Batch ${batchNumber}] Scraping: ${source.name}`)

        const scraper = new AiScraper(source.url, source.id)
        const result = await scraper.scrape()

        if (!result.success) {
          console.log(`❌ [Batch ${batchNumber}] Failed: ${source.name}`)
          
          await prisma.scrapingLog.create({
            data: {
              sourceId: source.id,
              status: 'error',
              errorMessage: result.error || 'Unknown error',
              itemsFound: 0,
            },
          })

          results.push({
            source: source.name,
            success: false,
            error: result.error,
          })
          continue
        }

        let newCount = 0
        let duplicateCount = 0

        for (const nabor of result.data) {
          const hash = generateNaborHash(
            nabor.title,
            nabor.institution,
            nabor.dateFrom,
            nabor.dateTo
          )

          try {
            await prisma.nabor.create({
              data: {
                sourceId: source.id,
                title: nabor.title,
                institution: nabor.institution,
                description: nabor.description,
                beneficiaries: nabor.beneficiaries,
                dateFrom: nabor.dateFrom,
                dateTo: nabor.dateTo,
                deadline: nabor.deadline,
                amount: nabor.amount,
                budget: nabor.budget,
                type: nabor.type,
                link: nabor.link,
                contentHash: hash,
              },
            })
            newCount++
          } catch (error: any) {
            if (error.code === 'P2002') {
              duplicateCount++
            }
          }
        }

        await prisma.source.update({
          where: { id: source.id },
          data: { lastScraped: new Date() },
        })

        await prisma.scrapingLog.create({
          data: {
            sourceId: source.id,
            status: 'success',
            itemsFound: result.data.length,
          },
        })

        console.log(
          `✅ [Batch ${batchNumber}] ${source.name}: ${result.data.length} found, ${newCount} new, ${duplicateCount} duplicates`
        )

        results.push({
          source: source.name,
          success: true,
          itemsFound: result.data.length,
          newItems: newCount,
          duplicates: duplicateCount,
        })

        // Delay 2 seconds between sources
        await new Promise((resolve) => setTimeout(resolve, 2000))
      } catch (error) {
        console.error(`❌ [Batch ${batchNumber}] Error scraping ${source.name}:`, error)
        results.push({
          source: source.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    console.log(`✅ Batch ${batchNumber} completed`)
    console.log(`   Processed: ${sources.length} sources`)
    console.log(`   Successful: ${results.filter((r) => r.success).length}`)
    console.log(`   Failed: ${results.filter((r) => !r.success).length}`)

    return NextResponse.json({
      success: true,
      batch: batchNumber,
      timestamp: new Date().toISOString(),
      processed: sources.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    })
  } catch (error) {
    console.error(`❌ Batch ${batchNumber} failed:`, error)
    return NextResponse.json(
      {
        success: false,
        batch: batchNumber,
        error: 'Batch scraping failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}