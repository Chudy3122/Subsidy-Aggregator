import { BaseScraper } from './BaseScraper'
import { ScrapedNabor } from '../types'
import * as cheerio from 'cheerio'
import { extractNaboryFromHTML } from '../utils/openai'

export class AiScraper extends BaseScraper {
  async scrape() {
    try {
      console.log('\n🚀 Starting AiScraper for:', this.url)
      
      const $ = await this.fetchHTML()
      if (!$) {
        console.log('❌ Failed to fetch HTML')
        return {
          success: false,
          data: [],
          error: 'Failed to fetch HTML',
        }
      }

      console.log('✅ HTML fetched successfully')

      // Get clean HTML without scripts and styles
      $('script').remove()
      $('style').remove()
      $('noscript').remove()
      
      const html = $.html()
      console.log('📄 Cleaned HTML length:', html.length, 'characters')
      
      // Check for common indicators
      const bodyText = $('body').text()
      console.log('📝 Body text length:', bodyText.length, 'characters')
      console.log('🔍 Contains "nabór":', bodyText.includes('nabór'))
      console.log('🔍 Contains "konkurs":', bodyText.includes('konkurs'))
      console.log('🔍 Contains "dofinansowanie":', bodyText.includes('dofinansowanie'))

      // Use AI to extract nabory
      const extracted = await extractNaboryFromHTML(html, this.url)
      
      console.log('✅ AI extraction complete, found:', extracted.length, 'items')

      // Convert to ScrapedNabor format
      const nabory: ScrapedNabor[] = extracted.map((item) => {
        const converted = {
          title: item.title,
          institution: item.institution,
          description: item.description,
          beneficiaries: item.beneficiaries,
          dateFrom: item.dateFrom ? this.parseDate(item.dateFrom) : null,
          dateTo: item.dateTo ? this.parseDate(item.dateTo) : null,
          deadline: item.deadline ? this.parseDate(item.deadline) : null,
          amount: item.amount,
          budget: item.budget,
          type: item.type,
          link: item.link,
        }
        
        console.log('📦 Converted nabor:', {
          title: converted.title.substring(0, 50) + '...',
          hasDescription: !!converted.description,
          hasBeneficiaries: !!converted.beneficiaries,
          hasDateFrom: !!converted.dateFrom,
          hasDateTo: !!converted.dateTo,
          hasDeadline: !!converted.deadline,
          hasAmount: !!converted.amount,
          hasBudget: !!converted.budget,
          hasLink: !!converted.link,
        })
        
        return converted
      })

      console.log('✅ Scraping completed successfully\n')

      return {
        success: true,
        data: nabory,
      }
    } catch (error) {
      console.error('❌ AiScraper error:', error)
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  parse($: cheerio.Root): ScrapedNabor[] {
    // Not used in AI scraper, but required by BaseScraper
    return []
  }
}