import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { useAppContext } from './context/AppContext'
import { MainLayout } from './layouts/MainLayout'
import { DestinationPage } from './pages/DestinationPage'
import { EventDetailPage } from './pages/EventDetailPage'
import { EventsPage } from './pages/EventsPage'
import { ExplorePage } from './pages/ExplorePage'
import { FavoritesPage } from './pages/FavoritesPage'
import { FoodPage } from './pages/FoodPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { HomePage } from './pages/HomePage'
import { ItineraryPage } from './pages/ItineraryPage'
import { LoginPage } from './pages/LoginPage'
import { MapPage } from './pages/MapPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { ProfilePage } from './pages/ProfilePage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { RestaurantPage } from './pages/RestaurantPage'
import { SignupPage } from './pages/SignupPage'
import { TermsPage } from './pages/TermsPage'

function ProtectedRoute() {
  const { user, authLoading, travelDataLoading } = useAppContext()
  const location = useLocation()

  if (authLoading) {
    return <div role="status" className="py-16 text-center text-sm text-slate-600">Checking your session...</div>
  }

  if (user && travelDataLoading) {
    return <div role="status" className="py-16 text-center text-sm text-slate-600">Loading your account...</div>
  }

  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/destination/:slug" element={<DestinationPage />} />
            <Route path="/restaurants/:slug" element={<RestaurantPage />} />
            <Route path="/food" element={<FoodPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:slug" element={<EventDetailPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/itinerary" element={<ItineraryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
