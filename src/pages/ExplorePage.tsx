
import { Filter, MapPinned, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DestinationCard } from '../components/DestinationCard'
import { EmptyState } from '../components/EmptyState'
import { MapView } from '../components/MapView'
import { useAppContext } from '../context/AppContext'

export function ExplorePage() {
  const { destinations, catalogLoading, catalogError } = useAppContext()
  const [searchParams, setSearchParams] = useSearchParams()

  const [category, setCategory] = useState('All')
  const [location, setLocation] = useState('All')
  const [price, setPrice] = useState('All')
  const [rating, setRating] = useState('Any')
  const [sort, setSort] = useState('Most Popular')

  // Matches the search parameter sent by Navbar.tsx
  const searchQuery = (searchParams.get('search') ?? '').trim()

  const categories = useMemo(
    () => [
      'All',
      ...new Set(destinations.map((destination) => destination.category)),
    ],
    [destinations]
  )

  const locations = useMemo(
    () => [
      'All',
      ...new Set(
        destinations.map((destination) =>
          destination.location.split(',')[0].trim()
        )
      ),
    ],
    [destinations]
  )

  const results = useMemo(() => {
    const query = searchQuery.toLowerCase()

    const filtered = destinations.filter((destination) => {
      const searchableText = [
        destination.name,
        destination.location,
        destination.category,
        ...destination.tags,
      ]
        .join(' ')
        .toLowerCase()

      const matchesQuery =
        !query || searchableText.includes(query)

      const matchesCategory =
        category === 'All' || destination.category === category

      const matchesLocation =
        location === 'All' || destination.location.includes(location)

      const matchesPrice =
        price === 'All' || destination.price === price

      const matchesRating =
        rating === 'Any' || destination.rating >= Number(rating)

      return (
        matchesQuery &&
        matchesCategory &&
        matchesLocation &&
        matchesPrice &&
        matchesRating
      )
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
  }, [
    destinations,
    searchQuery,
    category,
    location,
    price,
    rating,
    sort,
  ])

  const clearFilters = () => {
    setCategory('All')
    setLocation('All')
    setPrice('All')
    setRating('Any')
    setSort('Most Popular')
    setSearchParams({})
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Explore Header */}
      <section className="rounded-[30px] bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">
              Explore Cebu
            </p>

            <h1 className="mt-2 text-4xl font-semibold">
              Find your next favorite escape
            </h1>

            {searchQuery && (
              <p className="mt-3 text-sm text-emerald-50">
                Search results for: <strong>{searchQuery}</strong>
              </p>
            )}
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
            <MapPinned className="h-4 w-4" />
            {results.length} curated spots
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        {/* Filters */}
        <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-slate-900">
            <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>

          <div className="space-y-5">
            {/* Location */}
            <div>
              <label htmlFor="explore-location" className="mb-2 block text-sm font-medium text-slate-700">
                Location
              </label>

              <select
                id="explore-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
              >
                {locations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="explore-category" className="mb-2 block text-sm font-medium text-slate-700">
                Category
              </label>

              <select
                id="explore-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label htmlFor="explore-price" className="mb-2 block text-sm font-medium text-slate-700">
                Price
              </label>

              <select
                id="explore-price"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
              >
                <option value="All">All</option>
                <option value="Budget">Budget</option>
                <option value="Mid-range">Mid-range</option>
                <option value="Premium">Premium</option>
              </select>
            </div>

            {/* Rating */}
            <div>
              <label htmlFor="explore-rating" className="mb-2 block text-sm font-medium text-slate-700">
                Rating
              </label>

              <select
                id="explore-rating"
                value={rating}
                onChange={(event) => setRating(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
              >
                <option value="Any">Any</option>
                <option value="4.5">4.5+</option>
                <option value="4.7">4.7+</option>
                <option value="4.8">4.8+</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label htmlFor="explore-sort" className="mb-2 block text-sm font-medium text-slate-700">
                Sort
              </label>

              <select
                id="explore-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
              >
                <option value="Most Popular">Most Popular</option>
                <option value="Highest Rated">Highest Rated</option>
                <option value="Newest">Newest</option>
                <option value="A-Z">A-Z</option>
              </select>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Clear All Filters
            </button>
          </div>
        </aside>

        {/* Destination Results */}
        <div className="space-y-6">
          {catalogLoading && (
            <p role="status" className="text-sm text-slate-600">
              Loading destinations...
            </p>
          )}

          {catalogError && (
            <p
              role="alert"
              className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800"
            >
              {catalogError}
            </p>
          )}

          <div className="flex items-center justify-between rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-2 text-slate-600">
              <Filter className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium">
                Showing {results.length} results
              </span>
            </div>

            <div className="text-sm text-slate-500">
              Sorted by {sort}
            </div>
          </div>

          {results.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
              {results.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                />
              ))}
            </div>
          ) : !catalogLoading ? (
            <EmptyState
              title="No destinations match your search"
              message="Try another destination name or clear your filters to discover more of Cebu."
            />
          ) : null}

          {/* Map View */}
          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-slate-900">
                Map view
              </h3>

              <span className="text-sm text-slate-500">
                Interactive destinations
              </span>
            </div>

            <MapView destinations={results} />
          </div>
        </div>
      </section>
    </div>
  )
}
