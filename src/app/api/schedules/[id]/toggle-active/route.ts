import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ContentScheduleService } from '@/lib/services/content-schedule-service';

/**
 * Toggles a schedule's active status
 * @param request Request containing the toggle data
 * @param params Route parameters containing the schedule ID
 * @returns The updated schedule
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract the dynamic parameter
    const { id } = await params;
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const masjidId = session.user.masjidId;
    if (!masjidId) {
      return NextResponse.json({ error: 'Masjid not found' }, { status: 404 });
    }

    const data = await request.json();
    const updatedSchedule = await ContentScheduleService.toggleActive(
      masjidId,
      id,
      data.isActive
    );
    
    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error('Failed to update schedule status:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Schedule not found') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      } else if (error.message === 'Cannot deactivate default schedule') {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
} 