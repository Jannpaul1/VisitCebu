import { CalendarDays, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { EventItem } from '../types'

interface EventCardProps {
  event: EventItem
}

export function EventCard({ event }: EventCardProps) {
  return (
    <article className="card-surface group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <img src={event.image} alt={event.name} className="image-zoom h-52 w-full object-cover" loading="lazy" />
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">{event.category}</span>
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Upcoming</span>
        </div>
        <Link to={`/events/${event.slug}`} className="soft-link text-xl font-semibold text-slate-900 hover:text-violet-600">
          {event.name}
        </Link>
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-violet-600" /> {event.date}</div>
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-violet-600" /> {event.location}</div>
        </div>
        <p className="text-sm leading-6 text-slate-600">{event.description}</p>
      </div>
    </article>
  )
}
