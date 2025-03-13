import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.masjidId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prayerTimes = await prisma.prayerTime.findMany({
      where: {
        masjidId: session.user.masjidId,
      },
      orderBy: {
        date: 'asc',
      },
    });
    return NextResponse.json(prayerTimes);
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return NextResponse.json({ error: 'Failed to fetch prayer times' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.masjidId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    // If it's a bulk upload (CSV or calculated times), handle multiple records
    if (Array.isArray(data)) {
      // Determine the source (default to 'CSV' for backward compatibility)
      const source = data[0]?.source || 'CSV';
      // Set isManuallySet based on source - only CSV uploads are considered manually set
      const isManuallySet = source === 'CSV';
      
      // Delete existing records for the dates being uploaded to avoid duplicates
      const dates = data.map(item => new Date(item.date));
      await prisma.prayerTime.deleteMany({
        where: {
          date: {
            in: dates,
          },
          masjidId: session.user.masjidId,
        },
      });

      // Insert new records
      const prayerTimes = await prisma.prayerTime.createMany({
        data: data.map(item => ({
          masjidId: session.user.masjidId,
          date: new Date(item.date),
          fajr: item.fajr,
          sunrise: item.sunrise,
          zuhr: item.zuhr,
          asr: item.asr,
          maghrib: item.maghrib,
          isha: item.isha,
          fajrJamaat: item.fajrJamaat,
          zuhrJamaat: item.zuhrJamaat,
          asrJamaat: item.asrJamaat,
          maghribJamaat: item.maghribJamaat,
          ishaJamaat: item.ishaJamaat,
          jummahKhutbah: item.jummahKhutbah,
          jummahJamaat: item.jummahJamaat,
          isManuallySet: isManuallySet,
          source: source,
        })),
      });
      return NextResponse.json(prayerTimes);
    }
    
    // Single record insert/update
    const isManuallySet = data.source !== 'CALCULATION';
    const prayerTime = await prisma.prayerTime.upsert({
      where: {
        date_masjidId: {
          date: new Date(data.date),
          masjidId: session.user.masjidId,
        },
      },
      update: {
        ...data,
        date: new Date(data.date),
        masjidId: session.user.masjidId,
        isManuallySet: isManuallySet,
      },
      create: {
        ...data,
        date: new Date(data.date),
        masjidId: session.user.masjidId,
        isManuallySet: isManuallySet,
      },
    });

    return NextResponse.json(prayerTime);
  } catch (error) {
    console.error('Error saving prayer times:', error);
    return NextResponse.json({ error: 'Failed to save prayer times' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.masjidId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    
    if (!dateParam) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    const date = new Date(dateParam);
    
    await prisma.prayerTime.delete({
      where: {
        date_masjidId: {
          date,
          masjidId: session.user.masjidId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting prayer time:', error);
    return NextResponse.json({ error: 'Failed to delete prayer time' }, { status: 500 });
  }
} 