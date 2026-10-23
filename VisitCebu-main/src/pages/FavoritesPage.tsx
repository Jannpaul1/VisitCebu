import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { FavoriteButton } from '../components/FavoriteButton'
import { useAppContext } from '../context/AppContext'

export function FavoritesPage() {
  const { favorites, removeFavorite, user, travelDataLoading, travelDataError } = useAppContext()

  if (!favorites.length) {
    return (
      <div className="pb-10">
        {user && travelDataLoading ? <p role="status" className="py-8 text-center text-sm text-slate-600">Loading your saved places...</p> : null}
        {travelDataError ? <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{travelDataError}</p> : null}
        {!(user && travelDataLoading) ? (
        <EmptyState
          title="No favorites yet"
          message="Save destinations, attractions, and dining spots to keep them handy during your Cebu trip."
          action={<Link to="/explore" className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white">Explore Cebu</Link>}
        />
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      <section className="flex items-center justify-between rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">Favorites</p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-900">Saved for later</h1>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
          <Heart className="h-4 w-4 fill-current" /> {favorites.length} saved
        </div>
      </section>

      {travelDataError ? <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{travelDataError}</p> : null}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {favorites.map((item) => (
          <article key={`${item.type}-${item.id}`} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <img src={item.image} alt={item.name} className="h-52 w-full object-cover" loading="lazy" />
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.1em] text-slate-600">{item.type}</span>
                <FavoriteButton
                  item={item}
                  size="sm"
                />
              </div>
              <Link to={item.type === 'restaurant' ? `/restaurants/${item.slug}` : `/destination/${item.slug}`} className="text-xl font-semibold text-slate-900 hover:text-emerald-700">
                {item.name}
              </Link>
              <button type="button" onClick={() => removeFavorite(item.id, item.type, item.slug)} className="mt-5 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:border-rose-200 hover:text-rose-600">
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
