import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const series = await prisma.serie.findMany({
      include: {
        generos: {
          include: { genero: true },
        },
        actores: {
          include: { actor: true },
          take: 5,
        },
        plataformas: {
          include: { plataforma: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(series);
  } catch {
    return NextResponse.json(
      { error: "Error fetching series" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const serie = await prisma.serie.create({
      data: {
        titulo: data.titulo,
        sinopsis: data.sinopsis,
        año: data.año,
        temporadas: data.temporadas || 1,
        poster: data.poster,
        generos: {
          create:
            data.generos?.map((generoId: string) => ({
              genero: { connect: { id: generoId } },
            })) || [],
        },
        actores: {
          create:
            data.actores?.map(
              (actor: {
                actorId: string;
                personaje: string;
                tipoRol: string;
              }) => ({
                actor: { connect: { id: actor.actorId } },
                personaje: actor.personaje,
                tipoRol: actor.tipoRol,
              })
            ) || [],
        },
      },
      include: {
        generos: { include: { genero: true } },
        actores: { include: { actor: true } },
      },
    });

    return NextResponse.json(serie);
  } catch (error) {
    console.error("Error creating serie:", error);
    return NextResponse.json(
      { error: "Error creating serie" },
      { status: 500 }
    );
  }
}
