import { promises as fs } from 'node:fs';
import path from 'node:path';
import { slugify } from './slugify';

const POSTERS_DIR = path.join(process.cwd(), 'public', 'posters');
// Define the path to your new local fallback image
const LOCAL_FALLBACK_POSTER_PATH = '/img/default-poster.png';

export async function getPosterPath(title: string): Promise<string> { // Added Promise<string> for clarity
  const slug = slugify(title);
  // Consider supporting multiple extensions if needed in the future
  // For now, we'll stick to .png as per your current setup
  const extensionsToTry = ['.png', '.jpg', '.jpeg', '.webp'];
  let localFileFound = false;
  let publicPosterPath = '';

  for (const ext of extensionsToTry) {
    const localFilename = `<span class="math-inline">\{slug\}</span>{ext}`;
    const localPath = path.join(POSTERS_DIR, localFilename);
    try {
      await fs.access(localPath); // Check if file exists
      publicPosterPath = `/posters/${localFilename}`; // Public path
      localFileFound = true;
      break; // Exit loop once a file is found
    } catch {
      // File with this extension not found, try next
    }
  }

  if (localFileFound) {
    return publicPosterPath;
  } else {
    // If no local poster is found after trying all extensions, return the local fallback
    return LOCAL_FALLBACK_POSTER_PATH;
  }
}