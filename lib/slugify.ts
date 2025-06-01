export const slugify = (str: string) =>
  str
    .normalize('NFD')                // quita acentos
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, '')      // deja solo alfanum + espacio
    .replace(/\s+/g, '-');           // espacios → guiones
