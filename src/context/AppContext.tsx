
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase'
import {
  loadUserFavorites,
  loadUserItineraries,
  syncUserFavorites,
  syncUserItineraries,
} from '../lib/supabaseData'
import { destinations as staticDestinations } from '../data/cebuData'
import type { Database } from '../types/database'
import type {
  Destination,
  FavoriteItem,
  Itinerary,
  ItineraryItem,
  UserProfile,
} from '../types'

const STORAGE_KEYS = {
  favorites: 'visitcebu-favorites',
  user: 'visitcebu-user',
  recentlyViewed: 'visitcebu-recently-viewed',
}

interface AppContextValue {
  favorites: FavoriteItem[]
  itineraries: Itinerary[]
  user: UserProfile | null
  session: Session | null
  authLoading: boolean
  destinations: Destination[]
  catalogLoading: boolean
  catalogError: string
  travelDataLoading: boolean
  travelDataError: string
  recentlyViewed: string[]
  addFavorite: (item: FavoriteItem) => void
  removeFavorite: (
    id: string,
    type: FavoriteItem['type'],
    slug?: string
  ) => void
  isFavorite: (
    id: string,
    type: FavoriteItem['type'],
    slug?: string
  ) => boolean
  login: (email: string, password: string) => Promise<AuthResult>
  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<AuthResult>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<AuthResult>
  updatePassword: (password: string) => Promise<AuthResult>
  updateProfile: (
    updates: Partial<UserProfile>
  ) => Promise<AuthResult>
  createItinerary: (name: string) => Itinerary
  renameItinerary: (itineraryId: string, name: string) => void
  deleteItinerary: (itineraryId: string) => void
  addItineraryDay: (itineraryId: string) => void
  addItemToItinerary: (
    itineraryId: string,
    item: ItineraryItem,
    dayIndex?: number
  ) => void
  updateItineraryItem: (
    itineraryId: string,
    dayIndex: number,
    itemId: string,
    updates: Partial<Pick<ItineraryItem, 'notes' | 'startTime'>>
  ) => void
  removeItemFromItinerary: (
    itineraryId: string,
    dayIndex: number,
    itemId: string
  ) => void
  moveItemBetweenDays: (
    itineraryId: string,
    fromDay: number,
    toDay: number,
    itemId: string
  ) => void
  moveItemWithinDay: (
    itineraryId: string,
    dayIndex: number,
    itemId: string,
    direction: -1 | 1
  ) => void
  addRecentlyViewed: (slug: string) => void
}

interface AuthResult {
  ok: boolean
  message?: string
  authenticated?: boolean
}

function readStored<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key)
    return saved === null ? fallback : JSON.parse(saved) as T
  } catch {
    return fallback
  }
}

function mergeFavorites(...lists: FavoriteItem[][]): FavoriteItem[] {
  const merged = new Map<string, FavoriteItem>()

  for (const item of lists.flat()) {
    merged.set(`${item.type}:${item.slug}`, item)
  }

  return [...merged.values()]
}

function newId(): string {
  return crypto.randomUUID()
}

function errorMessage(error: unknown, fallback: string): string {
  const message =
    error instanceof Error
      ? error.message
      : error &&
          typeof error === 'object' &&
          'message' in error &&
          typeof error.message === 'string'
        ? error.message
        : String(error)

  return /network|fetch|connection/i.test(message)
    ? 'Network error. Check your connection and try again.'
    : message || fallback
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

type DestinationRow =
  Database['public']['Tables']['destinations']['Row']

function destinationFromRow(row: DestinationRow): Destination {
  const fallback = staticDestinations.find(
    (destination) => destination.slug === row.slug
  )

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    location: row.location,
    category: row.category as Destination['category'],
    rating: Number(row.rating),
    reviewCount: fallback?.reviewCount ?? 0,
    price: fallback?.price ?? 'Budget',
    description: row.description,
    summary: row.short_description,
    image: row.image_url,
    gallery: fallback?.gallery ?? [row.image_url],

    // Use coordinates directly from Supabase.
    // Missing coordinates are NaN so MapView can exclude them.
    coordinates: {
      lat: row.latitude == null ? NaN : Number(row.latitude),
      lng: row.longitude == null ? NaN : Number(row.longitude),
    },

    tags: fallback?.tags ?? [],
    highlights: fallback?.highlights ?? [],
    bestTime: row.best_time_to_visit,
    entranceFee: row.entrance_fee,
    openingHours: row.opening_hours,
    howToGetThere: row.how_to_get_there,
    amenities: fallback?.amenities ?? [],
    travelTips: row.travel_tips,
    nearbyAttractions: fallback?.nearbyAttractions ?? [],
    nearbyRestaurants: fallback?.nearbyRestaurants ?? [],
    relatedDestinations: fallback?.relatedDestinations ?? [],
  }
}

function profileFromAuthUser(authUser: User): UserProfile {
  const name = String(
    authUser.user_metadata.full_name ??
      authUser.user_metadata.name ??
      authUser.email ??
      'Traveler'
  )

  return {
    id: authUser.id,
    name,
    email: authUser.email ?? '',
    avatar: String(
      authUser.user_metadata.avatar_url ??
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
    ),
  }
}

export const AppProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [destinations, setDestinations] =
    useState<Destination[]>(staticDestinations)

  const [catalogLoading, setCatalogLoading] =
    useState(isSupabaseConfigured)

  const [catalogError, setCatalogError] = useState('')

  const [guestFavorites, setGuestFavorites] = useState<FavoriteItem[]>(
    () => readStored(STORAGE_KEYS.favorites, [])
  )

  const guestFavoritesRef = useRef(guestFavorites)

  const [favorites, setFavorites] = useState<FavoriteItem[]>(
    () => readStored(STORAGE_KEYS.favorites, [])
  )

  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [user, setUser] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured)
  const [travelDataError, setTravelDataError] = useState('')
  const [travelDataReadyFor, setTravelDataReadyFor] =
    useState<string | null>(null)

  const syncQueue = useRef<Promise<void>>(Promise.resolve())
  const activeUserId = useRef<string | null>(null)

  const travelDataLoading = Boolean(
    user &&
      travelDataReadyFor !== user.id &&
      !travelDataError
  )

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(
    () => readStored(STORAGE_KEYS.recentlyViewed, [])
  )

  useEffect(() => {
    guestFavoritesRef.current = guestFavorites

    localStorage.setItem(
      STORAGE_KEYS.favorites,
      JSON.stringify(guestFavorites)
    )
  }, [guestFavorites])

  useEffect(() => {
    localStorage.removeItem(STORAGE_KEYS.user)
    localStorage.removeItem('visitcebu-users')
  }, [])

  const applyAuthSession = useCallback(
    (nextSession: Session | null) => {
      const authUser = nextSession?.user ?? null
      const nextUser = authUser
        ? profileFromAuthUser(authUser)
        : null

      if (activeUserId.current !== (nextUser?.id ?? null)) {
        activeUserId.current = nextUser?.id ?? null
        setFavorites([])
        setItineraries([])
        setTravelDataReadyFor(null)
        setTravelDataError('')
      }

      setSession(nextSession)
      setUser(nextUser)
      setAuthLoading(false)
    },
    []
  )

  // Load destinations from Supabase.
  useEffect(() => {
    const client = getSupabaseClient()

    if (!client) return

    let active = true

    void (async () => {
      try {
        const { data, error } = await client
          .from('destinations')
          .select('*')
          .order('name')

        if (error) throw error
        if (!active) return

        if (data?.length) {
          setDestinations(data.map(destinationFromRow))
        }

        setCatalogError('')
      } catch (error) {
        if (active) {
          setCatalogError(
            errorMessage(
              error,
              'Unable to load destinations from Supabase. Showing the bundled catalog.'
            )
          )
        }
      } finally {
        if (active) setCatalogLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [])

  // Supabase authentication.
  useEffect(() => {
    const client = getSupabaseClient()

    if (!client) return

    let active = true

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      applyAuthSession(session)
    })

    void client.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return

        if (error) {
          setTravelDataError(
            errorMessage(error, 'Unable to restore your session.')
          )
        }

        applyAuthSession(data.session)
      })
      .catch((error: unknown) => {
        if (!active) return

        setTravelDataError(
          errorMessage(error, 'Unable to restore your session.')
        )

        setAuthLoading(false)
      })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [applyAuthSession])

  // Load user favorites and itineraries.
  useEffect(() => {
    const client = getSupabaseClient()
    const userId = user?.id

    if (!userId || !client) return

    let active = true

    void (async () => {
      try {
        const [accountFavorites, accountItineraries] =
          await Promise.all([
            loadUserFavorites(client, userId),
            loadUserItineraries(client, userId),
          ])

        if (!active) return

        const guestFavoritesAtLogin = guestFavoritesRef.current

        const mergedFavorites = mergeFavorites(
          accountFavorites,
          guestFavoritesAtLogin
        )

        if (guestFavoritesAtLogin.length) {
          await syncUserFavorites(client, userId, mergedFavorites)
        }

        if (!active) return

        setFavorites(mergedFavorites)

        if (guestFavoritesRef.current === guestFavoritesAtLogin) {
          setGuestFavorites([])
        }

        setItineraries(accountItineraries)
        setTravelDataReadyFor(userId)
      } catch (error) {
        if (!active) return

        setFavorites([])
        setItineraries([])
        setTravelDataError(
          errorMessage(error, 'Unable to load your saved travel data.')
        )
      }
    })()

    return () => {
      active = false
    }
  }, [user?.id])

  // Save user favorites and itineraries.
  useEffect(() => {
    const client = getSupabaseClient()
    const userId = user?.id

    if (
      !client ||
      !userId ||
      travelDataReadyFor !== userId ||
      travelDataLoading
    ) {
      return
    }

    let active = true

    const payload = {
      favorites,
      itineraries,
    }

    const timer = window.setTimeout(() => {
      syncQueue.current = syncQueue.current
        .then(async () => {
          if (!active) return

          await Promise.all([
            syncUserFavorites(
              client,
              userId,
              payload.favorites
            ),
            syncUserItineraries(
              client,
              userId,
              payload.itineraries
            ),
          ])

          if (active) setTravelDataError('')
        })
        .catch((error: unknown) => {
          if (active) {
            setTravelDataError(
              errorMessage(
                error,
                'Unable to save your travel data.'
              )
            )
          }
        })
    }, 250)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [
    favorites,
    itineraries,
    user?.id,
    travelDataLoading,
    travelDataReadyFor,
  ])

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.recentlyViewed,
      JSON.stringify(recentlyViewed.slice(0, 8))
    )
  }, [recentlyViewed])

  const addFavorite = useCallback(
    (item: FavoriteItem) => {
      if (!user) {
        setGuestFavorites((current) =>
          mergeFavorites(current, [item])
        )
        return
      }

      setFavorites((current) =>
        mergeFavorites(current, [item])
      )
    },
    [user]
  )

  const removeFavorite = useCallback(
    (
      id: string,
      type: FavoriteItem['type'],
      slug?: string
    ) => {
      if (!user) {
        setGuestFavorites((current) =>
          current.filter(
            (favorite) =>
              !(
                favorite.type === type &&
                (favorite.id === id || favorite.slug === slug)
              )
          )
        )
        return
      }

      setFavorites((current) =>
        current.filter(
          (favorite) =>
            !(
              favorite.type === type &&
              (favorite.id === id || favorite.slug === slug)
            )
        )
      )
    },
    [user]
  )

  const isFavorite = useCallback(
    (
      id: string,
      type: FavoriteItem['type'],
      slug?: string
    ) =>
      (user ? favorites : guestFavorites).some(
        (favorite) =>
          favorite.type === type &&
          (favorite.id === id || favorite.slug === slug)
      ),
    [favorites, guestFavorites, user]
  )

  const login = useCallback(
    async (
      email: string,
      password: string
    ): Promise<AuthResult> => {
      const client = getSupabaseClient()

      if (!client) {
        return {
          ok: false,
          message:
            'Sign-in is unavailable until Supabase is configured.',
        }
      }

      try {
        const { error } =
          await client.auth.signInWithPassword({
            email: email.trim(),
            password,
          })

        return error
          ? {
              ok: false,
              message: errorMessage(
                error,
                'Unable to sign in.'
              ),
            }
          : { ok: true, authenticated: true }
      } catch (error) {
        return {
          ok: false,
          message: errorMessage(
            error,
            'Unable to sign in.'
          ),
        }
      }
    },
    []
  )

  const signup = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ): Promise<AuthResult> => {
      const trimmedName = name.trim()
      const trimmedEmail = email.trim()

      if (!trimmedName || !trimmedEmail || !password) {
        return {
          ok: false,
          message: 'Please complete every field.',
        }
      }

      if (password.length < 8) {
        return {
          ok: false,
          message: 'Use a password with at least 8 characters.',
        }
      }

      const client = getSupabaseClient()

      if (!client) {
        return {
          ok: false,
          message:
            'Account creation is unavailable until Supabase is configured.',
        }
      }

      try {
        const { data, error } = await client.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              full_name: trimmedName,
            },
            emailRedirectTo: `${window.location.origin}/login`,
          },
        })

        if (error) {
          return {
            ok: false,
            message: errorMessage(
              error,
              'Unable to create your account.'
            ),
          }
        }

        if (data.user && data.user.identities?.length === 0) {
          return {
            ok: false,
            message:
              'An account with this email already exists. Try signing in instead.',
          }
        }

        return data.session
          ? { ok: true, authenticated: true }
          : {
              ok: true,
              authenticated: false,
              message:
                'Account created. Check your email to confirm it before signing in.',
            }
      } catch (error) {
        return {
          ok: false,
          message: errorMessage(
            error,
            'Unable to create your account.'
          ),
        }
      }
    },
    []
  )

  const logout = useCallback(async () => {
    const client = getSupabaseClient()

    if (client) {
      const { error } = await client.auth.signOut()
      if (error) throw error
    }

    setUser(null)
  }, [])

  const resetPassword = useCallback(
    async (email: string): Promise<AuthResult> => {
      const client = getSupabaseClient()

      if (!client) {
        return {
          ok: false,
          message:
            'Password reset is unavailable until Supabase is configured.',
        }
      }

      try {
        const { error } =
          await client.auth.resetPasswordForEmail(
            email.trim(),
            {
              redirectTo: `${window.location.origin}/reset-password`,
            }
          )

        return error
          ? {
              ok: false,
              message: errorMessage(
                error,
                'Unable to send a password reset email.'
              ),
            }
          : { ok: true }
      } catch (error) {
        return {
          ok: false,
          message: errorMessage(
            error,
            'Unable to send a password reset email.'
          ),
        }
      }
    },
    []
  )

  const updatePassword = useCallback(
    async (password: string): Promise<AuthResult> => {
      const client = getSupabaseClient()

      if (!client) {
        return {
          ok: false,
          message:
            'Password updates are unavailable until Supabase is configured.',
        }
      }

      if (password.length < 8) {
        return {
          ok: false,
          message:
            'Use a password with at least 8 characters.',
        }
      }

      try {
        const { error } =
          await client.auth.updateUser({ password })

        return error
          ? {
              ok: false,
              message: errorMessage(
                error,
                'Unable to update your password.'
              ),
            }
          : { ok: true }
      } catch (error) {
        return {
          ok: false,
          message: errorMessage(
            error,
            'Unable to update your password.'
          ),
        }
      }
    },
    []
  )

  const updateProfile = useCallback(
    async (
      updates: Partial<UserProfile>
    ): Promise<AuthResult> => {
      if (!user || !isSupabaseConfigured) {
        return {
          ok: false,
          message: 'Sign in to update your profile.',
        }
      }

      const client = getSupabaseClient()

      if (!client) {
        return {
          ok: false,
          message: 'Supabase is not configured.',
        }
      }

      const nextName = updates.name?.trim()

      if (!nextName) {
        return {
          ok: false,
          message: 'Name cannot be empty.',
        }
      }

      try {
        const { data, error } = await client.auth.updateUser({
          data: {
            full_name: nextName,
          },
        })

        if (error) {
          return {
            ok: false,
            message: errorMessage(
              error,
              'Unable to update your profile.'
            ),
          }
        }

        if (data.user) {
          const { error: profileError } = await client
            .from('profiles')
            .upsert(
              {
                id: data.user.id,
                full_name: nextName,
                avatar_url:
                  typeof data.user.user_metadata.avatar_url ===
                  'string'
                    ? data.user.user_metadata.avatar_url
                    : null,
              },
              { onConflict: 'id' }
            )

          if (profileError) {
            return {
              ok: false,
              message: errorMessage(
                profileError,
                'Unable to update your profile.'
              ),
            }
          }

          setUser(profileFromAuthUser(data.user))
        }

        return { ok: true }
      } catch (error) {
        return {
          ok: false,
          message: errorMessage(
            error,
            'Unable to update your profile.'
          ),
        }
      }
    },
    [user]
  )

  const createItinerary = useCallback(
    (name: string) => {
      const next: Itinerary = {
        id: newId(),
        name: name.trim() || `Trip ${itineraries.length + 1}`,
        days: [
          {
            id: newId(),
            title: 'Day 1',
            items: [],
          },
          {
            id: newId(),
            title: 'Day 2',
            items: [],
          },
        ],
      }

      setItineraries((current) => [next, ...current])
      return next
    },
    [itineraries.length]
  )

  const renameItinerary = useCallback(
    (itineraryId: string, name: string) => {
      const title = name.trim()
      if (!title) return

      setItineraries((current) =>
        current.map((itinerary) =>
          itinerary.id === itineraryId
            ? { ...itinerary, name: title }
            : itinerary
        )
      )
    },
    []
  )

  const deleteItinerary = useCallback(
    (itineraryId: string) => {
      setItineraries((current) =>
        current.filter(
          (itinerary) => itinerary.id !== itineraryId
        )
      )
    },
    []
  )

  const addItineraryDay = useCallback(
    (itineraryId: string) => {
      setItineraries((current) =>
        current.map((itinerary) => {
          if (itinerary.id !== itineraryId) {
            return itinerary
          }

          const dayNumber = itinerary.days.length + 1

          return {
            ...itinerary,
            days: [
              ...itinerary.days,
              {
                id: newId(),
                title: `Day ${dayNumber}`,
                items: [],
              },
            ],
          }
        })
      )
    },
    []
  )

  const addItemToItinerary = useCallback(
    (
      itineraryId: string,
      item: ItineraryItem,
      dayIndex = 0
    ) => {
      setItineraries((current) =>
        current.map((itinerary) => {
          if (itinerary.id !== itineraryId) {
            return itinerary
          }

          const nextDays = itinerary.days.map(
            (day, index) => {
              if (index !== dayIndex) return day

              return {
                ...day,
                items: [...day.items, item],
              }
            }
          )

          return {
            ...itinerary,
            days: nextDays,
          }
        })
      )
    },
    []
  )

  const updateItineraryItem = useCallback(
    (
      itineraryId: string,
      dayIndex: number,
      itemId: string,
      updates: Partial<
        Pick<ItineraryItem, 'notes' | 'startTime'>
      >
    ) => {
      setItineraries((current) =>
        current.map((itinerary) => {
          if (itinerary.id !== itineraryId) {
            return itinerary
          }

          return {
            ...itinerary,
            days: itinerary.days.map(
              (day, index) =>
                index !== dayIndex
                  ? day
                  : {
                      ...day,
                      items: day.items.map((item) =>
                        item.id === itemId
                          ? { ...item, ...updates }
                          : item
                      ),
                    }
            ),
          }
        })
      )
    },
    []
  )

  const removeItemFromItinerary = useCallback(
    (
      itineraryId: string,
      dayIndex: number,
      itemId: string
    ) => {
      setItineraries((current) =>
        current.map((itinerary) => {
          if (itinerary.id !== itineraryId) {
            return itinerary
          }

          const nextDays = itinerary.days.map(
            (day, index) => {
              if (index !== dayIndex) return day

              return {
                ...day,
                items: day.items.filter(
                  (item) => item.id !== itemId
                ),
              }
            }
          )

          return {
            ...itinerary,
            days: nextDays,
          }
        })
      )
    },
    []
  )

  const moveItemBetweenDays = useCallback(
    (
      itineraryId: string,
      fromDay: number,
      toDay: number,
      itemId: string
    ) => {
      setItineraries((current) =>
        current.map((itinerary) => {
          if (itinerary.id !== itineraryId) {
            return itinerary
          }

          const fromItems = [
            ...(itinerary.days[fromDay]?.items ?? []),
          ]

          const item = fromItems.find(
            (entry) => entry.id === itemId
          )

          if (!item) return itinerary

          const nextDays = itinerary.days.map(
            (day, index) => {
              if (index === fromDay) {
                return {
                  ...day,
                  items: day.items.filter(
                    (entry) => entry.id !== itemId
                  ),
                }
              }

              if (index === toDay) {
                return {
                  ...day,
                  items: [...day.items, item],
                }
              }

              return day
            }
          )

          return {
            ...itinerary,
            days: nextDays,
          }
        })
      )
    },
    []
  )

  const moveItemWithinDay = useCallback(
    (
      itineraryId: string,
      dayIndex: number,
      itemId: string,
      direction: -1 | 1
    ) => {
      setItineraries((current) =>
        current.map((itinerary) => {
          if (itinerary.id !== itineraryId) {
            return itinerary
          }

          return {
            ...itinerary,
            days: itinerary.days.map(
              (day, index) => {
                if (index !== dayIndex) return day

                const itemIndex =
                  day.items.findIndex(
                    (item) => item.id === itemId
                  )

                const targetIndex =
                  itemIndex + direction

                if (
                  itemIndex < 0 ||
                  targetIndex < 0 ||
                  targetIndex >= day.items.length
                ) {
                  return day
                }

                const items = [...day.items]

                ;[
                  items[itemIndex],
                  items[targetIndex],
                ] = [
                  items[targetIndex],
                  items[itemIndex],
                ]

                return {
                  ...day,
                  items,
                }
              }
            ),
          }
        })
      )
    },
    []
  )

  const addRecentlyViewed = useCallback(
    (slug: string) => {
      setRecentlyViewed((current) =>
        [
          slug,
          ...current.filter(
            (entry) => entry !== slug
          ),
        ].slice(0, 8)
      )
    },
    []
  )

  const value = useMemo<AppContextValue>(
    () => ({
      favorites: user ? favorites : guestFavorites,
      itineraries: user ? itineraries : [],
      user,
      session,
      authLoading,
      destinations,
      catalogLoading,
      catalogError,
      travelDataLoading,
      travelDataError,
      recentlyViewed,
      addFavorite,
      removeFavorite,
      isFavorite,
      login,
      signup,
      logout,
      resetPassword,
      updatePassword,
      updateProfile,
      createItinerary,
      renameItinerary,
      deleteItinerary,
      addItineraryDay,
      addItemToItinerary,
      updateItineraryItem,
      removeItemFromItinerary,
      moveItemBetweenDays,
      moveItemWithinDay,
      addRecentlyViewed,
    }),
    [
      favorites,
      itineraries,
      guestFavorites,
      user,
      session,
      authLoading,
      destinations,
      catalogLoading,
      catalogError,
      travelDataLoading,
      travelDataError,
      recentlyViewed,
      addFavorite,
      removeFavorite,
      isFavorite,
      login,
      signup,
      logout,
      resetPassword,
      updatePassword,
      updateProfile,
      createItinerary,
      renameItinerary,
      deleteItinerary,
      addItineraryDay,
      addItemToItinerary,
      updateItineraryItem,
      removeItemFromItinerary,
      moveItemBetweenDays,
      moveItemWithinDay,
      addRecentlyViewed,
    ]
  )

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error(
      'useAppContext must be used within an AppProvider'
    )
  }

  return context
}
