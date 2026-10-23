import { Camera, Globe, Mail, MapPin, Phone, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <Logo white />
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              Discover the best of Cebu through immersive experiences, island escapes, local flavors, and memorable journeys.
            </p>
            <div className="mt-6 flex items-center gap-3 text-slate-300">
              <a href="https://facebook.com" aria-label="Facebook" className="rounded-full border border-slate-700 p-2 hover:border-emerald-500 hover:text-emerald-400"><Globe className="h-4 w-4" /></a>
              <a href="https://instagram.com" aria-label="Instagram" className="rounded-full border border-slate-700 p-2 hover:border-emerald-500 hover:text-emerald-400"><Camera className="h-4 w-4" /></a>
              <a href="https://t.me" aria-label="Send" className="rounded-full border border-slate-700 p-2 hover:border-emerald-500 hover:text-emerald-400"><Send className="h-4 w-4" /></a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Explore</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-400">
              <li><Link to="/explore">Destinations</Link></li>
              <li><Link to="/food">Food</Link></li>
              <li><Link to="/events">Events</Link></li>
              <li><Link to="/itinerary">Itineraries</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Company</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-400">
              <li><Link to="/">About Cebu</Link></li>
              <li><Link to="/explore">Things to Do</Link></li>
              <li><Link to="/favorites">Favorites</Link></li>
              <li><Link to="/profile">Profile</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Contact</h3>
            <ul className="mt-5 space-y-4 text-sm text-slate-400">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-400" /> Cebu City, Philippines</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-emerald-400" /> +63 32 123 4567</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-emerald-400" /> hello@visitcebu.ph</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-800 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© 2027 VisitCebu. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
