// /app/api/series/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import { Buffer } from 'buffer';
import { slugify } from '../../../../lib/slugify';
import { EstadoSerie, Prisma } from '@prisma/client';

// GET: Fetch single serie (remains the same)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
): Promise<NextResponse> {
  try {
    const params = await context.params;
    const { id } = params;
    if (!id) return NextResponse.json({ error: 'Serie ID is required' }, { status: 400 });

    console.log(`[API GET /api/series/${id}] Fetching serie.`);
    const serie = await prisma.serie.findUnique({
      where: { id },
      include: {
        generos: { include: { genero: true } },
        tags: { include: { tag: true } },
        actores: { include: { actor: true } },
        plataformas: { include: { plataforma: true } },
      },
    });

    if (!serie) {
      console.log(`[API GET /api/series/${id}] Serie not found.`);
      return NextResponse.json({ error: 'Serie not found' }, { status: 404 });
    }
    console.log(`[API GET /api/series/${id}] Serie fetched successfully.`);
    return NextResponse.json(serie);
  } catch (error) {
    console.error(`[API GET /api/series/:id] Error fetching serie:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during fetch';
    return NextResponse.json({ error: 'Failed to fetch serie', details: errorMessage }, { status: 500 });
  }
}

// ensureDirectoryExistence, uploadImage, deleteImageFile (remain the same)
async function ensureDirectoryExistence(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err: any) {
    if (err.code !== 'EEXIST') {
      console.error("Error creando directorio:", err);
      throw err;
    }
  }
}

async function uploadImage(file: File, type: 'poster' | 'banner', serieTitle: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  const finalExtension = allowedExtensions.includes(extension) ? extension : 'jpg';
  const titleSlug = slugify(serieTitle || 'untitled');
  const filename = `${titleSlug}-${type}-${Date.now()}.${finalExtension}`;
  const dir = type === 'banner' ? 'banners' : 'posters';
  const targetDir = path.join(process.cwd(), 'public', dir);
  await ensureDirectoryExistence(targetDir);
  const filePath = path.join(targetDir, filename);
  await fs.writeFile(filePath, buffer);
  console.log(`[API uploadImage] Image uploaded: /${dir}/${filename}`);
  return `/${dir}/${filename}`;
}

async function deleteImageFile(imagePath: string | null) {
  if (!imagePath || typeof imagePath !== 'string') return;
  if (imagePath.startsWith('/posters/') || imagePath.startsWith('/banners/') || imagePath.startsWith('/backdrops/')) {
    try {
      const filePath = path.join(process.cwd(), 'public', imagePath);
      await fs.unlink(filePath);
      console.log(`[API deleteImageFile] Image deleted: ${filePath}`);
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        console.warn(`[API deleteImageFile] Could not delete ${imagePath}:`, err.message);
      }
    }
  }
}


// PUT: Update serie
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id: serieIdFromContext } = await context.params;
  console.log(`[API PUT /api/series/${serieIdFromContext}] Received update request.`);

  try {
    const serieId = serieIdFromContext;
    if (!serieId) {
      console.error("[API PUT] Serie ID not provided in context.");
      return NextResponse.json({ error: 'ID de serie no proporcionado' }, { status: 400 });
    }

    const apiFormData = await request.formData();
    console.log("[API PUT] FormData received:", Array.from(apiFormData.entries()));

    // Get genre and tag IDs before using them
    // const submittedGenreIds = apiFormData.getAll('genreIds[]').map(id => String(id));
    // const submittedTagIds = apiFormData.getAll('tagIds[]').map(id => String(id));

    const updateData: any = {
      titulo: apiFormData.get('titulo') as string,
      sinopsis: apiFormData.get('sinopsis') as string,
      año: parseInt(apiFormData.get('año') as string),
      temporadas: parseInt(apiFormData.get('temporadas') as string),
      estado: apiFormData.get('estado') as string,
      pais: apiFormData.get('pais') as string,
      rating: parseFloat(apiFormData.get('rating') as string),
      trailerUrl: apiFormData.get('trailerUrl') as string,
      duracionPromedio: parseInt(apiFormData.get('duracionPromedio') as string),
      creador: apiFormData.get('creador') as string || '',
      productora: apiFormData.get('productora') as string || '',
      fechaEstreno: apiFormData.get('fechaEstreno') ? new Date(apiFormData.get('fechaEstreno') as string) : null,
      // generos and tags will be set later after validation
    };

    const serieActual = await prisma.serie.findUnique({
      where: { id: serieId },
      select: { poster: true, banner: true, titulo: true },
    });

    if (!serieActual) {
      console.error(`[API PUT /api/series/${serieId}] Serie not found for update.`);
      return NextResponse.json({ error: 'Serie no encontrada' }, { status: 404 });
    }

    // Procesar campos escalares (sin cambios relevantes aquí)
    const getString = (key: string): string | undefined => {
      const value = apiFormData.get(key);
      return typeof value === 'string' ? value : undefined;
    };

    const scalarFields: (keyof Prisma.SerieUpdateInput)[] = [
      'titulo', 'sinopsis', 'año', 'temporadas', 'estado', 'pais', 'rating', 'trailerUrl',
      'duracionPromedio', 'creador', 'productora',
    ];

    console.log("[API PUT] Processing scalar fields...");
    for (const key of scalarFields) {
      const value = apiFormData.get(key as string);
      if (value !== null && value !== undefined) {
        if (typeof value === 'string') {
          if (key === 'año' || key === 'temporadas' || key === 'duracionPromedio') {
            const numVal = parseInt(value, 10);
            if (!isNaN(numVal)) (updateData as any)[key] = numVal;
            else if (value === '') (updateData as any)[key] = null;
          } else if (key === 'rating') {
            const floatVal = parseFloat(value);
            if (!isNaN(floatVal)) (updateData as any)[key] = floatVal;
            else if (value === '') (updateData as any)[key] = null;
          } else if (key === 'estado') {
            updateData.estado = value as EstadoSerie;
          } else {
            (updateData as any)[key] = value;
          }
        }
      }
    }

    const fechaEstrenoStr = getString('fechaEstreno');
    if (fechaEstrenoStr !== undefined) {
      if (fechaEstrenoStr === '') updateData.fechaEstreno = null;
      else {
        const date = new Date(fechaEstrenoStr);
        if (!isNaN(date.getTime())) updateData.fechaEstreno = date;
      }
    }

    const serieTitleForImage = getString('titulo') || serieActual.titulo;

    // Manejo de imágenes (sin cambios relevantes aquí)
    const posterFile = apiFormData.get('posterFile');
    if (posterFile instanceof File && posterFile.size > 0) {
      if (serieActual.poster) await deleteImageFile(serieActual.poster);
      updateData.poster = await uploadImage(posterFile, 'poster', serieTitleForImage);
    } else {
      const posterSignal = getString('poster');
      if (posterSignal === '' && serieActual.poster) {
        await deleteImageFile(serieActual.poster);
        updateData.poster = null;
      }
    }

    const bannerFile = apiFormData.get('bannerFile');
    if (bannerFile instanceof File && bannerFile.size > 0) {
      if (serieActual.banner) await deleteImageFile(serieActual.banner);
      updateData.banner = await uploadImage(bannerFile, 'banner', serieTitleForImage);
    } else {
      const bannerSignal = getString('banner');
      if (bannerSignal === '' && serieActual.banner) {
        await deleteImageFile(serieActual.banner);
        updateData.banner = null;
      }
    }

    // Manejo de géneros y etiquetas con verificación
    const submittedGenreIds = apiFormData.getAll('genreIds[]').map(id => String(id));
    const submittedTagIds = apiFormData.getAll('tagIds[]').map(id => String(id));
    console.log("[API PUT] Submitted Genre IDs:", submittedGenreIds);
    console.log("[API PUT] Submitted Tag IDs:", submittedTagIds);


    if (apiFormData.has('genreIds[]') && submittedGenreIds.length > 0) {
      const existingGenres = await prisma.genero.findMany({
        where: { id: { in: submittedGenreIds } },
        select: { id: true },
      });
      const missingGenres = submittedGenreIds.filter(id => !existingGenres.some(g => g.id === id));
      if (missingGenres.length > 0) {
        console.error(`[API PUT] Géneros no encontrados: ${missingGenres.join(', ')}`);
        return NextResponse.json(
          { error: 'Uno o más géneros no existen', missingGenres },
          { status: 400 }
        );
      }
      if (missingGenres.length > 0) {
        console.error(`[API PUT] Géneros no encontrados: ${missingGenres.join(', ')}`);
        return NextResponse.json(
          { error: 'Uno o más IDs de géneros no existen', missingGenres },
          { status: 400 }
        );
      }
      updateData.generos = { set: submittedGenreIds.map(generoId => ({ serieId_generoId: { serieId, generoId } })) };
      console.log("[API PUT] Setting genres to:", updateData.generos);
    }

    if (apiFormData.has('tagIds[]') && submittedTagIds.length > 0) {
      const existingTags = await prisma.tag.findMany({
        where: { id: { in: submittedTagIds } },
        select: { id: true },
      });
      const missingTags = submittedTagIds.filter(id => !existingTags.some(t => t.id === id));
      if (missingTags.length > 0) {
        console.error(`[API PUT] Etiquetas no encontradas: ${missingTags.join(', ')}`);
        return NextResponse.json(
          { error: 'Uno o más IDs de etiquetas no existen', missingTags },
          { status: 400 }
        );
      }
      updateData.tags = { set: submittedTagIds.map(tagId => ({ serieId_tagId: { serieId, tagId } })) };
      console.log("[API PUT] Setting tags to:", updateData.tags);
    }

    console.log(`[API PUT /api/series/${serieId}] Final updateData object before Prisma call:`, updateData);

    const updatedSerie = await prisma.serie.update({
      where: { id: serieId },
      data: updateData,
      include: { generos: true, tags: true },
    });
    console.log(`[API PUT /api/series/${serieId}] Serie updated successfully:`, updatedSerie);
    return NextResponse.json(updatedSerie);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(`[API PUT] Error de Prisma: ${error.message}, Código: ${error.code}`);
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Uno o más géneros o etiquetas no existen en la base de datos' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Error en la base de datos', details: error.message, code: error.code },
        { status: 400 }
      );
    }
    console.error(`[API PUT /api/series/${serieIdFromContext}] Error al actualizar la serie:`, error);
    return NextResponse.json(
      { error: 'Error al actualizar la serie', details: error.message },
      { status: 500 }
    );
  }
}

// POST: Create serie
export async function POST(request: NextRequest) {
  console.log("[API POST /api/series] Received create request.");
  try {
    const apiFormData = await request.formData();
    console.log("[API POST] FormData received:", Array.from(apiFormData.entries()));

    const getString = (key: string, defaultValue: string = ''): string => {
      const value = apiFormData.get(key);
      return typeof value === 'string' ? value.trim() : defaultValue;
    };

    const getNumber = (key: string, defaultValue: number = 0): number => {
      const value = apiFormData.get(key);
      if (typeof value === 'string' && value.trim() !== '') {
        const parsed = parseFloat(value);
        return !isNaN(parsed) ? parsed : defaultValue;
      }
      return defaultValue;
    };

    const createData: Prisma.SerieCreateInput = {
      titulo: getString('titulo'),
      sinopsis: getString('sinopsis'),
      año: getNumber('año', new Date().getFullYear()),
      temporadas: getNumber('temporadas', 1),
      estado: getString('estado', EstadoSerie.EN_EMISION) as EstadoSerie,
      pais: getString('pais'),
      rating: getNumber('rating', 0),
      trailerUrl: getString('trailerUrl'),
      duracionPromedio: getNumber('duracionPromedio', 0),
      creador: getString('creador'),
      productora: getString('productora'),
    };

    const fechaEstrenoStr = getString('fechaEstreno');
    if (fechaEstrenoStr) {
      const date = new Date(fechaEstrenoStr);
      if (!isNaN(date.getTime())) createData.fechaEstreno = date;
    }

    if (!createData.titulo) {
      console.error("[API POST] Titulo is required.");
      return NextResponse.json({ error: "'titulo' es un campo requerido y no puede estar vacío." }, { status: 400 });
    }
    console.log("[API POST] Title for image naming:", createData.titulo);

    const posterFile = apiFormData.get('posterFile');
    if (posterFile instanceof File && posterFile.size > 0) {
      console.log("[API POST] New poster file received:", posterFile.name);
      createData.poster = await uploadImage(posterFile, 'poster', createData.titulo);
    } else {
      createData.poster = null;
    }

    const bannerFile = apiFormData.get('bannerFile');
    if (bannerFile instanceof File && bannerFile.size > 0) {
      console.log("[API POST] New banner file received:", bannerFile.name);
      createData.banner = await uploadImage(bannerFile, 'banner', createData.titulo);
    } else {
      createData.banner = null;
    }

    const submittedGenreIds = apiFormData.getAll('genreIds[]').map(id => String(id));
    const submittedTagIds = apiFormData.getAll('tagIds[]').map(id => String(id));
    console.log("[API POST] Submitted Genre IDs:", submittedGenreIds);
    console.log("[API POST] Submitted Tag IDs:", submittedTagIds);

    // Remove generos and tags from createData for now; connect after creation
    console.log("[API POST] Final createData object before Prisma call:", JSON.stringify(createData, null, 2));
    const newSerie = await prisma.serie.create({
      data: createData,
      include: { // Include relations in the response
        generos: { include: { genero: true } },
        tags: { include: { tag: true } }
      }
    });

    // Now connect genres and tags if provided
    let updatedSerie = newSerie;
    if (submittedGenreIds.length > 0 || submittedTagIds.length > 0) {
      updatedSerie = await prisma.serie.update({
        where: { id: newSerie.id },
        data: {
          ...(submittedGenreIds.length > 0 && {
            generos: {
              connect: submittedGenreIds.map(generoId => ({
                serieId_generoId: {
                  serieId: newSerie.id,
                  generoId,
                }
              }))
            }
          }),
          ...(submittedTagIds.length > 0 && {
            tags: {
              connect: submittedTagIds.map(tagId => ({
                serieId_tagId: {
                  serieId: newSerie.id,
                  tagId,
                }
              }))
            }
          }),
        },
        include: {
          generos: { include: { genero: true } },
          tags: { include: { tag: true } }
        }
      });
    }

    console.log("[API POST] Serie created successfully:", updatedSerie);
    return NextResponse.json(updatedSerie, { status: 201 });

  } catch (error: any) {
    console.error("[API POST /api/series] Error processing POST request:", error, error.stack);
    let errorMessage = error instanceof Error ? error.message : 'Unknown error during creation';
    let statusCode = 500;
    let errorCode = undefined;

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      errorMessage = "Error al crear la serie en la base de datos.";
      errorCode = error.code;
      statusCode = 400;
      console.error(`[API POST] Prisma Known Error: Code ${errorCode}, Message: ${error.message}`);
    }
    return NextResponse.json({ error: "Error al crear la serie.", details: errorMessage, code: errorCode, stack: error.stack }, { status: statusCode });
  }
}

// DELETE: Delete serie (remains largely the same)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
): Promise<NextResponse> {
  const { id: serieIdFromContext } = await context.params;
  console.log(`[API DELETE /api/series/${serieIdFromContext}] Received delete request.`);
  try {
    const id = serieIdFromContext;

    if (!id) {
      console.error("[API DELETE] Serie ID not provided.");
      return NextResponse.json({ error: 'Serie ID is required' }, { status: 400 });
    }

    const serie = await prisma.serie.findUnique({
      where: { id },
      select: { poster: true, banner: true }
    });

    if (!serie) {
      console.error(`[API DELETE /api/series/${id}] Serie not found for deletion.`);
      return NextResponse.json({ error: 'Serie not found' }, { status: 404 });
    }

    // Disconnect relations before deleting the serie to avoid foreign key constraint issues
    // if cascade delete is not set up or not working as expected.
    // This is a more explicit cleanup.
    await prisma.serie.update({
      where: { id: id },
      data: {
        generos: { set: [] }, // Disconnect all genres
        tags: { set: [] },    // Disconnect all tags
        // actores: { set: [] }, // Disconnect actors if managing this relation
        // plataformas: { set: [] }, // Disconnect platforms
        // idiomas: { set: [] } // Disconnect idiomas
        // For one-to-many like temporadas, they might need to be deleted separately
        // or handled by cascade delete in Prisma schema.
      }
    });
    console.log(`[API DELETE /api/series/${id}] Relations disconnected.`);


    if (serie.poster) await deleteImageFile(serie.poster);
    if (serie.banner) await deleteImageFile(serie.banner);

    await prisma.serie.delete({ where: { id } });
    console.log(`[API DELETE /api/series/${id}] Serie deleted successfully.`);
    return NextResponse.json({ message: 'Serie deleted successfully' });
  } catch (error: any) {
    console.error(`[API DELETE /api/series/${serieIdFromContext}] Error processing DELETE request:`, error, error.stack);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during deletion';
    return NextResponse.json(
      { error: 'Failed to delete serie', details: errorMessage, stack: error.stack },
      { status: 500 }
    );
  }
}
