import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequestWithAuth } from 'next-auth/middleware'
import { prisma } from '@/lib/prisma'

export default withAuth(
  async function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl
    
    // Skip middleware for auth-related paths and static files
    if (
      pathname.startsWith('/api/auth') || 
      pathname === '/login' ||
      pathname.includes('.') // Skip all files with extensions
    ) {
      return NextResponse.next()
    }

    // Handle screen API authentication
    if (pathname.startsWith('/api/screen/')) {
      const apiKey = req.headers.get('Authorization')?.replace('Bearer ', '')
      const screenId = req.headers.get('X-Screen-ID')
      
      if (!apiKey || !screenId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      try {
        // Verify the API key matches the screen
        const screen = await prisma.screen.findFirst({
          where: {
            id: screenId,
            apiKey,
            isActive: true,
          },
        })
        
        if (!screen) {
          return NextResponse.json({ error: 'Invalid API key or screen ID' }, { status: 401 })
        }
        
        // Update last seen timestamp
        await prisma.screen.update({
          where: { id: screenId },
          data: { 
            lastSeen: new Date(),
            status: 'ONLINE'
          },
        })
        
        // Continue to the API route
        return NextResponse.next()
      } catch (error) {
        console.error('Screen authentication error:', error)
        return NextResponse.json({ error: 'Authentication error' }, { status: 500 })
      }
    }

    // Allow unpaired screen endpoints without authentication
    if (
      pathname === '/api/screens/unpaired' || 
      pathname === '/api/screens/unpaired/check' ||
      pathname === '/api/screens/pair'
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
     */
    '/((?!_next).*)'
  ]
} 