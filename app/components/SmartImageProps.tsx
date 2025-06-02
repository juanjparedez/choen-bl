// app/components/SmartImageProps.tsx (o como lo hayas llamado)
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface SmartImageProps {
  src?: string | null         // Esta es la ruta que viene de la BD, ej: "/posters/bad_buddy_poster.jpg"
  alt: string
  imageTitle?: string       // Se usa si 'src' es null o no es una ruta completa, para llamar a la API
  type?: 'poster' | 'banner'
  fill?: boolean
  className?: string
  width?: number
  height?: number
  priority?: boolean
}

export default function SmartImage({
  src,
  alt,
  imageTitle,
  type = 'poster',
  fill = false,
  className = '',
  width = type === 'banner' ? 1280 : 600,
  height = type === 'banner' ? 720 : 900,
  priority = false
}: SmartImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Define la imagen default BASADA EN EL TIPO
  const defaultImage = type === 'banner' ? '/img/default-banner.jpg' : '/img/default-poster.png';

  useEffect(() => {
    const resolveImageSrc = async () => {
      setLoading(true);
      setError(false);

      // 1. Si 'src' es una ruta completa (empieza con / o http), úsala.
      if (src && (src.startsWith('/') || src.startsWith('http'))) {
        setImageSrc(src);
        setLoading(false);
        return;
      }

      // 2. Si 'src' no es una ruta completa (o es null) PERO tenemos 'imageTitle',
      //    intentamos buscarla con la API.
      if (imageTitle) {
        try {
          const response = await fetch('/api/poster-path', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: imageTitle, type })
          });

          if (response.ok) {
            const data = await response.json();
            setImageSrc(data.posterPath); // La API devuelve la ruta correcta o el default de la API
          } else {
            setImageSrc(defaultImage); // Fallback si la API falla
          }
        } catch (e) {
          console.error(`SmartImage: Error fetching ${type} for ${imageTitle}:`, e);
          setImageSrc(defaultImage); // Fallback en caso de error de red
        }
      } else {
        // 3. Si no hay 'src' usable ni 'imageTitle', usa la imagen default del componente.
        setImageSrc(defaultImage);
      }
      setLoading(false);
    };

    resolveImageSrc();
  }, [src, imageTitle, type, defaultImage]); // Asegúrate que defaultImage esté en las dependencias

  const handleError = () => {
    if (!error && imageSrc !== defaultImage) { // Evita bucles si la imagen default también falla
      setError(true);
      setImageSrc(defaultImage);
    }
  };

  // ... (resto del componente SmartImage sin cambios significativos para este problema)
  // Solo asegúrate que el 'className' que le pasas a <Image> incluya 'object-cover' si es necesario
  // y que las props de width/height o fill se manejen bien.

  if (loading && !imageSrc) {
    return (
      <div className={`bg-slate-200 dark:bg-slate-700 animate-pulse flex items-center justify-center ${className} ${fill ? 'w-full h-full' : ''}`} style={!fill ? { width: `${width}px`, height: `${height}px` } : {}}>
        <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const imageProps: any = {
    src: imageSrc || defaultImage,
    alt,
    onError: handleError,
    onLoad: () => setLoading(false),
    priority,
    className: `transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'} ${className}`,
    ...(fill ? { fill: true, style: { objectFit: 'cover' } } : { width, height, style: { objectFit: 'cover' } })
  };
  return <Image {...imageProps} />;
}