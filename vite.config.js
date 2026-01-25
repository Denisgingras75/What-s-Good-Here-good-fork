import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html after build
    // Run: npm run build && open stats.html
    visualizer({
      filename: 'stats.html',
      open: false, // Don't auto-open
      gzipSize: true,
      brotliSize: true,
    }),
  ],
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
