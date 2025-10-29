import crypto from 'crypto'

export function generateNaborHash(
  title: string,
  institution: string,
  dateFrom: Date | string | null,
  dateTo: Date | string | null
): string {
  // Normalizuj dane
  const normalizedTitle = title.trim().toLowerCase().replace(/\s+/g, ' ')
  const normalizedInstitution = institution?.trim().toLowerCase().replace(/\s+/g, ' ') || ''
  
  // Konwertuj daty na stringi
  const dateFromStr = dateFrom ? new Date(dateFrom).toISOString() : ''
  const dateToStr = dateTo ? new Date(dateTo).toISOString() : ''
  
  const data = `${normalizedTitle}|${normalizedInstitution}|${dateFromStr}|${dateToStr}`
  
  return crypto.createHash('sha256').update(data).digest('hex')
}