import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import posthog from 'posthog-js'
import './index.css'
import App from './App.jsx'

// Initialize PostHog for user analytics
if (import.meta.env.VITE_PUBLIC_POSTHOG_KEY && import.meta.env.PROD) {
  posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
    // Use reverse proxy to avoid ad blockers (serverless function at /api/ingest)
    api_host: '/api/ingest',
    ui_host: 'https://us.posthog.com',
    capture_pageview: true,        // Auto-track page views
    capture_pageleave: true,       // Track when users leave
    autocapture: true,             // Auto-track clicks, form submissions
    // Enable Web Vitals performance monitoring
    capture_performance: {
      web_vitals: true,            // Capture Core Web Vitals (LCP, CLS, INP)
    },
    session_recording: {
      maskAllInputs: true,         // Mask all form inputs for privacy
      maskTextSelector: '[data-mask]', // Mask elements with data-mask attribute
    },
    // Don't send user IP address
    ip: false,
    // Mask email in properties
    sanitize_properties: (properties) => {
      // Mask email addresses in all properties
      const masked = { ...properties }
      if (masked.email) {
        masked.email = masked.email.replace(/(.{2}).*(@.*)/, '$1***$2')
      }
      if (masked.$current_url) {
        // Remove any email params from URLs
        masked.$current_url = masked.$current_url.replace(/email=[^&]+/, 'email=***')
      }
      return masked
    },
  })
}

// Initialize Sentry for error tracking
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD, // Only track errors in production
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // Performance monitoring
  tracesSampleRate: 0.1, // 10% of transactions
  // Session replay for debugging
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
