// /app/api/poster-path/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { slugify } from '@/lib/slugify' // Asumo que tienes esta función

// Asumimos que estas funciones existen y buscan en las carpetas correctas
// y devuelven la ruta pública, ej: /posters/titulo-slug.jpg o /banners/titulo-slug.jpg

async function findLocalImage(title: string, directory: string, defaultPath: string): Promise<string> {
  // 'directory' aquí debería ser 'posters' o 'banners'
  const BROWSE_DIR = path.join(process.cwd(), 'public', directory); // ej: public/posters
  const slug = slugify(title);
  const extensions = ['.jpg', '.jpeg', '.png', '.webp'];

  for (const ext of extensions) {
    const filename = `<span class="math-inline">\{slug\}</span>{ext}`; // ej: bad-buddy.jpg
    const fullPath = path.join(BROWSE_DIR, filename);
    try {
      await fs.access(fullPath);
      return `/<span class="math-inline">\{directory\}/</span>{filename}`; // ej: /posters/bad-buddy.jpg
    } catch {
      // Not found, continue
    }
  }
  return defaultPath; // ej: /img/default-poster.png
}

async function getPosterPath(title: string): Promise<string> {
  return findLocalImage(title, 'posters', '/img/default-poster.png');
}

async function getBannerPath(title: string): Promise<string> {
  return findLocalImage(title, 'banners', '/img/default-banner.jpg');
}


export async function POST(request: NextRequest) {
  let requestType = 'poster' // Default type
  try {
    const body = await request.json()
    const { title, type = 'poster' } = body // 'type' puede ser 'poster' o 'banner'
    requestType = type

    if (!title) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 })
    }

    let imagePath: string

    if (type === 'banner') {
      imagePath = await getBannerPath(title)
    } else {
      imagePath = await getPosterPath(title)
    }

    // La API ahora devuelve 'posterPath' para mantener consistencia con el nombre original del campo
    // aunque podría ser 'imagePath' de forma más genérica.
    return NextResponse.json({ posterPath: imagePath })
  } catch (error) {
    console.error(`[${requestType.toUpperCase()} API] Error:`, error)
    // Devuelve el fallback correspondiente al tipo solicitado
    const fallbackPath = requestType === 'banner' ? '/img/default-banner.jpg' : '/img/default-poster.png'
    return NextResponse.json({ posterPath: fallbackPath }, { status: 500 }) // Usar 500 para error interno
  }
}