
import { useEffect, useMemo, useState } from 'react'
import { divIcon } from 'leaflet'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'
import { Link } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import type { Destination } from '../types'

interface MapViewProps {
  destinations: Destination[]
}

const DEFAULT_CENTER: [number, number] = [10.3157, 123.8854]

const REGIONS = [
  'All',
  'City',
  'North Cebu',
  'South Cebu',
  'Central Cebu',
  'Mountain & Hills',
]

function normalize(value: string) {
  return value.toLowerCase().trim()
}

function matchesSearch(place: Destination, query: string) {
  const searchText = normalize(
    `${place.name} ${place.location} ${place.category} ${(place.tags || []).join(' ')}`
  )

  return searchText.includes(normalize(query))
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

function hasValidCoordinates(place: Destination) {
  const lat = Number(place.coordinates?.lat)
  const lng = Number(place.coordinates?.lng)

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0)
  )
}

// Approximate Cebu region matching.
// For exact administrative classification,
// add a dedicated region field to your database.
function getRegion(place: Destination): string {
  const location = normalize(place.location || '')
  const name = normalize(place.name || '')
  const combined = `${location} ${name}`

  const containsAny = (keywords: string[]) =>
    keywords.some((keyword) => combined.includes(keyword))

  // North Cebu
  if (
    containsAny([
      'bantayan',
      'malapascua',
      'daanbantayan',
      'medellin',
      'bogo',
      'san remigio',
      'tabogon',
      'borbon',
      'sogod',
      'catmon',
      'carmen',
      'danao',
      'compostela',
      'liloan',
      'camotes',
      'pilar',
      'poro',
      'san francisco',
      'tudela',
      'northern cebu',
      'north cebu',
    ])
  ) {
    return 'North Cebu'
  }

  // South Cebu
  if (
    containsAny([
      'moalboal',
      'badian',
      'oslob',
      'alegria',
      'malabuyoc',
      'ginatilan',
      'samboan',
      'santander',
      'boljoon',
      'alcoy',
      'dalaguete',
      'argao',
      'sibonga',
      'carcar',
      'barili',
      'dumanjug',
      'ronda',
      'alcantara',
      'pinamungajan',
      'aloguinsan',
      'toledo',
      'south cebu',
      'southern cebu',
    ])
  ) {
    return 'South Cebu'
  }

  // Cebu City and nearby urban areas
  if (
    containsAny([
      'cebu city',
      'lapu-lapu',
      'lapu lapu',
      'mactan',
      'mandaue',
      'cordova',
      'talisay city',
      'magellan',
      'fort san pedro',
      'basilica del santo',
      'colon street',
      'temple of leah',
      'sirao',
      'tops lookout',
      'tops cebu',
      'busay',
    ])
  ) {
    return 'City'
  }

  // Central Cebu
  if (
    containsAny([
      'balamban',
      'asturias',
      'tuburan',
      'tabuelan',
      'minglanilla',
      'naga city',
      'consolacion',
      'central cebu',
    ])
  ) {
    return 'Central Cebu'
  }

  return 'Unclassified'
}

function isMountainOrHill(place: Destination) {
  const category = normalize(place.category || '')
  const text = normalize(
    `${place.name} ${place.location} ${(place.tags || []).join(' ')}`
  )

  return (
    category.includes('mountain') ||
    category.includes('hill') ||
    text.includes('mountain') ||
    text.includes('hill') ||
    text.includes('peak') ||
    text.includes('highland') ||
    text.includes('hiking') ||
    text.includes('viewpoint')
  )
}

function matchesRegion(place: Destination, region: string) {
  if (region === 'All') return true

  if (region === 'Mountain & Hills') {
    return isMountainOrHill(place)
  }

  return getRegion(place) === region
}

function MapController({
  destinations,
  selectedPlace,
}: {
  destinations: Destination[]
  selectedPlace: Destination | null
}) {
  const map = useMap()

  useEffect(() => {
    const validDestinations = destinations.filter(hasValidCoordinates)

    if (selectedPlace && hasValidCoordinates(selectedPlace)) {
      map.flyTo(
        [
          selectedPlace.coordinates.lat,
          selectedPlace.coordinates.lng,
        ],
        11,
        { duration: 0.8 }
      )
      return
    }

    if (validDestinations.length === 0) {
      map.setView(DEFAULT_CENTER, 9)
      return
    }

    const bounds = validDestinations.map(
      (place) =>
        [
          place.coordinates.lat,
          place.coordinates.lng,
        ] as [number, number]
    )

    if (bounds.length === 1) {
      map.setView(bounds[0], 11)
    } else {
      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 12,
      })
    }
  }, [destinations, selectedPlace, map])

  return null
}

export function MapView({ destinations }: MapViewProps) {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)

  // Only use destinations that have valid map coordinates.
  const mapDestinations = useMemo(
    () => destinations.filter(hasValidCoordinates),
    [destinations]
  )

  // Filter by region and search first.
  const regionDestinations = useMemo(() => {
    return mapDestinations.filter(
      (place) =>
        matchesRegion(place, selectedRegion) &&
        matchesSearch(place, query)
    )
  }, [mapDestinations, selectedRegion, query])

  // Only show categories available for the selected region/search.
  const categories = useMemo(() => {
    const available = [
      ...new Set(regionDestinations.map((place) => place.category)),
    ].filter(Boolean)

    return ['All', ...available.sort()]
  }, [regionDestinations])

  // If selected category is unavailable, automatically return to All.
  useEffect(() => {
    if (!categories.includes(selectedCategory)) {
      setSelectedCategory('All')
    }
  }, [categories, selectedCategory])

  const filteredDestinations = useMemo(() => {
    return regionDestinations.filter(
      (place) =>
        selectedCategory === 'All' ||
        place.category === selectedCategory
    )
  }, [regionDestinations, selectedCategory])

  // Keep a selected destination only while it matches the filters.
  const activePlace = useMemo(() => {
    if (!selectedPlaceId) return null

    return (
      filteredDestinations.find(
        (place) => place.id === selectedPlaceId
      ) ?? null
    )
  }, [filteredDestinations, selectedPlaceId])

  const resetFilters = () => {
    setQuery('')
    setSelectedCategory('All')
    setSelectedRegion('All')
    setSelectedPlaceId(null)
  }

  const selectRegion = (region: string) => {
    setSelectedRegion(region)
    setSelectedCategory('All')
    setSelectedPlaceId(null)
  }

  const selectCategory = (category: string) => {
    setSelectedCategory(category)
    setSelectedPlaceId(null)
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start">
      {/* Sidebar */}
      <aside className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 xl:sticky xl:top-24 xl:self-start">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <label
              htmlFor="map-search"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Search destinations
            </label>

            <input
              id="map-search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setSelectedPlaceId(null)
              }}
              placeholder="Search by place or keyword"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-cyan-500"
            />
          </div>

          {/* Regions */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">
              Regions
            </p>

            <div className="flex flex-wrap gap-2">
              {REGIONS.map((region) => {
                const count = mapDestinations.filter(
                  (place) =>
                    matchesRegion(place, region) &&
                    matchesSearch(place, query)
                ).length

                const isSelected = selectedRegion === region

                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => selectRegion(region)}
                    disabled={count === 0 && !isSelected}
                    title={`${count} destinations`}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : count === 0
                        ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                        : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {region} ({count})
                  </button>
                )
              })}
            </div>
          </div>

          {/* Categories */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">
              Categories
            </p>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const count =
                  category === 'All'
                    ? regionDestinations.length
                    : regionDestinations.filter(
                        (place) => place.category === category
                      ).length

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => selectCategory(category)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      selectedCategory === category
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {category} ({count})
                  </button>
                )
              })}
            </div>
          </div>

          {/* Results and Reset */}
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <p className="text-sm font-semibold text-slate-700">
              {filteredDestinations.length}{' '}
              {filteredDestinations.length === 1
                ? 'destination'
                : 'destinations'}{' '}
              found
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Destination List */}
        <div className="mt-5 space-y-3">
          {filteredDestinations.length > 0 ? (
            filteredDestinations.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => setSelectedPlaceId(place.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-2 text-left transition ${
                  activePlace?.id === place.id
                    ? 'border-cyan-500 bg-cyan-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-cyan-200'
                }`}
              >
                <img
                  src={place.image}
                  alt={place.name}
                  className="h-16 w-16 rounded-xl object-cover"
                  loading="lazy"
                />

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-800">
                    {place.name}
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    {place.location}
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-cyan-700">
                      {place.category}
                    </span>

                    <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-cyan-700">
                      {place.price}
                    </span>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
              <p className="font-semibold text-slate-700">
                No destinations found
              </p>

              <p className="mt-2">
                There are no destinations matching the selected filters.
                Try another region or category.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-full bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-700"
              >
                Show All Destinations
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Map */}
      <div className="relative h-[560px] overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm xl:sticky xl:top-24">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={9}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController
            destinations={filteredDestinations}
            selectedPlace={activePlace}
          />

          {filteredDestinations.map((place) => (
            <Marker
              key={place.id}
              title={place.name}
              position={[
                place.coordinates.lat,
                place.coordinates.lng,
              ]}
              icon={createMarkerIcon(activePlace?.id === place.id)}
              eventHandlers={{
                click: () => setSelectedPlaceId(place.id),
              }}
            >
              <Popup>
                <div className="max-w-[220px] p-1">
                  <img
                    src={place.image}
                    alt={place.name}
                    className="mb-2 h-24 w-full rounded-xl object-cover"
                  />

                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-slate-800">
                      {place.name}
                    </div>

                    <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-cyan-700">
                      {place.price}
                    </span>
                  </div>

                  <div className="mb-2 text-xs text-slate-500">
                    {place.category}
                  </div>

                  <Link
                    to={`/destination/${place.slug}`}
                    className="text-xs font-semibold text-cyan-700"
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {filteredDestinations.length === 0 && (
          <div className="pointer-events-none absolute bottom-5 left-1/2 z-[500] w-[90%] max-w-sm -translate-x-1/2 rounded-2xl bg-white/95 p-4 text-center text-sm text-slate-700 shadow-lg">
            No matching destinations to display on the map.
          </div>
        )}
      </div>
    </div>
  )
}
