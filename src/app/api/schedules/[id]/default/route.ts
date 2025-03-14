import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ContentScheduleService } from '@/lib/services/content-schedule-service';

/**
 * POST /api/schedules/:id/default
 * Set a schedule as the default
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract the dynamic parameter
    const { id } = await params;
    
    // Get the current session to determine the user and masjid
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    // Use the masjid ID from the session
    const masjidId = session.user.masjidId;
    if (!masjidId) {
      return NextResponse.json(
        { error: 'Masjid not found' }, 
        { status: 404 }
      );
    }
    
    try {
      console.log('Setting schedule as default:', id, 'for masjid:', masjidId);
      
      // Set the schedule as default
      const updatedSchedule = await ContentScheduleService.setDefault(
        masjidId,
        id
      );
      
      return NextResponse.json(updatedSchedule);
    } catch (error) {
      console.error('Error in setDefault:', error);
      
      if (error instanceof Error) {
        // Check for specific Prisma errors
        if ('code' in error && error.code === 'P2002') {
          return NextResponse.json(
            { error: 'Cannot have multiple default schedules' }, 
            { status: 409 }
          );
        }
        
        return NextResponse.json(
          { error: error.message }, 
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to set default schedule' }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 