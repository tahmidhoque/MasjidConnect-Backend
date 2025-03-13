import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ContentScheduleService } from '@/lib/services/content-schedule-service';

/**
 * GET /api/schedules
 * Returns all content schedules for the current user's masjid
 */
export async function GET() {
  try {
    // Get the current session to determine the user and masjid
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    // Use the masjid ID from the session
    // For now using a placeholder, should be replaced with actual session data
    const masjidId = session.user.masjidId || '1';
    
    // Fetch the schedules using the service
    const schedules = await ContentScheduleService.getSchedules(masjidId);
    
    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/schedules
 * Creates a new content schedule
 */
export async function POST(req: NextRequest) {
  try {
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
    const data = await req.json();
    
    // Basic validation
    if (!data.name) {
      return NextResponse.json(
        { error: 'Name is required' }, 
        { status: 400 }
      );
    }
    
    // Create the schedule using the service
    const schedule = await ContentScheduleService.createSchedule(masjidId, data);
    
    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule:', error);
    
    return NextResponse.json(
      { error: 'Failed to create schedule' }, 
      { status: 500 }
    );
  }
} 