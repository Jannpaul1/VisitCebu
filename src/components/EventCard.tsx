
import { CalendarDays, MapPin, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

type EventCardProps = {
  event: {
    id: string
    slug?: string
    name: string
    description: string
    image: string
    location: string
    category: string
    date: string
  }
}

export function EventCard({ event }: EventCardProps) {
  const eventSlug = event.slug || event.id

  const eventUrl = `/events/${encodeURIComponent(eventSlug)}`

  return (
    <Link
      to={eventUrl}
      className="group block overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Event Image */}
      <div className="relative h-56 overflow-hidden bg-slate-100">
        {event.image ? (
          <img
            src={event.image}
            alt={event.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const fallback =
                e.currentTarget.nextElementSibling

              if (fallback instanceof HTMLElement) {
                fallback.style.display = 'flex'
              }
            }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}

        {/* Fallback image */}
        <div
          style={{
            display: event.image ? 'none' : 'flex',
          }}
          className="absolute inset-0 flex-col items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-6 text-center text-white"
        >
          <CalendarDays className="mb-3 h-12 w-12 opacity-80" />

          <p className="text-xl font-bold">
            {event.name}
          </p>

          <p className="mt-2 text-sm text-violet-100">
            Discover Cebu Events
          </p>
        </div>

        {/* Arrow */}
        <div className="absolute right-4 top-4 rounded-full bg-white/90 p-2 shadow-sm transition group-hover:bg-white">
          <ArrowUpRight className="h-4 w-4 text-violet-700" />
        </div>
      </div>

      {/* Event Information */}
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            {event.category || 'Event'}
          </span>

          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Cebu Event
          </span>
        </div>

        <h3 className="text-xl font-semibold text-slate-900 transition-colors group-hover:text-violet-700">
          {event.name}
        </h3>

        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-violet-600" />
            <span>{event.date}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-violet-600" />
            <span>{event.location}</span>
          </div>
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-slate-600">
          {event.description}
        </p>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-sm font-semibold text-violet-700">
            View event details
          </span>

          <ArrowUpRight className="h-4 w-4 text-violet-700 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>
      </div>
    </Link>
  )
}
