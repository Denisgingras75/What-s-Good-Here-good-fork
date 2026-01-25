import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
import { LocationProvider } from './context/LocationContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Layout } from './components/Layout'
import { WelcomeModal } from './components/Auth/WelcomeModal'
import { preloadSounds } from './lib/sounds'

// Helper to handle chunk load failures after new deploys
// If a lazy-loaded chunk fails to load (e.g., after deploy), reload the page
function lazyWithRetry(importFn, namedExport) {
  return lazy(() =>
    importFn()
      .then(m => ({ default: namedExport ? m[namedExport] : m.default }))
      .catch((error) => {
        // Check if this is a chunk load failure
        if (error.message?.includes('Failed to fetch dynamically imported module')) {
          // Reload the page to get fresh chunks
          window.location.reload()
          // Return empty component while reloading
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
const Badges = lazyWithRetry(() => import('./pages/Badges'), 'Badges')
const UserProfile = lazyWithRetry(() => import('./pages/UserProfile'), 'UserProfile')
const ResetPassword = lazyWithRetry(() => import('./pages/ResetPassword'), 'ResetPassword')

// Prefetch functions for smoother navigation - call on hover/focus
export const prefetchRoutes = {
  home: () => import('./pages/Home'),
  browse: () => import('./pages/Browse'),
  dish: () => import('./pages/Dish'),
  restaurants: () => import('./pages/Restaurants'),
  profile: () => import('./pages/Profile'),
}

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
              <Route path="/user/:userId" element={<Layout><UserProfile /></Layout>} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
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
