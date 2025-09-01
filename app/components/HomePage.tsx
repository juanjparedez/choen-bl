"use client";

import Image from "next/image";
import AppHeader from "./AppHeader";
import SearchBar from "./SearchBar";
import SeriesGrid from "./SeriesGrid";
import { Serie } from "../page";
import { usePersistedState } from "../hooks/usePersistedState";

export default function HomePage({ series }: { series: Serie[] }) {
  const [viewType, setViewType] = usePersistedState<"grid" | "edit">(
    "homepage-view",
    "grid"
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AppHeader />

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden py-12 md:py-20 text-center">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-violet-700 via-violet-600 to-violet-800 dark:from-violet-900 dark:via-violet-800 dark:to-violet-950" />

        <div className="pointer-events-none select-none">
          <Image
            src="/ramen.png"
            alt=""
            width={256}
            height={256}
            className="absolute hidden lg:block left-0 top-1/2 -translate-y-1/2 w-48 xl:w-64 opacity-50"
          />
          <Image
            src="/ramen.png"
            alt=""
            width={256}
            height={256}
            className="absolute hidden lg:block right-0 top-1/2 -translate-y-1/2 w-48 xl:w-64 opacity-50"
          />
        </div>

        <div className="container mx-auto px-6 relative">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Bienvenid@ a Mundo BL
          </h1>
          <p className="text-lg md:text-xl text-violet-100 max-w-2xl mx-auto">
            Tu espacio dedicado al <strong>Boys Love</strong>: sinopsis, reseñas
            y recomendaciones.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="py-8 bg-slate-100 dark:bg-slate-900 flex justify-center">
        <SearchBar />
      </section>

      {/* Series */}
      <main className="py-12 container mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 dark:text-slate-300">
            Series Destacadas
          </h2>
          <div className="inline-flex overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600">
            <button
              onClick={() => setViewType("grid")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewType === "grid"
                  ? "bg-violet-600 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewType("edit")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewType === "edit"
                  ? "bg-violet-600 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              Edición
            </button>
          </div>
        </div>

        <SeriesGrid series={series} viewType={viewType} />
      </main>

      {/* Footer */}
      <footer className="py-10 bg-slate-800 dark:bg-slate-950 text-slate-300 text-center">
        <div className="flex justify-center gap-6 mb-4">
          <a
            href="https://twitter.com"
            className="hover:text-violet-400 transition-colors"
          >
            Twitter
          </a>
          <a
            href="https://instagram.com"
            className="hover:text-violet-400 transition-colors"
          >
            Instagram
          </a>
          <a
            href="/contact"
            className="hover:text-violet-400 transition-colors"
          >
            Contacto
          </a>
        </div>
        <p>© {new Date().getFullYear()} Mundo BL</p>
        <p className="text-sm mt-2">Hecho con ❤️ para fans del BL</p>
      </footer>
    </div>
  );
}
