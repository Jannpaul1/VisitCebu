
import {
  CalendarDays,
  CarFront,
  Clock3,
  MapPin,
  ShieldCheck,
  Star,
  Ticket,
  WalletCards,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DestinationCard } from '../components/DestinationCard'
import { FavoriteButton } from '../components/FavoriteButton'
import { Modal } from '../components/Modal'
import { ReviewSection } from '../components/ReviewSection'
import { useAppContext } from '../context/AppContext'

export function DestinationPage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const {
    addItemToItinerary,
    createItinerary,
    itineraries,
    addRecentlyViewed,
    user,
    destinations,
  } = useAppContext()

  const [selectedItineraryId, setSelectedItineraryId] = useState<string>(
    () => itineraries[0]?.id ?? ''
  )
  const [showModal, setShowModal] = useState(false)
  const [failedImages, setFailedImages] = useState<{
    slug: string | undefined
    images: string[]
  }>({ slug, images: [] })

  const destination = useMemo(
    () => destinations.find((entry) => entry.slug === slug),
    [destinations, slug]
  )

  useEffect(() => {
    if (slug) {
      addRecentlyViewed(slug)
    }
  }, [addRecentlyViewed, slug])

  const activeItineraryId =
    selectedItineraryId || itineraries[0]?.id || ''

  useEffect(() => {
    if (destinations.length > 0 && !destination) {
      navigate('/404', { replace: true })
    }
  }, [destination, destinations.length, navigate])

  if (!destination) {
    return (
      <div className="py-20 text-center text-slate-600">
        Loading destination...
      </div>
    )
  }

  const galleryImages = destination.gallery.filter(
    (image) =>
      Boolean(image?.trim()) &&
      !(failedImages.slug === slug && failedImages.images.includes(image))
  )

  const handleImageError = (image: string) => {
    setFailedImages((previous) => {
      const images = previous.slug === slug ? previous.images : []
      return images.includes(image)
        ? previous
        : { slug, images: [...images, image] }
    })
  }

  const addToItinerary = () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (!activeItineraryId && !itineraries.length) {
      const newItinerary = createItinerary('My Cebu Adventure')

      setSelectedItineraryId(newItinerary.id)

      addItemToItinerary(
        newItinerary.id,
        {
          id: crypto.randomUUID(),
          name: destination.name,
          type: 'destination',
          image: destination.image,
          slug: destination.slug,
          notes: 'Added from destination page',
        },
        0
      )

      setShowModal(false)
      return
    }

    addItemToItinerary(
      activeItineraryId,
      {
        id: crypto.randomUUID(),
        name: destination.name,
        type: 'destination',
        image: destination.image,
        slug: destination.slug,
        notes: 'Added from destination page',
      },
      0
    )

    setShowModal(false)
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Destination Details */}
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
        <img
          src={destination.image}
          alt={destination.name}
          className="h-[360px] w-full object-cover md:h-[480px]"
        />

        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                {destination.category}
              </p>

              <h1 className="mt-2 text-4xl font-semibold text-slate-900">
                {destination.name}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  {destination.location}
                </div>

                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                  {destination.rating} ({destination.reviewCount} reviews)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FavoriteButton
                item={{
                  id: destination.id,
                  type: 'destination',
                  name: destination.name,
                  image: destination.image,
                  slug: destination.slug,
                }}
              />

              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Add to Itinerary
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
            <div className="space-y-6">
              {/* Overview */}
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Overview
                </h2>

                <p className="mt-3 text-base leading-8 text-slate-600">
                  {destination.description}
                </p>
              </div>

              {/* Highlights */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Things to do
                </h3>

                <div className="mt-3 flex flex-wrap gap-2">
                  {destination.highlights.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Gallery */}
              {galleryImages.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {galleryImages.map((image, index) => (
                    <img
                      key={`${image}-${index}`}
                      src={image}
                      alt={`${destination.name} view ${index + 1}`}
                      className="h-52 w-full rounded-[24px] object-cover"
                      loading="lazy"
                      onError={() => handleImageError(image)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Visit Details */}
            <aside className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-xl font-semibold text-slate-900">
                Visit details
              </h3>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-4 w-4 text-emerald-600" />
                  <span>
                    <strong className="font-semibold text-slate-800">
                      Best time:
                    </strong>{' '}
                    {destination.bestTime}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Ticket className="h-4 w-4 text-emerald-600" />
                  <span>
                    <strong className="font-semibold text-slate-800">
                      Entrance fee:
                    </strong>{' '}
                    {destination.entranceFee}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock3 className="h-4 w-4 text-emerald-600" />
                  <span>
                    <strong className="font-semibold text-slate-800">
                      Hours:
                    </strong>{' '}
                    {destination.openingHours}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <CarFront className="h-4 w-4 text-emerald-600" />
                  <span>
                    <strong className="font-semibold text-slate-800">
                      How to get there:
                    </strong>{' '}
                    {destination.howToGetThere}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <WalletCards className="h-4 w-4 text-emerald-600" />
                  <span>
                    <strong className="font-semibold text-slate-800">
                      Price:
                    </strong>{' '}
                    {destination.price}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Amenities and Travel Tips */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">
            Amenities
          </h3>

          <div className="mt-4 flex flex-wrap gap-2">
            {destination.amenities.map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">
            Travel tips
          </h3>

          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            {destination.travelTips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Nearby Places */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">
            Nearby attractions
          </h3>

          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {destination.nearbyAttractions.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">
            Nearby restaurants
          </h3>

          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {destination.nearbyRestaurants.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Related Destinations */}
      <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold text-slate-900">
          Related destinations
        </h3>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {destinations
            .filter((entry) =>
              destination.relatedDestinations.includes(entry.name)
            )
            .slice(0, 3)
            .map((entry) => (
              <DestinationCard key={entry.id} destination={entry} />
            ))}
        </div>
      </div>

      {/* Reviews */}
      <ReviewSection
        destinationSlug={destination.slug}
        destinationName={destination.name}
      />

      {/* Add to Itinerary Modal */}
      <Modal
        open={showModal}
        title="Add to itinerary"
        onClose={() => setShowModal(false)}
      >
        <div className="space-y-4">
          <label htmlFor="itinerary-select" className="block text-sm font-medium text-slate-700">
            Choose itinerary
          </label>

          <select
            id="itinerary-select"
            value={activeItineraryId}
            onChange={(event) =>
              setSelectedItineraryId(event.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
          >
            {itineraries.length ? (
              itineraries.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))
            ) : (
              <option value="">Create an itinerary first</option>
            )}
          </select>

          <div className="flex justify-end gap-3">
            {!user ? (
              <Link
                to="/login"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Log in to save itinerary
              </Link>
            ) : (
              <button
                type="button"
                onClick={addToItinerary}
                className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Save to itinerary
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
