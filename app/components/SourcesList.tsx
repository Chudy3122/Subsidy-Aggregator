'use client'

import { useState } from 'react'

type Source = {
  id: string
  name: string
  type: string
  region: string
  url: string
  active: boolean
  lastScraped: Date | null
  _count: {
    nabory: number
    scrapingLogs: number
  }
}

type Props = {
  sources: Source[]
}

export default function SourcesList({ sources }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleScrape = async (sourceId: string, sourceName: string) => {
    if (!confirm(`Uruchomić scraping dla: ${sourceName}?`)) return

    setLoading(sourceId)
    setMessage(null)

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({
          type: 'success',
          text: `✓ Znaleziono ${data.itemsFound} naborów (${data.newItems} nowych, ${data.duplicates} duplikatów)`,
        })
        setTimeout(() => window.location.reload(), 2000)
      } else {
        setMessage({
          type: 'error',
          text: `✗ Błąd: ${data.error}`,
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `✗ Błąd połączenia: ${error}`,
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      {message && (
        <div
          className={`mx-6 mt-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nazwa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Region
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Typ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nabory
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ostatni scraping
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sources.map((source) => (
              <tr key={source.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">
                  <div className="font-medium text-gray-900">{source.name}</div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">
                    {source.url}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {source.region}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {source.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {source._count.nabory}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {source.lastScraped
                    ? new Date(source.lastScraped).toLocaleString('pl-PL')
                    : 'Nigdy'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {source.active ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      ✓ Aktywne
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                      ✗ Nieaktywne
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleScrape(source.id, source.name)}
                    disabled={loading === source.id}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-xs"
                  >
                    {loading === source.id ? '⏳ Scraping...' : '▶️ Uruchom'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}