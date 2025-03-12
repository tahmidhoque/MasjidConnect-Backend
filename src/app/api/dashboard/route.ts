import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { addDays, startOfDay, format } from 'date-fns';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const masjidId = (session.user as any).masjidId;

    // Get all screens for the masjid
    const screens = await prisma.screen.findMany({
      where: { masjidId },
      select: {
        id: true,
        name: true,
        status: true,
        lastSeen: true,
        location: true,
        orientation: true,
        schedule: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get active content schedules
    const contentSchedules = await prisma.contentSchedule.findMany({
      where: {
        masjidId,
        isActive: true,
      },
      include: {
        items: {
          include: {
            contentItem: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    // Check for missing prayer times - look for the next 5 days
    const today = startOfDay(new Date());
    const fiveDaysFromNow = addDays(today, 5);
    
    const prayerTimes = await prisma.prayerTime.findMany({
      where: {
        masjidId,
        date: {
          gte: today,
          lt: fiveDaysFromNow,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Calculate missing dates
    const existingDates = new Set(prayerTimes.map(pt => format(pt.date, 'yyyy-MM-dd')));
    const missingDates = [];
    
    for (let d = 0; d < 5; d++) {
      const date = addDays(today, d);
      const dateStr = format(date, 'yyyy-MM-dd');
      if (!existingDates.has(dateStr)) {
        missingDates.push(dateStr);
      }
    }

    // Get offline screens (not seen in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const offlineScreens = screens.filter(
      screen => screen.status === 'OFFLINE' || !screen.lastSeen || screen.lastSeen < fiveMinutesAgo
    ).map(screen => ({
      id: screen.id,
      name: screen.name,
      lastSeen: screen.lastSeen,
    }));

    return NextResponse.json({
      screens,
      contentSchedules,
      alerts: {
        missingPrayerTimes: missingDates,
        offlineScreens,
      },
    });
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 