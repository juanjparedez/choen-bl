// /app/series/[id]/page.tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { EstadoSerie, TipoRolActor } from '@prisma/client' // Assuming these are used by helpers
import SerieHeader from '../../components/SerieHeader' // Ensure this path is correct

// Componente para mostrar estadísticas (StatCard - unchanged from your code)
function StatCard({ icon, label, value, subValue }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="text-violet-500 dark:text-violet-400">
          {icon}
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{value}</p>
          {subValue && <p className="text-xs text-slate-500 dark:text-slate-400">{subValue}</p>}
        </div>
      </div>
    </div>
  )
}


export default async function SerieDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const serie = await prisma.serie.findUnique({
    where: { id: params.id },
    // No explicit 'select' for Serie's scalar fields means Prisma fetches all of them by default,
    // including 'banner', 'poster', 'titulo', 'año', 'rating', 'estado', etc.
    include: {
      actores: {
        include: {
          actor: { select: { id: true, nombre: true, nacionalidad: true, foto: true } },
        },
        orderBy: { tipoRol: 'asc' },
      },
      generos: { include: { genero: true } },
      idiomas: { include: { idioma: true } },
      plataformas: { include: { plataforma: true } },
      galeria: true, // Assuming 'galeria' is a relation or a JSON field
      tags: { include: { tag: true } }
      // If 'temporadas' is a relation needed for stats, include it here.
      // e.g., temporadas: { select: { _count: { select: { episodios: true } } } } or similar
    },
  });

  if (!serie) {
    notFound();
  }

  // --- Adjust your statistics calculation logic as needed based on your actual schema ---
  // This section is illustrative and depends on how 'temporadas' and 'episodios' are structured.
  // Your existing logic for totalEpisodios:
  const totalEpisodios = Array.isArray((serie as any).temporadas) // Cast if 'temporadas' is not directly on Serie type
    ? (serie as any).temporadas.reduce((sum: number, temp: any) => sum + (temp.episodios?.length || 0), 0)
    : ((serie as any).episodios || 0); // Fallback if 'episodios' is a direct count

  // Example for number of seasons:
  // This assumes 'temporadas' is a field on Serie or a relation from which length can be derived.
  // Or if you have a scalar field like 'numero_temporadas'
  const numeroTemporadas = Array.isArray((serie as any).temporadas)
    ? (serie as any).temporadas.length
    : ((serie as any).numeroTemporadas || 0); // Adjust if you have a specific field for season count

  const duracionTotal = serie.duracionPromedio && totalEpisodios
    ? serie.duracionPromedio * totalEpisodios
    : 0;
  const horasTotal = Math.floor(duracionTotal / 60);
  const minutosRestantes = duracionTotal % 60;

  const fechaEstreno = serie.fechaEstreno
    ? new Date(serie.fechaEstreno).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;
  // --- End of statistics calculation logic ---

  // For debugging:
  console.log("Fetched serie for detail page:", JSON.stringify(serie, null, 2));
  console.log("Serie banner URL to be passed to Header:", serie.banner);


  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <SerieHeader
        titulo={serie.titulo}
        // CORRECTED: Pass serie.banner to the backdrop prop
        backdrop={serie.banner || undefined} // Use undefined or null as a fallback
        poster={serie.poster || undefined}   // Use undefined or null as a fallback
        año={serie.año}
        temporadas={numeroTemporadas} // Pass the calculated number of seasons
        rating={serie.rating}
        estado={displayEstado(serie.estado as EstadoSerie | null)}
      />

      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm">
          <Link href="/series" className="inline-flex items-center text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors font-medium group">
            <svg className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al catálogo
          </Link>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4" /></svg>}
            label="Episodios"
            value={totalEpisodios}
            subValue={numeroTemporadas > 0 ? `${numeroTemporadas} temporadas` : undefined}
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Duración total"
            value={duracionTotal ? `${horasTotal}h ${minutosRestantes}m` : 'N/A'}
            subValue={serie.duracionPromedio ? `${serie.duracionPromedio}m por episodio` : undefined}
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" /></svg>}
            label="Estreno"
            value={fechaEstreno || serie.año?.toString() || 'N/A'}
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>}
            label="País"
            value={serie.pais || 'N/A'}
          />
        </div>

        {/* Rest of your page content (sidebar, main, actions) */}
        {/* Ensure all references to serie properties are correct based on your schema */}
        <div className="grid lg:grid-cols-12 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
            {/* Información de producción */}
            {(serie.creador || serie.productora || serie.presupuesto || serie.recaudacion) && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-md">
                <h3 className="font-semibold text-lg mb-4 text-slate-700 dark:text-slate-200">Información de Producción</h3>
                <div className="space-y-3">
                    {serie.creador && (
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Creador(es)</p>
                        <p className="font-medium text-slate-700 dark:text-slate-200">{serie.creador}</p>
                    </div>
                    )}
                    {serie.productora && (
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Productora</p>
                        <p className="font-medium text-slate-700 dark:text-slate-200">{serie.productora}</p>
                    </div>
                    )}
                    {serie.presupuesto && (
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Presupuesto</p>
                        <p className="font-medium text-slate-700 dark:text-slate-200">
                        {/* Ensure 'presupuesto' is a number or can be converted */}
                        ${Number(serie.presupuesto).toLocaleString('es-ES')}
                        </p>
                    </div>
                    )}
                    {serie.recaudacion && (
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Recaudación</p>
                        <p className="font-medium text-slate-700 dark:text-slate-200">
                        {/* Ensure 'recaudacion' is a number or can be converted */}
                        ${Number(serie.recaudacion).toLocaleString('es-ES')}
                        </p>
                    </div>
                    )}
                </div>
                </div>
            )}

            {/* Plataformas de streaming */}
            {serie.plataformas && serie.plataformas.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-md">
                <h3 className="font-semibold text-lg mb-4 text-slate-700 dark:text-slate-200">Ver en</h3>
                <div className="space-y-3">
                    {serie.plataformas.map(({ plataforma, urlSerieEnPlataforma }) => (
                    <a
                        key={plataforma.id}
                        href={urlSerieEnPlataforma || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-between p-3 rounded-lg transition-all ${urlSerieEnPlataforma
                        ? 'bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30'
                        : 'bg-slate-50 dark:bg-slate-700/50 cursor-not-allowed opacity-60'
                        }`}
                    >
                        <span className="font-medium text-slate-700 dark:text-slate-200">{plataforma.nombre}</span>
                        {urlSerieEnPlataforma && (
                        <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        )}
                    </a>
                    ))}
                </div>
                </div>
            )}

            {/* Idiomas */}
            {serie.idiomas && serie.idiomas.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-md">
                <h3 className="font-semibold text-lg mb-4 text-slate-700 dark:text-slate-200">Idiomas</h3>
                <div className="space-y-2">
                    {serie.idiomas.map(({ idioma, tipo }) => (
                    <div key={`${idioma.id}-${tipo}`} className="flex items-center justify-between">
                        <span className="text-slate-700 dark:text-slate-200">{idioma.nombre}</span>
                        <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">
                        {tipo} {/* Assuming 'tipo' is a string like 'Audio', 'Subtítulos' */}
                        </span>
                    </div>
                    ))}
                </div>
                </div>
            )}

            {/* Tags */}
            {serie.tags && serie.tags.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-md">
                <h3 className="font-semibold text-lg mb-4 text-slate-700 dark:text-slate-200">Tags</h3>
                <div className="flex flex-wrap gap-2">
                    {serie.tags.map(({ tag }) => (
                    <span
                        key={tag.id}
                        className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-600/30 dark:text-blue-300 px-2.5 py-0.5 text-xs font-medium"
                    >
                        {tag.nombre}
                    </span>
                    ))}
                </div>
                </div>
            )}
            </aside>

            {/* Contenido principal */}
            <main className="lg:col-span-8 xl:col-span-9 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                <div className="space-y-6">
                {/* Géneros */}
                {serie.generos && serie.generos.length > 0 && (
                    <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-700 dark:text-slate-200">Géneros</h3>
                    <div className="flex flex-wrap gap-2">
                        {serie.generos.map(({ genero }) => (
                        <Link
                            href={`/series?genre=${genero.id}`} // Assuming you have a genre filter page
                            key={genero.id}
                            className="inline-flex items-center gap-1 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-600/30 dark:text-violet-300 px-3 py-1.5 text-sm font-medium hover:bg-violet-200 dark:hover:bg-violet-600/50 transition-all hover:scale-105"
                        >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            {genero.nombre}
                        </Link>
                        ))}
                    </div>
                    </div>
                )}

                {/* Sinopsis */}
                {serie.sinopsis && (
                    <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-700 dark:text-slate-200">Sinopsis</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {serie.sinopsis}
                    </p>
                    </div>
                )}

                {/* Trailer */}
                {serie.trailerUrl && (
                    <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-700 dark:text-slate-200">Trailer</h3>
                    <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
                        { (serie.trailerUrl.includes('youtube.com/') || serie.trailerUrl.includes('youtu.be/')) ? (
                        <iframe
                            src={`https://www.youtube.com/embed/${
                                serie.trailerUrl.includes('youtu.be/')
                                ? serie.trailerUrl.split('/').pop()?.split('?')[0]
                                : new URL(serie.trailerUrl).searchParams.get('v')
                            }`}
                            className="w-full h-full"
                            title={`Trailer de ${serie.titulo}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                        ) : (
                        <a
                            href={serie.trailerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full h-full flex items-center justify-center text-white hover:text-violet-400 transition-colors"
                            title={`Ver trailer de ${serie.titulo}`}
                        >
                            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                            <span className="sr-only">Ver trailer</span>
                        </a>
                        )}
                    </div>
                    </div>
                )}

                {/* Reparto */}
                {serie.actores && serie.actores.length > 0 && (
                    <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-700 dark:text-slate-200">Reparto</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {serie.actores.map(({ actor, personaje, tipoRol }) => (
                        <div key={actor.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-600 rounded-full flex-shrink-0 overflow-hidden">
                            {actor.foto ? (
                                <img src={actor.foto} alt={actor.nombre} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                </div>
                            )}
                            </div>
                            <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-700 dark:text-slate-200 truncate" title={actor.nombre}>{actor.nombre}</p>
                            {personaje && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate" title={personaje}>{personaje}</p>
                            )}
                            {tipoRol && (
                                <span className="inline-block text-xs bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full mt-1">
                                {displayTipoRol(tipoRol)}
                                </span>
                            )}
                            </div>
                        </div>
                        ))}
                    </div>
                    </div>
                )}
                </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-wrap gap-4 justify-center pt-6">
                <Link
                href={`/series/${serie.id}/editar`}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-violet-700 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
                >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar Serie
                </Link>
                <Link
                href={`/series/${serie.id}/temporadas`} // Ensure this route exists
                className="inline-flex items-center gap-2 rounded-lg bg-slate-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-700 hover:scale-105"
                >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4" />
                </svg>
                Gestionar Temporadas
                </Link>
            </div>
            </main>
        </div>
      </div>
    </div>
  )
}

// Helper functions (displayEstado, displayTipoRol - unchanged from your code)
const displayEstado = (estado: EstadoSerie | null): string | undefined => {
  if (!estado) return undefined;
  switch (estado) {
    case EstadoSerie.EN_EMISION: return "En emisión";
    case EstadoSerie.FINALIZADA: return "Finalizada";
    case EstadoSerie.CANCELADA: return "Cancelada";
    case EstadoSerie.PROXIMAMENTE: return "Próximamente";
    case EstadoSerie.PAUSADA: return "Pausada";
    case EstadoSerie.PILOTO: return "Piloto";
    default:
      const _exhaustiveCheck: never = estado; // Ensures all cases are handled
      return undefined;
  }
};

const displayTipoRol = (tipoRol: TipoRolActor | null): string | undefined => {
  if (!tipoRol) return undefined;
  switch (tipoRol) {
    case TipoRolActor.PRINCIPAL: return "Principal";
    case TipoRolActor.SECUNDARIO: return "Secundario";
    case TipoRolActor.RECURRENTE: return "Recurrente";
    case TipoRolActor.INVITADO: return "Invitado";
    case TipoRolActor.CAMEO: return "Cameo";
    case TipoRolActor.VOZ: return "Voz";
    default:
      const _exhaustiveCheck: never = tipoRol; // Ensures all cases are handled
      return undefined;
  }
};
