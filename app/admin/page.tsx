import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import SourcesList from '../components/SourcesList'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [sources, logs, stats] = await Promise.all([
    prisma.source.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            nabory: true,
            scrapingLogs: true,
          },
        },
      },
    }),
    prisma.scrapingLog.findMany({
      take: 50,
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        source: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.$queryRaw`
      SELECT 
        COUNT(DISTINCT source_id) as sources_scraped,
        COUNT(*) as total_nabory,
        COUNT(CASE WHEN description IS NOT NULL THEN 1 END) as with_description,
        COUNT(CASE WHEN beneficiaries IS NOT NULL THEN 1 END) as with_beneficiaries,
        COUNT(CASE WHEN amount IS NOT NULL OR budget IS NOT NULL THEN 1 END) as with_amounts
      FROM nabory
    ` as any,
  ])

  const statsData = stats[0] || {
    sources_scraped: 0,
    total_nabory: 0,
    with_description: 0,
    with_beneficiaries: 0,
    with_amounts: 0,
  }

  const recentErrors = logs.filter((log) => log.status === 'error')
  const successRate =
    logs.length > 0
      ? ((logs.filter((log) => log.status === 'success').length / logs.length) * 100).toFixed(1)
      : 0

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Panel Administracyjny
            </h1>
            <p className="mt-2 text-gray-600">
              Zarządzanie źródłami i monitorowanie scrapingu
            </p>
          </div>
          <div className="flex gap-4">
            <form action="/api/cron/trigger" method="POST">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ⏰ Uruchom scraping (cron)
              </button>
            </form>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Powrót do strony głównej
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Źródła aktywne</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {sources.filter((s) => s.active).length}
              <span className="text-lg text-gray-500"> / {sources.length}</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Zebrane nabory</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">
              {Number(statsData.total_nabory)}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Jakość danych</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {statsData.total_nabory > 0
                ? (
                    ((Number(statsData.with_description) +
                      Number(statsData.with_beneficiaries) +
                      Number(statsData.with_amounts)) /
                      (Number(statsData.total_nabory) * 3)) *
                    100
                  ).toFixed(0)
                : 0}
              %
            </div>
            <div className="text-xs text-gray-500 mt-1">
              (opis, beneficjenci, kwoty)
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Sukces scrapingu</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {successRate}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ostatnie {logs.length} operacji
            </div>
          </div>
        </div>

        {/* Recent Errors */}
        {recentErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-red-900 mb-4">
              ⚠️ Ostatnie błędy ({recentErrors.length})
            </h2>
            <div className="space-y-2">
              {recentErrors.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="bg-white rounded p-3 text-sm"
                >
                  <div className="font-medium text-gray-900">
                    {log.source?.name}
                  </div>
                  <div className="text-red-600 mt-1">
                    {log.errorMessage}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    {new Date(log.timestamp).toLocaleString('pl-PL')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sources List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Źródła danych ({sources.length})
            </h2>
          </div>
          <SourcesList sources={sources} />
        </div>

        {/* Recent Logs */}
        <div className="bg-white rounded-lg shadow mt-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Historia scrapingu (ostatnie 50)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Czas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Źródło
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Znaleziono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Błąd
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString('pl-PL')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.source?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {log.status === 'success' ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          ✓ Sukces
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          ✗ Błąd
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.itemsFound}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600 max-w-md truncate">
                      {log.errorMessage || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}