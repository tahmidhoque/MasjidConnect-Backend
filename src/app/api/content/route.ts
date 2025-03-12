import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { masjidId: true },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const contentItems = await prisma.contentItem.findMany({
      where: {
        masjidId: user.masjidId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(contentItems);
  } catch (error) {
    console.error('Error in GET /api/content:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { masjidId: true },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const data = await request.json();
    const contentItem = await prisma.contentItem.create({
      data: {
        ...data,
        masjidId: user.masjidId,
      },
    });

    return NextResponse.json(contentItem);
  } catch (error) {
    console.error('Error in POST /api/content:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 