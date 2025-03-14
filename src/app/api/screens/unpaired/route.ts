import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePairingCode } from '@/lib/screen-utils';
import { applyCorsHeaders, handleCorsOptions } from '@/lib/cors';
import type { NextRequest } from 'next/server';

export async function OPTIONS(req: NextRequest): Promise<Response> {
  // Always return a Response object, not null
  const corsResponse = handleCorsOptions(req);
  if (corsResponse) return corsResponse;
  
  // If handleCorsOptions returns null, create a default response
  return new NextResponse(null, { status: 204 });
}

// Endpoint for unpaired devices to get a pairing code
export async function POST(req: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleCorsOptions(req);
  if (corsResponse) return corsResponse;

  try {
    const { deviceType = 'DISPLAY', orientation = 'LANDSCAPE' } = await req.json();

    // Generate a new pairing code
    const pairingCode = generatePairingCode();
    const pairingCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // Create a temporary screen record without a masjid
    const screen = await prisma.screen.create({
      data: {
        name: 'Unpaired Display',
        status: 'PAIRING',
        orientation,
        deviceType,
        isActive: false,
        pairingCode,
        pairingCodeExpiry,
      },
      select: {
        pairingCode: true,
        pairingCodeExpiry: true,
      },
    });

    const successResponse = NextResponse.json({
      pairingCode: screen.pairingCode,
      expiresAt: screen.pairingCodeExpiry,
      checkInterval: 5000, // Suggest checking every 5 seconds
    });
    return applyCorsHeaders(req, successResponse);
  } catch (error) {
    console.error('Error generating pairing code:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to generate pairing code' },
      { status: 500 }
    );
    return applyCorsHeaders(req, errorResponse);
  }
} 