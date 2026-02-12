import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
import { LocationProvider } from './context/LocationContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { WelcomeModal } from './components/Auth/WelcomeModal'
import { RouteProgress } from './components/RouteProgress'
import { preloadSounds } from './lib/sounds'
import { preloadCategoryImages } from './constants/categories'

// Helper to handle chunk load failures after new deploys
// If a lazy-loaded chunk fails to load (e.g., after deploy), reload the page once
function isChunkLoadError(error) {
  const msg = error?.message || ''
  return (
    msg.includes('Failed to fetch dynamically imported module') || // Chrome
    msg.includes('error loading dynamically imported module') ||   // Safari
    msg.includes('Importing a module script failed') ||            // Firefox
    msg.includes('Loading chunk') ||                               // Generic bundler
    msg.includes('Failed to fetch')                                // Network-level
  )
}

const RELOAD_KEY = 'wgh_chunk_reload'

function lazyWithRetry(importFn, namedExport) {
  return lazy(() =>
    importFn()
      .then(m => {
        // Successful load — clear any reload flag
        sessionStorage.removeItem(RELOAD_KEY)
        return { default: namedExport ? m[namedExport] : m.default }
      })
      .catch((error) => {
        if (isChunkLoadError(error) && !sessionStorage.getItem(RELOAD_KEY)) {
          sessionStorage.setItem(RELOAD_KEY, '1')
          window.location.reload()
          return { default: () => null }
        }
        throw error
      })
  )
}

// Lazy load pages for code splitting
const Home = lazyWithRetry(() => import('./pages/Home'), 'Home')
const Browse = lazyWithRetry(() => import('./pages/Browse'), 'Browse')
const Dish = lazyWithRetry(() => import('./pages/Dish'), 'Dish')
const Restaurants = lazyWithRetry(() => import('./pages/Restaurants'), 'Restaurants')
const Profile = lazyWithRetry(() => import('./pages/Profile'), 'Profile')
const Admin = lazyWithRetry(() => import('./pages/Admin'), 'Admin')
const Login = lazyWithRetry(() => import('./pages/Login'), 'Login')
const Privacy = lazyWithRetry(() => import('./pages/Privacy'), 'Privacy')
const Terms = lazyWithRetry(() => import('./pages/Terms'), 'Terms')
const UserProfile = lazyWithRetry(() => import('./pages/UserProfile'), 'UserProfile')
const Discover = lazyWithRetry(() => import('./pages/Discover'), 'Discover')
const ResetPassword = lazyWithRetry(() => import('./pages/ResetPassword'), 'ResetPassword')
const AcceptInvite = lazyWithRetry(() => import('./pages/AcceptInvite'), 'AcceptInvite')
const ManageRestaurant = lazyWithRetry(() => import('./pages/ManageRestaurant'), 'ManageRestaurant')
const NotFound = lazyWithRetry(() => import('./pages/NotFound'), 'NotFound')

// Prefetch functions for smoother navigation - call on hover/focus
export const prefetchRoutes = {
  home: () => import('./pages/Home'),
  browse: () => import('./pages/Browse'),
  dish: () => import('./pages/Dish'),
  restaurants: () => import('./pages/Restaurants'),
  discover: () => import('./pages/Discover'),
  profile: () => import('./pages/Profile'),
}

// Loading fallback
const PageLoader = () => (
  <div
    role="status"
    aria-label="Loading page"
    className="min-h-screen flex items-center justify-center"
    style={{ background: 'var(--color-surface)' }}
  >
    <div className="animate-pulse text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full" style={{ background: 'var(--color-divider)' }} />
      <div className="h-4 w-24 mx-auto rounded" style={{ background: 'var(--color-divider)' }} />
      <span className="sr-only">Loading...</span>
    </div>
  </div>
)

function App() {
  // Preload sounds and category images on app start
  useEffect(() => {
    preloadSounds()
    preloadCategoryImages()
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
          <RouteProgress />
          <WelcomeModal />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/browse" element={<Layout><Browse /></Layout>} />
              <Route path="/dish/:dishId" element={<Layout><Dish /></Layout>} />
              <Route path="/restaurants" element={<Layout><Restaurants /></Layout>} />
              <Route path="/restaurants/:restaurantId" element={<Layout><Restaurants /></Layout>} />
              <Route path="/discover" element={<Layout><Discover /></Layout>} />
              <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
              <Route path="/user/:userId" element={<Layout><UserProfile /></Layout>} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/invite/:token" element={<AcceptInvite />} />
              <Route path="/manage" element={<ProtectedRoute><ManageRestaurant /></ProtectedRoute>} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </LocationProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
