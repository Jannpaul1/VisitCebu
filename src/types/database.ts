type Table<Row, Insert = Partial<Row>, Update = Partial<Insert>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      profiles: Table<{
        id: string
        full_name: string
        avatar_url: string | null
        created_at: string
      }, {
        id: string
        full_name?: string
        avatar_url?: string | null
        created_at?: string
      }>
      destinations: Table<{
        id: string
        slug: string
        name: string
        description: string
        short_description: string
        location: string
        category: string
        image_url: string
        latitude: number | null
        longitude: number | null
        rating: number
        opening_hours: string
        entrance_fee: string
        best_time_to_visit: string
        how_to_get_there: string
        travel_tips: string[]
        created_at: string
      }, {
        id?: string
        slug: string
        name: string
        description: string
        short_description: string
        location: string
        category: string
        image_url: string
        latitude?: number | null
        longitude?: number | null
        rating?: number
        opening_hours?: string
        entrance_fee?: string
        best_time_to_visit?: string
        how_to_get_there?: string
        travel_tips?: string[]
        created_at?: string
      }>
      restaurants: Table<{
        id: string
        slug: string
        name: string
        description: string
        cuisine: string
        location: string
        image_url: string
        price_range: string
        rating: number
        latitude: number | null
        longitude: number | null
        created_at: string
      }>
      events: Table<{
        id: string
        slug: string
        name: string
        description: string
        image_url: string
        location: string
        category: string
        start_date: string
        end_date: string
        created_at: string
      }>
      favorites: Table<{
        id: string
        user_id: string
        destination_id: string | null
        restaurant_id: string | null
        created_at: string
      }, {
        id?: string
        user_id: string
        destination_id?: string | null
        restaurant_id?: string | null
        created_at?: string
      }>
      itineraries: Table<{
        id: string
        user_id: string
        title: string
        start_date: string | null
        end_date: string | null
        created_at: string
        updated_at: string
      }, {
        id?: string
        user_id: string
        title: string
        start_date?: string | null
        end_date?: string | null
        created_at?: string
        updated_at?: string
      }>
      itinerary_days: Table<{
        id: string
        itinerary_id: string
        day_number: number
        date: string | null
      }, {
        id?: string
        itinerary_id: string
        day_number: number
        date?: string | null
      }>
      itinerary_items: Table<{
        id: string
        itinerary_day_id: string
        destination_id: string
        position: number
        notes: string
        start_time: string | null
      }, {
        id?: string
        itinerary_day_id: string
        destination_id: string
        position: number
        notes?: string
        start_time?: string | null
      }>
      reviews: Table<{
        id: string
        user_id: string
        destination_id: string
        rating: number
        comment: string
        created_at: string
        updated_at: string
      }, {
        id?: string
        user_id: string
        destination_id: string
        rating: number
        comment: string
        created_at?: string
        updated_at?: string
      }>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}