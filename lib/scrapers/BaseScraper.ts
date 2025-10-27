import axios from 'axios'
import * as cheerio from 'cheerio'
import { ScraperResult, ScrapedNabor } from '../types'

export abstract class BaseScraper {
  protected url: string
  protected sourceId: string

  constructor(url: string, sourceId: string) {
    this.url = url
    this.sourceId = sourceId
  }

  protected async fetchHTML(): Promise<cheerio.Root | null> {
    try {
      const https = require('https')
      
      // Lista domen z problematycznymi certyfikatami
      const problematicDomains = [
        'funduszeue.wzp.pl',
        'funduszeueswietokrzyskie.pl'
      ]
      
      const needsSSLFix = problematicDomains.some(domain => this.url.includes(domain))
      
      const config: any = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 15000,
      }
      
      // Tylko dla problematycznych domen wyłącz weryfikację SSL
      if (needsSSLFix) {
        config.httpsAgent = new https.Agent({
          rejectUnauthorized: false,
        })
      }
      
      const response = await axios.get(this.url, config)
      return cheerio.load(response.data)
    } catch (error) {
      console.error(`Error fetching ${this.url}:`, error)
      return null
    }
  }

  protected parseDate(dateString: string): Date | null {
    try {
      // Format: YYYY-MM-DD or DD-MM-YYYY or DD.MM.YYYY
      const patterns = [
        /(\d{4})-(\d{2})-(\d{2})/,  // YYYY-MM-DD
        /(\d{2})-(\d{2})-(\d{4})/,  // DD-MM-YYYY
        /(\d{2})\.(\d{2})\.(\d{4})/, // DD.MM.YYYY
      ]

      for (const pattern of patterns) {
        const match = dateString.match(pattern)
        if (match) {
          if (pattern === patterns[0]) {
            // YYYY-MM-DD
            return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]))
          } else {
            // DD-MM-YYYY or DD.MM.YYYY
            return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]))
          }
        }
      }
      return null
    } catch {
      return null
    }
  }

  protected cleanAmount(amount: string): string {
    // Clean amount string (remove spaces, normalize)
    return amount.trim().replace(/\s+/g, ' ')
  }

  abstract parse($: cheerio.Root): ScrapedNabor[]

  async scrape(): Promise<ScraperResult> {
    try {
      const $ = await this.fetchHTML()
      if (!$) {
        return {
          success: false,
          data: [],
          error: 'Failed to fetch HTML',
        }
      }

      const data = this.parse($)
      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}