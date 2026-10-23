import { ArrowRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Restaurant } from '../types'
import { FavoriteButton } from './FavoriteButton'
import { Rating } from './Rating'

interface RestaurantCardProps {
  restaurant: Restaurant
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <article className="card-surface group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="relative overflow-hidden">
        <img src={restaurant.image} alt={restaurant.name} className="image-zoom h-56 w-full object-cover" loading="lazy" />
        <div className="absolute right-4 top-4">
          <FavoriteButton
            item={{
              id: restaurant.id,
              type: 'restaurant',
              name: restaurant.name,
              image: restaurant.image,
              slug: restaurant.slug,
            }}
            size="sm"
          />
        </div>
      </div>
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">{restaurant.category}</span>
          <span className="text-sm font-medium text-slate-500">{restaurant.price}</span>
        </div>
        <Link to={`/restaurants/${restaurant.slug}`} className="soft-link text-xl font-semibold text-slate-900 hover:text-orange-600">
          {restaurant.name}
        </Link>
        <div className="mt-2 flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="h-4 w-4" />
          {restaurant.location}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <Rating value={restaurant.rating} />
          <span className="text-sm text-slate-600">{restaurant.cuisine}</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">{restaurant.description}</p>
        <Link to={`/restaurants/${restaurant.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-600">
          View restaurant <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}
