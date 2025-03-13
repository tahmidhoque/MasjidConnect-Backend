import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ContentScheduleService } from '@/lib/services/content-schedule-service';

/**
 * Sets a schedule as the default
 * @param req Request object
 * @param params Route parameters containing the schedule ID
 * @returns The updated schedule
 */
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const masjidId = session.user.masjidId;
    if (!masjidId) {
      return NextResponse.json({ error: 'Masjid not found' }, { status: 404 });
    }

    const updatedSchedule = await ContentScheduleService.setDefault(
      masjidId,
      params.id
    );
    
    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error('Failed to set default schedule:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Schedule not found') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
} 