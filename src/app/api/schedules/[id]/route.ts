import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ContentScheduleService } from '@/lib/services/content-schedule-service';

/**
 * Deletes a content schedule
 * @param req Request object
 * @param params Route parameters containing the schedule ID
 * @returns Empty response with status code
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const masjidId = (session.user as any).masjidId;
    if (!masjidId) {
      return NextResponse.json({ error: 'Masjid not found' }, { status: 404 });
    }

    await ContentScheduleService.deleteSchedule(masjidId, params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete schedule:', error);
    
    if (error instanceof Error) {
      // Return appropriate error response based on error message
      if (error.message === 'Schedule not found') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      } else if (
        error.message === 'Cannot delete the last schedule' ||
        error.message === 'Cannot delete the default schedule'
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
} 