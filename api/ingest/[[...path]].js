// Vercel serverless function to proxy PostHog requests
// This avoids ad blocker blocking by routing through our domain

const POSTHOG_HOST = 'https://us.i.posthog.com'
const POSTHOG_ASSETS_HOST = 'https://us-assets.i.posthog.com'

export const config = {
  runtime: 'edge',
}

export default async function handler(request) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/ingest', '')

  // Determine which PostHog host to use based on the path
  let targetHost = POSTHOG_HOST
  if (path.startsWith('/static')) {
    targetHost = POSTHOG_ASSETS_HOST
  }

  const targetUrl = `${targetHost}${path}${url.search}`

  // Forward the request to PostHog
  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.set('host', new URL(targetHost).host)

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD'
        ? await request.text()
        : undefined,
    })

    // Create response with CORS headers
    const responseHeaders = new Headers(response.headers)
    responseHeaders.set('Access-Control-Allow-Origin', '*')
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
