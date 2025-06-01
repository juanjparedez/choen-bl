"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SearchIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

interface SearchBarProps {
  initialQuery?: string;
}

interface Serie {
  id: string;
  titulo: string;
  año: number | null;
  poster: string | null;
}

export default function SearchBar({ initialQuery = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Serie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim() === "") {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`/api/series/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/series?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative w-full max-w-lg">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar series, películas, manhwas..."
          className="border border-slate-300 dark:border-slate-600 rounded-lg p-3 pl-10 w-full focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-violet-500 dark:focus:border-violet-400 outline-none transition-shadow shadow-sm hover:shadow-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
          aria-label="Search for series, movies, or manhwas"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
        </div>
      </form>
      {isLoading && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 text-slate-600 dark:text-slate-300">
          Loading...
        </div>
      )}
      {results.length > 0 && !isLoading && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 shadow-lg rounded-lg max-h-64 overflow-y-auto">
          {results.map((serie) => (
            <a
              key={serie.id}
              href={`/series/${serie.id}`}
              className="block px-4 py-2 hover:bg-violet-100 dark:hover:bg-violet-900 text-slate-700 dark:text-slate-200"
            >
              {serie.titulo} {serie.año && `(${serie.año})`}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}