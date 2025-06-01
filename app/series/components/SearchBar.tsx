'use client'
export function SearchBar({ onSearch }: { onSearch: (term: string) => void }) {
  return (
    <input
      type="search"
      placeholder="Buscar series..."
      onChange={(e) => onSearch(e.target.value)}
      className="px-4 py-2 border rounded-lg w-full md:w-64"
    />
  )
}