
import { useEffect, useState } from 'react'
import {
  getSupabaseClient,
  isSupabaseConfigured,
} from '../lib/supabase'

type TestResult = {
  status: 'loading' | 'success' | 'error'
  message: string
  records: { id: string; name: string }[]
}

export function SupabaseTestPage() {
  const [destinations, setDestinations] = useState<TestResult>({
    status: 'loading',
    message: 'Checking destinations...',
    records: [],
  })

  const [restaurants, setRestaurants] = useState<TestResult>({
    status: 'loading',
    message: 'Checking restaurants...',
    records: [],
  })

  useEffect(() => {
    let active = true

    async function testConnection() {
      const supabase = getSupabaseClient()

      if (!supabase) {
        if (active) {
          const error = {
            status: 'error' as const,
            message: 'Supabase is not configured. Check .env.local.',
            records: [],
          }
          setDestinations(error)
          setRestaurants(error)
        }
        return
      }

      const [destinationResult, restaurantResult] =
        await Promise.all([
          supabase
            .from('destinations')
            .select('id, name')
            .limit(20),

          supabase
            .from('restaurants')
            .select('id, name')
            .limit(20),
        ])

      if (!active) return

      setDestinations({
        status: destinationResult.error ? 'error' : 'success',
        message: destinationResult.error
          ? destinationResult.error.message
          : `Connected! ${destinationResult.data?.length ?? 0} records returned.`,
        records: destinationResult.data ?? [],
      })

      setRestaurants({
        status: restaurantResult.error ? 'error' : 'success',
        message: restaurantResult.error
          ? restaurantResult.error.message
          : `Connected! ${restaurantResult.data?.length ?? 0} records returned.`,
        records: restaurantResult.data ?? [],
      })
    }

    testConnection()

    return () => {
      active = false
    }
  }, [])

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-4 text-3xl font-bold">
        Visit Cebu — Supabase Connection Test
      </h1>

      <p className="mb-8 text-gray-600">
        Configuration:{' '}
        {isSupabaseConfigured
          ? 'Supabase credentials detected'
          : 'Missing or invalid configuration'}
      </p>

      {[
        { title: 'Destinations', result: destinations },
        { title: 'Restaurants', result: restaurants },
      ].map(({ title, result }) => (
        <section
          key={title}
          className="mb-6 rounded-xl border bg-white p-6 shadow-sm"
        >
          <h2 className="mb-2 text-xl font-semibold">{title}</h2>

          <p
            className={
              result.status === 'error'
                ? 'text-red-600'
                : result.status === 'success'
                  ? 'text-green-700'
                  : 'text-gray-500'
            }
          >
            {result.message}
          </p>

          <ul className="mt-4 space-y-2">
            {result.records.map((record) => (
              <li
                key={record.id}
                className="rounded bg-gray-50 px-4 py-2"
              >
                {record.name}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}
