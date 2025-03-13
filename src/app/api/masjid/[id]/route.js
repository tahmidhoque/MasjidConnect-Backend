import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/masjid/[id]
 * Fetches masjid information by ID
 */
export async function GET(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch masjid data - only allow if user belongs to this masjid or is an admin
    if (session.user.masjidId !== params.id && session.user.role !== 'ADMIN') {
      return new NextResponse('Access denied', { status: 403 });
    }

    const masjid = await prisma.masjid.findUnique({
      where: {
        id: params.id,
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
    console.error('Error in GET /api/masjid/[id]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 