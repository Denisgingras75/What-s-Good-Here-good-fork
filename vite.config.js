import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - cached separately from app code
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          // Split monitoring tools so they can load independently
          'vendor-sentry': ['@sentry/react'],
          'vendor-posthog': ['posthog-js'],
        },
      },
    },
  },
})
