import { useState } from 'react'
import { EventCard } from '../components/EventCard'
import { events } from '../data/cebuData'

const months = ['All', 'January', 'March', 'April', 'May', 'June']

export function EventsPage() {
  const [month, setMonth] = useState('All')
  const [category, setCategory] = useState('All')

  const filtered = events.filter((event) => {
    const matchesMonth = month === 'All' || event.date.includes(month)
    const matchesCategory = category === 'All' || event.category === category
    return matchesMonth && matchesCategory
  })

  return (
    <div className="space-y-8 pb-10">
      <section className="rounded-[30px] bg-gradient-to-r from-violet-700 to-indigo-600 p-8 text-white shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-100">Events</p>
        <h1 className="mt-2 text-4xl font-semibold">Experience Cebu events</h1>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Month</label>
            <select value={month} onChange={(event) => setMonth(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-violet-500">
              {months.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-violet-500">
              <option value="All">All</option>
              <option value="Festival">Festival</option>
              <option value="Food">Food</option>
              <option value="Nightlife">Nightlife</option>
              <option value="Concert">Concert</option>
              <option value="Culture">Culture</option>
            </select>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </section>
    </div>
  )
}
