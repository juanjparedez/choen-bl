import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'

export default async function SeriesPage() {
  const series = await prisma.serie.findMany({
    include: {
      generos: { include: { genero: true } },
      plataformas: { include: { plataforma: true } },
      _count: { select: { actores: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  if (!series) return notFound()

  const fallbackPoster = (title: string) =>
    `https://placehold.co/600x900/E0E7FF/4338CA?text=${encodeURIComponent(title)}`

  return (
    <section className="container mx-auto px-4 pb-16 pt-8">
      {/* ─────────────────── Header ─────────────────── */}
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

      {/* ─────────────────── Listado ─────────────────── */}
      {series.length === 0 ? (
        <p className="py-24 text-center text-slate-500 dark:text-slate-400">
          No hay series todavía. ¡Agrega la primera!
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {series.map((serie) => (
            <li key={serie.id}>
              <Link
                href={`/series/${serie.id}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:bg-slate-800"
              >
                {/* ────────── Poster ────────── */}
                <div className="relative aspect-[3/4] w-full bg-slate-200 dark:bg-slate-700">
                  <Image
                    src={serie.poster ?? fallbackPoster(serie.titulo)}
                    alt={serie.titulo}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Gradiente y géneros */}
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

                {/* ────────── Info ────────── */}
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
