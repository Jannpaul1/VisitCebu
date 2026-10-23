import { Clock3, MapPin, Sparkles, Star, UtensilsCrossed } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { FavoriteButton } from '../components/FavoriteButton'
import { restaurants } from '../data/cebuData'

export function RestaurantPage() {
  const { slug } = useParams()
  const restaurant = restaurants.find((item) => item.slug === slug)

  if (!restaurant) {
    return <div className="rounded-3xl bg-white p-10 text-center text-slate-600">Restaurant not found.</div>
  }

  return (
    <div className="space-y-6 pb-10">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
        <img src={restaurant.image} alt={restaurant.name} className="h-[320px] w-full object-cover" />
        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">{restaurant.category}</p>
              <h1 className="mt-2 text-4xl font-semibold text-slate-900">{restaurant.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-orange-600" /> {restaurant.location}</div>
                <div className="flex items-center gap-2"><Star className="h-4 w-4 fill-amber-400 text-amber-500" /> {restaurant.rating}</div>
                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-orange-700">{restaurant.priceRange}</span>
              </div>
            </div>
            <FavoriteButton item={{ id: restaurant.id, type: 'restaurant', name: restaurant.name, image: restaurant.image, slug: restaurant.slug }} />
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
            <div>
              <p className="text-base leading-8 text-slate-600">{restaurant.description}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><UtensilsCrossed className="h-4 w-4 text-orange-600" /> Cuisine</div>
                  <p className="text-sm text-slate-600">{restaurant.cuisine}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><Sparkles className="h-4 w-4 text-orange-600" /> Best for</div>
                  <p className="text-sm text-slate-600">{restaurant.bestFor}</p>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-semibold text-slate-900">Highlights</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {restaurant.highlights.map((highlight) => (
                    <li key={highlight} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">Visit details</h2>
              <div className="mt-4 space-y-4 text-sm text-slate-700">
                <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-orange-600" /> <span>{restaurant.location}</span></div>
                <div className="flex items-start gap-3"><Clock3 className="mt-0.5 h-4 w-4 text-orange-600" /> <span>{restaurant.hours}</span></div>
                {restaurant.contact && <div className="flex items-start gap-3"><Sparkles className="mt-0.5 h-4 w-4 text-orange-600" /> <span>{restaurant.contact}</span></div>}
              </div>

              <div className="mt-5 rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Quick note</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Ideal for travelers looking for authentic Cebu flavors, scenic island dining, or a memorable meal with local character.
                </p>
              </div>

              <Link to="/food" className="mt-5 inline-flex items-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700">
                Browse more food spots
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">More views</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {restaurant.gallery.map((image) => (
            <img key={image} src={image} alt={`${restaurant.name} detail`} className="h-52 w-full rounded-2xl object-cover" />
          ))}
        </div>
      </section>
    </div>
  )
}
