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
    const { pairingCode } = await req.json();
    if (!pairingCode) {
      const errorResponse = NextResponse.json(
        { error: 'Pairing code is required' },
        { status: 400 }
      );
      return applyCorsHeaders(req, errorResponse);
    }

    // Find screen with this pairing code
    const screen = await prisma.screen.findFirst({
      where: {
        pairingCode,
        pairingCodeExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!screen) {
      const errorResponse = NextResponse.json(
        { error: 'Invalid or expired pairing code' },
        { status: 404 }
      );
      return applyCorsHeaders(req, errorResponse);
    }

    // If the screen has been paired (has a masjidId and apiKey)
    if (screen.masjidId && screen.apiKey && screen.isActive) {
      const successResponse = NextResponse.json({
        paired: true,
        apiKey: screen.apiKey,
        masjidId: screen.masjidId,
      });
      return applyCorsHeaders(req, successResponse);
    }

    // Not yet paired
    const pendingResponse = NextResponse.json({
      paired: false,
      checkAgainIn: 5000, // Suggest checking again in 5 seconds
    });
    return applyCorsHeaders(req, pendingResponse);
  } catch (error) {
    console.error('Error checking pairing status:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to check pairing status' },
      { status: 500 }
    );
    return applyCorsHeaders(req, errorResponse);
  }
} 