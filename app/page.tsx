import { PrismaClient } from "@prisma/client";
import { cache } from "react";
import HomePage from "./components/HomePage";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export interface Serie {
  id: string;
  titulo: string;
  año: number | null;
  poster: string | null;
  rating: number | null;
  pais: string | null;
  temporadas: number | null;
  episodios: number | null;
  sinopsis: string | null;
  estado: string | null;
  fechaEstreno: Date | null;
}

const getRecentSeries = cache(async (): Promise<Serie[]> => {
  try {
    return await prisma.serie.findMany({
      take: 20,
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        titulo: true,
        año: true,
        poster: true,
        rating: true,
        pais: true,
        temporadas: true,
        episodios: true,
        sinopsis: true,
        estado: true,
        fechaEstreno: true,
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
});

export default async function HomePageServer() {
  const series = await getRecentSeries();
  return <HomePage series={series} />;
}
