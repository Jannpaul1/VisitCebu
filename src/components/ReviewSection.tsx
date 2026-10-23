import { useEffect, useMemo, useState } from 'react'
import { Star } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { getSupabaseClient } from '../lib/supabase'
import type { Review } from '../types'

interface ReviewSectionProps {
  destinationSlug: string
  destinationName: string
}

function readLocalReviews(slug: string): Review[] {
  try {
    return JSON.parse(localStorage.getItem(`visitcebu-reviews-${slug}`) ?? '[]') as Review[]
  } catch {
    return []
  }
}

export function ReviewSection({ destinationSlug, destinationName }: ReviewSectionProps) {
  const { user, destinations } = useAppContext()
  const destination = destinations.find((place) => place.slug === destinationSlug)
  const client = getSupabaseClient()
  const [reviewData, setReviewData] = useState<{ slug: string; reviews: Review[] } | null>(null)
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(5)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const reviews = reviewData?.slug === destinationSlug ? reviewData.reviews : readLocalReviews(destinationSlug)
  const loading = Boolean(client && destination && loadedSlug !== destinationSlug)

  useEffect(() => {
    let active = true
    if (!client || !destination) return () => { active = false }

    void (async () => {
      try {
        const { data, error: reviewError } = await client
          .from('reviews')
          .select('id, user_id, destination_id, rating, comment, created_at')
          .eq('destination_id', destination.id)
          .order('created_at', { ascending: false })
        if (reviewError) throw reviewError

        const userIds = [...new Set((data ?? []).map((review) => review.user_id))]
        const { data: profiles, error: profileError } = userIds.length
          ? await client.from('profiles').select('id, full_name').in('id', userIds)
          : { data: [], error: null }
        if (profileError) throw profileError
        if (!active) return

        const names = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name]))
        const nextReviews = (data ?? []).map((review) => ({
          id: review.id,
          userId: review.user_id,
          user: names.get(review.user_id) || 'Traveler',
          rating: review.rating,
          comment: review.comment,
          createdAt: review.created_at,
        }))
        setReviewData({ slug: destinationSlug, reviews: nextReviews })
        setLoadedSlug(destinationSlug)
        const myReview = nextReviews.find((review) => review.userId === user?.id)
        setComment(myReview?.comment ?? '')
        setRating(myReview?.rating ?? 5)
        setError('')
      } catch (loadError) {
        if (!active) return
        setReviewData({ slug: destinationSlug, reviews: readLocalReviews(destinationSlug) })
        setLoadedSlug(destinationSlug)
        setError(loadError instanceof Error ? loadError.message : 'Unable to load reviews.')
      }
    })()

    return () => { active = false }
  }, [client, destination, destinationSlug, user?.id])

  const ownReview = reviews.find((review) => review.userId === user?.id)

  const average = useMemo(
    () => (reviews.length ? reviews.reduce((sum, entry) => sum + entry.rating, 0) / reviews.length : 0),
    [reviews],
  )

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user || !destination || !client) return
    setSaving(true)
    setError('')
    setStatus('')
    try {
      const { data, error: saveError } = await client.from('reviews').upsert({
        user_id: user.id,
        destination_id: destination.id,
        rating,
        comment: comment.trim(),
      }, { onConflict: 'user_id,destination_id' }).select('id, created_at').single()
      if (saveError) throw saveError
      const nextReview: Review = {
        id: data.id,
        userId: user.id,
        user: user.name,
        rating,
        comment: comment.trim(),
        createdAt: data.created_at,
      }
      setReviewData({ slug: destinationSlug, reviews: [nextReview, ...reviews.filter((review) => review.userId !== user.id)] })
      setStatus(ownReview ? 'Review updated.' : 'Review submitted.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save your review.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!user || !ownReview || !client) return
    setSaving(true)
    setError('')
    setStatus('')
    try {
      const { error: deleteError } = await client.from('reviews').delete().eq('id', ownReview.id).eq('user_id', user.id)
      if (deleteError) throw deleteError
      setReviewData({ slug: destinationSlug, reviews: reviews.filter((review) => review.id !== ownReview.id) })
      setComment('')
      setRating(5)
      setStatus('Review deleted.')
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete your review.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Reviews</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">Traveler feedback</h3>
        </div>
        <div className="rounded-full bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
          {average ? `${average.toFixed(1)} / 5` : 'No reviews yet'}
        </div>
      </div>

      {loading ? <p role="status" className="mb-4 text-sm text-slate-500">Loading reviews...</p> : null}
      {error ? <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      {status ? <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{status}</p> : null}

      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-3 text-sm font-medium text-slate-700">Your rating</p>
          <div role="group" aria-label="Your rating" className="mb-4 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`Rate ${value} stars`}
                className={value <= rating ? 'text-amber-500' : 'text-slate-300'}
              >
                <Star className="h-6 w-6 fill-current" />
              </button>
            ))}
          </div>
          <label htmlFor="review-comment" className="mb-2 block text-sm font-medium text-slate-700">
            Your review
          </label>
          <textarea
            id="review-comment"
            required
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder={`Share what you loved about ${destinationName}`}
            rows={4}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
          />
          <div className="mt-4 flex justify-end gap-2">
            {ownReview ? <button type="button" onClick={() => void handleDelete()} disabled={saving} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">Delete review</button> : null}
            <button type="submit" disabled={saving} className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
              {saving ? 'Saving...' : ownReview ? 'Update review' : 'Submit review'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
          Sign in to leave a review for this destination.
        </div>
      )}

      <div className="space-y-4">
        {reviews.length ? (
          reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{review.user}</p>
                  <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} className={`h-4 w-4 ${index < review.rating ? 'fill-current' : ''}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-600">{review.comment}</p>
            </div>
          ))
        ) : !loading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
            No reviews yet. Be the first to share a visit.
          </div>
        ) : null}
      </div>
    </section>
  )
}
