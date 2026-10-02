import { CalendarDays, Clock3, MapPin, Sparkles, Ticket } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { events } from '../data/cebuData'

export function EventDetailPage() {
  const { slug } = useParams()
  const event = events.find((item) => item.slug === slug)

  if (!event) {
    return <div className="rounded-3xl bg-white p-10 text-center text-slate-600">Event not found.</div>
  }

  return (
    <div className="space-y-6 pb-10">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
        <img src={event.image} alt={event.name} className="h-[320px] w-full object-cover" />
        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">{event.category}</p>
              <h1 className="mt-2 text-4xl font-semibold text-slate-900">{event.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-violet-600" /> {event.date}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-violet-600" /> {event.location}</div>
              </div>
            </div>
            <Link to="/events" className="inline-flex items-center rounded-full bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500">
              Back to events
            </Link>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
            <div>
              <p className="text-base leading-8 text-slate-600">{event.description}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-violet-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><Ticket className="h-4 w-4 text-violet-600" /> Entry</div>
                  <p className="text-sm text-slate-600">{event.price}</p>
                </div>
                <div className="rounded-2xl bg-violet-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><Sparkles className="h-4 w-4 text-violet-600" /> Best for</div>
                  <p className="text-sm text-slate-600">{event.bestFor}</p>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-semibold text-slate-900">What to expect</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {event.highlights.map((item) => (
                    <li key={item} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">Event information</h2>
              <div className="mt-4 space-y-4 text-sm text-slate-700">
                <div className="flex items-start gap-3"><CalendarDays className="mt-0.5 h-4 w-4 text-violet-600" /> <span>{event.date}</span></div>
                <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-violet-600" /> <span>{event.location}</span></div>
                <div className="flex items-start gap-3"><Clock3 className="mt-0.5 h-4 w-4 text-violet-600" /> <span>{event.hours}</span></div>
              </div>

              <div className="mt-5 rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Quick note</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  This is one of the most immersive ways to experience Cebu’s culture, hospitality, and energy while you’re in town.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Gallery</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {event.gallery.map((image) => (
            <img key={image} src={image} alt={`${event.name} gallery`} className="h-52 w-full rounded-2xl object-cover" />
          ))}
        </div>
      </section>
    </div>
  )
}
