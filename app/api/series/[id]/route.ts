// /app/api/series/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import fs, { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { Buffer } from 'buffer';
import { slugify } from '../../../../lib/slugify';
import { EstadoSerie, Serie } from '@prisma/client';

const ActorInputSchema = z.object({
  actorId: z.string().min(1, 'El ID del actor es obligatorio'),
  personaje: z.string().optional(),
  tipoRol: z.enum(['PRINCIPAL', 'SECUNDARIO', 'RECURRENTE']).optional(),
});

const SerieUpdateSchema = z.object({
  titulo: z.string().min(1, 'El título es obligatorio'),
  sinopsis: z.string().optional(),
  año: z.preprocess(
    (val: unknown) => {
      if (typeof val === 'string') {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? undefined : parsed;
      }
      return val;
    },
    z.number().int().min(1900).max(new Date().getFullYear() + 5).optional()
  ),
  temporadas: z.preprocess(
    (val: unknown) => {
      if (typeof val === 'string') {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? 1 : parsed;
      }
      return val ?? 1;
    },
    z.number().int().min(1).default(1)
  ),
  poster: z.string().url().optional().nullable(),
  estado: z.enum(['EN_EMISION', 'FINALIZADA', 'PROXIMAMENTE', 'CANCELADA']).optional(),
  pais: z.string().optional(),
  rating: z.preprocess(
    (val: unknown) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? undefined : parsed;
      }
      return val;
    },
    z.number().min(0).max(10).optional()
  ),
  trailerUrl: z.string().url().optional().nullable(),
  generos: z.array(z.string()).default([]),
  actores: z.array(ActorInputSchema).default([]),
});

// GET: Fetch single serie
export async function GET(
  request: NextRequest, // Cambiado de Request a NextRequest para consistencia
  { params: paramsPromise }: { params: Promise<{ id: string }> } // <--- MODIFICACIÓN AQUÍ
): Promise<NextResponse> {
  try {
    const params = await paramsPromise;
    const { id } = await params;

    const serie = await prisma.serie.findUnique({
      where: { id },
      include: {
        generos: { include: { genero: true } },
        actores: { include: { actor: true } },
        plataformas: { include: { plataforma: true } },
      },
    });

    if (!serie) {
      return NextResponse.json(
        { error: 'Serie not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(serie);
  } catch (error) {
    console.error('Error fetching serie:', error);
    return NextResponse.json(
      { error: 'Failed to fetch serie', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  try {
    await mkdir(dirname, { recursive: true }); // Usa mkdir de fs/promises
  } catch (err: any) {
    // Si el directorio ya existe, el error EEXIST es normal, lo ignoramos.
    if (err.code !== 'EEXIST') {
      console.error("Error creando directorio:", err);
      throw err; // Lanza otros errores
    }
  }
}

// PUT: Update serie
export async function PUT(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> } // <--- MODIFICACIÓN AQUÍ
) {
  const params = await paramsPromise; // Espera a que se resuelva el Promise
  const serieId = params.id;

  if (!serieId) {
    return NextResponse.json({ error: 'ID de serie no proporcionado' }, { status: 400 });
  }

  try {
    const formDataBody = await request.formData(); // Next.js parsea FormData

    const updateData: { [key: string]: any } = {}; // Objeto para los datos a actualizar en Prisma

    // Recoge todos los campos de texto/número del FormData
    // Excluye 'poster' por ahora, ya que lo manejaremos especialmente si es un archivo.
    for (const [key, value] of formDataBody.entries()) {
      if (key !== 'poster' && typeof value === 'string') { // Asegúrate que es string para campos no-archivo
        // Convertir a número si es necesario (basado en tu schema o lógica)
        if (key === 'año' || key === 'temporadas') {
          updateData[key] = parseInt(value, 10);
        } else if (key === 'rating') {
          updateData[key] = parseFloat(value);
        } else {
          updateData[key] = value;
        }
      }
    }

    const posterValue = formDataBody.get('poster'); // Esto puede ser un File o un string (si es '' para borrar)

    const serieActual = await prisma.serie.findUnique({
      where: { id: serieId },
      select: { poster: true, titulo: true }
    });

    if (!serieActual) {
      return NextResponse.json({ error: 'Serie no encontrada' }, { status: 404 });
    }


    if (posterValue instanceof File && posterValue.size > 0) {
      // ---- INICIO: LÓGICA PARA MANEJAR SUBIDA DE NUEVO ARCHIVO ----
      // 1. Borrar el póster antiguo si existe y es un archivo local
      if (serieActual.poster && serieActual.poster.startsWith('/posters/')) {
        try {
          const oldPath = path.join(process.cwd(), 'public', serieActual.poster);
          await unlink(oldPath);
          console.log(`Póster antiguo borrado: ${oldPath}`);
        } catch (err: any) {
          console.warn(`No se pudo borrar el póster antiguo ${serieActual.poster}:`, err.message);
        }
      }

      // 2. Guardar el nuevo póster
      const bytes = await posterValue.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const TittleSlug = slugify(serieActual.titulo || updateData.titulo || 'serie');

      const extension = posterValue.name.split('.').pop()?.toLowerCase() || 'jpg';
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
      const finalExtension = allowedExtensions.includes(extension) ? extension : 'jpg';

      const filename = `${TittleSlug}-${Date.now()}.${finalExtension}`;
      const postersDir = path.join(process.cwd(), 'public', 'posters');
      await ensureDirectoryExistence(postersDir); // Asegura que la carpeta 'public/posters' exista
      const imagePathOnDisk = path.join(postersDir, filename);

      await writeFile(imagePathOnDisk, buffer);
      updateData.poster = `/posters/${filename}`; // ESTA ES LA RUTA QUE SE GUARDA EN BD
      console.log(`Nuevo póster guardado en: ${imagePathOnDisk}, ruta en BD: ${updateData.poster}`);
      // ---- FIN: LÓGICA PARA MANEJAR SUBIDA DE NUEVO ARCHIVO ----

    } else if (typeof posterValue === 'string' && posterValue === '') {
      // ---- INICIO: LÓGICA PARA ELIMINAR EL PÓSTER EXISTENTE ----
      // Si se envió 'poster' como un string vacío, significa que el usuario quiere borrar la imagen
      if (serieActual.poster && serieActual.poster.startsWith('/posters/')) {
        try {
          const oldPath = path.join(process.cwd(), 'public', serieActual.poster);
          await unlink(oldPath);
          console.log(`Póster existente borrado (solicitado por usuario): ${oldPath}`);
        } catch (err: any) {
          console.warn(`No se pudo borrar el póster existente ${serieActual.poster}:`, err.message);
        }
      }
      updateData.poster = null; // Establece el poster como null en la BD
      console.log(`Póster eliminado de la base de datos para la serie ${serieId}`);
      // ---- FIN: LÓGICA PARA ELIMINAR EL PÓSTER EXISTENTE ----
    }
    // Si posterValue no es un File, y no es un string vacío, significa que no se subió un nuevo archivo
    // y no se pidió borrar. En este caso, NO modificamos updateData.poster,
    // por lo que Prisma no actualizará el campo poster si no está en updateData,
    // conservando así el valor existente si el usuario no tocó la imagen.


    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No se proporcionaron datos para actualizar, o no se cambió la imagen.' }, { status: 200 });
    }

    const updatedSerie = await prisma.serie.update({
      where: { id: serieId },
      data: updateData,
    });

    return NextResponse.json(updatedSerie);

  } catch (error: any) {
    console.error("[API PUT /api/series/:id] Error:", error);
    let errorMessage = 'Error al actualizar la serie';
    // P2025: Record to update not found (ya lo manejaste arriba)
    return NextResponse.json({ error: errorMessage, details: error.message }, { status: 500 });
  }
}

// Deberías también tener una API POST para /api/series (Crear nueva serie)
// que también maneje la subida de 'poster' de forma similar.
export async function POST(request: NextRequest) {
  // Similar a PUT, pero para crear.
  // Extrae los datos de formDataBody.
  // Si hay un posterValue (File), guárdalo y obtén la ruta.
  // Luego crea la serie en Prisma con todos los datos, incluyendo la ruta del póster.
  // ... implementación similar a la parte de creación de archivo de PUT ...
  try {
    const formDataBody = await request.formData();
    const createData: { [key: string]: any } = {};
    let posterPathInDb: string | null = null;

    for (const [key, value] of formDataBody.entries()) {
      if (key !== 'poster' && typeof value === 'string') {
        if (key === 'año' || key === 'temporadas') createData[key] = parseInt(value, 10);
        else if (key === 'rating') createData[key] = parseFloat(value);
        else createData[key] = value;
      }
    }

    const posterValue = formDataBody.get('poster') as File | null;
    const tituloParaSlug = createData.titulo || 'serie-nueva';

    if (posterValue instanceof File && posterValue.size > 0) {
      const bytes = await posterValue.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const TittleSlug = slugify(tituloParaSlug);
      const extension = posterValue.name.split('.').pop()?.toLowerCase() || 'jpg';
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
      const finalExtension = allowedExtensions.includes(extension) ? extension : 'jpg';
      const filename = `${TittleSlug}-${Date.now()}.${finalExtension}`;
      const postersDir = path.join(process.cwd(), 'public', 'posters');
      await ensureDirectoryExistence(postersDir);
      const imagePathOnDisk = path.join(postersDir, filename);
      await writeFile(imagePathOnDisk, buffer);
      posterPathInDb = `/posters/${filename}`;
    }

    createData.poster = posterPathInDb; // Puede ser null si no se subió imagen

    // Asegúrate que todos los campos requeridos por Prisma estén presentes
    // Por ejemplo, si 'estado' no se envía pero es requerido, debes darle un default
    if (!createData.estado) createData.estado = EstadoSerie.EN_EMISION;


    const newSerie = await prisma.serie.create({
      data: createData as Serie, // Haz un type assertion aquí
    });
    return NextResponse.json(newSerie, { status: 201 });

  } catch (error: any) {
    console.error("[API POST /api/series] Error:", error);
    return NextResponse.json({ error: "Error al crear la serie", details: error.message }, { status: 500 });
  }
}

// DELETE: Delete serie
export async function DELETE(
  request: NextRequest, // Cambiado de Request a NextRequest
  { params: paramsPromise }: { params: Promise<{ id: string }> } // <--- MODIFICACIÓN AQUÍ
): Promise<NextResponse> {
  const params = await paramsPromise; // Espera a que se resuelva el Promise
  try {
    const { id } = params; // Acceso directo si no es Promise

    const serie = await prisma.serie.findUnique({
      where: { id },
      select: { poster: true }
    });

    if (!serie) {
      return NextResponse.json(
        { error: 'Serie not found' },
        { status: 404 }
      );
    }

    // Eliminar archivo de poster si existe Y ESTÁ EN LA CARPETA CORRECTA
    if (serie.poster && serie.poster.startsWith('/posters/')) { // <--- CORRECCIÓN AQUÍ
      const filePath = path.join(process.cwd(), 'public', serie.poster);
      try {
        await unlink(filePath); // Usa unlink de fs/promises
        console.log(`Poster eliminado del sistema de archivos: ${filePath}`);
      } catch (err: any) {
        // Ignorar errores si el archivo no existe, pero loguear otros errores
        if (err.code !== 'ENOENT') {
          console.warn(`No se pudo borrar el archivo de poster ${filePath}:`, err.message);
        }
      }
    }

    await prisma.serie.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Serie deleted successfully' });
  } catch (error) {
    console.error('Error deleting serie:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete serie',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}