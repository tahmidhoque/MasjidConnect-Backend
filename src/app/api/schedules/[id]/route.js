import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ContentScheduleService } from '@/lib/services/content-schedule-service';

/**
 * GET /api/schedules/:id
 * Get a specific content schedule by ID
 */
export async function GET(request, { params }) {
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
    
    try {
      // Get schedules for the masjid
      const schedules = await ContentScheduleService.getSchedules(masjidId);
      
      // Find the requested schedule
      const schedule = schedules.find(s => s.id === scheduleId);
      
      if (!schedule) {
        return NextResponse.json(
          { error: 'Schedule not found' }, 
          { status: 404 }
        );
      }
      
      return NextResponse.json(schedule);
    } catch (serviceError) {
      console.error('Error in ContentScheduleService.getSchedules:', serviceError);
      throw serviceError;
    }
  } catch (error) {
    console.error('Unhandled error fetching schedule:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch schedule' }, 
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/schedules/:id
 * Update a content schedule
 */
export async function PATCH(request, { params }) {
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
    
    try {
      // Update the schedule
      const updatedSchedule = await ContentScheduleService.updateSchedule(
        masjidId,
        scheduleId,
        data
      );
      
      return NextResponse.json(updatedSchedule);
    } catch (serviceError) {
      console.error('Error in ContentScheduleService.updateSchedule:', serviceError);
      
      if (serviceError instanceof Error) {
        return NextResponse.json(
          { error: serviceError.message }, 
          { status: 400 }
        );
      }
      
      throw serviceError;
    }
  } catch (error) {
    console.error('Unhandled error updating schedule:', error);
    
    return NextResponse.json(
      { error: 'Failed to update schedule' }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/schedules/:id
 * Delete a content schedule
 */
export async function DELETE(request, { params }) {
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
    
    try {
      // Delete the schedule
      await ContentScheduleService.deleteSchedule(masjidId, scheduleId);
      
      return new NextResponse(null, { status: 204 });
    } catch (serviceError) {
      console.error('Error in ContentScheduleService.deleteSchedule:', serviceError);
      
      if (serviceError instanceof Error) {
        return NextResponse.json(
          { error: serviceError.message }, 
          { status: 400 }
        );
      }
      
      throw serviceError;
    }
  } catch (error) {
    console.error('Unhandled error deleting schedule:', error);
    
    if (error instanceof Error && error.message) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete schedule' }, 
      { status: 500 }
    );
  }
} 