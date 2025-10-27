import { BaseScraper } from './BaseScraper'
import { ScrapedNabor } from '../types'
import * as cheerio from 'cheerio'

export class FemMazowieckieScraper extends BaseScraper {
  parse($: cheerio.CheerioAPI): ScrapedNabor[] {
    const nabory: ScrapedNabor[] = []

    // TODO: To będzie dostosowane do konkretnej struktury strony FEM Mazowsze
    // Na razie przykładowa implementacja
    
    // Przykład: szukamy tabeli z naborami
    $('table tbody tr').each((_, element) => {
      const $row = $(element)
      const cells = $row.find('td')

      if (cells.length >= 4) {
        const title = $(cells[0]).text().trim()
        const institution = $(cells[1]).text().trim()
        const dateFromStr = $(cells[2]).text().trim()
        const dateToStr = $(cells[3]).text().trim()
        const amount = cells.length > 4 ? $(cells[4]).text().trim() : null
        const link = $row.find('a').attr('href') || null

        if (title) {
          nabory.push({
            title,
            institution,
            dateFrom: this.parseDate(dateFromStr),
            dateTo: this.parseDate(dateToStr),
            amount: amount ? this.cleanAmount(amount) : null,
            type: null, // będziemy wyciągać z treści jeśli dostępne
            link: link ? new URL(link, this.url).href : null,
          })
        }
      }
    })

    return nabory
  }
}