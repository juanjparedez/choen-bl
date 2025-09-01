// /app/api/actores/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const actores = await prisma.actor.findMany({
      orderBy: { nombre: "asc" }, // Solo 'nombre' existe en el schema
    });
    return NextResponse.json(actores);
  } catch {
    return NextResponse.json(
      { error: "Error fetching actors" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const actor = await prisma.actor.create({
      data: {
        nombre: data.nombre, // Campo único en tu schema
        nacionalidad: data.pais || null,
        fechaNac: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
        foto: data.foto || null,
        biografia: data.biografia || null,
      },
    });

    return NextResponse.json(actor, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error creating actor" },
      { status: 500 }
    );
  }
}
