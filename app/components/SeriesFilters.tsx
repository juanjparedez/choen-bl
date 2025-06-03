'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'
import { useRef } from 'react'


type SortOption = 'newest' | 'oldest' | 'title' | 'year' | 'seasons'


function useClickOutside<T extends HTMLElement>(ref: React.RefObject<T | null>, handler: () => void) {
  useEffect(() => {
    function listener(e: MouseEvent) {
      if (!ref.current || ref.current.contains(e.target as Node)) return
      handler()
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref, handler])
}


interface FilterState {
  search: string
  selectedGenres: string[]
  selectedPlatforms: string[]
  sortBy: SortOption
  pais: string
  tags: string[]
}

interface SeriesFiltersProps {
  genres: Array<{ id: string; nombre: string }>
  platforms: Array<{ id: string; nombre: string }>
  pais: string[]
  tags: string[]
  onFiltersChange: (filters: FilterState) => void
  initialFilters?: Partial<FilterState>
}

/* ───────────────────────────── Helpers ───────────────────────────── */
const useDebounce = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const h = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(h)
  }, [value, delay])
  return debouncedValue
}

/* ─────────────────────────── Component ─────────────────────────── */
export default function SeriesFilters({
  genres,
  platforms,
  pais: countries,
  tags,
  onFiltersChange,
  initialFilters = {}
}: SeriesFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    selectedGenres: [],
    selectedPlatforms: [],
    sortBy: 'newest',
    pais: '',
    tags: [],
    ...initialFilters
  })

  const [showGenres, setShowGenres] = useState(false)
  const [showPlatforms, setShowPlatforms] = useState(false)
  const [showCountries, setShowCountries] = useState(false)
  const [showTags, setShowTags] = useState(false)
  const genreRef = useRef<HTMLDivElement>(null)
  const platformRef = useRef<HTMLDivElement>(null)
  const countryRef = useRef<HTMLDivElement>(null)
  const tagRef = useRef<HTMLDivElement>(null)

  useClickOutside(genreRef, () => setShowGenres(false))
  useClickOutside(platformRef, () => setShowPlatforms(false))
  useClickOutside(countryRef, () => setShowCountries(false))
  useClickOutside(tagRef, () => setShowTags(false))

  const debouncedSearch = useDebounce(filters.search, 300)

  const sortOptions = useMemo(() => [
    { value: 'newest', label: 'Más recientes' },
    { value: 'oldest', label: 'Más antiguos' },
    { value: 'title', label: 'Título A-Z' },
    { value: 'year', label: 'Año' },
    { value: 'seasons', label: 'Temporadas' }
  ] as const, [])

  /* ───────────────────────── Callbacks ───────────────────────── */
  const handleSearchChange = (v: string) =>
    setFilters(prev => ({ ...prev, search: v }))

  const handleSortChange = (v: SortOption) =>
    setFilters(prev => ({ ...prev, sortBy: v }))

  const toggleGenre = (id: string) =>
    setFilters(prev => ({
      ...prev,
      selectedGenres: prev.selectedGenres.includes(id)
        ? prev.selectedGenres.filter(g => g !== id)
        : [...prev.selectedGenres, id]
    }))

  const togglePlatform = (id: string) =>
    setFilters(prev => ({
      ...prev,
      selectedPlatforms: prev.selectedPlatforms.includes(id)
        ? prev.selectedPlatforms.filter(p => p !== id)
        : [...prev.selectedPlatforms, id]
    }))

  const handleCountrySelect = (country: string) => {
    setFilters(prev => ({ ...prev, pais: country }))
    setShowCountries(false)
  }

  const clearFilters = () =>
    setFilters({
      search: '',
      selectedGenres: [],
      selectedPlatforms: [],
      sortBy: 'newest',
      pais: '',
      tags: []
    })

  useEffect(() => {
    onFiltersChange({ ...filters, search: debouncedSearch })
  }, [
    debouncedSearch,
    filters.selectedGenres,
    filters.selectedPlatforms,
    filters.sortBy,
    filters.pais,
    filters.tags,
    onFiltersChange
  ])

  const hasActiveFilters =
    filters.search ||
    filters.selectedGenres.length > 0 ||
    filters.selectedPlatforms.length > 0 ||
    filters.pais ||
    filters.sortBy !== 'newest' ||
    filters.tags.length > 0

  function handleTagSelect(tag: string): void {
    setFilters(prev => ({
      ...prev,
      tags: tag === ''
        ? []
        : prev.tags.includes(tag)
          ? prev.tags.filter(t => t !== tag)
          : [...prev.tags, tag]
    }))
    setShowTags(false)
  }
  return (
    <div className="mb-8 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar series..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm placeholder-slate-500 transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Géneros */}
        <div className="relative" ref={genreRef}>
          <button
            onClick={() => setShowGenres(!showGenres)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Filter className="h-4 w-4" />
            Géneros
            {filters.selectedGenres.length > 0 && (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                {filters.selectedGenres.length}
              </span>
            )}
            <ChevronDown className="h-4 w-4" />
          </button>
          {showGenres && (
            <div className="absolute top-full left-0 z-50 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {genres.map(g => (
                  <label key={g.id} className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={filters.selectedGenres.includes(g.id)}
                      onChange={() => toggleGenre(g.id)}
                      className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {g.nombre}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Plataformas */}
        <div className="relative" ref={platformRef}>
          <button
            onClick={() => setShowPlatforms(!showPlatforms)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Filter className="h-4 w-4" />
            Plataformas
            {filters.selectedPlatforms.length > 0 && (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                {filters.selectedPlatforms.length}
              </span>
            )}
            <ChevronDown className="h-4 w-4" />
          </button>
          {showPlatforms && (
            <div className="absolute top-full left-0 z-50 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {platforms.map(p => (
                  <label key={p.id} className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={filters.selectedPlatforms.includes(p.id)}
                      onChange={() => togglePlatform(p.id)}
                      className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {p.nombre}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Países */}
        <div className="relative" ref={countryRef}>
          <button
            onClick={() => setShowCountries(!showCountries)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Filter className="h-4 w-4" />
            País
            {filters.pais && (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                1
              </span>
            )}
            <ChevronDown className="h-4 w-4" />
          </button>
          {showCountries && (
            <div className="absolute top-full left-0 z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
              <ul className="max-h-48 space-y-1 overflow-y-auto text-sm">
                <li>
                  <button
                    className={`w-full rounded px-2 py-1 text-left ${filters.pais === ''
                      ? 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    onClick={() => handleCountrySelect('')}
                  >
                    Todos
                  </button>
                </li>
                {countries.map(country => (
                  <li key={country}>
                    <button
                      className={`w-full rounded px-2 py-1 text-left ${filters.pais === country
                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                        }`}
                      onClick={() => handleCountrySelect(country)}
                    >
                      {country}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Etiquetas */}
        <div className="relative" ref={tagRef}>
          <button
            onClick={() => setShowTags(!showTags)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Filter className="h-4 w-4" />
            Etiquetas
            {filters.tags.length > 0 && (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                {filters.tags.length}
              </span>
            )}
            <ChevronDown className="h-4 w-4" />
          </button>
          {showTags && (
            <div className="absolute top-full left-0 z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
              <ul className="max-h-48 space-y-1 overflow-y-auto text-sm">
                <li>
                  <button
                    className={`w-full rounded px-2 py-1 text-left ${filters.tags.length === 0
                      ? 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    onClick={() => handleTagSelect('')}
                  >
                    Todos
                  </button>
                </li>
                {tags.map(tag => (
                  <li key={tag}>
                    <button
                      className={`w-full rounded px-2 py-1 text-left ${filters.tags.includes(tag)
                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                        }`}
                      onClick={() => handleTagSelect(tag)}
                    >
                      {tag}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Ordenar */}
        <select
          value={filters.sortBy}
          onChange={(e) => handleSortChange(e.target.value as SortOption)}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          {sortOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Limpiar */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          >
            <X className="h-4 w-4" />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Etiquetas activas */}
      {(filters.selectedGenres.length > 0
        || filters.selectedPlatforms.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {filters.selectedGenres.map(id => {
              const g = genres.find(x => x.id === id)
              return g && (
                <span key={id} className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                  {g.nombre}
                  <button
                    onClick={() => toggleGenre(id)}
                    className="h-4 w-4 rounded-full hover:bg-violet-200 dark:hover:bg-violet-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )
            })}
            {filters.selectedPlatforms.map(id => {
              const p = platforms.find(x => x.id === id)
              return p && (
                <span key={id} className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {p.nombre}
                  <button
                    onClick={() => togglePlatform(id)}
                    className="h-4 w-4 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )
            })}
          </div>
        )}
    </div>
  )
}
