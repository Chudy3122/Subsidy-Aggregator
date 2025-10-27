'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type Nabor = {
  id: string
  title: string
  institution: string
  description: string | null
  beneficiaries: string | null
  // ➜ Daty z serwera w kliencie będą stringami (JSON). Dajemy unię.
  dateFrom: string | Date | null
  dateTo: string | Date | null
  deadline: string | Date | null
  amount: string | null
  budget: string | null
  type: string | null
  link: string | null
  source: {
    name: string
    region: string
  } | null
}

type Props = {
  nabory: Nabor[]
}

export default function NaboryTable({ nabory }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [regionFilter, setRegionFilter] = useState('all')
  const [beneficiaryFilter, setBeneficiaryFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date')

  const toDate = (d: string | Date | null) => (d ? new Date(d) : null)

  // Unikalne regiony (posortowane po PL locale)
  const regions = useMemo(() => {
    const unique = new Set(
      nabory
        .map((n) => n.source?.region)
        .filter((r): r is string => Boolean(r))
    )
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'pl'))
  }, [nabory])

  // Filtrowanie i sortowanie (nie mutujemy propsów!)
  const filteredNabory = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()

    const filtered = nabory.filter((n) => {
      const matchesQuery =
        !query ||
        n.title.toLowerCase().includes(query) ||
        n.institution?.toLowerCase().includes(query) ||
        n.description?.toLowerCase().includes(query) ||
        n.beneficiaries?.toLowerCase().includes(query)

      const matchesRegion =
        regionFilter === 'all' || n.source?.region === regionFilter

      const matchesBeneficiaries =
        beneficiaryFilter === 'all' ||
        n.beneficiaries?.toLowerCase().includes(
          beneficiaryFilter.toLowerCase()
        )

      return matchesQuery && matchesRegion && matchesBeneficiaries
    })

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title, 'pl')
      }
      const dateA = toDate(a.deadline) || toDate(a.dateTo) || new Date(0)
      const dateB = toDate(b.deadline) || toDate(b.dateTo) || new Date(0)
      return dateB.getTime() - dateA.getTime()
    })

    return sorted
  }, [nabory, searchQuery, regionFilter, beneficiaryFilter, sortBy])

  return (
    <div>
      {/* Filtry */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Wyszukiwarka */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Szukaj
            </label>
            <input
              type="text"
              placeholder="Nazwa, opis, instytucja..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtr województwa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Województwo
            </label>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Wszystkie</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* Filtr beneficjentów */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dla kogo
            </label>
            <select
              value={beneficiaryFilter}
              onChange={(e) => setBeneficiaryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Wszyscy</option>
              <option value="mśp">MŚP</option>
              <option value="ngo">NGO</option>
              <option value="jst">JST</option>
              <option value="osoby">Osoby fizyczne</option>
            </select>
          </div>

          {/* Sortowanie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sortuj
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Po dacie</option>
              <option value="title">Po nazwie</option>
            </select>
          </div>
        </div>

        {/* Licznik wyników */}
        <div className="mt-4 text-sm text-gray-600">
          Znaleziono:{' '}
          <span className="font-semibold">{filteredNabory.length}</span> z{' '}
          {nabory.length} naborów
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nazwa naboru
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instytucja
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dla kogo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Termin
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kwota
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budżet
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Źródło
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Link
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredNabory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Brak naborów spełniających kryteria wyszukiwania.
                  </td>
                </tr>
              ) : (
                filteredNabory.map((nabor) => (
                  <tr key={nabor.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">
                        {nabor.title}
                      </div>
                      {nabor.description && (
                        <div className="text-xs text-gray-500 mt-1 max-w-md overflow-hidden text-ellipsis line-clamp-2">
                          {nabor.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {nabor.institution || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {nabor.beneficiaries || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {toDate(nabor.deadline)
                        ? Intl.DateTimeFormat('pl-PL').format(
                            toDate(nabor.deadline)!
                          )
                        : toDate(nabor.dateTo)
                        ? Intl.DateTimeFormat('pl-PL').format(
                            toDate(nabor.dateTo)!
                          )
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {nabor.amount || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {nabor.budget || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <span className="inline-flex px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {nabor.source?.region ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {nabor.link ? (
                        <a
                          href={nabor.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                          aria-label={`Otwórz szczegóły naboru: ${nabor.title}`}
                        >
                          Link
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
