import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import NaboryTable from './components/NaboryTable'

export const dynamic = 'force-dynamic'

type SafeNabor = {
  id: string
  title: string
  institution: string
  description: string | null
  beneficiaries: string | null
  dateFrom: string | null
  dateTo: string | null
  deadline: string | null
  amount: string | null
  budget: string | null
  type: string | null
  link: string | null
  source: {
    name: string
    region: string
  } | null
}

export default async function Home() {
  const [naboryRaw, stats, totalSources] = await Promise.all([
    prisma.nabor.findMany({
      include: {
        source: {
          select: { name: true, region: true },
        },
      },
      orderBy: { scrapedAt: 'desc' },
    }),
    prisma.nabor.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.source.count({
      where: { active: true },
    }),
  ])

  // Ujednolicenie dat do stringów – bezpieczne przejście do Client Component
  const nabory: SafeNabor[] = naboryRaw.map((n) => ({
    ...n,
    dateFrom: n.dateFrom ? new Date(n.dateFrom).toISOString() : null,
    dateTo: n.dateTo ? new Date(n.dateTo).toISOString() : null,
    deadline: n.deadline ? new Date(n.deadline).toISOString() : null,
    // Prisma potrafi zwrócić null dla relacji – zostawiamy jak jest
    source: n.source
      ? {
          name: n.source.name,
          region: n.source.region,
        }
      : null,
  }))

  const totalNabory =
    stats.reduce((acc, s) => acc + (s._count?._all ?? 0), 0) || nabory.length

  const activeCount =
    stats.find((s) => s.status === 'active')?._count?._all ?? 0

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agregator Dofinansowań</h1>
          <p className="mt-2 text-gray-600">Automatyczne zbieranie informacji o naborach i projektach</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Wszystkie nabory</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{totalNabory}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Aktywne</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{activeCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Źródła</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{totalSources}</div>
          </div>
        </div>

        <div className="mb-6 flex gap-4">
          {/* Uwaga: to zrobi GET do endpointu API (pokaże JSON). Jeśli chcesz "wywołać joba",
              lepsze jest fetch POST z akcji serwerowej lub przycisk w komponencie klienta. */}
          <Link
            href="/api/scrape"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            aria-label="Uruchom scraping wszystkich źródeł"
          >
            Uruchom scraping
          </Link>
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            aria-label="Przejdź do panelu administracyjnego"
          >
            Panel administracyjny
          </Link>
        </div>

        <NaboryTable nabory={nabory} />
      </div>
    </main>
  )
}
