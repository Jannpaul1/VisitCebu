import type { ReactNode } from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FavoriteButton } from '../components/FavoriteButton'
import { Hero } from '../components/Hero'
import { ItineraryCard } from '../components/ItineraryCard'
import { MapView } from '../components/MapView'
import { destinations } from '../data/cebuData'
import { FavoritesPage } from '../pages/FavoritesPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { ItineraryPage } from '../pages/ItineraryPage'
import { LoginPage } from '../pages/LoginPage'
import { ResetPasswordPage } from '../pages/ResetPasswordPage'
import { SignupPage } from '../pages/SignupPage'
import type { Itinerary } from '../types'

const mocks = vi.hoisted(() => ({
  map: {
    flyTo: vi.fn(),
    fitBounds: vi.fn(),
    setView: vi.fn(),
  },
  context: {
    favorites: [] as Array<{
      id: string
      type: 'destination' | 'restaurant' | 'activity'
      name: string
      image: string
      slug: string
    }>,
    itineraries: [] as Itinerary[],
    user: null as { id: string; name: string; email: string; avatar: string } | null,
    authLoading: false,
    travelDataLoading: false,
    travelDataError: '',
    destinations: [] as typeof destinations,
    catalogLoading: false,
    catalogError: '',
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
    isFavorite: vi.fn(() => false),
    login: vi.fn(async () => ({ ok: false, message: 'Invalid credentials.' })),
    signup: vi.fn<
      (
        name: string,
        email: string,
        password: string
      ) => Promise<{
        ok: boolean
        authenticated?: boolean
        message?: string
      }>
    >(async () => ({ ok: false, message: 'Unable to create account.' })),
    logout: vi.fn(async () => {}),
    resetPassword: vi.fn(async () => ({ ok: true })),
    updatePassword: vi.fn(async () => ({ ok: true })),
    updateProfile: vi.fn(async () => ({ ok: true })),
    createItinerary: vi.fn(() => ({
      id: 'new-trip',
      name: 'New trip',
      days: [{ id: 'day-1', title: 'Day 1', items: [] }],
    })),
    renameItinerary: vi.fn(),
    deleteItinerary: vi.fn(),
    addItineraryDay: vi.fn(),
    addItemToItinerary: vi.fn(),
    updateItineraryItem: vi.fn(),
    removeItemFromItinerary: vi.fn(),
    moveItemBetweenDays: vi.fn(),
    moveItemWithinDay: vi.fn(),
  },
}))

vi.mock('../context/AppContext', () => ({
  useAppContext: () => mocks.context,
}))

vi.mock('react-leaflet', async () => {
  const { createElement } = await import('react')

  return {
    MapContainer: ({ children }: { children: ReactNode }) =>
      createElement('div', { 'data-testid': 'leaflet-map' }, children),
    Marker: ({
      children,
      position,
      eventHandlers,
    }: {
      children: ReactNode
      position: [number, number]
      eventHandlers?: { click?: () => void }
    }) =>
      createElement(
        'button',
        {
          type: 'button',
          'data-testid': 'map-marker',
          'data-position': position.join(','),
          onClick: eventHandlers?.click,
        },
        children
      ),
    Popup: ({ children }: { children: ReactNode }) =>
      createElement('div', { 'data-testid': 'map-popup' }, children),
    TileLayer: () => null,
    useMap: () => mocks.map,
  }
})

function renderWithRouter(ui: ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

function CurrentLocation() {
  const { pathname, search } = useLocation()
  return <output data-testid="current-location">{pathname}{search}</output>
}

describe('VisitCebu user flows (Supabase calls mocked)', () => {
  beforeEach(() => {
    mocks.context.favorites = []
    mocks.context.itineraries = []
    mocks.context.user = null
    mocks.context.destinations = destinations
    mocks.context.travelDataError = ''
    mocks.context.login.mockResolvedValue({
      ok: false,
      message: 'Invalid credentials.',
    })
    mocks.context.signup.mockResolvedValue({
      ok: true,
      authenticated: false,
      message: 'Account created. Check your email.',
    })
    mocks.context.resetPassword.mockResolvedValue({ ok: true })
    mocks.context.updatePassword.mockResolvedValue({ ok: true })
    mocks.context.createItinerary.mockReturnValue({
      id: 'new-trip',
      name: 'New trip',
      days: [{ id: 'day-1', title: 'Day 1', items: [] }],
    })
    vi.clearAllMocks()
  })

  afterEach(cleanup)

  it('routes home hero searches to the query parameter Explore reads', async () => {
    const user = userEvent.setup()
    const searchResults = destinations.slice(0, 1).map((place) => ({
      id: place.id,
      name: place.name,
      type: 'Destination',
      slug: place.slug,
      image: place.image,
    }))

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Hero searchResults={searchResults} />} />
          <Route path="/explore" element={<h1>Explore results</h1>} />
        </Routes>
        <CurrentLocation />
      </MemoryRouter>
    )

    await user.type(
      screen.getByRole('textbox', {
        name: 'Search destinations, attractions, restaurants, and activities',
      }),
      'Moalboal'
    )
    await user.click(screen.getByRole('button', { name: /^Search$/ }))

    expect(screen.getByTestId('current-location')).toHaveTextContent(
      '/explore?search=Moalboal'
    )
    expect(screen.getByRole('heading', { name: 'Explore results' })).toBeInTheDocument()
  })

  it('filters map results, focuses a selected destination, and resets markers', async () => {
    const user = userEvent.setup()
    const places = destinations.filter((place) =>
      ['moalboal', 'oslob', 'bantayan-island'].includes(place.slug)
    )

    renderWithRouter(<MapView destinations={places} />)

    expect(screen.getByText('3 destinations found')).toBeInTheDocument()
    expect(screen.getAllByTestId('map-marker')).toHaveLength(3)

    await user.click(screen.getByRole('button', { name: 'South Cebu (2)' }))
    expect(screen.getByText('2 destinations found')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Beaches (1)' }))
    expect(screen.getByText('1 destination found')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /Moalboal Cebu South Coast/ })
    )
    expect(mocks.map.flyTo).toHaveBeenCalledWith([9.9447, 123.3962], 11, {
      duration: 0.8,
    })

    await user.click(screen.getByRole('button', { name: 'Reset Filters' }))
    expect(screen.getByText('3 destinations found')).toBeInTheDocument()
    expect(screen.getAllByTestId('map-marker')).toHaveLength(3)
    expect(screen.getAllByRole('link', { name: 'View Details' })).toHaveLength(3)
  })

  it('shows an empty map result for unmatched search and recovers with reset', async () => {
    const user = userEvent.setup()
    renderWithRouter(<MapView destinations={destinations.slice(0, 2)} />)

    await user.type(
      screen.getByRole('textbox', { name: 'Search destinations' }),
      'no-place-matches'
    )

    expect(screen.getByText('No destinations found')).toBeInTheDocument()
    expect(
      screen.getByText('No matching destinations to display on the map.')
    ).toBeInTheDocument()
    expect(screen.queryAllByTestId('map-marker')).toHaveLength(0)

    await user.click(screen.getByRole('button', { name: 'Show All Destinations' }))
    expect(screen.getByText('2 destinations found')).toBeInTheDocument()
  })

  it('submits login data to the mocked auth provider and shows its error', async () => {
    const user = userEvent.setup()
    renderWithRouter(<LoginPage />)

    await user.type(screen.getByLabelText('Email'), 'traveler@example.test')
    await user.type(screen.getByLabelText('Password'), 'not-a-real-password')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    expect(mocks.context.login).toHaveBeenCalledWith(
      'traveler@example.test',
      'not-a-real-password'
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials.')
  })

  it('validates signup fields in the browser without calling auth when incomplete', async () => {
    const user = userEvent.setup()
    renderWithRouter(<SignupPage />)

    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(mocks.context.signup).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Full name')).toBeRequired()
    expect(screen.getByLabelText('Password')).toHaveAttribute('minLength', '8')
  })

  it('displays reset-password mismatch without calling the update API', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ResetPasswordPage />)

    await user.type(screen.getByLabelText('New password'), 'first-password')
    await user.type(screen.getByLabelText('Confirm password'), 'different-password')
    await user.click(screen.getByRole('button', { name: 'Update password' }))

    expect(mocks.context.updatePassword).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match.')
  })

  it('shows password-reset confirmation from the mocked provider', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText('Email'), 'traveler@example.test')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))

    expect(mocks.context.resetPassword).toHaveBeenCalledWith(
      'traveler@example.test'
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'If an account exists for traveler@example.test'
    )
  })

  it('calls the guest favorite actions and removes a saved item', async () => {
    const user = userEvent.setup()
    const place = destinations[0]
    const favorite = {
      id: place.id,
      type: 'destination' as const,
      name: place.name,
      image: place.image,
      slug: place.slug,
    }

    renderWithRouter(
      <>
        <FavoriteButton item={favorite} />
        <FavoritesPage />
      </>
    )

    await user.click(screen.getByRole('button', { name: 'Save Moalboal to favorites' }))
    expect(mocks.context.addFavorite).toHaveBeenCalledWith(favorite)

    cleanup()
    mocks.context.favorites = [favorite]
    renderWithRouter(<FavoritesPage />)
    await user.click(screen.getByRole('button', { name: 'Remove' }))
    expect(mocks.context.removeFavorite).toHaveBeenCalledWith(
      place.id,
      'destination',
      place.slug
    )
  })

  it('adds a suggested destination to a newly created itinerary', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ItineraryPage />)

    const moalboalCard = screen
      .getByRole('heading', { name: 'Moalboal' })
      .closest('article')

    expect(moalboalCard).not.toBeNull()

    await user.click(
      within(moalboalCard!).getByRole('button', {
        name: '+ Add to itinerary',
      })
    )

    expect(mocks.context.createItinerary).toHaveBeenCalledWith('My Cebu Adventure')
    expect(mocks.context.addItemToItinerary).toHaveBeenCalledWith(
      'new-trip',
      expect.objectContaining({ name: 'Moalboal', slug: 'moalboal' }),
      0
    )
  })

  it('edits itinerary notes, time, ordering, and name through the itinerary card', async () => {
    const user = userEvent.setup()
    const itinerary: Itinerary = {
      id: 'trip-1',
      name: 'Cebu Weekend',
      days: [
        {
          id: 'day-1',
          title: 'Day 1',
          items: [
            {
              id: 'place-1',
              name: 'Moalboal',
              type: 'destination',
              image: destinations[0].image,
              slug: 'moalboal',
              notes: '',
            },
            {
              id: 'place-2',
              name: 'Oslob',
              type: 'destination',
              image: destinations[4].image,
              slug: 'oslob',
              notes: '',
            },
          ],
        },
      ],
    }

    render(
      <ItineraryCard
        itinerary={itinerary}
        onRename={mocks.context.renameItinerary}
        onUpdateNotes={mocks.context.updateItineraryItem}
        onUpdateTime={mocks.context.updateItineraryItem}
        onMoveWithinDay={mocks.context.moveItemWithinDay}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Rename Cebu Weekend' }))
    await user.clear(screen.getByLabelText('Itinerary name'))
    await user.type(screen.getByLabelText('Itinerary name'), 'Island Weekend')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(mocks.context.renameItinerary).toHaveBeenCalledWith('Island Weekend')

    await user.type(screen.getAllByLabelText('Notes')[0], 'Snorkel early')
    expect(mocks.context.updateItineraryItem).toHaveBeenCalled()

    fireEvent.change(screen.getAllByLabelText('Start time')[0], {
      target: { value: '08:30' },
    })
    expect(mocks.context.updateItineraryItem).toHaveBeenLastCalledWith(
      0,
      'place-1',
      '08:30'
    )

    await user.click(screen.getByRole('button', { name: 'Move Moalboal later' }))
    expect(mocks.context.moveItemWithinDay).toHaveBeenCalledWith(0, 'place-1', 1)
  })
})
