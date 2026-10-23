
import { useEffect, useMemo, useState } from 'react'
import { EventCard } from '../components/EventCard'
import { getSupabaseClient } from '../lib/supabase'
import { events as localEvents } from '../data/cebuData'

type LocalEvent = (typeof localEvents)[number]

type DatabaseEvent = {
  id: string
  slug: string
  name: string
  description: string
  image_url: string
  location: string
  category: string
  start_date: string
  end_date: string
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Manila',
  }).format(new Date(value))
}

function toCardEvent(event: DatabaseEvent): LocalEvent {
  return {
    id: event.slug,
    slug: event.slug,
    name: event.name,
    description: event.description,
    image: event.image_url || '',
    location: event.location,
    category: event.category,
    date: formatEventDate(event.start_date),
  } as LocalEvent
}

const months = [
  'All',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function EventsPage() {
  const [events, setEvents] = useState<LocalEvent[]>([])
  const [month, setMonth] = useState('All')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadEvents() {
      const supabase = getSupabaseClient()

      if (!supabase) {
        if (active) {
          setError('Supabase is not configured.')
          setLoading(false)
        }
        return
      }

      try {
        const { data, error: queryError } = await supabase
          .from('events')
          .select(
            'id, slug, name, description, image_url, location, category, start_date, end_date'
          )
          .order('start_date', { ascending: true })

        if (queryError) throw queryError

        if (active) {
          setEvents(
            ((data ?? []) as DatabaseEvent[]).map(toCardEvent)
          )
          setError(null)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load events.'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadEvents()

    return () => {
      active = false
    }
  }, [])

  const categories = useMemo(
    () => [
      'All',
      ...new Set(events.map((event) => event.category)),
    ],
    [events]
  )

  const filtered = useMemo(
    () =>
      events.filter((event) => {
        const matchesMonth =
          month === 'All' || event.date.includes(month)

        const matchesCategory =
          category === 'All' || event.category === category

        return matchesMonth && matchesCategory
      }),
    [events, month, category]
  )

  return (
    <div className="space-y-8 pb-10">
      <section className="rounded-[30px] bg-gradient-to-r from-violet-700 to-indigo-600 p-8 text-white shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-100">
          Events
        </p>
        <h1 className="mt-2 text-4xl font-semibold">
          Experience Cebu events
        </h1>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Month
            </label>
            <select
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-violet-500"
            >
              {months.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-violet-500"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {loading && (
        <p role="status" className="text-center text-slate-500">
          Loading Cebu events...
        </p>
      )}

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          No events found for the selected filters.
        </div>
      )}

      {!loading && !error && (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </section>
      )}
    </div>
  )
}
