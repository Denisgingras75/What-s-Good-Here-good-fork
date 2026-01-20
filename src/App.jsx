import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
import { LocationProvider } from './context/LocationContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Layout } from './components/Layout'
import { WelcomeModal } from './components/Auth/WelcomeModal'
import { preloadSounds } from './lib/sounds'

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })))
const Browse = lazy(() => import('./pages/Browse').then(m => ({ default: m.Browse })))
const Dish = lazy(() => import('./pages/Dish').then(m => ({ default: m.Dish })))
const Restaurants = lazy(() => import('./pages/Restaurants').then(m => ({ default: m.Restaurants })))
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })))
const Admin = lazy(() => import('./pages/Admin').then(m => ({ default: m.Admin })))
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })))
const Privacy = lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })))
const Terms = lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })))
const Badges = lazy(() => import('./pages/Badges').then(m => ({ default: m.Badges })))

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
    <div className="animate-pulse text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full" style={{ background: 'var(--color-divider)' }} />
      <div className="h-4 w-24 mx-auto rounded" style={{ background: 'var(--color-divider)' }} />
    </div>
  </div>
)

function App() {
  // Preload sound files on app start
  useEffect(() => {
    preloadSounds()
  }, [])

  return (
    <ErrorBoundary>
      <Toaster
        position="top-center"
        richColors
        expand={false}
        duration={4000}
        closeButton
        toastOptions={{
          style: {
            padding: '16px',
            borderRadius: '12px',
          },
        }}
      />
      <AuthProvider>
      <LocationProvider>
        <BrowserRouter>
          <WelcomeModal />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/browse" element={<Layout><Browse /></Layout>} />
              <Route path="/dish/:dishId" element={<Layout><Dish /></Layout>} />
              <Route path="/restaurants" element={<Layout><Restaurants /></Layout>} />
              <Route path="/restaurants/:restaurantId" element={<Layout><Restaurants /></Layout>} />
              <Route path="/profile" element={<Layout><Profile /></Layout>} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/badges" element={<Badges />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </LocationProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
