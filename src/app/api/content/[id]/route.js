import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { masjidId: true },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const contentItem = await prisma.contentItem.findFirst({
      where: {
        id: params.id,
        masjidId: user.masjidId,
      },
    });

    if (!contentItem) {
      return new NextResponse('Content item not found', { status: 404 });
    }

    return NextResponse.json(contentItem);
  } catch (error) {
    console.error('Error in GET /api/content/[id]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { masjidId: true },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const data = await request.json();
    const contentItem = await prisma.contentItem.update({
      where: {
        id: params.id,
        masjidId: user.masjidId,
      },
      data,
    });

    return NextResponse.json(contentItem);
  } catch (error) {
    console.error('Error in PUT /api/content/[id]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { masjidId: true },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    await prisma.contentItem.delete({
      where: {
        id: params.id,
        masjidId: user.masjidId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/content/[id]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 