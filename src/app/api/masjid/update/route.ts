import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.masjidId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const data = await req.json();
    
    // Validate data
    const { name, address, city, state, postalCode, country, latitude, longitude } = data;
    
    // Update masjid information
    const updatedMasjid = await prisma.masjid.update({
      where: {
        id: session.user.masjidId,
      },
      data: {
        name: name || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        postalCode: postalCode || undefined,
        country: country || undefined,
        latitude: typeof latitude === 'number' ? latitude : undefined,
        longitude: typeof longitude === 'number' ? longitude : undefined,
      },
    });

    return NextResponse.json({
      message: 'Masjid information updated successfully',
      masjid: {
        id: updatedMasjid.id,
        name: updatedMasjid.name,
        address: updatedMasjid.address,
        city: updatedMasjid.city,
        state: updatedMasjid.state,
        postalCode: updatedMasjid.postalCode,
        country: updatedMasjid.country,
        latitude: updatedMasjid.latitude,
        longitude: updatedMasjid.longitude,
      },
    });
  } catch (error) {
    console.error('Error updating masjid information:', error);
    return NextResponse.json(
      { error: 'Failed to update masjid information' },
      { status: 500 }
    );
  }
} 