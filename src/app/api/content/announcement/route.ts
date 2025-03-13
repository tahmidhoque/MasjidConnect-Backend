import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
        type: 'ANNOUNCEMENT',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

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
    const item = await prisma.contentItem.create({
      data: {
        ...data,
        type: 'ANNOUNCEMENT',
        masjidId: user.masjidId,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error creating announcement:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 