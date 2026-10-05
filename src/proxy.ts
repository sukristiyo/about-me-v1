import { NextRequest, NextResponse } from 'next/server'
import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import createMiddleware from 'next-intl/middleware'
import { routing } from './routing'

const intlMiddleware = createMiddleware(routing)
const { auth } = NextAuth(authConfig)

export default auth((req: NextRequest & { auth: unknown }) => {
  const { nextUrl } = req
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || nextUrl.hostname || ''
  const isLinkSubdomain = host.startsWith('link.') || host.startsWith('links.')

  // Handle link subdomain routing (e.g. link.sukristiyo.site)
  if (isLinkSubdomain) {
    const path = nextUrl.pathname
    // link.sukristiyo.site/ -> display Lynk.id style showcase
    if (path === '/' || path === '') {
      return NextResponse.rewrite(new URL('/links', req.url))
    }
    // link.sukristiyo.site/[slug] -> direct shortener redirect
    if (
      !path.startsWith('/links') &&
      !path.startsWith('/go') &&
      !path.startsWith('/api') &&
      !path.startsWith('/_next')
    ) {
      const slug = path.replace(/^\//, '')
      return NextResponse.redirect(new URL(`/go/${slug}`, req.url), { status: 307 })
    }
  }

  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isLoginPage = nextUrl.pathname === '/admin/login'
  const isGoRoute = nextUrl.pathname.startsWith('/go')
  const isLinksRoute = nextUrl.pathname.startsWith('/links')
  const isLoggedIn = !!(req as { auth: unknown }).auth

  // Bypass locale for /go and /links
  if (isGoRoute || isLinksRoute) {
    return NextResponse.next()
  }

  // Handle admin routes
  if (isAdminRoute) {
    if (isLoginPage) {
      if (isLoggedIn) return NextResponse.redirect(new URL('/admin/dashboard', nextUrl))
      return NextResponse.next()
    }
    if (!isLoggedIn) return NextResponse.redirect(new URL('/admin/login', nextUrl))
    return NextResponse.next()
  }

  // Public routes: apply next-intl middleware for locale handling
  return intlMiddleware(req)
})

export const config = {
  matcher: [
    // Match all paths except internals, static files, API routes, /go, and /links
    '/((?!api|go|links|_next/static|_next/image|favicon\\.ico|images|icons|robots\\.txt|sitemap\\.xml).*)',
  ],
}
