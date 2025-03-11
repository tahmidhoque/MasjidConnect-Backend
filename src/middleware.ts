import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequestWithAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl
    
    // Skip middleware for auth-related paths and static files
    if (
      pathname.startsWith('/api/auth') || 
      pathname === '/login' ||
      pathname.includes('.') // Skip all files with extensions
    ) {
      return NextResponse.next()
    }

    // Authenticated users trying to access the root should go to dashboard
    if (req.nextauth.token && pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Allow authenticated users to access protected routes
    if (req.nextauth.token) {
      return NextResponse.next()
    }

    // Redirect unauthenticated users to login
    const loginUrl = new URL('/login', req.url)
    if (pathname !== '/') {
      loginUrl.searchParams.set('callbackUrl', pathname)
    }
    return NextResponse.redirect(loginUrl)
  },
  {
    callbacks: {
      authorized: () => true, // We'll handle authorization in the middleware function
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next (Next.js internals)
     * - api (API routes)
     */
    '/((?!_next|api).*)'
  ]
} 