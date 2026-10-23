import { LogOut, X } from 'lucide-react'
import { Link } from 'react-router-dom'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  onLogout: () => void
  userName?: string | null
}

export function MobileMenu({ open, onClose, onLogout, userName }: MobileMenuProps) {
  const links = [
    { label: 'Home', to: '/' },
    { label: 'Explore', to: '/explore' },
    { label: 'Map', to: '/map' },
    { label: 'Food', to: '/food' },
    { label: 'Events', to: '/events' },
    { label: 'Itineraries', to: '/itinerary' },
    { label: 'Favorites', to: '/favorites' },
  ]

  if (!open) return null

  return (
    <div className="absolute left-0 right-0 top-full z-30 border-b border-slate-200 bg-white p-4 shadow-xl lg:hidden">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">Menu</span>
        <button type="button" aria-label="Close menu" onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="space-y-2">
        {links.map((link) => (
          <Link key={`${link.label}-${link.to}`} to={link.to} onClick={onClose} className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="mt-5 space-y-2 border-t border-slate-200 pt-4">
        <Link to={userName ? '/profile' : '/login'} onClick={onClose} className="block rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white">
          {userName ? `Profile • ${userName}` : 'Login / Signup'}
        </Link>
        {userName ? (
          <button type="button" onClick={onLogout} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        ) : null}
      </div>
    </div>
  )
}
