import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract the dynamic parameter
    const { id } = await params;
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { masjidId: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const contentItem = await prisma.contentItem.findFirst({
      where: {
        id,
        masjidId: user.masjidId,
      },
    });

    if (!contentItem) {
      return NextResponse.json({ message: 'Content item not found' }, { status: 404 });
    }

    return NextResponse.json(contentItem);
  } catch (error) {
    console.error('Error in GET /api/content/[id]:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract the dynamic parameter
    const { id } = await params;
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { masjidId: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const data = await request.json();
    const contentItem = await prisma.contentItem.update({
      where: {
        id,
        masjidId: user.masjidId,
      },
      data,
    });

    return NextResponse.json(contentItem);
  } catch (error) {
    console.error('Error in PUT /api/content/[id]:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract the dynamic parameter
    const { id } = await params;
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { masjidId: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    await prisma.contentItem.delete({
      where: {
        id,
        masjidId: user.masjidId,
      },
    });

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/content/[id]:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 