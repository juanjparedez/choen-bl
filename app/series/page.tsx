'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import SeriesFilters from '../components/SeriesFilters'
import SmartImage from '../components/SmartImageProps'


type SortOption = 'newest' | 'oldest' | 'title' | 'year' | 'seasons'

interface FilterState {
  search: string
  selectedGenres: string[]
  selectedPlatforms: string[]
  sortBy: SortOption
  pais: string | null
  tags: string[]
}

interface Serie {
  pais: any
  id: string
  titulo: string
  año?: number | null
  temporadas?: number | null
  sinopsis?: string | null
  poster?: string | null
  createdAt: Date
  generos: Array<{ genero: { id: string; nombre: string } }>
  tags: Array<{ tag: { id: string; nombre: string } }>
  actores: Array<{ id: string; nombre: string }>
  plataformas: Array<{ plataforma: { id: string; nombre: string } }>
  _count: { actores: number }
}

export default function SeriesPage() {
  const [series, setSeries] = useState<Serie[]>([])
  const [filteredSeries, setFilteredSeries] = useState<Serie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await fetch('/api/series')
        const data = await response.json()
        setSeries(data)
        setFilteredSeries(data)
      } catch (error) {
        console.error('Error fetching series:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSeries()
  }, [])

  const handleFiltersChange = useCallback((filters: FilterState) => {
    let filtered = [...series]

    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(serie =>
        serie.titulo.toLowerCase().includes(search) ||
        serie.sinopsis?.toLowerCase().includes(search)
      )
    }

    if (filters.selectedGenres.length > 0) {
      filtered = filtered.filter(serie =>
        serie.generos.some(sg => filters.selectedGenres.includes(sg.genero.id))
      )
    }

    if (filters.selectedPlatforms.length > 0) {
      filtered = filtered.filter(serie =>
        serie.plataformas.some(sp => filters.selectedPlatforms.includes(sp.plataforma.id))
      )
    }

    if (filters.pais) {
      filtered = filtered.filter(serie => serie.pais === filters.pais)
    }

    const sortFunctions = {
      newest: (a: Serie, b: Serie) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      oldest: (a: Serie, b: Serie) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      title: (a: Serie, b: Serie) => a.titulo.localeCompare(b.titulo),
      year: (a: Serie, b: Serie) => (b.año || 0) - (a.año || 0),
      seasons: (a: Serie, b: Serie) => (b.temporadas || 0) - (a.temporadas || 0)
    }

    filtered.sort(sortFunctions[filters.sortBy])
    setFilteredSeries(filtered)
  }, [series])

  const fallbackPoster = (title: string) =>
    `https://placehold.co/600x900/E0E7FF/4338CA?text=${encodeURIComponent(title)}`

  // Extract unique genres and platforms
  const uniqueGenres = Array.from(
    new Map(
      series.flatMap(s => s.generos.map(sg => sg.genero))
        .map(g => [g.id, g])
    ).values()
  )

  const uniqueCountries = Array.from(
    new Set(
      series
        .map(s => s.pais)
        .filter((pais): pais is string => Boolean(pais))
    )
  ).sort()

  const uniqueTags = Array.from(
    new Set(
      series.flatMap(s => s?.tags?.map(tag => tag.nombre))
    )
  ).sort()
  .map(tag => ({ nombre: tag })) || ['todos']

  console.log({ series })

  const uniquePlatforms = Array.from(
    new Map(
      series.flatMap(s => s.plataformas.map(sp => sp.plataforma))
        .map(p => [p.id, p])
    ).values()
  )

  if (loading) {
    return (
      <section className="container mx-auto px-4 pb-16 pt-8">
        <div className="animate-pulse">
          <div className="mb-8 h-8 w-64 bg-slate-200 rounded dark:bg-slate-700"></div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-slate-200 rounded-xl dark:bg-slate-700"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="container mx-auto px-4 pb-16 pt-8">
      <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
          Catálogo de Series
        </h1>
        <Link
          href="/series/nueva"
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 dark:bg-violet-500 dark:hover:bg-violet-600"
        >
          <span className="hidden sm:inline">Añadir nueva serie</span>
          <span className="sm:hidden">+</span>
        </Link>
      </header>

      <SeriesFilters
        genres={uniqueGenres}
        platforms={uniquePlatforms}
        onFiltersChange={handleFiltersChange}
        pais={uniqueCountries}
        tags={uniqueTags}

      />

      {filteredSeries.length === 0 && series.length > 0 ? (
        <p className="py-24 text-center text-slate-500 dark:text-slate-400">
          No se encontraron series con los filtros aplicados.
        </p>
      ) : filteredSeries.length === 0 ? (
        <p className="py-24 text-center text-slate-500 dark:text-slate-400">
          No hay series todavía. ¡Agrega la primera!
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSeries.map((serie) => (
            <li key={serie.id}>
              <Link
                href={`/series/${serie.id}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:bg-slate-800"
              >
                <div className="relative aspect-[3/4] w-full bg-slate-200 dark:bg-slate-700">
                  <div className="relative aspect-[2/3] w-full bg-slate-200 dark:bg-slate-700">
                    <SmartImage
                      src={serie.poster}
                      imageTitle={serie.titulo}
                      alt={serie.titulo}
                      type="poster"
                      fill
                      className="transition-transform duration-300 group-hover:scale-110 object-cover"
                    />

                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-opacity" />

                    {serie.generos?.length > 0 && (
                      <span className="absolute top-2 left-2 bg-violet-600 text-white text-xs font-semibold px-2 py-1 rounded">
                        {serie.generos[0].genero.nombre}
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 group-hover:opacity-60" />
                  <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                    {serie.generos.slice(0, 3).map(({ genero }) => (
                      <span
                        key={genero.id}
                        className="rounded bg-violet-600/80 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm"
                      >
                        {genero.nombre}
                      </span>
                    ))}
                    {serie.generos.length > 3 && (
                      <span className="rounded bg-violet-600/80 px-2 py-0.5 text-xs font-medium text-white">
                        +{serie.generos.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-grow flex-col gap-2 p-4">
                  <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-slate-800 transition-colors group-hover:text-violet-700 dark:text-slate-100 dark:group-hover:text-violet-400">
                    {serie.titulo}
                  </h2>

                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {serie.año && <span>{serie.año} • </span>}
                    {serie.temporadas} temporada{serie?.temporadas != null && serie?.temporadas > 1 ? 's' : ''}
                    {serie._count.actores > 0 && <> • {serie._count.actores} actores</>}
                  </p>

                  {serie.sinopsis && (
                    <p className="line-clamp-3 text-sm text-slate-700 dark:text-slate-300">
                      {serie.sinopsis}
                    </p>
                  )}

                  {serie.plataformas.length > 0 && (
                    <ul className="mt-auto flex flex-wrap gap-2 pt-2">
                      {serie.plataformas.map(({ plataforma }) => (
                        <li
                          key={plataforma.id}
                          className="rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-600 dark:border-slate-600 dark:text-slate-300"
                        >
                          {plataforma.nombre}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}