import { PrismaClient } from "@prisma/client";
import { getPosterPath } from "@/lib/getPosterPath";
import HomePage from "./components/HomePage";

const prisma = new PrismaClient();

export interface Serie {
  id: string;
  titulo: string;
  año: number | null;
  poster: string | null;
  rating?: number | null;
  pais?: string | null;
  temporadas?: number | null;
  episodios?: number | null;
  sinopsis?: string | null;
  duracionPromedio?: number | null;
  estado?: string | null;
  creador?: string | null;
  productora?: string | null;
  trailerUrl?: string | null;
  fechaEstreno?: Date | null;
  fechaFinalizacion?: Date | null;
}

export default async function HomePageServer() {
  let series: Serie[] = [];

  try {
    const rawSeries = await prisma.serie.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        titulo: true,
        año: true,
        rating: true,
        pais: true,
        temporadas: true,
        episodios: true,
        sinopsis: true,
        duracionPromedio: true,
        estado: true,
        creador: true,
        productora: true,
        trailerUrl: true,
        fechaEstreno: true,
        fechaFinalizacion: true,
      },
    });

    series = await Promise.all(
      rawSeries.map(async (s) => ({
        ...s,
        poster: await getPosterPath(s.titulo),
      }))
    );
  } catch (error) {
    console.error("Database error:", error);
  }

  return <HomePage series={series} />;
}
