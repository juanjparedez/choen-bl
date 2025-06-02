// /app/api/series/route.ts - Schemas corregidos

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { Buffer } from 'buffer';

const ActorInputSchema = z.object({
  actorId: z.string().min(1, 'El ID del actor es obligatorio'),
  personaje: z.string().optional(),
  tipoRol: z.enum(['PRINCIPAL', 'SECUNDARIO', 'RECURRENTE']).optional(),
});

// Schema corregido - aplica validaciones antes de preprocess
const SerieCreateSchema = z.object({
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
  // Tipado explícito para arrays
  generos: z.array(z.string()).default([]),
  actores: z.array(ActorInputSchema).default([]),
});

type SerieCreateInput = z.infer<typeof SerieCreateSchema>;

// GET: Fetch all series with related data
// export async function GET(): Promise<NextResponse> {
//   try {
//     const series = await prisma.serie.findMany({
//       include: {
//         generos: { include: { genero: true } },
//         actores: {
//           include: { actor: true },
//           take: 5,
//         },
//         plataformas: { include: { plataforma: true } },
//       },
//       orderBy: { createdAt: 'desc' },
//     });

//     return NextResponse.json(series);
//   } catch (error) {
//     console.error('Error fetching series:', error);
//     return NextResponse.json(
//       {
//         error: 'Failed to fetch series',
//         details: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     );
//   }
// }

export async function GET() {
  try {
    const series = await prisma.serie.findMany({
      include: {
        generos: { include: { genero: true } },
        plataformas: { include: { plataforma: true } },
        _count: { select: { actores: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(series)
  } catch (error) {
    console.error('Error fetching series:', error)
    return NextResponse.json(
      { error: 'Failed to fetch series' },
      { status: 500 }
    )
  }
}

// POST: Create a new serie
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const posterFile = formData.get('poster') as File | null;

    const body: Record<string, unknown> = {};

    formData.forEach((value, key) => {
      if (key === 'poster' && value instanceof File) return;

      // Parseo específico para arrays JSON
      if (key === 'generos' || key === 'actores') {
        try {
          body[key] = typeof value === 'string' ? JSON.parse(value) : [];
        } catch {
          body[key] = [];
        }
      } else {
        body[key] = value;
      }
    });

    let posterUrl: string | null = null;

    if (posterFile && posterFile.size > 0) {
      if (!posterFile.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'Invalid file type for poster. Only images are allowed.' },
          { status: 400 }
        );
      }

      const MAX_SIZE_MB = 2;
      if (posterFile.size > MAX_SIZE_MB * 1024 * 1024) {
        return NextResponse.json(
          { error: `Poster image is too large (max ${MAX_SIZE_MB}MB)` },
          { status: 400 }
        );
      }

      const bytes = await posterFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${posterFile.name.replace(/\s+/g, '_')}`;
      const uploadsDir = path.join(process.cwd(), 'public/uploads/posters');

      await fs.mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, filename);
      await fs.writeFile(filePath, buffer);

      posterUrl = `/uploads/posters/${filename}`;
      body.poster = posterUrl;
    } else if (body.poster === '') {
      body.poster = null;
    }

    const parsedData = SerieCreateSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsedData.error.flatten() },
        { status: 400 }
      );
    }

    const { generos, actores, ...serieDataFromForm } = parsedData.data;

    // Validación de géneros existentes
    if (generos.length > 0) {
      const existingGenres = await prisma.genero.findMany({
        where: { id: { in: generos } },
        select: { id: true },
      });

      if (existingGenres.length !== generos.length) {
        const foundIds = existingGenres.map(g => g.id);
        const notFoundGenres = generos.filter(id => !foundIds.includes(id));
        return NextResponse.json(
          {
            error: 'One or more genres do not exist',
            details: `Not found: ${notFoundGenres.join(', ')}`
          },
          { status: 400 }
        );
      }
    }

    // Validación de actores existentes
    if (actores.length > 0) {
      const actorIds = actores.map(a => a.actorId);
      const existingActors = await prisma.actor.findMany({
        where: { id: { in: actorIds } },
        select: { id: true },
      });

      if (existingActors.length !== actorIds.length) {
        const foundIds = existingActors.map(a => a.id);
        const notFoundActors = actorIds.filter(id => !foundIds.includes(id));
        return NextResponse.json(
          {
            error: 'One or more actors do not exist',
            details: `Not found IDs: ${notFoundActors.join(', ')}`
          },
          { status: 400 }
        );
      }
    }

    const serie = await prisma.serie.create({
      data: {
        ...serieDataFromForm,
        generos: generos.length > 0 ? {
          create: generos.map(generoId => ({
            genero: { connect: { id: generoId } },
          })),
        } : undefined,
        actores: actores.length > 0 ? {
          create: actores.map(actor => ({
            actor: { connect: { id: actor.actorId } },
            personaje: actor.personaje,
            tipoRol: actor.tipoRol,
          })),
        } : undefined,
      },
      include: {
        generos: { include: { genero: true } },
        actores: { include: { actor: true } },
      },
    });

    return NextResponse.json(serie, { status: 201 });
  } catch (error) {
    console.error('Error creating serie:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create serie',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}