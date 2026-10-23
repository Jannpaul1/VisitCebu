import { useEffect, useMemo, useState } from 'react'
import { divIcon } from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { Destination } from '../types'

interface MapViewProps {
  destinations: Destination[]
}

function createMarkerIcon(active: boolean) {
  return divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        display:flex;
        align-items:center;
        justify-content:center;
        width:18px;
        height:18px;
        border-radius:9999px;
        border:3px solid white;
        box-shadow:0 8px 24px rgba(15,23,42,0.18);
        background:${active ? '#0f766e' : '#38bdf8'};
        transform:scale(${active ? 1.2 : 1});
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  })
}

function MapController({ destinations, selectedPlace }: { destinations: Destination[]; selectedPlace: Destination | null }) {
  const map = useMap()

  useEffect(() => {
    if (!destinations.length) return

    if (selectedPlace) {
      map.flyTo([selectedPlace.coordinates.lat, selectedPlace.coordinates.lng], 10, { duration: 1.2 })
      return
    }

    const bounds = destinations.map((place) => [place.coordinates.lat, place.coordinates.lng] as [number, number])
    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [30, 30] })
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 11)
    }

    map.setView([10.3157, 123.8854], 8)
  }, [destinations, map, selectedPlace])

  return null
}

export function MapView({ destinations }: MapViewProps) {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [selectedPlace, setSelectedPlace] = useState<Destination | null>(null)

  const categories = useMemo(
    () => ['All', ...new Set(destinations.map((place) => place.category))],
    [destinations],
  )

  const regions = useMemo(
    () => [
      'All',
      'City',
      'North Cebu',
      'South Cebu',
      'Central Cebu',
      'Mountain & Hills',
    ],
    [],
  )

  const matchesRegion = (place: Destination, region: string) => {
    const location = place.location.toLowerCase()

    switch (region) {
      case 'City':
        return location.includes('cebu city') || location.includes('lapu-lapu') || location.includes('mactan')
      case 'North Cebu':
        return location.includes('northern') || location.includes('bantayan') || location.includes('malapascua') || location.includes('danao') || location.includes('tagbilaran')
      case 'South Cebu':
        return location.includes('south') || location.includes('badian') || location.includes('oslob') || location.includes('dalaguete') || location.includes('moalboal')
      case 'Central Cebu':
        return location.includes('busay') || location.includes('sibonga') || location.includes('middle') || location.includes('cebu')
      case 'Mountain & Hills':
        return place.category === 'Mountains' || place.category === 'Nature' || place.category === 'Waterfalls'
      default:
        return true
    }
  }

  const filteredDestinations = useMemo(() => {
    return destinations.filter((place) => {
      const matchesCategory = selectedCategory === 'All' || place.category === selectedCategory
      const matchesRegionFilter = selectedRegion === 'All' || matchesRegion(place, selectedRegion)
      const searchText = `${place.name} ${place.location} ${place.tags.join(' ')}`.toLowerCase()
      const matchesQuery = searchText.includes(query.trim().toLowerCase())
      return matchesCategory && matchesRegionFilter && matchesQuery
    })
  }, [destinations, query, selectedCategory, selectedRegion])

  const activePlace =
    selectedPlace && filteredDestinations.some((place) => place.id === selectedPlace.id)
      ? selectedPlace
      : filteredDestinations[0] ?? null

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start">
      <aside className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 xl:sticky xl:top-24 xl:self-start">
        <div className="space-y-4">
          <div>
            <label htmlFor="map-search" className="mb-2 block text-sm font-medium text-slate-700">Search destinations</label>
            <input
              id="map-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by place or keyword"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none ring-0 placeholder:text-slate-400 focus:border-cyan-500"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Regions</p>
            <div className="flex flex-wrap gap-2">
              {regions.map((region, index) => (
                <button
                  key={`${region}-${index}`}
                  type="button"
                  onClick={() => setSelectedRegion(region)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
                    selectedRegion === region
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Categories</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <button
                  key={`${category}-${index}`}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    selectedCategory === category
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {filteredDestinations.length ? (
            filteredDestinations.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => setSelectedPlace(place)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-2 text-left transition ${
                  activePlace?.id === place.id
                    ? 'border-cyan-500 bg-cyan-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-cyan-200'
                }`}
              >
                <img src={place.image} alt={place.name} className="h-16 w-16 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-800">{place.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{place.location}</div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-cyan-700">{place.category}</span>
                    <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-cyan-700">{place.price}</span>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
              No destinations match this search.
            </div>
          )}
        </div>
      </aside>

      <div className="h-[560px] overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm xl:sticky xl:top-24">
        <MapContainer center={[10.3157, 123.8854]} zoom={8} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController destinations={filteredDestinations} selectedPlace={activePlace} />

          {filteredDestinations.map((place) => (
            <Marker
              key={place.id}
              position={[place.coordinates.lat, place.coordinates.lng]}
              icon={createMarkerIcon(activePlace?.id === place.id)}
              eventHandlers={{ click: () => setSelectedPlace(place) }}
            >
              <Popup>
                <div className="max-w-[220px] p-1">
                  <img src={place.image} alt={place.name} className="mb-2 h-24 w-full rounded-xl object-cover" />
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-slate-800">{place.name}</div>
                    <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-cyan-700">{place.price}</span>
                  </div>
                  <div className="mb-2 text-xs text-slate-500">{place.category}</div>
                  <a href={`/destination/${place.slug}`} className="text-xs font-semibold text-cyan-700">
                    View Details
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
