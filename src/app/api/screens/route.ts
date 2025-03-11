import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { randomBytes } from 'crypto';

// List all screens for the masjid
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.masjidId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const screens = await prisma.screen.findMany({
      where: {
        masjidId: session.user.masjidId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(screens);
  } catch (error) {
    console.error('Error fetching screens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch screens' },
      { status: 500 }
    );
  }
}

// Create a new screen
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.masjidId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await req.json();
    if (!name) {
      return NextResponse.json(
        { error: 'Screen name is required' },
        { status: 400 }
      );
    }

    // Generate a unique API key
    const apiKey = randomBytes(32).toString('hex');

    const screen = await prisma.screen.create({
      data: {
        name,
        masjidId: session.user.masjidId,
        apiKey,
        status: 'OFFLINE',
      },
    });

    return NextResponse.json(screen);
  } catch (error) {
    console.error('Error creating screen:', error);
    return NextResponse.json(
      { error: 'Failed to create screen' },
      { status: 500 }
    );
  }
}

// Update a screen
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.masjidId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name } = await req.json();
    if (!id || !name) {
      return NextResponse.json(
        { error: 'Screen ID and name are required' },
        { status: 400 }
      );
    }

    // Verify screen belongs to masjid
    const existingScreen = await prisma.screen.findFirst({
      where: {
        id,
        masjidId: session.user.masjidId,
      },
    });

    if (!existingScreen) {
      return NextResponse.json({ error: 'Screen not found' }, { status: 404 });
    }

    const screen = await prisma.screen.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(screen);
  } catch (error) {
    console.error('Error updating screen:', error);
    return NextResponse.json(
      { error: 'Failed to update screen' },
      { status: 500 }
    );
  }
} 