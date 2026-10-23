import { ArrowRight, Compass, MapPin, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SearchBar } from './SearchBar'
import type { SearchResult } from '../types'

interface HeroProps {
  searchResults: SearchResult[]
}

export function Hero({ searchResults }: HeroProps) {
  const navigate = useNavigate()

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-700 text-white shadow-xl">
      <img
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80"
        alt="Cebu coast with turquoise water"
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-slate-900/20 to-emerald-900/20" />

      <div className="relative z-10 px-6 py-14 sm:px-8 lg:px-12 lg:py-16 xl:px-16">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
            <Compass className="h-4 w-4" />
            Explore the Queen City of the South
          </div>
          <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Discover Cebu
          </h1>
          <p className="mt-5 max-w-xl text-base text-emerald-50/90 sm:text-lg">
            Find unforgettable places, experiences, food, and adventures across Cebu.
          </p>
        </div>

        <div className="mt-8 max-w-3xl">
          <SearchBar
            items={searchResults}
            onSelect={(item) => {
              const routeMap: Record<string, string> = {
                Destination: `/destination/${item.slug}`,
                Restaurant: `/restaurants/${item.slug}`,
                Event: `/events/${item.slug}`,
              }

              navigate(routeMap[item.type] ?? `/explore?search=${encodeURIComponent(item.name)}`)
            }}
            onSubmit={(query) => navigate(`/explore?search=${encodeURIComponent(query)}`)}
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-white/80">
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 backdrop-blur-sm">
            <MapPin className="h-4 w-4" /> Cebu City
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 backdrop-blur-sm">
            <Search className="h-4 w-4" /> 20+ destinations
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <button type="button" onClick={() => navigate('/explore')} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg">
            Start planning
            <ArrowRight className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => navigate('/events')} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10">
            See events
          </button>
        </div>
      </div>
    </section>
  )
}
