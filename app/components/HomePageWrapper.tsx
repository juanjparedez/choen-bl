"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type View = "grid" | "list";

// Define the HomePageSerie type (adjust fields as needed)
type HomePageSerie = {
  id: string | number;
  titulo: string;
  año?: string | number;
  poster?: string;
};

export default function HomePageWrapper({
  series,
}: {
  series: HomePageSerie[];
}) {
  const [view, setView] = useState<View>("grid");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Series recientes</h1>
        <div className="inline-flex overflow-hidden rounded-lg border">
          <button
            onClick={() => setView("grid")}
            className={`px-3 py-2 text-sm ${
              view === "grid" ? "bg-gray-100" : "bg-white"
            }`}
            aria-pressed={view === "grid"}
          >
            Cuadrícula
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-2 text-sm ${
              view === "list" ? "bg-gray-100" : "bg-white"
            }`}
            aria-pressed={view === "list"}
          >
            Lista
          </button>
        </div>
      </header>

      {series.length === 0 ? (
        <p className="text-sm text-gray-500">No hay series para mostrar.</p>
      ) : view === "grid" ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6">
          {series.map((s) => (
            <li
              key={s.id}
              className="group rounded-lg border bg-white p-2 shadow-sm"
            >
              <Link href={`/series/${s.id}`} className="block">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md">
                  {s.poster ? (
                    <Image
                      src={s.poster}
                      alt={s.titulo}
                      fill
                      sizes="(max-width:768px) 50vw, 200px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-100 text-xs text-gray-500">
                      Sin póster
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <h2 className="line-clamp-2 text-sm font-medium">
                    {s.titulo}
                  </h2>
                  <p className="text-xs text-gray-500">{s.año ?? "—"}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="divide-y rounded-lg border bg-white">
          {series.map((s) => (
            <li key={s.id} className="flex items-center gap-3 p-3">
              <div className="relative h-16 w-12 overflow-hidden rounded">
                {s.poster ? (
                  <Image
                    src={s.poster}
                    alt={s.titulo}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 text-[10px] text-gray-500">
                    Sin póster
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/series/${s.id}`}
                  className="block hover:underline"
                >
                  <h3 className="truncate text-sm font-medium">{s.titulo}</h3>
                </Link>
                <p className="text-xs text-gray-500">{s.año ?? "—"}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
