import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import NaboryTable from './components/NaboryTable'
import Header from './components/Header'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [allNabory, stats, totalSources] = await Promise.all([
    prisma.nabor.findMany({
      include: {
        source: {
          select: {
            name: true,
            region: true,
          },
        },
      },
      orderBy: {
        scrapedAt: 'desc',
      },
    }),
    prisma.nabor.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.source.count({
      where: { active: true },
    }),
  ])

  // Deduplikacja - zachowaj tylko unikalne contentHash
  const uniqueNabory = allNabory.reduce((acc, nabor) => {
    const hash = nabor.contentHash || nabor.id
    if (!acc.some((n) => (n.contentHash || n.id) === hash)) {
      acc.push(nabor)
    }
    return acc
  }, [] as typeof allNabory)

  console.log(`📊 Total: ${allNabory.length}, Unique: ${uniqueNabory.length}, Duplicates: ${allNabory.length - uniqueNabory.length}`)

  const totalNabory = stats.reduce((acc, s) => acc + (s._count?._all ?? 0), 0)
  const activeCount =
    stats.find((s) => s.status === 'active')?._count?._all ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Agregator Dofinansowań
          </h1>
          <p className="text-lg text-gray-600">
            Automatyczne zbieranie informacji o naborach i projektach
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
              Unikalne nabory
            </div>
            <div className="text-3xl font-bold text-gray-900">{uniqueNabory.length}</div>
            {allNabory.length !== uniqueNabory.length && (
              <div className="text-xs text-gray-500 mt-1">
                ({allNabory.length - uniqueNabory.length} duplikatów ukrytych)
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
              Nabory aktywne
            </div>
            <div className="text-3xl font-bold text-[#8BBE3F]">{activeCount}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
              Monitorowane źródła
            </div>
            <div className="text-3xl font-bold text-gray-900">{totalSources}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-10 flex gap-4">
          <Link
            href="/api/scrape"
            className="inline-block px-8 py-3 bg-[#8BBE3F] text-white rounded-md hover:bg-[#7AAD35] transition-colors font-medium text-sm uppercase tracking-wide"
            aria-label="Uruchom scraping wszystkich źródeł"
          >
            Uruchom pełny scraping
          </Link>
          
          {allNabory.length !== uniqueNabory.length && (
            <form action="/api/deduplicate" method="POST">
              <button
                type="submit"
                className="px-8 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium text-sm uppercase tracking-wide"
              >
                Usuń {allNabory.length - uniqueNabory.length} duplikatów z bazy
              </button>
            </form>
          )}
        </div>

        {/* Table */}
        <NaboryTable nabory={uniqueNabory} />
      </main>
    </div>
  )
}