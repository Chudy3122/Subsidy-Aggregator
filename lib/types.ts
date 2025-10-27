export interface ScrapedNabor {
  title: string
  institution: string
  description?: string | null
  beneficiaries?: string | null
  dateFrom: Date | null
  dateTo: Date | null
  deadline?: Date | null
  amount: string | null
  budget?: string | null
  type: string | null
  link: string | null
}

export interface ScraperResult {
  success: boolean
  data: ScrapedNabor[]
  error?: string
}

export interface BaseScraper {
  scrape(): Promise<ScraperResult>
}