'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView } from '@/lib/analytics'

export function AnalyticsTracker() {
  const pathname = usePathname()
  const lastTrackedPath = useRef<string | null>(null)

  useEffect(() => {
    // Only track if pathname changed and is not an admin route
    if (pathname && pathname !== lastTrackedPath.current && !pathname.startsWith('/admin')) {
      lastTrackedPath.current = pathname
      trackPageView(pathname)
    }
  }, [pathname])

  return null
}
