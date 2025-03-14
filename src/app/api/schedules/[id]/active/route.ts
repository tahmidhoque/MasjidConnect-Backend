import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ContentScheduleService } from '@/lib/services/content-schedule-service';

/**
 * POST /api/schedules/:id/active
 * Toggle a schedule's active status
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract the dynamic parameter
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Schedule ID is required' }, 
        { status: 400 }
      );
    }

    // Get the current session to determine the user and masjid
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    // Use the masjid ID from the session
    const masjidId = session.user.masjidId || '1';
    
    // Parse the request body
    const data = await request.json();
    const { isActive } = data;
    
    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive is required and must be a boolean' }, 
        { status: 400 }
      );
    }
    
    try {
      // Update the schedule active status
      const updatedSchedule = await ContentScheduleService.toggleActive(
        masjidId,
        id,
        isActive
      );
      
      return NextResponse.json(updatedSchedule);
    } catch (serviceError) {
      console.error('Error in ContentScheduleService.toggleActive:', serviceError);
      
      if (serviceError instanceof Error) {
        return NextResponse.json(
          { error: serviceError.message }, 
          { status: 400 }
        );
      }
      
      throw serviceError; // Re-throw for the outer catch
    }
  } catch (error) {
    console.error('Unhandled error toggling schedule active status:', error);
    
    if (error instanceof Error && error.message) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to toggle schedule active status' }, 
      { status: 500 }
    );
  }
} 