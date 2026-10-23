
import { useMemo, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { ItineraryCard } from '../components/ItineraryCard'
import { useAppContext } from '../context/AppContext'

export function ItineraryPage() {
  const {
    destinations,
    itineraries,
    travelDataLoading,
    travelDataError,
    createItinerary,
    renameItinerary,
    deleteItinerary,
    addItineraryDay,
    addItemToItinerary,
    updateItineraryItem,
    removeItemFromItinerary,
    moveItemBetweenDays,
    moveItemWithinDay,
  } = useAppContext()

  const [name, setName] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selectedItineraryId, setSelectedItineraryId] = useState('')
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const [feedback, setFeedback] = useState('')

  const categories = useMemo(
    () => [
      'All',
      ...Array.from(
        new Set(destinations.map((item) => item.category))
      ).sort(),
    ],
    [destinations]
  )

  const filteredDestinations = useMemo(() => {
    const query = search.trim().toLowerCase()

    return destinations.filter((destination) => {
      const matchesSearch =
        !query ||
        destination.name.toLowerCase().includes(query) ||
        destination.location.toLowerCase().includes(query) ||
        destination.category.toLowerCase().includes(query)

      const matchesCategory =
        category === 'All' ||
        destination.category === category

      return matchesSearch && matchesCategory
    })
  }, [destinations, search, category])

  const visibleDestinations = showAll
    ? filteredDestinations
    : filteredDestinations.slice(0, 6)

  const selectedItinerary =
    itineraries.find(
      (item) => item.id === selectedItineraryId
    ) ?? itineraries[0]

  const selectedDay =
    selectedItinerary?.days[selectedDayIndex] ??
    selectedItinerary?.days[0]

  const handleNewTrip = () => {
    const tripName = name.trim()

    if (!tripName) {
      setFeedback('Please enter a trip name first.')
      return
    }

    const itinerary = createItinerary(tripName)

    setSelectedItineraryId(itinerary.id)
    setSelectedDayIndex(0)
    setName('')
    setFeedback(`Created "${itinerary.name}" successfully.`)
  }

  const handleAddDestination = (destinationId: string) => {
    if (travelDataLoading) {
      setFeedback('Please wait while your trips load.')
      return
    }

    const destination = destinations.find(
      (item) => item.id === destinationId
    )

    if (!destination) return

    let itinerary = selectedItinerary

    if (!itinerary) {
      itinerary = createItinerary('My Cebu Adventure')
      setSelectedItineraryId(itinerary.id)
      setSelectedDayIndex(0)
    }

    const dayIndex = Math.max(
      0,
      itinerary.days.findIndex(
        (day) =>
          day.id ===
          (selectedDay?.id ?? itinerary.days[0]?.id)
      )
    )

    const day = itinerary.days[dayIndex]

    if (!day) {
      setFeedback(
        'Please add a day to your itinerary first.'
      )
      return
    }

    const alreadyAdded = day.items.some(
      (item) =>
        item.type === 'destination' &&
        item.slug === destination.slug
    )

    if (alreadyAdded) {
      setFeedback(
        `${destination.name} is already in ${day.title}.`
      )
      return
    }

    addItemToItinerary(
      itinerary.id,
      {
        id: crypto.randomUUID(),
        name: destination.name,
        type: 'destination',
        image: destination.image,
        slug: destination.slug,
        notes: '',
      },
      dayIndex
    )

    setFeedback(
      `${destination.name} added to ${itinerary.name} — ${day.title}.`
    )
  }

  const isDestinationAdded = (slug: string) =>
    Boolean(
      selectedDay?.items.some(
        (item) =>
          item.type === 'destination' &&
          item.slug === slug
      )
    )

  return (
    <div className="space-y-8 pb-10">
      {/* Page heading */}
      <section className="rounded-[30px] bg-gradient-to-r from-emerald-700 to-teal-600 p-6 text-white shadow-xl sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">
          Planner
        </p>

        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
          Your Cebu itinerary
        </h1>

        <p className="mt-3 max-w-2xl text-sm text-emerald-50">
          Discover destinations, organize your travel days,
          and create your perfect Cebu adventure.
        </p>
      </section>

      {/* Create itinerary */}
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">
          Create a new itinerary
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Give your trip a name to start planning.
        </p>

        <form
          className="mt-4 flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault()
            handleNewTrip()
          }}
        >
          <label
            htmlFor="itinerary-name"
            className="sr-only"
          >
            Trip name
          </label>

          <input
            id="itinerary-name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="e.g. 3 Days in Cebu"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
          />

          <button
            type="submit"
            disabled={travelDataLoading}
            className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Create itinerary
          </button>
        </form>
      </section>

      {/* Destination selection */}
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Explore & Add Destinations
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose from {destinations.length} Cebu
              destinations and add them to your travel plan.
            </p>
          </div>

          <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {filteredDestinations.length} available
          </span>
        </div>

        {/* Itinerary and day selection */}
        {itineraries.length > 0 && (
          <div className="mt-5 grid gap-4 rounded-2xl bg-emerald-50 p-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="select-itinerary"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Add to itinerary
              </label>

              <select
                id="select-itinerary"
                value={selectedItinerary?.id ?? ''}
                onChange={(event) => {
                  setSelectedItineraryId(
                    event.target.value
                  )
                  setSelectedDayIndex(0)
                  setFeedback('')
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
              >
                {itineraries.map((itinerary) => (
                  <option
                    key={itinerary.id}
                    value={itinerary.id}
                  >
                    {itinerary.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="select-day"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Choose day
              </label>

              <select
                id="select-day"
                value={
                  selectedItinerary?.days.findIndex(
                    (day) => day.id === selectedDay?.id
                  ) ?? 0
                }
                onChange={(event) => {
                  setSelectedDayIndex(
                    Number(event.target.value)
                  )
                  setFeedback('')
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
              >
                {selectedItinerary?.days.map(
                  (day, index) => (
                    <option
                      key={day.id}
                      value={index}
                    >
                      {day.title}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        )}

        {itineraries.length === 0 && (
          <p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            You can select a destination now. A new
            itinerary named "My Cebu Adventure" will be
            created automatically.
          </p>
        )}

        {/* Search */}
        <div className="mt-5">
          <label
            htmlFor="destination-search"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Search destinations
          </label>

          <input
            id="destination-search"
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setShowAll(true)
            }}
            placeholder="Search Kawasan Falls, Moalboal, Oslob..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500"
          />
        </div>

        {/* Categories */}
        <div
          className="mt-4 flex flex-wrap gap-2"
          aria-label="Destination categories"
        >
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={category === item}
              onClick={() => {
                setCategory(item)
                setShowAll(true)
              }}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                category === item
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            role="status"
            aria-live="polite"
            className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
          >
            {feedback}
          </div>
        )}

        {/* Destination cards */}
        {visibleDestinations.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleDestinations.map((destination) => {
              const added = isDestinationAdded(
                destination.slug
              )

              return (
                <article
                  key={destination.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-emerald-300 hover:shadow-md"
                >
                  <div className="relative h-40 overflow-hidden bg-slate-100">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />

                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                      {destination.category}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="text-base font-bold text-slate-900">
                      {destination.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      📍 {destination.location}
                    </p>

                    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">
                      {destination.summary ||
                        destination.description}
                    </p>

                    <button
                      type="button"
                      disabled={
                        added || travelDataLoading
                      }
                      onClick={() =>
                        handleAddDestination(
                          destination.id
                        )
                      }
                      className={`mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        added
                          ? 'cursor-default bg-emerald-50 text-emerald-700'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      } disabled:opacity-70`}
                    >
                      {added
                        ? '✓ Added to this day'
                        : '+ Add to itinerary'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <p className="font-semibold text-slate-700">
              No destinations found
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Try another search or category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch('')
                setCategory('All')
                setShowAll(false)
              }}
              className="mt-4 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Show all / show less */}
        {filteredDestinations.length > 6 && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() =>
                setShowAll((current) => !current)
              }
              className="rounded-xl border border-emerald-200 px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              {showAll
                ? 'Show fewer destinations'
                : `View all ${filteredDestinations.length} destinations`}
            </button>
          </div>
        )}
      </section>

      {/* Loading and errors */}
      {travelDataLoading && (
        <p
          role="status"
          className="text-sm text-slate-600"
        >
          Loading your saved itineraries...
        </p>
      )}

      {travelDataError && (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
        >
          {travelDataError}
        </p>
      )}

      {/* Saved itineraries */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            My Itineraries
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Organize your activities and customize your
            travel days.
          </p>
        </div>

        {itineraries.length ? (
          itineraries.map((itinerary) => (
            <div
              key={itinerary.id}
              className="rounded-[30px] bg-white p-5 shadow-sm ring-1 ring-slate-200"
            >
              <ItineraryCard
                itinerary={itinerary}
                onRename={(nextName) =>
                  renameItinerary(
                    itinerary.id,
                    nextName
                  )
                }
                onDelete={() =>
                  deleteItinerary(itinerary.id)
                }
                onAddDay={() =>
                  addItineraryDay(itinerary.id)
                }
                onUpdateNotes={(
                  dayIndex,
                  itemId,
                  notes
                ) =>
                  updateItineraryItem(
                    itinerary.id,
                    dayIndex,
                    itemId,
                    { notes }
                  )
                }
                onUpdateTime={(
                  dayIndex,
                  itemId,
                  startTime
                ) =>
                  updateItineraryItem(
                    itinerary.id,
                    dayIndex,
                    itemId,
                    { startTime }
                  )
                }
                onMoveWithinDay={(
                  dayIndex,
                  itemId,
                  direction
                ) =>
                  moveItemWithinDay(
                    itinerary.id,
                    dayIndex,
                    itemId,
                    direction
                  )
                }
                onRemoveItem={(
                  dayIndex,
                  itemId
                ) =>
                  removeItemFromItinerary(
                    itinerary.id,
                    dayIndex,
                    itemId
                  )
                }
                onMoveLeft={(
                  dayIndex,
                  itemId
                ) => {
                  if (dayIndex > 0) {
                    moveItemBetweenDays(
                      itinerary.id,
                      dayIndex,
                      dayIndex - 1,
                      itemId
                    )
                  }
                }}
                onMoveRight={(
                  dayIndex,
                  itemId
                ) => {
                  if (
                    dayIndex <
                    itinerary.days.length - 1
                  ) {
                    moveItemBetweenDays(
                      itinerary.id,
                      dayIndex,
                      dayIndex + 1,
                      itemId
                    )
                  }
                }}
              />
            </div>
          ))
        ) : (
          <EmptyState
            title="No itinerary yet"
            message="Plan your trip by creating a new Cebu itinerary and adding destinations to each day."
          />
        )}
      </section>
    </div>
  )
}
