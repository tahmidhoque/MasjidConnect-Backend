import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Handler for PUT requests (update existing announcement)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ message: 'Announcement ID is required' }, { status: 400 });
    }

    console.log('Attempting to update announcement with ID:', id);

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
      select: { id: true, masjidId: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // First, check if the announcement exists and belongs to this masjid
    const existingItem = await prisma.contentItem.findFirst({
      where: {
        id,
        masjidId: user.masjidId,
        type: 'ANNOUNCEMENT',
      },
    });

    if (!existingItem) {
      console.log('Announcement not found for update:', id);
      return NextResponse.json({ message: 'Announcement not found or not authorized' }, { status: 404 });
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.content) {
      return NextResponse.json({ message: 'Title and content are required' }, { status: 400 });
    }

    // Prepare the content field as a JSON object
    const contentObject: Prisma.JsonObject = {
      text: data.content,
      isUrgent: data.isUrgent || false,
    };

    try {
      // Update the content item
      const updatedItem = await prisma.contentItem.update({
        where: { id },
        data: {
          title: data.title,
          content: contentObject,
          duration: data.duration || existingItem.duration,
          startDate: data.startDate || existingItem.startDate,
          endDate: data.endDate || existingItem.endDate,
          isActive: data.isActive !== undefined ? data.isActive : existingItem.isActive,
        },
      });

      console.log('Successfully updated announcement:', id);
      return NextResponse.json(updatedItem);
    } catch (updateError) {
      console.error('Database error updating announcement:', updateError);
      return NextResponse.json({ 
        message: 'Failed to update announcement. Please try again.' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Handler for DELETE requests
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ message: 'Announcement ID is required' }, { status: 400 });
    }

    console.log('Attempting to delete announcement with ID:', id);

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
      select: { id: true, masjidId: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // First, check if the announcement exists and belongs to this masjid
    const existingItem = await prisma.contentItem.findFirst({
      where: {
        id,
        masjidId: user.masjidId,
        type: 'ANNOUNCEMENT',
      },
    });

    if (!existingItem) {
      console.log('Announcement not found for deletion:', id);
      return NextResponse.json({ message: 'Announcement not found or not authorized' }, { status: 404 });
    }

    try {
      // Delete the content item
      await prisma.contentItem.delete({
        where: { id },
      });
      
      console.log('Successfully deleted announcement:', id);
      return NextResponse.json({ message: 'Announcement deleted successfully' }, { status: 200 });
    } catch (deleteError) {
      console.error('Database error deleting announcement:', deleteError);
      return NextResponse.json({ 
        message: 'Failed to delete announcement. It may be referenced by other items.' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Handler for GET requests for a specific announcement
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ message: 'Announcement ID is required' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
      select: { id: true, masjidId: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Find the specific announcement
    const item = await prisma.contentItem.findFirst({
      where: {
        id,
        masjidId: user.masjidId,
        type: 'ANNOUNCEMENT',
      },
    });

    if (!item) {
      return NextResponse.json({ message: 'Announcement not found' }, { status: 404 });
    }

    // Transform the item to match the expected UI format
    const contentObj = item.content as Prisma.JsonObject || {};
    const text = typeof contentObj.text === 'string' ? contentObj.text : '';
    const isUrgent = contentObj.isUrgent === true;
    
    const formattedItem = {
      id: item.id,
      title: item.title,
      content: text,
      isUrgent: isUrgent,
      duration: item.duration,
      startDate: item.startDate,
      endDate: item.endDate,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };

    return NextResponse.json(formattedItem);
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 