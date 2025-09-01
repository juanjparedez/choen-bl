# Choen BL

Proyecto web para la gestión y exploración de series BL (Boys' Love).

## Descripción

Esta aplicación permite buscar, filtrar, agregar y editar información sobre series BL, incluyendo imágenes, banners y sinopsis. Utiliza Next.js para el frontend y Prisma para la gestión de la base de datos SQLite.

## Tecnologías

- Next.js 14
- React
- Prisma ORM
- SQLite
- Tailwind CSS

## Estructura del proyecto

- `app/` - Páginas principales y rutas API
- `components/` - Componentes reutilizables de la interfaz
- `lib/` - Utilidades y helpers
- `prisma/` - Esquema y migraciones de la base de datos
- `public/` - Imágenes y archivos estáticos

## Instalación y uso

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Accede a [http://localhost:3000](http://localhost:3000) en tu navegador.

## Configuración

Si usas una base de datos diferente, edita el archivo `.env` y el esquema en `prisma/schema.prisma`.

## Créditos y recursos

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)

---

¡Contribuciones y sugerencias son bienvenidas!
