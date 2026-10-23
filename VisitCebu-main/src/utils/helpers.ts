export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const averageRating = (ratings: number[]) =>
  ratings.length ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length : 0

export const formatCurrency = (value: number) => `₱${value.toLocaleString()}`

export const formatPriceLabel = (value: string) => value || 'Varies'

export const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

export const getCategoryTone = (category: string) => {
  const map: Record<string, string> = {
    Beaches: 'bg-cyan-100 text-cyan-700',
    Waterfalls: 'bg-blue-100 text-blue-700',
    Islands: 'bg-emerald-100 text-emerald-700',
    'Historical Sites': 'bg-amber-100 text-amber-700',
    Mountains: 'bg-violet-100 text-violet-700',
    Adventure: 'bg-orange-100 text-orange-700',
    Food: 'bg-rose-100 text-rose-700',
    Nightlife: 'bg-fuchsia-100 text-fuchsia-700',
    Shopping: 'bg-pink-100 text-pink-700',
    Family: 'bg-indigo-100 text-indigo-700',
    Nature: 'bg-green-100 text-green-700',
    Culture: 'bg-yellow-100 text-yellow-700',
  }

  return map[category] ?? 'bg-slate-100 text-slate-700'
}
