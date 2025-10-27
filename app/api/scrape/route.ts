import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { AiScraper } from '@/lib/scrapers/AiScraper'
import { generateNaborHash } from '@/lib/utils/hash'

// Helper function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

console.log('🔧 Scrape API loaded')
console.log('🔑 OpenAI API Key present:', !!process.env.OPENAI_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sourceId } = body

    if (!sourceId) {
      return NextResponse.json(
        { error: 'sourceId is required' },
        { status: 400 }
      )
    }

    const source = await prisma.source.findUnique({
      where: { id: sourceId },
    })

    if (!source) {
      return NextResponse.json(
        { error: 'Source not found' },
        { status: 404 }
      )
    }

    if (!source.active) {
      return NextResponse.json(
        { error: 'Source is not active' },
        { status: 400 }
      )
    }

    // Use AI scraper for all sources
    const scraper = new AiScraper(source.url, source.id)
    const result = await scraper.scrape()

    if (!result.success) {
      await prisma.scrapingLog.create({
        data: {
          sourceId: source.id,
          status: 'error',
          errorMessage: result.error || 'Unknown error',
          itemsFound: 0,
        },
      })

      return NextResponse.json(
        { error: result.error, itemsFound: 0 },
        { status: 500 }
      )
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
        } else {
          console.error('Error saving nabor:', error)
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

    return NextResponse.json({
      success: true,
      source: source.name,
      itemsFound: result.data.length,
      newItems: newCount,
      duplicates: duplicateCount,
    })
  } catch (error) {
    console.error('Scraping error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - scrape all active sources with rate limiting
export async function GET() {
  try {
    console.log('\n\n🎯 ========== NEW SCRAPING REQUEST ==========')
    console.log('⏰ Timestamp:', new Date().toISOString())
    const sources = await prisma.source.findMany({
      where: { active: true },
    })

    const results = []
    let processedCount = 0

    for (const source of sources) {
      // Rate limiting: 2 second delay between requests
      if (processedCount > 0) {
        await delay(2000)
      }

      const scraper = new AiScraper(source.url, source.id)
      const result = await scraper.scrape()

      if (!result.success) {
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
        processedCount++
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

      results.push({
        source: source.name,
        success: true,
        itemsFound: result.data.length,
        newItems: newCount,
        duplicates: duplicateCount,
      })

      processedCount++
    }

    return NextResponse.json({
      success: true,
      totalSources: sources.length,
      processed: processedCount,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Batch scraping error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}