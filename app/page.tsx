import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import SearchBar from "./components/SearchBar";
import AppHeader from "./components/AppHeader";
import { getPosterPath } from "@/lib/getPosterPath";

const prisma = new PrismaClient();

interface HomePageSerie {
  id: string;
  titulo: string;
  año: number | null;
  poster: string | null;
  genero?: string | null;
}

export default async function HomePage() {
  let rawSeriesData: {
    id: string;
    titulo: string;
    año: number | null;
  }[] = [];
  try {
    rawSeriesData = await prisma.serie.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        titulo: true,
        año: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch series for homepage:", error);
  } finally {
    await prisma.$disconnect();
  }

  const series: HomePageSerie[] = await Promise.all(
    rawSeriesData.map(async (serieData) => {
      const posterPath = await getPosterPath(serieData.titulo);
      return {
        ...serieData,
        poster: posterPath,
      };
    })
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans antialiased">
      <AppHeader />

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden py-12 md:py-20 text-center">
        {/* Fondo degradé violeta */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-violet-700 via-violet-600 to-violet-800 dark:from-violet-900 dark:via-violet-800 dark:to-violet-950" />

        {/* Imágenes decorativas a los costados (ocultas en pantallas pequeñas) */}
        <img
          src="/ramen.png"
          alt=""
          className="pointer-events-none select-none absolute hidden lg:block
               left-0 top-1/2 -translate-y-1/2 w-48 xl:w-64 opacity-50"
        />
        <img
          src="/ramen.png"
          alt=""
          className="pointer-events-none select-none absolute hidden lg:block
               right-0 top-1/2 -translate-y-1/2 w-48 xl:w-64 opacity-50"
        />

        {/* Contenido principal */}
        <div className="container mx-auto px-6 relative">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Bienvenidx a Mundo BL
          </h1>
          <p className="text-lg md:text-xl text-violet-100 max-w-2xl mx-auto">
            Este es mi espacio dedicado al <strong>Boys Love</strong>. Aquí encontrarás
            sinopsis, reseñas detalladas, análisis de personajes y recomendaciones hechas con cariño.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 bg-slate-100 dark:bg-slate-900">
        <div className="container mx-auto px-6 flex justify-center">
          <SearchBar />
        </div>
      </section>

      {/* Cards Grid */}
      <main className="py-12">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 dark:text-slate-300 mb-8 text-center md:text-left">
            Explora Contenido Destacado
          </h2>
          {series.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {series.map((serie) => (
                <Link
                  key={serie.id}
                  href={`/series/${serie.id}`}
                  className="group block"
                  aria-label={`View details for ${serie.titulo}`}
                >
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden h-full flex flex-col transform hover:scale-105 hover:shadow-xl transition-all duration-300 ease-out">
                    <div className="relative h-56 bg-slate-200 dark:bg-slate-700"> {/* Considera aspect-[3/4] o similar si las imágenes son retrato */}
                      <img
                        src={serie.poster ?? "img/default-poster.png"}
                        alt={serie.titulo}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-0 transition-opacity duration-300"></div>
                      {serie.genero && (
                        <span className="absolute top-2 left-2 bg-violet-600 text-white text-xs font-semibold px-2 py-1 rounded">
                          {serie.genero}
                        </span>
                      )}
                    </div>
                    <div className="p-5 text-center flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors duration-300">
                          {serie.titulo}
                        </h3>
                        {serie.año && (
                          <p className="text-sm text-slate-500 dark:text-slate-400">{serie.año}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 dark:text-slate-400 py-10">
              No hay series destacadas en este momento. ¡Vuelve pronto!
            </p>
          )}
          <div className="text-center mt-8">
            <Link
              href="/series"
              className="inline-block px-6 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors"
            >
              Ver Más Series
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 bg-slate-800 dark:bg-slate-950 text-slate-300 dark:text-slate-400 text-center">
        <div className="container mx-auto px-6">
          <div className="flex justify-center space-x-4 mb-4">
            <a href="https://twitter.com" className="hover:text-violet-400">Twitter</a>
            <a href="https://instagram.com" className="hover:text-violet-400">Instagram</a>
            <a href="/contact" className="hover:text-violet-400">Contacto</a>
          </div>
          <p>© {new Date().getFullYear()} Mundo BL. Todos los derechos reservados.</p>
          <p className="text-sm mt-1">Hecho con ❤️ para fans del BL.</p>
        </div>
      </footer>
    </div>
  );
}