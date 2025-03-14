import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { applyCorsHeaders, handleCorsOptions } from '@/lib/cors';
import type { NextRequest } from 'next/server';

export async function OPTIONS(req: NextRequest): Promise<Response> {
  // Always return a Response object, not null
  const corsResponse = handleCorsOptions(req);
  if (corsResponse) return corsResponse;
  
  // If handleCorsOptions returns null, create a default response
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleCorsOptions(req);
  if (corsResponse) return corsResponse;

  try {
    // Authentication is handled by middleware
    // Extract screen ID from headers
    const screenId = req.headers.get('X-Screen-ID');
    
    if (!screenId) {
      const errorResponse = NextResponse.json(
        { error: 'Screen ID is required' }, 
        { status: 400 }
      );
      return applyCorsHeaders(req, errorResponse);
    }
    
    // Get status information from request body
    const { status, metrics } = await req.json();
    
    // Update screen status
    await prisma.screen.update({
      where: { id: screenId },
      data: {
        status: status || 'ONLINE',
        lastSeen: new Date(),
        contentConfig: metrics ? { metrics } : undefined
      }
    });
    
    const successResponse = NextResponse.json({ success: true });
    return applyCorsHeaders(req, successResponse);
  } catch (error) {
    console.error('Error updating screen heartbeat:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to update screen heartbeat' },
      { status: 500 }
    );
    return applyCorsHeaders(req, errorResponse);
  }
} 