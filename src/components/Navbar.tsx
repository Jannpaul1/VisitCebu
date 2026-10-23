
import { Heart, LogOut, Menu, Search, UserCircle2, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { Logo } from './Logo'
import { MobileMenu } from './MobileMenu'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Explore', to: '/explore' },
  { label: 'Map', to: '/map' },
  { label: 'Destinations', to: '/explore' },
  { label: 'Food', to: '/food' },
  { label: 'Events', to: '/events' },
  { label: 'Itineraries', to: '/itinerary' },
  { label: 'Favorites', to: '/favorites' },
]

export function Navbar() {
  const { favorites, user, authLoading, logout } = useAppContext()
  const navigate = useNavigate()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountError, setAccountError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const query = searchQuery.trim()
    if (!query) return

    navigate(`/explore?search=${encodeURIComponent(query)}`)
    setSearchQuery('')
    setMobileOpen(false)
  }

  const handleLogout = async () => {
    setAccountError('')

    try {
      await logout()
      setMobileOpen(false)
    } catch {
      setAccountError('Unable to sign out. Check your connection and try again.')
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={`${item.label}-${item.to}`}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive
                    ? 'text-emerald-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {/* Working top search bar */}
          <form
            onSubmit={handleSearch}
            role="search"
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 shadow-sm focus-within:border-emerald-400"
          >
            <button
              type="submit"
              aria-label="Search destinations"
              className="transition hover:text-emerald-600"
            >
              <Search className="h-4 w-4" />
            </button>

            <input
              type="search"
              aria-label="Search destinations"
              placeholder="Search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-28 border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </form>

          <Link
            to="/favorites"
            aria-label="Favorites"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-emerald-200 hover:text-emerald-700"
          >
            <Heart className="h-4 w-4" />
            {favorites.length ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                {favorites.length}
              </span>
            ) : null}
          </Link>

          {user ? (
            <details className="relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle2 className="h-4 w-4" />
                )}
                {user.name.split(' ')[0] || 'Account'}
              </summary>

              <div className="absolute right-0 top-full z-50 mt-2 min-w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <Link
                  to="/profile"
                  className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </details>
          ) : (
            <Link
              to={authLoading ? '#' : '/login'}
              aria-disabled={authLoading}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <UserCircle2 className="h-4 w-4" />
              {authLoading ? 'Loading...' : 'Login'}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <Link
            to="/favorites"
            aria-label="Favorites"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
          >
            <Heart className="h-4 w-4" />
            {favorites.length ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-semibold text-white">
                {favorites.length}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {accountError ? (
        <p
          role="alert"
          className="mx-auto max-w-7xl px-4 pb-2 text-right text-xs text-rose-600"
        >
          {accountError}
        </p>
      ) : null}

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        userName={user?.name ?? null}
        onLogout={() => void handleLogout()}
      />
    </header>
  )
}
