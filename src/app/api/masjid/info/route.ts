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

    // Get the masjid's information
    const masjid = await prisma.masjid.findUnique({
      where: {
        id: session.user.masjidId,
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        address: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
      },
    });

    if (!masjid) {
      return NextResponse.json({ error: 'Masjid not found' }, { status: 404 });
    }

    // Format full address from components if available
    const addressComponents = [];
    if (masjid.address) addressComponents.push(masjid.address);
    if (masjid.city) addressComponents.push(masjid.city);
    if (masjid.state) addressComponents.push(masjid.state);
    if (masjid.postalCode) addressComponents.push(masjid.postalCode);
    if (masjid.country) addressComponents.push(masjid.country);
    
    const formattedAddress = addressComponents.length > 0 
      ? addressComponents.join(', ') 
      : null;

    return NextResponse.json({
      id: masjid.id,
      name: masjid.name,
      latitude: masjid.latitude,
      longitude: masjid.longitude,
      address: formattedAddress,
      addressComponents: {
        address: masjid.address,
        city: masjid.city,
        state: masjid.state,
        country: masjid.country,
        postalCode: masjid.postalCode,
      }
    });
  } catch (error) {
    console.error('Error fetching masjid info:', error);
    return NextResponse.json({ error: 'Failed to fetch masjid information' }, { status: 500 });
  }
} 