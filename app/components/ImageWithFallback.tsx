'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageWithFallbackProps {
  src: string | null | undefined
  alt: string
  fill?: boolean
  className?: string
  width?: number
  height?: number
}

export default function ImageWithFallback({
  src,
  alt,
  fill = false,
  className = '',
  width,
  height
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  // Normalizar la ruta de la imagen
  const normalizeImagePath = (imagePath: string | null | undefined): string => {
    if (!imagePath) return ''

    // Si ya es una URL completa, devolverla tal como está
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }

    // Si no empieza con /, añadirlo
    if (!imagePath.startsWith('/')) {
      return `/images/${imagePath}`
    }

    return imagePath
  }

  const generateFallbackUrl = (title: string): string => {
    const encodedTitle = encodeURIComponent(title.substring(0, 20))
    return `https://placehold.co/600x900/E0E7FF/4338CA?text=${encodedTitle}`
  }

  const imageSrc = src ? normalizeImagePath(src) : generateFallbackUrl(alt)

  const handleError = () => {
    console.warn(`Failed to load image: ${imageSrc}`)
    setError(true)
    setLoading(false)
  }

  const handleLoad = () => {
    setLoading(false)
  }

  if (error || !src) {
    return (
      <div className={`bg-slate-200 dark:bg-slate-700 flex items-center justify-center ${className}`}>
        {fill ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-4">
              <svg className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-slate-500 dark:text-slate-400">{alt}</p>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            <svg className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-slate-500 dark:text-slate-400">{alt}</p>
          </div>
        )}
      </div>
    )
  }

  const imageProps = {
    src: imageSrc,
    alt,
    onError: handleError,
    onLoad: handleLoad,
    className: `transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'} ${className}`,
    ...(fill ? { fill: true } : { width: width || 400, height: height || 600 })
  }

  return (
    <div className="relative">
      <Image {...imageProps} />
      {loading && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}