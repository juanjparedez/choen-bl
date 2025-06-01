import { promises as fs } from 'node:fs';
import path from 'node:path';
import { slugify } from './slugify';

const POSTERS_DIR = path.join(process.cwd(), 'public', 'posters');
const PLACEHOLDER_URL = (title: string) =>
  `https://placehold.co/600x800/E0E7FF/4338CA?text=${encodeURIComponent(title)}`;

export async function getPosterPath(title: string) {
  const slug = slugify(title);
  const localFilename = `${slug}.png`;           // o .webp si guardas WebP
  const localPath = path.join(POSTERS_DIR, localFilename);

  try {
    await fs.access(localPath);                  // ¿existe el archivo?
    return `/posters/${localFilename}`;          // ruta pública
  } catch {
    return PLACEHOLDER_URL(title);               // fallback remoto
  }
}