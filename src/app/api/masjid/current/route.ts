import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/masjid/current
 * Returns the masjid information for the current logged-in user
 */
export async function GET() {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the masjid ID from the session
    const masjidId = session.user.masjidId;
    if (!masjidId) {
      return new NextResponse('User not associated with any masjid', { status: 404 });
    }

    // Fetch the masjid data
    const masjid = await prisma.masjid.findUnique({
      where: {
        id: masjidId,
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        timezone: true,
        calculationMethod: true,
        madhab: true,
      },
    });

    if (!masjid) {
      return new NextResponse('Masjid not found', { status: 404 });
    }

    return NextResponse.json(masjid);
  } catch (error) {
    console.error('Error in GET /api/masjid/current:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 