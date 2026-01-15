import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Browse } from './pages/Browse'
import { Restaurants } from './pages/Restaurants'
import { Profile } from './pages/Profile'
import { Admin } from './pages/Admin'
import { Login } from './pages/Login'
import { preloadSounds } from './lib/sounds'

function App() {
  // Preload sound files on app start
  useEffect(() => {
    preloadSounds()
  }, [])

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/browse" element={<Layout><Browse /></Layout>} />
          <Route path="/restaurants" element={<Layout><Restaurants /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
