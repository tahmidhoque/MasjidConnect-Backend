import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Define a type for the event content structure
interface EventContent {
  description: string;
  location: string;
  eventDate: string; // ISO date string
  isHighlighted: boolean;
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
        type: 'EVENT',
      },
    });

    // Then fetch the paginated items
    const items = await prisma.contentItem.findMany({
      where: {
        masjidId: user.masjidId,
        type: 'EVENT',
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
      const description = typeof contentObj.description === 'string' ? contentObj.description : '';
      const location = typeof contentObj.location === 'string' ? contentObj.location : '';
      const eventDate = typeof contentObj.eventDate === 'string' ? contentObj.eventDate : '';
      const isHighlighted = contentObj.isHighlighted === true;
      
      return {
        id: item.id,
        title: item.title,
        description: description,
        location: location,
        eventDate: eventDate,
        isHighlighted: isHighlighted,
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
        totalPages: Math.ceil(total / pageSize),
        page,
        pageSize,
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
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
    if (!data.title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    // Create a properly structured content object
    const content: EventContent = {
      description: data.description || '',
      location: data.location || '',
      eventDate: data.eventDate || new Date().toISOString(),
      isHighlighted: data.isHighlighted || false,
    };

    // Create the event
    const event = await prisma.contentItem.create({
      data: {
        title: data.title,
        content: content as unknown as Prisma.JsonObject,
        duration: typeof data.duration === 'string' ? parseInt(data.duration, 10) : (data.duration || 15), // ensure duration is an integer
        isActive: data.isActive !== undefined ? data.isActive : true,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        type: 'EVENT',
        masjidId: user.masjidId,
      },
    });

    console.log(`Successfully created event: ${event.id}`);
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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
    if (!data.id) {
      return NextResponse.json({ message: 'Event ID is required' }, { status: 400 });
    }
    
    if (!data.title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    // Check if the event exists and belongs to the user's masjid
    const existingEvent = await prisma.contentItem.findFirst({
      where: {
        id: data.id,
        masjidId: user.masjidId,
      },
    });

    if (!existingEvent) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    // Create a properly structured content object
    const content: EventContent = {
      description: data.description || '',
      location: data.location || '',
      eventDate: data.eventDate || new Date().toISOString(),
      isHighlighted: data.isHighlighted || false,
    };

    // Update the event
    const updatedEvent = await prisma.contentItem.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        content: content as unknown as Prisma.JsonObject,
        duration: typeof data.duration === 'string' ? parseInt(data.duration, 10) : (data.duration || existingEvent.duration),
        isActive: data.isActive !== undefined ? data.isActive : existingEvent.isActive,
        startDate: data.startDate ? new Date(data.startDate) : existingEvent.startDate,
        endDate: data.endDate ? new Date(data.endDate) : existingEvent.endDate,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Event ID is required' }, { status: 400 });
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

    // Check if the event exists and belongs to the user's masjid
    const existingEvent = await prisma.contentItem.findFirst({
      where: {
        id,
        masjidId: user.masjidId,
      },
    });

    if (!existingEvent) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    // Delete the event
    const deletedEvent = await prisma.contentItem.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(deletedEvent);
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 