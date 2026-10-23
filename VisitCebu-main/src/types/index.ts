export type Category =
  | 'Beaches'
  | 'Waterfalls'
  | 'Islands'
  | 'Historical Sites'
  | 'Mountains'
  | 'Adventure'
  | 'Food'
  | 'Nightlife'
  | 'Shopping'
  | 'Family'
  | 'Nature'
  | 'Culture'

export type PriceRange = 'Budget' | 'Mid-range' | 'Premium'

export interface Destination {
  id: string
  slug: string
  name: string
  location: string
  category: Category
  rating: number
  reviewCount: number
  price: PriceRange
  description: string
  summary: string
  image: string
  gallery: string[]
  coordinates: { lat: number; lng: number }
  tags: string[]
  highlights: string[]
  bestTime: string
  entranceFee: string
  openingHours: string
  howToGetThere: string
  amenities: string[]
  travelTips: string[]
  nearbyAttractions: string[]
  nearbyRestaurants: string[]
  relatedDestinations: string[]
}

export interface Restaurant {
  id: string
  slug: string
  name: string
  cuisine: string
  location: string
  rating: number
  price: string
  description: string
  image: string
  category: string
  highlights: string[]
  bestFor: string
  hours: string
  priceRange: string
  gallery: string[]
  contact?: string
}

export interface EventItem {
  id: string
  slug: string
  name: string
  date: string
  location: string
  category: string
  description: string
  image: string
  price: string
  hours: string
  bestFor: string
  highlights: string[]
  gallery: string[]
}

export interface FavoriteItem {
  id: string
  type: 'destination' | 'restaurant' | 'activity'
  name: string
  image: string
  slug: string
}

export interface Review {
  id: string
  user: string
  userId?: string
  rating: number
  comment: string
  createdAt: string
}

export interface ItineraryItem {
  id: string
  name: string
  type: 'destination' | 'restaurant' | 'activity'
  image: string
  slug: string
  notes: string
  startTime?: string
}

export interface ItineraryDay {
  id: string
  title: string
  date?: string
  items: ItineraryItem[]
}

export interface Itinerary {
  id: string
  name: string
  startDate?: string
  endDate?: string
  days: ItineraryDay[]
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
}

export interface SearchResult {
  id: string
  name: string
  type: string
  slug: string
  image: string
}
