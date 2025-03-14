import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract the dynamic parameter
    const { id } = await params;
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.masjidId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Screen ID is required' },
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

    // Delete screen
    await prisma.screen.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting screen:', error);
    return NextResponse.json(
      { error: 'Failed to delete screen' },
      { status: 500 }
    );
  }
} 