import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Itinerary, ItineraryDay } from '../types'

interface ItineraryCardProps {
  itinerary: Itinerary
  onRemoveItem?: (dayIndex: number, itemId: string) => void
  onMoveLeft?: (dayIndex: number, itemId: string) => void
  onMoveRight?: (dayIndex: number, itemId: string) => void
  onMoveWithinDay?: (dayIndex: number, itemId: string, direction: -1 | 1) => void
  onUpdateNotes?: (dayIndex: number, itemId: string, notes: string) => void
  onRename?: (name: string) => void
  onDelete?: () => void
  onAddDay?: () => void
}

export function ItineraryCard({ itinerary, onRemoveItem, onMoveLeft, onMoveRight, onMoveWithinDay, onUpdateNotes, onRename, onDelete, onAddDay }: ItineraryCardProps) {
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(itinerary.name)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          {editingName ? (
            <form onSubmit={(event) => { event.preventDefault(); onRename?.(name); setEditingName(false) }} className="flex items-center gap-2">
              <input aria-label="Itinerary name" value={name} onChange={(event) => setName(event.target.value)} className="min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-lg font-semibold" />
              <button type="submit" className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Save</button>
              <button type="button" onClick={() => { setName(itinerary.name); setEditingName(false) }} className="rounded-full border border-slate-200 px-3 py-2 text-xs">Cancel</button>
            </form>
          ) : (
            <>
              <h3 className="truncate text-2xl font-semibold text-slate-900">{itinerary.name}</h3>
              <button type="button" onClick={() => setEditingName(true)} aria-label={`Rename ${itinerary.name}`} className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>
            </>
          )}
          <button type="button" onClick={onAddDay} className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"><Plus className="h-3.5 w-3.5" /> Day</button>
          <button type="button" onClick={onDelete} aria-label={`Delete ${itinerary.name}`} className="rounded-full p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
          {itinerary.days.reduce((total, day) => total + day.items.length, 0)} activities
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {itinerary.days.map((day: ItineraryDay, dayIndex: number) => (
          <div key={day.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-900">{day.title}</h4>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {day.items.length} stop{day.items.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="space-y-3">
              {day.items.length ? (
                day.items.map((item, itemIndex) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-start gap-3">
                      <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-slate-800">{item.name}</p>
                          {onRemoveItem ? (
                            <button type="button" onClick={() => onRemoveItem(dayIndex, item.id)} className="text-slate-400 hover:text-rose-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : null}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {item.type}
                        </div>
                        <p className="mt-2 text-xs text-slate-500">{item.notes || 'Flexible plan'} </p>
                      </div>
                    </div>

                    <label className="mt-3 block text-xs font-medium text-slate-600">
                      Notes
                      <textarea value={item.notes} onChange={(event) => onUpdateNotes?.(dayIndex, item.id, event.target.value)} rows={2} className="mt-1 w-full resize-y rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700" />
                    </label>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button type="button" aria-label={`Move ${item.name} earlier`} onClick={() => onMoveWithinDay?.(dayIndex, item.id, -1)} disabled={itemIndex === 0} className="rounded-full border border-slate-200 px-2.5 py-1 text-xs disabled:opacity-40">Up</button>
                        <button type="button" aria-label={`Move ${item.name} later`} onClick={() => onMoveWithinDay?.(dayIndex, item.id, 1)} disabled={itemIndex === day.items.length - 1} className="rounded-full border border-slate-200 px-2.5 py-1 text-xs disabled:opacity-40">Down</button>
                      </div>
                      <button
                        type="button"
                        onClick={() => onMoveLeft?.(dayIndex, item.id)}
                        disabled={dayIndex === 0}
                        className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Prev day
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveRight?.(dayIndex, item.id)}
                        disabled={dayIndex === itinerary.days.length - 1}
                        className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next day
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">
                  No activity planned yet.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
