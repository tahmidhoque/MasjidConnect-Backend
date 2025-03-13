import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { randomBytes } from 'crypto';

// Admin enters code shown on display to pair it
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.masjidId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pairingCode, name, location } = await req.json();
    if (!pairingCode || !name) {
      return NextResponse.json(
        { error: 'Pairing code and screen name are required' },
        { status: 400 }
      );
    }

    // Find unpaired screen with this code
    const screen = await prisma.screen.findFirst({
      where: {
        AND: [
          { pairingCode },
          { pairingCodeExpiry: { gt: new Date() } },
          { isActive: false }
        ]
      }
    });

    if (!screen) {
      return NextResponse.json(
        { error: 'Invalid or expired pairing code' },
        { status: 404 }
      );
    }

    // Generate API key and update screen
    const apiKey = randomBytes(32).toString('hex');
    const updatedScreen = await prisma.screen.update({
      where: { id: screen.id },
      data: {
        name,
        masjidId: session.user.masjidId,
        apiKey,
        isActive: true,
        status: 'ONLINE',
        location: location || null,
        pairingCode: null,
        pairingCodeExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      screen: updatedScreen,
    });
  } catch (error) {
    console.error('Error pairing screen:', error);
    return NextResponse.json(
      { error: 'Failed to pair screen' },
      { status: 500 }
    );
  }
}

// Verify a pairing code and complete device pairing
export async function PUT(req: Request) {
  try {
    const { pairingCode } = await req.json();

    if (!pairingCode) {
      return NextResponse.json({ error: 'Pairing code is required' }, { status: 400 });
    }

    // Find screen with valid pairing code
    const screen = await prisma.screen.findFirst({
      where: {
        AND: [
          { pairingCode },
          { pairingCodeExpiry: { gt: new Date() } },
          { status: 'PAIRING' }
        ]
      }
    });

    if (!screen) {
      return NextResponse.json({ error: 'Invalid or expired pairing code' }, { status: 400 });
    }

    // Update screen with device info and clear pairing code
    const updatedScreen = await prisma.screen.update({
      where: { id: screen.id },
      data: {
        status: 'ONLINE',
        lastSeen: new Date(),
        pairingCode: null,
        pairingCodeExpiry: null,
      },
    });

    return NextResponse.json({
      screenId: updatedScreen.id,
      apiKey: updatedScreen.apiKey,
    });
  } catch (error) {
    console.error('Error completing device pairing:', error);
    return NextResponse.json(
      { error: 'Failed to complete device pairing' },
      { status: 500 }
    );
  }
} 