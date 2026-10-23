import { Heart } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

interface FavoriteButtonProps {
  item: {
    id: string
    type: 'destination' | 'restaurant' | 'activity'
    name: string
    image: string
    slug: string
  }
  size?: 'sm' | 'md'
}

export function FavoriteButton({ item, size = 'md' }: FavoriteButtonProps) {
  const { addFavorite, removeFavorite, isFavorite } = useAppContext()
  const active = isFavorite(item.id, item.type, item.slug)

  const handleClick = () => {
    if (active) {
      removeFavorite(item.id, item.type, item.slug)
      return
    }

    addFavorite(item)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? `Remove ${item.name} from favorites` : `Save ${item.name} to favorites`}
      className={`inline-flex items-center justify-center rounded-full border transition ${
        active
          ? 'border-rose-500 bg-rose-500 text-white shadow-md shadow-rose-200'
          : 'border-white/60 bg-white/80 text-slate-700 backdrop-blur-sm hover:border-rose-200 hover:text-rose-500'
      } ${size === 'sm' ? 'h-9 w-9' : 'h-11 w-11'}`}
    >
      <Heart className={`h-4 w-4 ${active ? 'fill-current' : ''}`} />
    </button>
  )
}
