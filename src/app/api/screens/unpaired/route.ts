import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePairingCode } from '@/lib/screen-utils';

// Endpoint for unpaired devices to get a pairing code
export async function POST(req: Request) {
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

    return NextResponse.json({
      pairingCode: screen.pairingCode,
      expiresAt: screen.pairingCodeExpiry,
      checkInterval: 5000, // Suggest checking every 5 seconds
    });
  } catch (error) {
    console.error('Error generating pairing code:', error);
    return NextResponse.json(
      { error: 'Failed to generate pairing code' },
      { status: 500 }
    );
  }
} 