'use client'

import { useMemo, useState } from 'react'

type Nabor = {
  id: string
  title: string
  institution: string
  description: string | null
  beneficiaries: string | null
  dateFrom: Date | string | null
  dateTo: Date | string | null
  deadline: Date | string | null
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

function formatPLDate(d: Date | string | null | undefined) {
  if (!d) return '—'
  const date = d instanceof Date ? d : new Date(d)
  if (isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('pl-PL').format(date)
}

export default function NaboryTable({ nabory }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [regionFilter, setRegionFilter] = useState('all')
  const [beneficiaryFilter, setBeneficiaryFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date')

  // unikalne województwa (posortowane)
  const regions = useMemo(() => {
    const unique = new Set(
      nabory
        .map((n) => n.source?.region)
        .filter((r): r is string => Boolean(r))
    )
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'pl'))
  }, [nabory])

  const filteredNabory = useMemo(() => {
    // nigdy nie mutujemy propsów — zaczynamy od kopii
    let filtered = [...nabory]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter((n) => {
        const inTitle = n.title?.toLowerCase().includes(q)
        const inInst = n.institution?.toLowerCase().includes(q)
        const inDesc = n.description?.toLowerCase().includes(q)
        const inBen = n.beneficiaries?.toLowerCase().includes(q)
        return inTitle || inInst || inDesc || inBen
      })
    }

    if (regionFilter !== 'all') {
      filtered = filtered.filter((n) => n.source?.region === regionFilter)
    }

    if (beneficiaryFilter !== 'all') {
      const ben = beneficiaryFilter.toLowerCase()
      filtered = filtered.filter((n) =>
        n.beneficiaries?.toLowerCase().includes(ben)
      )
    }

    if (sortBy === 'date') {
      filtered.sort((a, b) => {
        const da =
          (a.deadline && new Date(a.deadline).getTime()) ||
          (a.dateTo && new Date(a.dateTo).getTime()) ||
          0
        const db =
          (b.deadline && new Date(b.deadline).getTime()) ||
          (b.dateTo && new Date(b.dateTo).getTime()) ||
          0
        return db - da
      })
    } else {
      filtered.sort((a, b) => a.title.localeCompare(b.title, 'pl'))
    }

    return filtered
  }, [nabory, searchQuery, regionFilter, beneficiaryFilter, sortBy])

  return (
    <div>
      {/* Filters Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#8BBE3F] to-[#6FA832] rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Filtry wyszukiwania</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔍 Szukaj
            </label>
            <input
              type="text"
              placeholder="Wpisz nazwę, opis, instytucję..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8BBE3F] focus:border-transparent transition-all"
            />
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📍 Województwo
            </label>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8BBE3F] focus:border-transparent transition-all"
            >
              <option value="all">Wszystkie</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* Beneficiary */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              👥 Dla kogo
            </label>
            <select
              value={beneficiaryFilter}
              onChange={(e) => setBeneficiaryFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8BBE3F] focus:border-transparent transition-all"
            >
              <option value="all">Wszyscy</option>
              <option value="mśp">MŚP</option>
              <option value="ngo">NGO</option>
              <option value="jst">JST</option>
              <option value="osoby">Osoby fizyczne</option>
            </select>
          </div>
        </div>

        {/* Results counter */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Znaleziono: <span className="font-bold text-[#8BBE3F] text-lg">{filteredNabory.length}</span> z {nabory.length} naborów
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8BBE3F] focus:border-transparent text-sm"
          >
            <option value="date">📅 Sortuj: Po dacie</option>
            <option value="title">🔤 Sortuj: Po nazwie</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Nazwa naboru
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Instytucja
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Dla kogo
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Termin
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Kwota
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Budżet
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Źródło
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Link
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredNabory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-500 text-lg">Brak naborów spełniających kryteria wyszukiwania</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredNabory.map((nabor) => (
                  <tr key={nabor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm">
                      <div className="font-semibold text-gray-900">{nabor.title}</div>
                      {nabor.description && (
                        <div className="text-xs text-gray-500 mt-1 max-w-md">
                          {nabor.description.length > 100
                            ? nabor.description.substring(0, 100) + '...'
                            : nabor.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {nabor.institution || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {nabor.beneficiaries ? (
                        <span className="px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-700 font-medium">
                          {nabor.beneficiaries}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                      {formatPLDate(nabor.deadline) !== '—'
                        ? formatPLDate(nabor.deadline)
                        : formatPLDate(nabor.dateTo)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      {nabor.amount || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {nabor.budget || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex px-3 py-1 text-xs rounded-full bg-gradient-to-r from-[#8BBE3F] to-[#6FA832] text-white font-medium">
                        {nabor.source?.region ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {nabor.link ? (
                        <a
                          href={nabor.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#8BBE3F] hover:text-[#6FA832] font-medium transition-colors"
                          aria-label={`Otwórz szczegóły naboru: ${nabor.title}`}
                        >
                          Otwórz
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
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
