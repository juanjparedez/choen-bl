import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import SmartImage from '../../../app/components/SmartImageProps'


export default async function SeriesPage() {
  const series = await prisma.serie.findMany({
    include: {
      generos: { include: { genero: true } },
      plataformas: { include: { plataforma: true } },
      _count: { select: { actores: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Catálogo de Series</h1>
        <Link
          href="/series/nueva"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Nueva Serie
        </Link>
      </div>

      {series.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          No hay series todavía. ¡Agrega la primera!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {series.map((serie) => (
            <div key={serie.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {serie.poster && (
                <SmartImage
                  src={serie.poster}
                  alt={serie.titulo}
                  fill
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              )}
              <div className="p-4">
                <h2 className="font-semibold text-xl mb-2">{serie.titulo}</h2>
                <div className="text-sm text-gray-600 mb-3">
                  {serie.año && <span>{serie.año} • </span>}
                  <span>{serie.temporadas} temporada{serie?.temporadas !== null && serie?.temporadas > 1 ? 's' : ''}</span>
                  {serie._count.actores > 0 && <span> • {serie._count.actores} actores</span>}
                </div>

                {serie.sinopsis && (
                  <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                    {serie.sinopsis}
                  </p>
                )}

                <div className="flex flex-wrap gap-1 mb-3">
                  {serie.generos.map(({ genero }) => (
                    <span key={genero.id} className="text-xs bg-gray-200 px-2 py-1 rounded">
                      {genero.nombre}
                    </span>
                  ))}
                </div>

                {serie.plataformas.length > 0 && (
                  <div className="flex gap-2 text-xs">
                    {serie.plataformas.map(({ plataforma }) => (
                      <span key={plataforma.id} className="text-blue-600">
                        {plataforma.nombre}
                      </span>
                    ))}
                  </div>
                )}

                <Link
                  href={`/series/${serie.id}`}
                  className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                >
                  Ver detalles →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}