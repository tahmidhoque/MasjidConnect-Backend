import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
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

    const item = await prisma.contentItem.findFirst({
      where: {
        id: params.id,
        masjidId: user.masjidId,
        type: 'VERSE_HADITH',
      },
    });

    if (!item) {
      return new NextResponse('Item not found', { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching verse/hadith item:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
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

    // Check if the item exists and belongs to the user's masjid
    const existingItem = await prisma.contentItem.findFirst({
      where: {
        id: params.id,
        masjidId: user.masjidId,
        type: 'VERSE_HADITH',
      },
    });

    if (!existingItem) {
      return new NextResponse('Item not found', { status: 404 });
    }

    const data = await request.json();
    
    // Ensure title uses reference if not provided
    const title = data.title && data.title.trim() !== '' 
      ? data.title 
      : (data.content?.reference || existingItem.title);
    
    const updatedItem = await prisma.contentItem.update({
      where: {
        id: params.id,
      },
      data: {
        title: title,
        content: data.content,
        duration: data.duration,
        isActive: data.isActive,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating verse/hadith item:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
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

    // Check if the item exists and belongs to the user's masjid
    const existingItem = await prisma.contentItem.findFirst({
      where: {
        id: params.id,
        masjidId: user.masjidId,
        type: 'VERSE_HADITH',
      },
    });

    if (!existingItem) {
      return new NextResponse('Item not found', { status: 404 });
    }

    // Delete the item
    await prisma.contentItem.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting verse/hadith item:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 