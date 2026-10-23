import { useMemo, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { ItineraryCard } from '../components/ItineraryCard'
import { useAppContext } from '../context/AppContext'

export function ItineraryPage() {
  const { destinations, itineraries, travelDataLoading, travelDataError, createItinerary, renameItinerary, deleteItinerary, addItineraryDay, addItemToItinerary, updateItineraryItem, removeItemFromItinerary, moveItemBetweenDays, moveItemWithinDay } = useAppContext()
  const [name, setName] = useState('')

  const suggestions = useMemo(() => destinations.slice(0, 5), [destinations])

  const handleAddSuggestion = (destinationId: string) => {
    const selected = destinations.find((destination) => destination.id === destinationId)
    if (!selected) return

    const itinerary = itineraries[0] ?? createItinerary('My Cebu Adventure')
    addItemToItinerary(itinerary.id, {
      id: crypto.randomUUID(),
      name: selected.name,
      type: 'destination',
      image: selected.image,
      slug: selected.slug,
      notes: 'Suggested stop',
    }, 0)
  }

  const handleNewTrip = () => {
    if (!name.trim()) return
    createItinerary(name.trim())
    setName('')
  }

  return (
    <div className="space-y-8 pb-10">
      <section className="rounded-[30px] bg-gradient-to-r from-emerald-700 to-teal-600 p-8 text-white shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">Planner</p>
        <h1 className="mt-2 text-4xl font-semibold">Your Cebu itinerary</h1>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Create a trip name, e.g. 3 Days in Cebu"
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
          />
          <button type="button" onClick={handleNewTrip} className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
            Create itinerary
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {suggestions.map((destination) => (
            <button key={destination.id} type="button" onClick={() => handleAddSuggestion(destination.id)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:border-emerald-200 hover:text-emerald-700">
              + {destination.name}
            </button>
          ))}
        </div>
      </section>

      {travelDataLoading ? <p role="status" className="text-sm text-slate-600">Loading your saved itineraries...</p> : null}
      {travelDataError ? <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{travelDataError}</p> : null}

      {itineraries.length ? (
        <div className="space-y-6">
          {itineraries.map((itinerary) => (
            <div key={itinerary.id} className="rounded-[30px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <ItineraryCard
                itinerary={itinerary}
                onRename={(nextName) => renameItinerary(itinerary.id, nextName)}
                onDelete={() => deleteItinerary(itinerary.id)}
                onAddDay={() => addItineraryDay(itinerary.id)}
                onUpdateNotes={(dayIndex, itemId, notes) => updateItineraryItem(itinerary.id, dayIndex, itemId, { notes })}
                onMoveWithinDay={(dayIndex, itemId, direction) => moveItemWithinDay(itinerary.id, dayIndex, itemId, direction)}
                onRemoveItem={(dayIndex, itemId) => removeItemFromItinerary(itinerary.id, dayIndex, itemId)}
                onMoveLeft={(dayIndex, itemId) => {
                  if (dayIndex > 0) moveItemBetweenDays(itinerary.id, dayIndex, dayIndex - 1, itemId)
                }}
                onMoveRight={(dayIndex, itemId) => {
                  if (dayIndex < itinerary.days.length - 1) moveItemBetweenDays(itinerary.id, dayIndex, dayIndex + 1, itemId)
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No itinerary yet" message="Plan your trip by creating a new Cebu itinerary and adding destinations to each day." />
      )}
    </div>
  )
}
