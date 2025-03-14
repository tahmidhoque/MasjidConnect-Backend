import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Define a type for the announcement content structure
interface AnnouncementContent {
  text: string;
  isUrgent: boolean;
}

export async function GET(request: Request) {
  try {
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

    // Get URL parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = page * pageSize;

    // Get total count first for pagination metadata
    const total = await prisma.contentItem.count({
      where: {
        masjidId: user.masjidId,
        type: 'ANNOUNCEMENT',
      },
    });

    // Then fetch the paginated items
    const items = await prisma.contentItem.findMany({
      where: {
        masjidId: user.masjidId,
        type: 'ANNOUNCEMENT',
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: pageSize,
    });

    // Transform the items to match the expected UI format
    const formattedItems = items.map(item => {
      // Safely extract content data with fallbacks
      const contentObj = item.content as Prisma.JsonObject || {};
      const text = typeof contentObj.text === 'string' ? contentObj.text : '';
      const isUrgent = contentObj.isUrgent === true;
      
      return {
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
    });

    // Return with pagination metadata
    return NextResponse.json({
      items: formattedItems,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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
      // Create the content item
      const item = await prisma.contentItem.create({
        data: {
          title: data.title,
          content: contentObject,
          type: 'ANNOUNCEMENT',
          duration: data.duration || 20,
          startDate: data.startDate || null,
          endDate: data.endDate || null,
          isActive: data.isActive !== undefined ? data.isActive : true,
          masjidId: user.masjidId,
        },
      });

      console.log('Successfully created announcement:', item.id);
      return NextResponse.json(item);
    } catch (createError) {
      console.error('Database error creating announcement:', createError);
      return NextResponse.json({ 
        message: 'Failed to create announcement. Please try again.' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Handler for PUT requests (update existing announcement)
export async function PUT(request: Request) {
  try {
    const id = request.url.split('/').pop();
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

    // First, check if the announcement exists and belongs to this masjid
    const existingItem = await prisma.contentItem.findFirst({
      where: {
        id,
        masjidId: user.masjidId,
        type: 'ANNOUNCEMENT',
      },
    });

    if (!existingItem) {
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
export async function DELETE(request: Request) {
  try {
    // Extract the ID from the URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    
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
      console.log('Announcement not found:', id);
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