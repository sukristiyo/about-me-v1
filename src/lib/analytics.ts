/**
 * Client-side Analytics Utilities
 */

export function trackEvent(name: string, metadata?: Record<string, any>) {
  if (typeof window === 'undefined') return

  const payload = {
    type: 'event',
    name,
    path: window.location.pathname,
    metadata,
  }

  // Use sendBeacon if supported for non-blocking reliability, fallback to fetch
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/track', blob)
  } else {
    fetch('/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {})
  }
}

export function trackPageView(path: string, referrer?: string) {
  if (typeof window === 'undefined') return
  if (path.startsWith('/admin')) return

  const payload = {
    type: 'pageview',
    path,
    referrer: referrer || document.referrer || undefined,
  }

  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/track', blob)
  } else {
    fetch('/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {})
  }
}
