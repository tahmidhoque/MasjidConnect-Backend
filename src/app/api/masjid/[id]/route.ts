import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/masjid/[id]
 * Fetches masjid information by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract the dynamic parameter
    const { id } = await params;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch masjid data - only allow if user belongs to this masjid or is an admin
    if (session.user.masjidId !== id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const masjid = await prisma.masjid.findUnique({
      where: {
        id,
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
      return NextResponse.json({ message: 'Masjid not found' }, { status: 404 });
    }

    return NextResponse.json(masjid);
  } catch (error) {
    console.error('Error in GET /api/masjid/[id]:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 