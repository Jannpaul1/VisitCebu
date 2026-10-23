import { MapView } from '../components/MapView'
import { useAppContext } from '../context/AppContext'

export function MapPage() {
  const { destinations, catalogLoading, catalogError } = useAppContext()
  const stats = [
    { label: 'Destinations', value: String(destinations.length) },
    { label: 'Categories', value: String(new Set(destinations.map((place) => place.category)).size) },
    { label: 'Best for', value: 'Beaches + culture' },
  ]

  return (
    <div className="space-y-6 pb-10">
      <section className="rounded-[30px] bg-gradient-to-r from-cyan-700 to-sky-600 p-8 text-white shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">Interactive map</p>
        <h1 className="mt-2 text-4xl font-semibold">Explore Cebu on the map</h1>
        <p className="mt-3 max-w-2xl text-sm text-cyan-50">
          Filter by category, search locations, and click destinations to focus on the places you want to visit.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="text-2xl font-semibold text-white">{stat.value}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.18em] text-cyan-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {catalogLoading ? <p role="status" className="text-sm text-slate-600">Loading destinations...</p> : null}
      {catalogError ? <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{catalogError}</p> : null}

      <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
        <MapView destinations={destinations} />
      </div>
    </div>
  )
}
