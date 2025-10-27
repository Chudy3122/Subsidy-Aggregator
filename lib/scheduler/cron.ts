import cron from 'node-cron'
import { prisma } from '@/lib/db/prisma'
import { AiScraper } from '@/lib/scrapers/AiScraper'
import { generateNaborHash } from '@/lib/utils/hash'

let isRunning = false

export function startScheduler() {
  console.log('📅 Scheduler initialized')

  // Scraping w każdy poniedziałek o 00:00
  cron.schedule('0 0 * * 1', async () => {
    console.log('⏰ Scheduled scraping started at:', new Date().toISOString())
    await runScheduledScraping()
  })

  // Opcjonalnie: testowy cron co 5 minut (zakomentowany)
  // cron.schedule('*/5 * * * *', async () => {
  //   console.log('⏰ Test scraping started at:', new Date().toISOString())
  //   await runScheduledScraping()
  // })

  console.log('✅ Cron jobs scheduled:')
  console.log('   - Weekly scraping: Mondays at 00:00')
}

async function runScheduledScraping() {
  if (isRunning) {
    console.log('⚠️  Scraping already in progress, skipping...')
    return
  }

  isRunning = true
  console.log('🚀 Starting scheduled scraping for all sources...')

  try {
    const sources = await prisma.source.findMany({
      where: { active: true },
    })

    console.log(`📊 Found ${sources.length} active sources`)

    let totalNew = 0
    let totalDuplicates = 0
    let totalErrors = 0

    for (const source of sources) {
      try {
        console.log(`\n🔍 Scraping: ${source.name}`)

        const scraper = new AiScraper(source.url, source.id)
        const result = await scraper.scrape()

        if (!result.success) {
          console.log(`❌ Failed: ${source.name} - ${result.error}`)
          totalErrors++

          await prisma.scrapingLog.create({
            data: {
              sourceId: source.id,
              status: 'error',
              errorMessage: result.error || 'Unknown error',
              itemsFound: 0,
            },
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
          `✅ ${source.name}: ${result.data.length} found, ${newCount} new, ${duplicateCount} duplicates`
        )

        totalNew += newCount
        totalDuplicates += duplicateCount

        // Delay 2 seconds between sources to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000))
      } catch (error) {
        console.error(`❌ Error scraping ${source.name}:`, error)
        totalErrors++
      }
    }

    console.log('\n📊 Scheduled scraping completed!')
    console.log(`   Total new: ${totalNew}`)
    console.log(`   Total duplicates: ${totalDuplicates}`)
    console.log(`   Total errors: ${totalErrors}`)
  } catch (error) {
    console.error('❌ Scheduled scraping failed:', error)
  } finally {
    isRunning = false
  }
}

// Export function to manually trigger scraping (for testing)
export async function triggerManualScraping() {
  console.log('🔧 Manual scraping triggered')
  await runScheduledScraping()
}