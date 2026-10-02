import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'
import type { FavoriteItem, Itinerary, ItineraryItem } from '../types'

type Client = SupabaseClient<Database>

function unique(values: string[]): string[] {
  return [...new Set(values)]
}

export async function loadUserFavorites(client: Client, userId: string): Promise<FavoriteItem[]> {
  const { data: savedRows, error } = await client
    .from('favorites')
    .select('id, destination_id, restaurant_id')
    .eq('user_id', userId)
  if (error) throw error

  const destinationIds = unique(savedRows.flatMap((row) => row.destination_id ? [row.destination_id] : []))
  const restaurantIds = unique(savedRows.flatMap((row) => row.restaurant_id ? [row.restaurant_id] : []))
  const [destinationResult, restaurantResult] = await Promise.all([
    destinationIds.length
      ? client.from('destinations').select('id, slug, name, image_url').in('id', destinationIds)
      : Promise.resolve({ data: [], error: null }),
    restaurantIds.length
      ? client.from('restaurants').select('id, slug, name, image_url').in('id', restaurantIds)
      : Promise.resolve({ data: [], error: null }),
  ])
  if (destinationResult.error) throw destinationResult.error
  if (restaurantResult.error) throw restaurantResult.error

  const destinations = new Map((destinationResult.data ?? []).map((place) => [place.id, place]))
  const restaurants = new Map((restaurantResult.data ?? []).map((place) => [place.id, place]))
  return savedRows.flatMap<FavoriteItem>((row) => {
    const destination = row.destination_id ? destinations.get(row.destination_id) : undefined
    if (destination) return [{ id: destination.id, type: 'destination' as const, name: destination.name, image: destination.image_url, slug: destination.slug }]
    const restaurant = row.restaurant_id ? restaurants.get(row.restaurant_id) : undefined
    if (restaurant) return [{ id: restaurant.id, type: 'restaurant' as const, name: restaurant.name, image: restaurant.image_url, slug: restaurant.slug }]
    return []
  })
}

export async function syncUserFavorites(client: Client, userId: string, items: FavoriteItem[]): Promise<void> {
  const destinationSlugs = unique(items.filter((item) => item.type === 'destination').map((item) => item.slug))
  const restaurantSlugs = unique(items.filter((item) => item.type === 'restaurant').map((item) => item.slug))
  const [destinationResult, restaurantResult, savedResult] = await Promise.all([
    destinationSlugs.length
      ? client.from('destinations').select('id, slug').in('slug', destinationSlugs)
      : Promise.resolve({ data: [], error: null }),
    restaurantSlugs.length
      ? client.from('restaurants').select('id, slug').in('slug', restaurantSlugs)
      : Promise.resolve({ data: [], error: null }),
    client.from('favorites').select('id, destination_id, restaurant_id').eq('user_id', userId),
  ])
  if (destinationResult.error) throw destinationResult.error
  if (restaurantResult.error) throw restaurantResult.error
  if (savedResult.error) throw savedResult.error

  const destinationsBySlug = new Map((destinationResult.data ?? []).map((place) => [place.slug, place.id]))
  const restaurantsBySlug = new Map((restaurantResult.data ?? []).map((place) => [place.slug, place.id]))
  const desired = items.flatMap<{ destination_id: string | null; restaurant_id: string | null }>((item) => {
    if (item.type === 'destination') {
      const destinationId = destinationsBySlug.get(item.slug)
      return destinationId ? [{ destination_id: destinationId, restaurant_id: null }] : []
    }
    if (item.type === 'restaurant') {
      const restaurantId = restaurantsBySlug.get(item.slug)
      return restaurantId ? [{ destination_id: null, restaurant_id: restaurantId }] : []
    }
    return []
  })
  if (desired.length !== items.length) {
    throw new Error('A saved place is missing from the Supabase catalog. Run the supplied seed SQL and try again.')
  }

  const key = (row: { destination_id: string | null; restaurant_id: string | null }) => row.destination_id ? `d:${row.destination_id}` : `r:${row.restaurant_id}`
  const desiredKeys = new Set(desired.map(key))
  const staleIds = savedResult.data.filter((row) => !desiredKeys.has(key(row))).map((row) => row.id)
  if (staleIds.length) {
    const { error: deleteError } = await client.from('favorites').delete().eq('user_id', userId).in('id', staleIds)
    if (deleteError) throw deleteError
  }

  const savedKeys = new Set(savedResult.data.map(key))
  const newDestinations = desired.filter((row) => row.destination_id && !savedKeys.has(key(row)))
    .map((row) => ({ user_id: userId, destination_id: row.destination_id }))
  const newRestaurants = desired.filter((row) => row.restaurant_id && !savedKeys.has(key(row)))
    .map((row) => ({ user_id: userId, restaurant_id: row.restaurant_id }))
  if (newDestinations.length) {
    const { error: insertError } = await client.from('favorites').upsert(newDestinations, { onConflict: 'user_id,destination_id', ignoreDuplicates: true })
    if (insertError) throw insertError
  }
  if (newRestaurants.length) {
    const { error: insertError } = await client.from('favorites').upsert(newRestaurants, { onConflict: 'user_id,restaurant_id', ignoreDuplicates: true })
    if (insertError) throw insertError
  }
}

export async function loadUserItineraries(client: Client, userId: string): Promise<Itinerary[]> {
  const { data: itineraryRows, error: itineraryError } = await client
    .from('itineraries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at')
  if (itineraryError) throw itineraryError
  if (!itineraryRows.length) return []

  const itineraryIds = itineraryRows.map((itinerary) => itinerary.id)
  const { data: dayRows, error: dayError } = await client
    .from('itinerary_days')
    .select('*')
    .in('itinerary_id', itineraryIds)
    .order('day_number')
  if (dayError) throw dayError

  const dayIds = dayRows.map((day) => day.id)
  const { data: itemRows, error: itemError } = dayIds.length
    ? await client.from('itinerary_items').select('*').in('itinerary_day_id', dayIds).order('position')
    : { data: [], error: null }
  if (itemError) throw itemError

  const destinationIds = unique(itemRows.map((item) => item.destination_id))
  const { data: destinationRows, error: destinationError } = destinationIds.length
    ? await client.from('destinations').select('id, slug, name, image_url').in('id', destinationIds)
    : { data: [], error: null }
  if (destinationError) throw destinationError

  const destinations = new Map((destinationRows ?? []).map((destination) => [destination.id, destination]))
  const itemsByDay = new Map<string, ItineraryItem[]>()
  for (const row of itemRows ?? []) {
    const destination = destinations.get(row.destination_id)
    if (!destination) continue
    const items = itemsByDay.get(row.itinerary_day_id) ?? []
    items.push({
      id: row.id,
      name: destination.name,
      type: 'destination',
      image: destination.image_url,
      slug: destination.slug,
      notes: row.notes,
      startTime: row.start_time ?? undefined,
    })
    itemsByDay.set(row.itinerary_day_id, items)
  }

  const daysByItinerary = new Map<string, Itinerary['days']>()
  for (const row of dayRows) {
    const days = daysByItinerary.get(row.itinerary_id) ?? []
    days.push({
      id: row.id,
      title: `Day ${row.day_number}`,
      date: row.date ?? undefined,
      items: itemsByDay.get(row.id) ?? [],
    })
    daysByItinerary.set(row.itinerary_id, days)
  }

  return itineraryRows.map((row) => ({
    id: row.id,
    name: row.title,
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    days: daysByItinerary.get(row.id) ?? [],
  }))
}

export async function syncUserItineraries(client: Client, userId: string, itineraries: Itinerary[]): Promise<void> {
  const existingResult = await client.from('itineraries').select('id').eq('user_id', userId)
  if (existingResult.error) throw existingResult.error
  const desiredItineraryIds = new Set(itineraries.map((itinerary) => itinerary.id))
  const removedItineraryIds = existingResult.data.map((row) => row.id).filter((id) => !desiredItineraryIds.has(id))
  if (removedItineraryIds.length) {
    const { error } = await client.from('itineraries').delete().eq('user_id', userId).in('id', removedItineraryIds)
    if (error) throw error
  }
  if (!itineraries.length) return

  const { error: itineraryUpsertError } = await client.from('itineraries').upsert(itineraries.map((itinerary) => ({
    id: itinerary.id,
    user_id: userId,
    title: itinerary.name,
    start_date: itinerary.startDate ?? null,
    end_date: itinerary.endDate ?? null,
  })), { onConflict: 'id' })
  if (itineraryUpsertError) throw itineraryUpsertError

  const itineraryIds = itineraries.map((itinerary) => itinerary.id)
  const { data: existingDays, error: existingDaysError } = await client.from('itinerary_days').select('id, itinerary_id').in('itinerary_id', itineraryIds)
  if (existingDaysError) throw existingDaysError
  const days = itineraries.flatMap((itinerary) => itinerary.days.map((day, index) => ({
    id: day.id,
    itinerary_id: itinerary.id,
    day_number: index + 1,
    date: day.date ?? null,
  })))
  const desiredDayIds = new Set(days.map((day) => day.id))
  const staleDayIds = existingDays.map((day) => day.id).filter((id) => !desiredDayIds.has(id))
  if (staleDayIds.length) {
    const { error } = await client.from('itinerary_days').delete().in('id', staleDayIds)
    if (error) throw error
  }
  if (days.length) {
    const { error } = await client.from('itinerary_days').upsert(days, { onConflict: 'id' })
    if (error) throw error
  }

  const destinationSlugs = unique(itineraries.flatMap((itinerary) => itinerary.days.flatMap((day) => day.items.map((item) => item.slug))))
  const { data: destinationRows, error: destinationError } = destinationSlugs.length
    ? await client.from('destinations').select('id, slug').in('slug', destinationSlugs)
    : { data: [], error: null }
  if (destinationError) throw destinationError
  const destinationIds = new Map((destinationRows ?? []).map((destination) => [destination.slug, destination.id]))
  const items = itineraries.flatMap((itinerary) => itinerary.days.flatMap((day) => day.items.map((item, index) => {
    const destinationId = destinationIds.get(item.slug)
    if (!destinationId) throw new Error(`Destination "${item.name}" is not present in Supabase. Run the supplied seed SQL.`)
    if (item.type !== 'destination') throw new Error('Only destination stops are currently supported in itineraries.')
    return {
      id: item.id,
      itinerary_day_id: day.id,
      destination_id: destinationId,
      position: index,
      notes: item.notes,
      start_time: item.startTime ?? null,
    }
  })))

  const dayIds = days.map((day) => day.id)
  const { data: existingItems, error: existingItemsError } = dayIds.length
    ? await client.from('itinerary_items').select('id, itinerary_day_id').in('itinerary_day_id', dayIds)
    : { data: [], error: null }
  if (existingItemsError) throw existingItemsError
  const desiredItemIds = new Set(items.map((item) => item.id))
  const staleItemIds = (existingItems ?? []).map((item) => item.id).filter((id) => !desiredItemIds.has(id))
  if (staleItemIds.length) {
    const { error } = await client.from('itinerary_items').delete().in('id', staleItemIds)
    if (error) throw error
  }
  if (items.length) {
    const { error } = await client.from('itinerary_items').upsert(items, { onConflict: 'id' })
    if (error) throw error
  }
}
