
import { useEffect, useState } from 'react'
import {
  CalendarDays,
  Clock3,
  MapPin,
  Sparkles,
  Ticket,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getSupabaseClient } from '../lib/supabase'

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

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila',
  }).format(new Date(date))
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Manila',
  }).format(new Date(date))
}

export function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  const [event, setEvent] = useState<DatabaseEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadEvent() {
      setLoading(true)
      setError(null)
      setEvent(null)

      if (!slug) {
        setLoading(false)
        return
      }

      const supabase = getSupabaseClient()

      if (!supabase) {
        setError('Supabase is not configured.')
        setLoading(false)
        return
      }

      try {
        const { data, error: queryError } = await supabase
          .from('events')
          .select(
            'id, slug, name, description, image_url, location, category, start_date, end_date'
          )
          .eq('slug', slug)
          .maybeSingle()

        if (queryError) throw queryError

        if (active) {
          setEvent(data as DatabaseEvent | null)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load event.'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadEvent()

    return () => {
      active = false
    }
  }, [slug])

  if (loading) {
    return (
      <div
        role="status"
        className="rounded-3xl bg-white p-10 text-center text-slate-600"
      >
        Loading event details...
      </div>
    )
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center"
      >
        <h2 className="text-xl font-semibold text-red-700">
          Unable to load event
        </h2>
        <p className="mt-2 text-red-600">{error}</p>
        <Link
          to="/events"
          className="mt-5 inline-block text-violet-700 underline"
        >
          Back to events
        </Link>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center text-slate-600">
        <h2 className="text-xl font-semibold">
          Event not found.
        </h2>
        <Link
          to="/events"
          className="mt-4 inline-block text-violet-600 underline"
        >
          Back to events
        </Link>
      </div>
    )
  }

  const startDate = formatDate(event.start_date)
  const endDate = formatDate(event.end_date)

  const dateDisplay =
    startDate === endDate
      ? startDate
      : `${startDate} – ${endDate}`

  const hoursDisplay =
    `${formatTime(event.start_date)} – ${formatTime(event.end_date)}`

  return (
    <div className="space-y-6 pb-10">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.name}
            className="h-[320px] w-full object-cover"
          />
        ) : (
          <div className="flex h-[320px] items-center justify-center bg-gradient-to-r from-violet-700 to-indigo-600 text-white">
            <div className="text-center">
              <CalendarDays className="mx-auto h-12 w-12" />
              <p className="mt-3 text-2xl font-semibold">
                {event.name}
              </p>
            </div>
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                {event.category}
              </p>

              <h1 className="mt-2 text-4xl font-semibold text-slate-900">
                {event.name}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-violet-600" />
                  {dateDisplay}
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-violet-600" />
                  {event.location}
                </div>
              </div>
            </div>

            <Link
              to="/events"
              className="inline-flex items-center rounded-full bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500"
            >
              Back to events
            </Link>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
            <div>
              <p className="text-base leading-8 text-slate-600">
                {event.description}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-violet-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Ticket className="h-4 w-4 text-violet-600" />
                    Entry
                  </div>

                  <p className="text-sm text-slate-600">
                    Contact the event organizer for ticket information.
                  </p>
                </div>

                <div className="rounded-2xl bg-violet-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Sparkles className="h-4 w-4 text-violet-600" />
                    Category
                  </div>

                  <p className="text-sm text-slate-600">
                    {event.category || 'Cebu event'}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  What to expect
                </h2>

                <p className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700">
                  {event.description ||
                    'More event information will be available soon.'}
                </p>
              </div>
            </div>

            <aside className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Event information
              </h2>

              <div className="mt-4 space-y-4 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                  <span>{dateDisplay}</span>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                  <span>{event.location}</span>
                </div>

                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                  <span>{hoursDisplay}</span>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Quick note
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Check with the event organizer to confirm
                  schedules, admission, and other details
                  before attending.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {event.image_url && (
        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">
            Gallery
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <img
              src={event.image_url}
              alt={`${event.name} gallery`}
              className="h-52 w-full rounded-2xl object-cover"
            />
          </div>
        </section>
      )}
    </div>
  )
}
