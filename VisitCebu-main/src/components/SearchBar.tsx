import { Search, X } from 'lucide-react'
import { useState } from 'react'
import type { SearchResult } from '../types'

interface SearchBarProps {
  items: SearchResult[]
  onSelect: (item: SearchResult) => void
  value?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
}

export function SearchBar({ items, onSelect, value = '', onChange, onSubmit }: SearchBarProps) {
  const [query, setQuery] = useState(value)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      onSubmit?.(trimmed)
    }
  }

  const handleInputChange = (nextQuery: string) => {
    setQuery(nextQuery)
    onChange?.(nextQuery)
  }

  const suggestions = items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5)

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
      <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 shadow-sm focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          value={query}
          onChange={(event) => handleInputChange(event.target.value)}
          aria-label="Search destinations, attractions, restaurants, and activities"
          placeholder="Search Cebu destinations, food, and adventures"
          className="flex-1 border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
        {query ? (
          <button type="button" onClick={() => handleInputChange('')} className="rounded-full p-1 text-slate-400 hover:text-slate-800" aria-label="Clear search">
            <X className="h-4 w-4" />
          </button>
        ) : null}
        <button type="submit" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-200 hover:bg-emerald-700">
          Search
        </button>
      </div>

      {query && suggestions.length ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-20 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          {suggestions.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              type="button"
              onClick={() => {
                handleInputChange(item.name)
                onSelect(item)
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50"
            >
              <img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl object-cover shadow-sm ring-1 ring-slate-200" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-slate-800">{item.name}</div>
                <div className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-slate-500">{item.type}</div>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </form>
  )
}
