import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/screens/[id]/assign-schedule
 * Assigns a content schedule to a screen
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the current session to determine the user and masjid
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    const masjidId = session.user.masjidId;
    const { id: screenId } = await params;
    
    // Parse the request body
    const { scheduleId } = await req.json();
    
    // Verify screen belongs to this masjid
    const screen = await prisma.screen.findFirst({
      where: {
        id: screenId,
        masjidId,
      },
    });
    
    if (!screen) {
      return NextResponse.json(
        { error: 'Screen not found or not authorized' },
        { status: 404 }
      );
    }
    
    // If scheduleId is provided, verify it belongs to this masjid
    if (scheduleId) {
      const schedule = await prisma.contentSchedule.findFirst({
        where: {
          id: scheduleId,
          masjidId,
        },
      });
      
      if (!schedule) {
        return NextResponse.json(
          { error: 'Schedule not found or not authorized' },
          { status: 404 }
        );
      }
    }
    
    // Update the screen with the new schedule ID (or null to use default)
    const updatedScreen = await prisma.screen.update({
      where: { id: screenId },
      data: { 
        scheduleId: scheduleId || null 
      },
      include: {
        schedule: {
          select: {
            name: true,
            isDefault: true,
          }
        }
      }
    });
    
    return NextResponse.json(updatedScreen);
  } catch (error) {
    console.error('Error assigning schedule to screen:', error);
    
    return NextResponse.json(
      { error: 'Failed to assign schedule to screen' }, 
      { status: 500 }
    );
  }
} 