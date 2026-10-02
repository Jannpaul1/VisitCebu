import { useState } from 'react'
import { RestaurantCard } from '../components/RestaurantCard'
import { restaurants } from '../data/cebuData'

const cuisineFilters = ['All', 'Cebu Lechon', 'Seafood', 'Filipino', 'Street Food', 'Cafés', 'Fine Dining', 'Desserts', 'Local Favorites']

export function FoodPage() {
  const [filter, setFilter] = useState('All')

  const filteredRestaurants = filter === 'All' ? restaurants : restaurants.filter((restaurant) => restaurant.category === filter || restaurant.cuisine === filter)

  return (
    <div className="space-y-8 pb-10">
      <section className="rounded-[30px] bg-gradient-to-r from-orange-600 to-amber-500 p-8 text-white shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-100">Food & dining</p>
        <h1 className="mt-2 text-4xl font-semibold">Taste Cebu</h1>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {cuisineFilters.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setFilter(category)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                filter === category ? 'bg-orange-600 text-white' : 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-orange-300 hover:text-orange-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredRestaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </section>
    </div>
  )
}
