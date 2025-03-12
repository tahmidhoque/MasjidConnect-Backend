import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    console.log('GET /api/prayer-times/settings: Starting request');
    const session = await getServerSession(authOptions);
    if (!session?.user?.masjidId) {
      console.log('GET /api/prayer-times/settings: Unauthorized - no masjidId in session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`GET /api/prayer-times/settings: Fetching for masjid ${session.user.masjidId}`);
    // Get the masjid's calculation settings
    const masjid = await prisma.masjid.findUnique({
      where: {
        id: session.user.masjidId,
      },
      select: {
        prayerTimeSettings: true,
        latitude: true,
        longitude: true,
        calculationMethod: true,
        madhab: true,
      },
    });

    if (!masjid) {
      console.log('GET /api/prayer-times/settings: Masjid not found');
      return NextResponse.json({ error: 'Masjid not found' }, { status: 404 });
    }

    console.log('GET /api/prayer-times/settings: Masjid found, checking for settings');
    
    // If no custom prayer time settings, use the masjid's default settings
    if (!masjid.prayerTimeSettings) {
      console.log('GET /api/prayer-times/settings: No custom settings, using defaults');
      // Return default settings if none found
      return NextResponse.json({
        latitude: masjid.latitude || 51.5074, // Use masjid latitude or default to London
        longitude: masjid.longitude || -0.1278,
        calculationMethod: masjid.calculationMethod || 'MWL',
        madhab: masjid.madhab || 'Shafi',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        useManualCoordinates: false, // Default to using masjid location
        adjustments: {
          fajr: 0,
          sunrise: 0,
          zuhr: 0,
          asr: 0,
          maghrib: 0,
          isha: 0,
        },
      });
    }

    console.log('GET /api/prayer-times/settings: Custom settings found');
    // Parse the settings JSON
    const settings = typeof masjid.prayerTimeSettings === 'string' 
      ? JSON.parse(masjid.prayerTimeSettings)
      : masjid.prayerTimeSettings;

    // Ensure current month and year are set
    const result = {
      ...settings,
      month: settings.month || new Date().getMonth() + 1,
      year: settings.year || new Date().getFullYear(),
      useManualCoordinates: settings.useManualCoordinates || false,
    };
    
    console.log('GET /api/prayer-times/settings: Returning settings', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching prayer time settings:', error);
    return NextResponse.json({ error: 'Failed to fetch prayer time settings', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    console.log('POST /api/prayer-times/settings: Starting request');
    const session = await getServerSession(authOptions);
    if (!session?.user?.masjidId) {
      console.log('POST /api/prayer-times/settings: Unauthorized - no masjidId in session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await req.json();
    console.log(`POST /api/prayer-times/settings: Saving settings for masjid ${session.user.masjidId}`, settings);
    
    // Save the settings to the database
    await prisma.masjid.update({
      where: {
        id: session.user.masjidId,
      },
      data: {
        prayerTimeSettings: JSON.stringify(settings),
      },
    });

    console.log('POST /api/prayer-times/settings: Settings saved successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving prayer time settings:', error);
    return NextResponse.json({ error: 'Failed to save prayer time settings', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 