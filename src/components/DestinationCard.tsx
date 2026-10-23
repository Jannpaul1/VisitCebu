import { ArrowRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Destination } from '../types'
import { FavoriteButton } from './FavoriteButton'
import { Rating } from './Rating'

interface DestinationCardProps {
  destination: Destination
}

export function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <article className="card-surface group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="relative overflow-hidden">
        <img
          src={destination.image}
          alt={destination.name}
          className="image-zoom h-60 w-full object-cover"
          loading="lazy"
        />
        <div className="absolute right-4 top-4">
          <FavoriteButton
            item={{
              id: destination.id,
              type: 'destination',
              name: destination.name,
              image: destination.image,
              slug: destination.slug,
            }}
            size="sm"
          />
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            {destination.category}
          </span>
          <span className="text-sm font-medium text-slate-500">{destination.price}</span>
        </div>

        <div>
          <Link to={`/destination/${destination.slug}`} className="soft-link text-xl font-semibold text-slate-900 hover:text-emerald-700">
            {destination.name}
          </Link>
          <div className="mt-2 flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-4 w-4" />
            {destination.location}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Rating value={destination.rating} count={destination.reviewCount} />
          <Link
            to={`/destination/${destination.slug}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700"
          >
            View details <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="text-sm leading-6 text-slate-600">{destination.summary}</p>
      </div>
    </article>
  )
}
