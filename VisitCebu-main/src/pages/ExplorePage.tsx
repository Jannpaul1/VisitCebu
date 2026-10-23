import { Filter, MapPinned, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DestinationCard } from '../components/DestinationCard'
import { EmptyState } from '../components/EmptyState'
import { MapView } from '../components/MapView'
import { useAppContext } from '../context/AppContext'

export function ExplorePage() {
  const { destinations, catalogLoading, catalogError } = useAppContext()
  const [searchParams] = useSearchParams()
  const [category, setCategory] = useState('All')
  const [location, setLocation] = useState('All')
  const [price, setPrice] = useState('All')
  const [rating, setRating] = useState('Any')
  const [sort, setSort] = useState('Most Popular')

  const categories = ['All', ...new Set(destinations.map((destination) => destination.category))]
  const locations = ['All', ...new Set(destinations.map((destination) => destination.location.split(',')[0].trim()))]

  const results = useMemo(() => {
    const query = (searchParams.get('query') ?? '').toLowerCase().trim()

    const filtered = destinations.filter((destination) => {
      const matchesQuery =
        !query ||
        destination.name.toLowerCase().includes(query) ||
        destination.location.toLowerCase().includes(query) ||
        destination.category.toLowerCase().includes(query) ||
        destination.tags.join(' ').toLowerCase().includes(query)

      const matchesCategory = category === 'All' || destination.category === category
      const matchesLocation = location === 'All' || destination.location.includes(location)
      const matchesPrice = price === 'All' || destination.price === price
      const matchesRating = rating === 'Any' || destination.rating >= Number(rating)

      return matchesQuery && matchesCategory && matchesLocation && matchesPrice && matchesRating
    })

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case 'Highest Rated':
          return b.rating - a.rating
        case 'Newest':
          return b.reviewCount - a.reviewCount
        case 'A-Z':
          return a.name.localeCompare(b.name)
        default:
          return b.reviewCount - a.reviewCount
      }
    })
  }, [category, destinations, location, price, rating, sort, searchParams])

  return (
    <div className="space-y-8 pb-10">
      <section className="rounded-[30px] bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">Explore Cebu</p>
            <h1 className="mt-2 text-4xl font-semibold">Find your next favorite escape</h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
            <MapPinned className="h-4 w-4" />
            {results.length} curated spots
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-slate-900">
            <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Location</label>
              <select value={location} onChange={(event) => setLocation(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500">
                {locations.map((item, index) => (
                  <option key={`${item}-${index}`} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500">
                {categories.map((item, index) => (
                  <option key={`${item}-${index}`} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Price</label>
              <select value={price} onChange={(event) => setPrice(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500">
                <option value="All">All</option>
                <option value="Budget">Budget</option>
                <option value="Mid-range">Mid-range</option>
                <option value="Premium">Premium</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Rating</label>
              <select value={rating} onChange={(event) => setRating(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500">
                <option value="Any">Any</option>
                <option value="4.5">4.5+</option>
                <option value="4.7">4.7+</option>
                <option value="4.8">4.8+</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Sort</label>
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500">
                <option value="Most Popular">Most Popular</option>
                <option value="Highest Rated">Highest Rated</option>
                <option value="Newest">Newest</option>
                <option value="A-Z">A-Z</option>
              </select>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          {catalogLoading ? <p role="status" className="text-sm text-slate-600">Loading destinations...</p> : null}
          {catalogError ? <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{catalogError}</p> : null}
          <div className="flex items-center justify-between rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-2 text-slate-600">
              <Filter className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium">Showing {results.length} results</span>
            </div>
            <div className="text-sm text-slate-500">Sorted by {sort}</div>
          </div>

          {results.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
              {results.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No destinations match your current filters"
              message="Try revising your search criteria or clearing a filter to discover more of Cebu."
            />
          )}

          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-slate-900">Map view</h3>
              <span className="text-sm text-slate-500">Interactive destinations</span>
            </div>
            <MapView destinations={results.length ? results : destinations} />
          </div>
        </div>
      </section>
    </div>
  )
}
