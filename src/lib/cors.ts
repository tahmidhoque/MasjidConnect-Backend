import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const allowedOrigins = [
  // Add your screen application origins here
  'https://your-screen-app.vercel.app',
  // During development
  'http://localhost:3000',
  'http://localhost:3001',
];

/**
 * Apply CORS headers to a response
 */
export function applyCorsHeaders(
  req: NextRequest,
  res: NextResponse,
  allowCredentials = false
): NextResponse {
  const origin = req.headers.get('origin');
  
  // Check if the origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    res.headers.set('Access-Control-Allow-Origin', origin);
  } else {
    // For requests without origin (like from mobile apps)
    res.headers.set('Access-Control-Allow-Origin', '*');
  }
  
  // Set other CORS headers
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.headers.set(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Screen-ID'
  );
  
  if (allowCredentials) {
    res.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  return res;
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export function handleCorsOptions(req: NextRequest): NextResponse | null {
  if (req.method === 'OPTIONS') {
    const res = new NextResponse(null, { status: 204 });
    return applyCorsHeaders(req, res);
  }
  return null;
} 