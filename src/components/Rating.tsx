import { Star } from 'lucide-react'

interface RatingProps {
  value: number
  count?: number
  compact?: boolean
}

export function Rating({ value, count, compact = false }: RatingProps) {
  return (
    <div className="flex items-center gap-1 text-amber-500">
      <Star className="h-4 w-4 fill-current" />
      <span className="text-sm font-semibold text-slate-800">
        {value.toFixed(1)}
        {count !== undefined ? <span className="ml-1 text-slate-500">({count})</span> : null}
      </span>
      {compact ? null : <span className="sr-only"> rating out of 5</span>}
    </div>
  )
}
