// /components/SerieHeader.tsx
'use client'

import SmartImage from "./SmartImageProps"


interface SerieHeaderProps {
  titulo: string
  backdrop?: string | null       // URL de la imagen de banner específica de la serie
  poster?: string | null
  año?: number | null
  temporadas?: number | null
  rating?: number | null
  estado?: string | null
  // Podrías añadir más props si son relevantes para el header, como géneros principales, etc.
}

export default function SerieHeader({
  titulo,
  backdrop,
  poster,
  año,
  temporadas,
  rating,
  estado
}: SerieHeaderProps) {
  function generateGradientBanner(titulo: string): import("csstype").Property.Background<string | number> | undefined {
    // Simple hash to generate a color from the title
    function hashString(str: string) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return hash;
    }

    function intToHsl(i: number) {
      const hue = Math.abs(i) % 360;
      return `hsl(${hue}, 65%, 45%)`;
    }

    const hash = hashString(titulo);
    const color1 = intToHsl(hash);
    const color2 = intToHsl(hash * 13); // Multiply to get a different hue

    // Return a CSS linear-gradient string
    return `linear-gradient(120deg, ${color1} 0%, ${color2} 100%)`;
  }
  return (
    <div className="relative h-96 md:h-[500px] lg:h-[550px] overflow-hidden text-white">
      {/* Banner de fondo: Imagen específica o Degradado */}
      <div className="absolute inset-0">
        {backdrop ? (
          <SmartImage
            src={backdrop}
            imageTitle={`${titulo}-banner`} // SmartImage usará esto para buscar localmente si src es solo un slug
            alt={`${titulo} banner`}
            type="banner" // Indica a SmartImage que es un banner
            fill
            priority
            className="object-cover" // SmartImage ya aplica object-cover si fill=true
          />
        ) : (
          // Fallback a degradado si no hay backdrop
          <div
            className="w-full h-full"
            style={{
              background: generateGradientBanner(titulo), // Usa el generador de gradientes
              backgroundSize: 'cover',
            }}
          />
        )}
        {/* Overlay oscuro sobre el banner/degradado para mejorar legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/10 md:bg-gradient-to-r md:from-black/80 md:to-transparent" />
      </div>

      {/* Contenido del Header */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 h-full flex flex-col justify-end pb-8 md:pb-12">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6 w-full">
          {/* Poster lateral (opcional, podría estar solo en el cuerpo de la página) */}
          {poster && (
            <div className="w-32 h-48 md:w-40 md:h-60 lg:w-48 lg:h-72 flex-shrink-0 relative rounded-lg overflow-hidden shadow-2xl">
              <SmartImage
                src={poster}
                imageTitle={titulo} // SmartImage usará esto para buscar `titulo-poster.png` o similar
                alt={`${titulo} póster`}
                type="poster"
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Info de la Serie */}
          <div className="flex-1 py-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 [text-shadow:_0_2px_4px_rgb(0_0_0_/_50%)]">
              {titulo}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm sm:text-base text-slate-200 [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">
              {año && <span>{año}</span>}
              {temporadas != null && (
                <>
                  {año && <span className="opacity-70">•</span>}
                  <span>{temporadas} temporada{temporadas !== 1 ? 's' : ''}</span>
                </>
              )}
              {rating != null && rating > 0 && (
                <>
                  {(año || temporadas != null) && <span className="opacity-70">•</span>}
                  <div className="flex items-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold">{rating.toFixed(1)}</span>
                  </div>
                </>
              )}
              {estado && (
                <>
                  {(año || temporadas != null || rating != null) && <span className="opacity-70">•</span>}
                  <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-xs sm:text-sm backdrop-blur-sm">
                    {estado}
                  </span>
                </>
              )}
            </div>
            {/* Aquí podrías añadir géneros principales si los tienes */}
            {/* <div className="mt-3 flex flex-wrap gap-2">
              {serie.generos?.slice(0, 3).map(g => (
                <span key={g.genero.id} className="text-xs px-2 py-1 bg-white/10 rounded-full backdrop-blur-sm">{g.genero.nombre}</span>
              ))}
            </div> */}
          </div>
        </div>
      </div>
    </div>
  )
}