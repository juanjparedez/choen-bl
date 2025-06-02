// /app/series/[id]/page.tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Serie, EstadoSerie, TipoRolActor } from '@prisma/client' // Tus tipos Prisma
import SerieHeader from '../../components/SerieHeader';
import SmartImage from '../../components/SmartImageProps';
// Asumo que tienes SmartImage para los posters dentro del cuerpo si es necesario


// Tus helpers displayEstado y displayTipoRol (sin cambios)
const displayEstado = (estado: EstadoSerie | null): string | undefined => {
  // Implementa la lógica de displayEstado aquí, asegurando que siempre retorna string o undefined
  if (!estado) return undefined;
  switch (estado) {
    case EstadoSerie.EN_EMISION:
      return "En emisión";
    case EstadoSerie.FINALIZADA:
      return "Finalizada";
    case EstadoSerie.CANCELADA:
      return "Cancelada";
    case EstadoSerie.PROXIMAMENTE:
      return "Próximamente";
    default:
      return undefined;
  }
};
const displayTipoRol = (tipoRol: TipoRolActor | null): string | undefined => {
  if (!tipoRol) return undefined;
  switch (tipoRol) {
    case TipoRolActor.PRINCIPAL:
      return "Principal";
    case TipoRolActor.SECUNDARIO:
      return "Secundario";
    case TipoRolActor.INVITADO:
      return "Invitado";
    default:
      return undefined;
  }
};

interface SerieForDetailPage extends Serie {
  backdrop?: string | null; // Asegúrate de que este campo exista en tu modelo Prisma o adáptalo
  actores: {
    actor: { id: string; nombre: string; nacionalidad: string | null; foto: string | null; }; // Datos del actor
    personaje: string | null;
    tipoRol: TipoRolActor | null;
  }[];
  generos: { genero: { id: string; nombre: string } }[];
  idiomas: { idioma: { id: string; nombre: string; codigo: string }; tipo: string }[];
  plataformas: { plataforma: { id: string; nombre: string }; urlSerieEnPlataforma: string | null }[];
  // Podrías añadir un campo para series relacionadas o calcularlo
  // seriesSimilares?: Array<{ id: string; titulo: string; poster: string | null }>;
}

// Función para buscar series similares (ejemplo básico)
async function getSeriesSimilares(serieActual: SerieForDetailPage, limit: number = 5): Promise<Array<{ id: string; titulo: string; poster: string | null; año: number | null }>> {
  if (!serieActual.generos || serieActual.generos.length === 0) {
    return [];
  }
  const primerGeneroId = serieActual.generos[0].genero.id;

  const similares = await prisma.serie.findMany({
    where: {
      id: { not: serieActual.id }, // Excluir la serie actual
      generos: {
        some: {
          generoId: primerGeneroId,
        },
      },
      estado: { notIn: [EstadoSerie.CANCELADA, EstadoSerie.PROXIMAMENTE] } // Opcional: filtrar por estado
    },
    take: limit,
    orderBy: {
      rating: 'desc', // O por popularidad, fecha, etc.
    },
    select: {
      id: true,
      titulo: true,
      poster: true,
      año: true,
    },
  });
  return similares;
}


export default async function SerieDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const serie = await prisma.serie.findUnique({
    where: { id: params.id }, // Ahora params.id es seguro de usar
    include: { // Usar include para cargar relaciones
      actores: {
        include: {
          actor: { select: { id: true, nombre: true, nacionalidad: true, foto: true } },
        },
        orderBy: { tipoRol: 'asc' },
      },
      generos: { include: { genero: true } },
      idiomas: { include: { idioma: true } },
      plataformas: { include: { plataforma: true } },
    },
  }) as SerieForDetailPage | null;

  if (!serie) {
    notFound();
  }

  const principalActors = serie.actores.filter(a => a.tipoRol === TipoRolActor.PRINCIPAL);
  const otherActors = serie.actores.filter(a => a.tipoRol !== TipoRolActor.PRINCIPAL);

  const seriesSimilares = await getSeriesSimilares(serie);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <SerieHeader
        titulo={serie.titulo}
        backdrop={serie.backdrop || serie.poster}
        poster={serie.poster}
        año={serie.año}
        temporadas={serie.temporadas}
        rating={serie.rating}
        estado={displayEstado(serie.estado as EstadoSerie | null)}
      />

      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 text-sm">
          <Link href="/series" className="inline-flex items-center text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors font-medium group">
            <svg className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al catálogo
          </Link>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Columna Izquierda (Poster, Plataformas, Detalles) */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
            {/* Poster principal (si no se muestra en el header o para móviles) */}
            {/* En este diseño el poster está en el SerieHeader, así que esta sección es más para info adicional */}
            <div className="block md:hidden aspect-[2/3] relative rounded-xl overflow-hidden shadow-xl mb-6">
              <SmartImage
                src={serie.poster}
                imageTitle={serie.titulo} // Para fallback local
                alt={`${serie.titulo} poster`}
                type="poster"
                fill
                className="object-cover"
              />
            </div>


            {serie.plataformas.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md">
                <h3 className="font-semibold text-lg mb-3 text-slate-700 dark:text-slate-200">Disponible en</h3>
                <div className="space-y-2.5">
                  {serie.plataformas.map(({ plataforma, urlSerieEnPlataforma }) => (
                    <a
                      key={plataforma.id}
                      href={urlSerieEnPlataforma || '#'} // Enlace a la plataforma si existe
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between p-2 rounded-md transition-colors ${urlSerieEnPlataforma ? 'hover:bg-slate-100 dark:hover:bg-slate-700/50' : 'cursor-default'}`}
                    >
                      <span className="font-medium text-slate-600 dark:text-slate-300">{plataforma.nombre}</span>
                      {urlSerieEnPlataforma ? (
                        <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">No link</span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md">
              {serie.pais && (
                <div className="mb-3">
                  <h4 className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">País de origen</h4>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{serie.pais}</p>
                </div>
              )}
              {serie.idiomas.length > 0 && (
                <div>
                  <h4 className="text-xs text-slate-500 dark:text-slate-400 mb-1">Idiomas</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {serie.idiomas.map(({ idioma, tipo }) => (
                      <span key={idioma.id} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                        {idioma.nombre} <em className="text-slate-400 dark:text-slate-500 text-[10px]">({tipo})</em>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Columna Derecha (Sinopsis, Géneros, Reparto, Similares) */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-6">
            {serie.generos.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3 text-slate-700 dark:text-slate-200">Géneros</h2>
                <div className="flex flex-wrap gap-2">
                  {serie.generos.map(({ genero }) => (
                    <Link href={`/series?genre=${genero.id}`} key={genero.id} className="rounded-full bg-violet-100 text-violet-700 dark:bg-violet-600/30 dark:text-violet-300 px-3 py-1 text-xs sm:text-sm font-medium hover:bg-violet-200 dark:hover:bg-violet-600/50 transition-colors">
                      {genero.nombre}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {serie.sinopsis && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 sm:p-6 shadow-md">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 text-slate-700 dark:text-slate-200">Sinopsis</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{serie.sinopsis}</p>
              </div>
            )}

            {serie.trailerUrl && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 sm:p-6 shadow-md">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 text-slate-700 dark:text-slate-200">Trailer</h2>
                <a href={serie.trailerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-medium group">
                  <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                  Ver trailer en YouTube
                </a>
              </div>
            )}

            {serie.actores.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 sm:p-6 shadow-md">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-slate-700 dark:text-slate-200">Reparto</h2>
                {principalActors.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-slate-600 dark:text-slate-300">Principales</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {principalActors.map(({ actor, personaje }) => (
                        <Link href={`/actores/${actor.id}`} key={actor.id} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 relative">
                            <SmartImage src={actor.foto} alt={actor.nombre} type="poster" fill className="rounded-full object-cover" imageTitle={`${actor.nombre}-foto`} />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-slate-700 dark:text-slate-200 group-hover:text-violet-600 dark:group-hover:text-violet-400">{actor.nombre}</p>
                            {personaje && <p className="text-xs text-slate-500 dark:text-slate-400">como {personaje}</p>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {otherActors.length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold mb-2 text-slate-600 dark:text-slate-300">Otros Personajes</h3>
                    <ul className="space-y-1 text-sm">
                      {otherActors.map(({ actor, personaje, tipoRol }) => (
                        <li key={actor.id}>
                          <Link href={`/actores/${actor.id}`} className="text-violet-600 hover:underline dark:text-violet-400">{actor.nombre}</Link>
                          {personaje && <span className="text-slate-500 dark:text-slate-400"> como {personaje}</span>}
                          {tipoRol && tipoRol !== TipoRolActor.PRINCIPAL && (
                            <span className="ml-1.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-sm capitalize">
                              {displayTipoRol(tipoRol)}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {seriesSimilares.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 sm:p-6 shadow-md">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-slate-700 dark:text-slate-200">También te podría gustar</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {seriesSimilares.map(similar => (
                    <Link href={`/series/${similar.id}`} key={similar.id} className="group">
                      <div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 shadow-sm hover:shadow-lg transition-shadow">
                        <SmartImage src={similar.poster} alt={similar.titulo} type="poster" fill className="object-cover group-hover:scale-105 transition-transform duration-300" imageTitle={similar.titulo} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <h4 className="text-white text-xs sm:text-sm font-semibold truncate [text-shadow:_0_1px_2px_rgb(0_0_0_/_60%)]">{similar.titulo}</h4>
                          {similar.año && <p className="text-slate-300 text-[10px] sm:text-xs">{similar.año}</p>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700/50 flex justify-center">
              <Link
                href={`/series/${serie.id}/editar`}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 dark:bg-violet-500 dark:hover:bg-violet-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                Editar Serie
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}