import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ContentScheduleService } from '@/lib/services/content-schedule-service';

/**
 * POST /api/schedules/:id/duplicate
 * Duplicate a schedule
 */
export async function POST(request, { params }) {
  try {
    // Extract scheduleId safely from the params
    const scheduleId = params?.id;
    
    if (!scheduleId) {
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
    const { name } = data;
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required and must be a string' }, 
        { status: 400 }
      );
    }
    
    try {
      // Duplicate the schedule
      const newSchedule = await ContentScheduleService.duplicateSchedule(
        masjidId,
        scheduleId,
        name
      );
      
      return NextResponse.json(newSchedule, { status: 201 });
    } catch (serviceError) {
      console.error('Error in ContentScheduleService.duplicateSchedule:', serviceError);
      
      if (serviceError instanceof Error) {
        return NextResponse.json(
          { error: serviceError.message }, 
          { status: 400 }
        );
      }
      
      throw serviceError; // Re-throw for the outer catch
    }
  } catch (error) {
    console.error('Unhandled error duplicating schedule:', error);
    
    if (error instanceof Error && error.message) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to duplicate schedule' }, 
      { status: 500 }
    );
  }
} 