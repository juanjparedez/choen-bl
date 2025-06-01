import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod'; // For input validation

// Define input schema for POST request
const SerieCreateSchema = z.object({
  titulo: z.string().min(1, 'El título es obligatorio'),
  sinopsis: z.string().optional(),
  año: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  temporadas: z.number().int().min(1).default(1),
  poster: z.string().url().optional().nullable(),
  estado: z.enum(['EN_EMISION', 'FINALIZADA']).optional(),
  pais: z.string().optional(),
  rating: z.number().min(0).max(10).optional(),
  trailerUrl: z.string().url().optional().nullable(),
  generos: z.array(z.string()).optional(),
  actores: z
    .array(
      z.object({
        actorId: z.string().min(1, 'El ID del actor es obligatorio'),
        personaje: z.string().optional(),
        tipoRol: z.enum(['PRINCIPAL', 'SECUNDARIO', 'RECURRENTE']).optional(),
      }),
    )
    .optional(),
});

// GET: Fetch all series with related data
export async function GET() {
  try {
    const series = await prisma.serie.findMany({
      include: {
        generos: { include: { genero: true } },
        actores: {
          include: { actor: true },
          take: 5, // Consider documenting or making this configurable
        },
        plataformas: { include: { plataforma: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    return NextResponse.json(
      { error: 'Failed to fetch series', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

// POST: Create a new serie
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedData = SerieCreateSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsedData.error.flatten() },
        { status: 400 },
      );
    }

    const { generos, actores, ...serieData } = parsedData.data;

    // Validate that genres exist
    if (generos && generos.length > 0) {
      const existingGenres = await prisma.genero.findMany({
        where: { id: { in: generos } },
        select: { id: true },
      });
      if (existingGenres.length !== generos.length) {
        return NextResponse.json(
          { error: 'One or more genres do not exist' },
          { status: 400 },
        );
      }
    }

    // Validate that actors exist
    if (actores && actores.length > 0) {
      const actorIds = actores.map((a) => a.actorId);
      const existingActors = await prisma.actor.findMany({
        where: { id: { in: actorIds } },
        select: { id: true },
      });
      if (existingActors.length !== actorIds.length) {
        return NextResponse.json(
          { error: 'One or more actors do not exist' },
          { status: 400 },
        );
      }
    }

    const serie = await prisma.serie.create({
      data: {
        ...serieData,
        generos: generos
          ? {
            create: generos.map((generoId) => ({
              genero: { connect: { id: generoId } },
            })),
          }
          : undefined,
        actores: actores
          ? {
            create: actores.map((actor) => ({
              actor: { connect: { id: actor.actorId } },
              personaje: actor.personaje,
              tipoRol: actor.tipoRol,
            })),
          }
          : undefined,
      },
      include: {
        generos: { include: { genero: true } },
        actores: { include: { actor: true } },
      },
    });

    return NextResponse.json(serie, { status: 201 });
  } catch (error) {
    console.error('Error creating serie:', error);
    return NextResponse.json(
      { error: 'Failed to create serie', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}