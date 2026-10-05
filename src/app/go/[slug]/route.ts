import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Anonymous daily visitor hash for privacy-friendly telemetry
function getAnonymousVisitorId(ip: string, ua: string | null): string {
  const today = new Date().toISOString().slice(0, 10)
  return crypto
    .createHash('sha256')
    .update(`${ip}-${ua || ''}-${today}`)
    .digest('hex')
    .slice(0, 16)
}

export async function GET(
  request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await props.params

    if (!slug) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    const cleanSlug = slug.toLowerCase().trim()

    // Find active link
    const shortLink = await prisma.shortLink.findUnique({
      where: { slug: cleanSlug },
    })

    if (!shortLink || !shortLink.isActive) {
      // If link does not exist or is disabled, redirect to homepage gracefully
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Extract basic client headers for telemetry
    const forwardedFor = request.headers.get('x-forwarded-for')
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1'
    const ua = request.headers.get('user-agent')
    const visitorId = getAnonymousVisitorId(clientIp, ua)

    // Parallelize click count increment and analytics event logging
    await Promise.allSettled([
      prisma.shortLink.update({
        where: { id: shortLink.id },
        data: { clicks: { increment: 1 } },
      }),
      prisma.analyticsEvent.create({
        data: {
          name: 'shortlink_click',
          path: `/go/${cleanSlug}`,
          metadata: JSON.stringify({
            slug: cleanSlug,
            title: shortLink.title,
            targetUrl: shortLink.targetUrl,
          }),
          visitorId,
        },
      }),
    ])

    // Redirect with 307 (Temporary Redirect) to avoid browser caching
    return NextResponse.redirect(shortLink.targetUrl, {
      status: 307,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('[GET /go/[slug]] error:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}
