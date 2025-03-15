import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET handler for fetching all Asma Al-Husna content items
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
      select: { id: true, masjidId: true },
    });

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const items = await prisma.contentItem.findMany({
      where: {
        masjidId: user.masjidId,
        type: 'ASMA_AL_HUSNA' as any,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching Asma Al-Husna content:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * POST handler for creating a new Asma Al-Husna content item
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
      select: { id: true, masjidId: true },
    });

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    
    // Validate the content structure
    if (!data.title) {
      return new NextResponse('Title is required', { status: 400 });
    }
    
    if (!data.content || typeof data.content !== 'object') {
      return new NextResponse('Content object is required', { status: 400 });
    }
    
    // Create the content item
    const item = await prisma.contentItem.create({
      data: {
        title: data.title,
        content: data.content,
        duration: data.duration || 30,
        isActive: data.isActive !== undefined ? data.isActive : true,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        type: 'ASMA_AL_HUSNA' as any,
        masjidId: user.masjidId,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error creating Asma Al-Husna content:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 