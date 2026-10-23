import { ArrowRight, Compass, UtensilsCrossed, Waves } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CategoryCard } from '../components/CategoryCard'
import { DestinationCard } from '../components/DestinationCard'
import { EventCard } from '../components/EventCard'
import { Hero } from '../components/Hero'
import { RestaurantCard } from '../components/RestaurantCard'
import { events, restaurants } from '../data/cebuData'
import { useAppContext } from '../context/AppContext'
import type { SearchResult } from '../types'

const travelCategories = [
  { title: 'Beaches', description: 'Sun, sand, and crystal waters', icon: <Waves className="h-5 w-5" /> },
  { title: 'Food', description: 'Local flavors and Cebu lechon', icon: <UtensilsCrossed className="h-5 w-5" /> },
  { title: 'Culture', description: 'Historic landmarks and traditions', icon: <Compass className="h-5 w-5" /> },
]

export function HomePage() {
  const { destinations } = useAppContext()
  const searchResults: SearchResult[] = [
    ...destinations.map((destination) => ({ id: destination.id, name: destination.name, type: 'Destination', slug: destination.slug, image: destination.image })),
    ...restaurants.map((restaurant) => ({ id: restaurant.id, name: restaurant.name, type: 'Restaurant', slug: restaurant.slug, image: restaurant.image })),
    ...events.map((event) => ({ id: event.id, name: event.name, type: 'Event', slug: event.slug, image: event.image })),
  ]

  return (
    <div className="space-y-10 pb-10">
      <Hero searchResults={searchResults} />

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Popular destinations</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Explore Cebu’s standout spots</h2>
          </div>
          <Link to="/explore" className="hidden items-center gap-2 text-sm font-semibold text-emerald-700 sm:inline-flex">
            Browse all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {destinations.slice(0, 6).map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      </section>

      <section className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Categories</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Things to do in Cebu</h2>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {travelCategories.map((category) => (
            <CategoryCard key={category.title} title={category.title} description={category.description} icon={category.icon} />
          ))}
        </div>
      </section>

      <section className="rounded-[30px] bg-gradient-to-r from-emerald-600 to-cyan-600 p-6 text-white shadow-sm ring-1 ring-emerald-500/40">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">Interactive map</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">See Cebu laid out on the map</h2>
          </div>
          <Link to="/map" className="inline-flex items-center gap-2 self-start rounded-full bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50">
            Open map <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Food & dining</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Must-try Cebu flavors</h2>
          </div>
          <Link to="/food" className="hidden items-center gap-2 text-sm font-semibold text-orange-600 sm:inline-flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {restaurants.slice(0, 4).map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Upcoming events</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">What’s happening in Cebu</h2>
          </div>
          <Link to="/events" className="hidden items-center gap-2 text-sm font-semibold text-violet-600 sm:inline-flex">
            See calendar <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  )
}
