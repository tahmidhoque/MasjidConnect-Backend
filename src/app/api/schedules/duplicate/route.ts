import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ContentScheduleService } from '@/lib/services/content-schedule-service';
import { DuplicateScheduleDTO } from '@/types/content-schedule';

/**
 * Duplicates a content schedule
 * @param req Request containing the duplication data
 * @returns The duplicated schedule
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const masjidId = (session.user as any).masjidId;
    if (!masjidId) {
      return NextResponse.json({ error: 'Masjid not found' }, { status: 404 });
    }

    const data: DuplicateScheduleDTO = await req.json();
    const { sourceScheduleId, name } = data;

    const newSchedule = await ContentScheduleService.duplicateSchedule(
      masjidId,
      sourceScheduleId,
      name
    );
    
    return NextResponse.json(newSchedule);
  } catch (error) {
    console.error('Failed to duplicate schedule:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Source schedule not found') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
} 