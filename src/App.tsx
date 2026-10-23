
import { lazy, Suspense, useEffect } from 'react'
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'

import { AppProvider, useAppContext } from './context/AppContext'
import { MainLayout } from './layouts/MainLayout'

const DestinationPage = lazy(() =>
  import('./pages/DestinationPage').then((module) => ({
    default: module.DestinationPage,
  }))
)
const EventDetailPage = lazy(() =>
  import('./pages/EventDetailPage').then((module) => ({
    default: module.EventDetailPage,
  }))
)
const EventsPage = lazy(() =>
  import('./pages/EventsPage').then((module) => ({
    default: module.EventsPage,
  }))
)
const ExplorePage = lazy(() =>
  import('./pages/ExplorePage').then((module) => ({
    default: module.ExplorePage,
  }))
)
const FavoritesPage = lazy(() =>
  import('./pages/FavoritesPage').then((module) => ({
    default: module.FavoritesPage,
  }))
)
const FoodPage = lazy(() =>
  import('./pages/FoodPage').then((module) => ({
    default: module.FoodPage,
  }))
)
const ForgotPasswordPage = lazy(() =>
  import('./pages/ForgotPasswordPage').then((module) => ({
    default: module.ForgotPasswordPage,
  }))
)
const HomePage = lazy(() =>
  import('./pages/HomePage').then((module) => ({
    default: module.HomePage,
  }))
)
const ItineraryPage = lazy(() =>
  import('./pages/ItineraryPage').then((module) => ({
    default: module.ItineraryPage,
  }))
)
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((module) => ({
    default: module.LoginPage,
  }))
)
const MapPage = lazy(() =>
  import('./pages/MapPage').then((module) => ({
    default: module.MapPage,
  }))
)
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((module) => ({
    default: module.NotFoundPage,
  }))
)
const PrivacyPage = lazy(() =>
  import('./pages/PrivacyPage').then((module) => ({
    default: module.PrivacyPage,
  }))
)
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((module) => ({
    default: module.ProfilePage,
  }))
)
const ResetPasswordPage = lazy(() =>
  import('./pages/ResetPasswordPage').then((module) => ({
    default: module.ResetPasswordPage,
  }))
)
const RestaurantPage = lazy(() =>
  import('./pages/RestaurantPage').then((module) => ({
    default: module.RestaurantPage,
  }))
)
const SignupPage = lazy(() =>
  import('./pages/SignupPage').then((module) => ({
    default: module.SignupPage,
  }))
)
const SupabaseTestPage = lazy(() =>
  import('./pages/SupabaseTestPage').then((module) => ({
    default: module.SupabaseTestPage,
  }))
)
const TermsPage = lazy(() =>
  import('./pages/TermsPage').then((module) => ({
    default: module.TermsPage,
  }))
)

// Automatically scroll to the top when changing pages
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

// Protect pages that require login
function ProtectedRoute() {
  const { user, authLoading, travelDataLoading } = useAppContext()
  const location = useLocation()

  if (authLoading) {
    return (
      <div
        role="status"
        className="py-16 text-center text-sm text-slate-600"
      >
        Checking your session...
      </div>
    )
  }

  if (user && travelDataLoading) {
    return (
      <div
        role="status"
        className="py-16 text-center text-sm text-slate-600"
      >
        Loading your account...
      </div>
    )
  }

  return user ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      replace
      state={{ from: location }}
    />
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />

        <Suspense
          fallback={
            <div role="status" className="py-16 text-center text-sm text-slate-600">
              Loading page...
            </div>
          }
        >
          <Routes>
            <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />

            <Route path="/explore" element={<ExplorePage />} />

            <Route
              path="/destination/:slug"
              element={<DestinationPage />}
            />

            <Route
              path="/restaurants/:slug"
              element={<RestaurantPage />}
            />

            <Route path="/food" element={<FoodPage />} />

            <Route path="/events" element={<EventsPage />} />

            <Route
              path="/events/:slug"
              element={<EventDetailPage />}
            />

            <Route path="/map" element={<MapPage />} />

            <Route
              path="/favorites"
              element={<FavoritesPage />}
            />

            <Route path="/login" element={<LoginPage />} />

            <Route path="/signup" element={<SignupPage />} />

            <Route
              path="/forgot-password"
              element={<ForgotPasswordPage />}
            />

            <Route
              path="/reset-password"
              element={<ResetPasswordPage />}
            />

            <Route
              path="/supabase-test"
              element={<SupabaseTestPage />}
            />

            {/* Protected pages */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/itinerary"
                element={<ItineraryPage />}
              />

              <Route
                path="/profile"
                element={<ProfilePage />}
              />
            </Route>

            <Route
              path="/privacy"
              element={<PrivacyPage />}
            />

            <Route
              path="/terms"
              element={<TermsPage />}
            />

            <Route
              path="*"
              element={<NotFoundPage />}
            />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  )
}
