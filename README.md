# Choen BL

Proyecto web para la gestión y exploración de series BL (Boys' Love) tailandesas.

---

## Descripción

Aplicación para buscar, filtrar, agregar y editar series BL, con soporte para imágenes, banners, sinopsis y sistema de etiquetas. Utiliza Next.js 14+ (App Router), TypeScript, Prisma ORM y Tailwind CSS.

## Características principales

- Búsqueda y filtrado avanzado de series BL
- Sistema de etiquetas para clasificar series
- Gestión de actores y banners
- Edición y creación de series desde la interfaz
- Automatización de PRs y cambios mediante n8n y GitHub Actions

## Tecnologías

- Next.js 14+ (App Router)
- React + TypeScript
- Prisma ORM + SQLite
- Tailwind CSS
- n8n (automatización)
- GitHub Actions

## Estructura del proyecto

- `app/` - Páginas principales y rutas API
- `components/` - Componentes reutilizables de la interfaz
- `lib/` - Utilidades y helpers
- `prisma/` - Esquema y migraciones de la base de datos
- `public/` - Imágenes y archivos estáticos
- `scripts/automation/` - Scripts para aplicar intents automáticos
- `workflow/` - Configuración de automatización

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

## Migraciones y base de datos

Para aplicar migraciones y poblar la base de datos:

```bash
npx prisma migrate dev
npx prisma db seed
```

Puedes modificar la configuración en `.env` y el esquema en `prisma/schema.prisma`.

## Automatización de cambios

El proyecto integra automatización de PRs usando n8n y GitHub Actions:

- Los requerimientos se analizan y convierten en intents JSON.
- El workflow `automation-intents.yml` aplica los cambios y crea PRs automáticos.
- El script `scripts/automation/apply-intent.mjs` ejecuta los cambios según el intent recibido.

### Ejemplo de uso de automatización

1. Define el requerimiento en n8n.
2. El intent JSON se envía al workflow de GitHub.
3. Se crea un PR con los cambios aplicados automáticamente.

## Scripts útiles

- `scripts/import-from-json.ts`: Importa datos desde un archivo JSON.
- `scripts/reset_and_seed.sh`: Resetea y repuebla la base de datos.

## Contribución

¡Contribuciones y sugerencias son bienvenidas!

1. Haz un fork del repositorio.
2. Crea una rama para tu cambio.
3. Realiza tus modificaciones y abre un Pull Request.
4. Si quieres proponer automatizaciones, revisa la carpeta `workflow/` y los scripts en `scripts/automation/`.

## Créditos y recursos

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [n8n](https://n8n.io/)
- [GitHub Actions](https://docs.github.com/en/actions)

---

¿Dudas o sugerencias? ¡Abre un issue o PR!
