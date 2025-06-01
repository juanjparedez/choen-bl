import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.toLowerCase() || "";

  try {
    const series = await prisma.serie.findMany({
      where: {
        OR: [
          { titulo: { contains: query } },

        ],
      },
      take: 10, // Limit results
      select: {
        id: true,
        titulo: true,
        año: true,
        poster: true,
      },
    });
    return NextResponse.json(series);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Failed to search series" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}