import { LogOut, Mail, MapPin, Pencil, Star, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, updateProfile, logout, favorites, itineraries, recentlyViewed, destinations } = useAppContext()
  const [name, setName] = useState(user?.name ?? '')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  if (!user) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Sign in to view your profile</h1>
          <Link to="/login" className="mt-6 inline-flex rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Log in</Link>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    setStatus('')
    setError('')
    setIsSaving(true)
    try {
      const result = await updateProfile({ name })
      if (result.ok) setStatus('Profile updated.')
      else setError(result.message ?? 'Unable to update your profile.')
    } catch {
      setError('Unable to update your profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    setError('')
    try {
      await logout()
      navigate('/login')
    } catch {
      setError('Unable to sign out. Check your connection and try again.')
    }
  }

  return (
    <div className="space-y-8 pb-10">
      <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <img src={user.avatar} alt={user.name} className="h-20 w-20 rounded-full object-cover ring-4 ring-emerald-100" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Profile</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">{user.name}</h1>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500"><Mail className="h-4 w-4" /> {user.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">{itineraries.length} saved plans</div>
            <button type="button" onClick={handleLogout} aria-label="Sign out" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Edit profile</h2>
            <Pencil className="h-4 w-4 text-slate-500" />
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="profile-name" className="mb-2 block text-sm font-medium text-slate-700">Name</label>
              <input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label htmlFor="profile-email" className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input id="profile-email" value={user.email} disabled className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500" />
            </div>
            {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
            {status ? <p role="status" className="text-sm text-emerald-700">{status}</p> : null}
            <button type="button" onClick={handleSave} disabled={isSaving} className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3 text-slate-900">
              <Star className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-semibold">Saved places</h2>
            </div>
            <div className="space-y-3">
              {favorites.length ? favorites.slice(0, 3).map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl object-cover" />
                  <div>
                    <p className="font-medium text-slate-800">{item.name}</p>
                    <p className="text-xs uppercase tracking-[0.15em] text-slate-500">{item.type}</p>
                  </div>
                </div>
              )) : <p className="text-sm text-slate-600">No saved places yet.</p>}
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3 text-slate-900">
              <MapPin className="h-5 w-5 text-emerald-600" />
              <h2 className="text-xl font-semibold">Recently viewed</h2>
            </div>
            <div className="space-y-3">
              {recentlyViewed.map((slug) => destinations.find((place) => place.slug === slug)).filter((place) => place !== undefined).slice(0, 3).map((place) => (
                <div key={place.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <img src={place.image} alt={place.name} className="h-12 w-12 rounded-xl object-cover" />
                  <div>
                    <p className="font-medium text-slate-800">{place.name}</p>
                    <p className="text-xs text-slate-500">{place.location}</p>
                  </div>
                </div>
              ))}
              {!recentlyViewed.length ? <p className="text-sm text-slate-600">Places you view will appear here.</p> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3 text-slate-900">
          <UserRound className="h-5 w-5 text-violet-600" />
          <h2 className="text-xl font-semibold">Created itineraries</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {itineraries.length ? itineraries.map((itinerary) => (
            <div key={itinerary.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">{itinerary.name}</p>
              <p className="mt-2 text-sm text-slate-600">{itinerary.days.reduce((count, day) => count + day.items.length, 0)} planned activities</p>
            </div>
          )) : <p className="text-sm text-slate-600">No itineraries created yet.</p>}
        </div>
      </section>
    </div>
  )
}
