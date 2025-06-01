import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Serie } from '@prisma/client';

interface SerieWithRelations extends Serie {
  actores: {
    actor: { id: string; nombre: string; nacionalidad: string | null; fechaNac: Date | null; foto: string | null; biografia: string | null };
    serieId: string;
    actorId: string;
    personaje: string | null;
    tipoRol: string | null;
  }[];
  generos: { genero: { id: string; nombre: string } }[];
  idiomas: { idioma: { id: string; nombre: string; codigo: string }; tipo: string }[];
  plataformas: { plataforma: { id: string; nombre: string }; urlSerieEnPlataforma: string | null }[];
}

export default async function SerieDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const serie = await prisma.serie.findUnique({
    where: { id },
    select: {
      id: true,
      titulo: true,
      sinopsis: true,
      año: true,
      temporadas: true,
      poster: true,
      estado: true,
      pais: true,
      rating: true,
      trailerUrl: true,
      actores: {
        select: {
          tipoRol: true,
          personaje: true,
          actor: {
            select: {
              id: true,
              nombre: true,
              nacionalidad: true,
              foto: true,
            },
          },
        },
        orderBy: { tipoRol: 'asc' },
      },
      generos: {
        select: {
          genero: { select: { id: true, nombre: true } },
        },
      },
      idiomas: {
        select: {
          tipo: true,
          idioma: { select: { id: true, nombre: true, codigo: true } },
        },
      },
      plataformas: {
        select: {
          plataforma: { select: { id: true, nombre: true } },
          urlSerieEnPlataforma: true,
        },
      },
    },
  });

  if (!serie) notFound();

  const principalActors = serie.actores.filter(a => a.tipoRol === 'principal')
  const otherActors = serie.actores.filter(a => a.tipoRol !== 'principal')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con imagen de fondo */}
      <div className="relative h-96 overflow-hidden">
        {serie.poster ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${serie.poster})`,
              filter: 'brightness(0.3)'
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gray-800" />
        )}

        <div className="relative z-10 container mx-auto px-6 h-full flex items-end pb-8">
          <div className="text-white">
            <Link href="/series" className="inline-flex items-center text-gray-300 hover:text-white mb-4 transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al catálogo
            </Link>
            <h1 className="text-5xl font-bold mb-2">{serie.titulo}</h1>
            <div className="flex items-center gap-4 text-gray-200">
              {serie.año && <span>{serie.año}</span>}
              <span>•</span>
              <span>{serie.temporadas} temporada{serie.temporadas > 1 ? 's' : ''}</span>
              {serie.rating && (
                <>
                  <span>•</span>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold">{serie.rating.toFixed(1)}</span>
                  </div>
                </>
              )}
              {serie.estado && (
                <>
                  <span>•</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {serie.estado === 'EN_EMISION' ? 'En emisión' :
                      serie.estado === 'FINALIZADA' ? 'Finalizada' : serie.estado}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Poster y detalles */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {serie.poster ? (
                <img
                  src={serie.poster}
                  alt={serie.titulo}
                  className="w-full rounded-lg shadow-xl mb-6"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
                  <span className="text-gray-400">Sin imagen</span>
                </div>
              )}

              {/* Plataformas */}
              {serie.plataformas.length > 0 && (
                <div className="bg-white rounded-lg p-4 shadow mb-4">
                  <h3 className="font-semibold mb-3">Disponible en</h3>
                  <div className="space-y-2">
                    {serie.plataformas.map(({ plataforma }) => (
                      <div key={plataforma.id} className="flex items-center justify-between">
                        <span className="font-medium">{plataforma.nombre}</span>
                        <span className="text-green-600 text-sm">Disponible</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* País e idiomas */}
              <div className="bg-white rounded-lg p-4 shadow">
                {serie.pais && (
                  <div className="mb-4">
                    <h4 className="text-sm text-gray-600 mb-1">País de origen</h4>
                    <p className="font-medium">{serie.pais}</p>
                  </div>
                )}

                {serie.idiomas.length > 0 && (
                  <div>
                    <h4 className="text-sm text-gray-600 mb-2">Idiomas disponibles</h4>
                    <div className="space-y-1">
                      {serie.idiomas.map(({ idioma, tipo }) => (
                        <div key={idioma.id} className="flex items-center justify-between text-sm">
                          <span>{idioma.nombre}</span>
                          {/* <span className="text-gray-500">
                            {tipo === 'ambos' ? 'Audio y subtítulos' :
                              tipo === 'audio' ? 'Solo audio' : 'Solo subtítulos'}
                          </span> */}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna derecha - Información */}
          <div className="lg:col-span-2">
            {/* Géneros */}
            <div className="flex flex-wrap gap-2 mb-6">
              {serie.generos.map(({ genero }) => (
                <span key={genero.id} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                  {genero.nombre}
                </span>
              ))}
            </div>

            {/* Sinopsis */}
            {serie.sinopsis && (
              <div className="bg-white rounded-lg p-6 shadow mb-6">
                <h2 className="text-2xl font-bold mb-3">Sinopsis</h2>
                <p className="text-gray-700 leading-relaxed">{serie.sinopsis}</p>
              </div>
            )}

            {/* Trailer */}
            {serie.trailerUrl && (
              <div className="bg-white rounded-lg p-6 shadow mb-6">
                <h2 className="text-2xl font-bold mb-3">Trailer</h2>
                <a
                  href={serie.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Ver trailer en YouTube
                </a>
              </div>
            )}

            {/* Reparto */}
            {serie.actores.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow">
                <h2 className="text-2xl font-bold mb-6">Reparto</h2>

                {principalActors.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Personajes principales</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                      {principalActors.map(({ actor, personaje }) => (
                        <div key={actor.id} className="flex items-start gap-4">
                          <div className="w-20 h-20 flex-shrink-0">
                            {actor.foto ? (
                              <img
                                src={actor.foto}
                                alt={actor.nombre}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{actor.nombre}</p>
                            {personaje && (
                              <p className="text-sm text-gray-600">como {personaje}</p>
                            )}
                            {actor.nacionalidad && (
                              <p className="text-xs text-gray-500 mt-1">{actor.nacionalidad}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {otherActors.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Otros personajes</h3>
                    <div className="space-y-2">
                      {otherActors.map(({ actor, personaje, tipoRol }) => (
                        <div key={actor.id} className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{actor.nombre}</span>
                          {personaje && <span className="text-gray-600">como {personaje}</span>}
                          {tipoRol && tipoRol !== 'principal' && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                              {tipoRol.toLowerCase()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Botón de editar */}
        <div className="mt-12 flex justify-center">
          <Link
            href={`/series/${serie.id}/editar`}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar Serie
          </Link>
        </div>
      </div>
    </div>
  )
}