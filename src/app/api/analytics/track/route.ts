import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Lightweight parser for user-agent without heavy dependencies
function parseUserAgent(ua: string | null) {
  if (!ua) {
    return { device: 'desktop', browser: 'Other', os: 'Other' }
  }

  // Device
  let device = 'desktop'
  if (/mobile/i.test(ua)) device = 'mobile'
  else if (/ipad|tablet/i.test(ua)) device = 'tablet'

  // Browser
  let browser = 'Other'
  if (/edg/i.test(ua)) browser = 'Edge'
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome'
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox'
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari'
  else if (/opr\//i.test(ua)) browser = 'Opera'

  // OS
  let os = 'Other'
  if (/windows/i.test(ua)) os = 'Windows'
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS'
  else if (/linux/i.test(ua)) os = 'Linux'
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS'
  else if (/android/i.test(ua)) os = 'Android'

  return { device, browser, os }
}

// Generate anonymous daily visitor hash (Privacy-preserving, zero PII)
function getAnonymousVisitorId(ip: string, ua: string | null): string {
  const today = new Date().toISOString().slice(0, 10)
  return crypto
    .createHash('sha256')
    .update(`${ip}-${ua || ''}-${today}`)
    .digest('hex')
    .slice(0, 16)
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { type = 'pageview', path, referrer, name, metadata } = body

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'Missing path' }, { status: 400 })
    }

    // Never track admin pages
    if (path.startsWith('/admin')) {
      return NextResponse.json({ skipped: true })
    }

    // Extract headers
    const forwardedFor = request.headers.get('x-forwarded-for')
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1'
    const ua = request.headers.get('user-agent')
    const country =
      request.headers.get('x-vercel-ip-country') ||
      request.headers.get('cf-ipcountry') ||
      null

    const { device, browser, os } = parseUserAgent(ua)
    const visitorId = getAnonymousVisitorId(clientIp, ua)

    if (type === 'pageview') {
      // Clean referrer if external
      let safeReferrer: string | null = null
      if (referrer && typeof referrer === 'string') {
        try {
          const refUrl = new URL(referrer)
          // Store hostname only for privacy (e.g. linkedin.com, github.com)
          safeReferrer = refUrl.hostname.replace(/^www\./, '')
        } catch {
          safeReferrer = referrer.slice(0, 100)
        }
      }

      await prisma.pageView.create({
        data: {
          path: path.slice(0, 255),
          referrer: safeReferrer,
          device,
          browser,
          os,
          country: country ? country.slice(0, 10) : null,
          visitorId,
        },
      })
    } else if (type === 'event' && name && typeof name === 'string') {
      await prisma.analyticsEvent.create({
        data: {
          name: name.slice(0, 80),
          path: path.slice(0, 255),
          metadata: metadata ? JSON.stringify(metadata).slice(0, 1000) : null,
          visitorId,
        },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[POST /api/analytics/track]', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
