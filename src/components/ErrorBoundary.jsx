import { Component } from 'react'

function ErrorFallback({ error, resetError }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-2xl">😵</span>
        </div>
        <h1 className="text-xl font-bold text-neutral-800 mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-neutral-600 mb-6">
          We've been notified and are working on it. Try refreshing the page.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-3 text-white font-semibold rounded-xl"
            style={{ background: 'var(--color-primary)' }}
          >
            Refresh Page
          </button>
          <button
            onClick={resetError}
            className="w-full px-4 py-3 text-neutral-700 font-medium rounded-xl border border-neutral-200"
          >
            Try Again
          </button>
        </div>
        {import.meta.env.DEV && (
          <details className="mt-6 text-left">
            <summary className="text-xs text-neutral-500 cursor-pointer">
              Error details (dev only)
            </summary>
            <pre className="mt-2 p-3 bg-neutral-100 rounded-lg text-xs text-red-600 overflow-auto">
              {error?.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

// Custom error boundary that lazy-loads Sentry for error reporting
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Auto-reload on chunk load errors (fallback if lazyWithRetry misses it)
    const msg = error?.message || ''
    const isChunkError = (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('error loading dynamically imported module') ||
      msg.includes('Importing a module script failed') ||
      msg.includes('Loading chunk') ||
      msg.includes('Failed to fetch')
    )
    if (isChunkError && !sessionStorage.getItem('wgh_chunk_reload')) {
      sessionStorage.setItem('wgh_chunk_reload', '1')
      window.location.reload()
      return
    }

    // Lazy-load Sentry and report the error
    if (import.meta.env.PROD) {
      import('@sentry/react').then(Sentry => {
        Sentry.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo?.componentStack,
            },
          },
        })
      })
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={this.resetError}
        />
      )
    }

    return this.props.children
  }
}
