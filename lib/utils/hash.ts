import crypto from 'crypto'

export function generateNaborHash(
  title: string,
  institution: string | null,
  dateFrom: Date | null,
  dateTo: Date | null
): string {
  const content = [
    title.toLowerCase().trim(),
    (institution || 'unknown').toLowerCase().trim(),
    dateFrom?.toISOString() || '',
    dateTo?.toISOString() || '',
  ].join('|')

  return crypto.createHash('sha256').update(content).digest('hex')
}