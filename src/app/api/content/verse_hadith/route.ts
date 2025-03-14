import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ReligiousContentService } from '@/services/ReligiousContentService';

export async function GET(request: NextRequest) {
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

    // Get search parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '0');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');
    const type = searchParams.get('type'); // 'VERSE' or 'HADITH'

    // Build filter conditions
    const where: any = {
      masjidId: user.masjidId,
      // Use CAST to handle ContentType enum
      type: { equals: 'VERSE_HADITH' },
    };

    // Apply active filter if provided
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    // Apply search if provided
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { path: ['reference'], string_contains: search, mode: 'insensitive' } },
        { content: { path: ['translation'], string_contains: search, mode: 'insensitive' } },
        { content: { path: ['arabicText'], string_contains: search, mode: 'insensitive' } }
      ];
    }

    // Apply content type filter if provided
    if (type) {
      where.content = {
        ...where.content,
        path: ['type'],
        equals: type,
      };
    }

    // Retrieve items with pagination
    const offset = page * pageSize;
    const [items, total] = await Promise.all([
      prisma.contentItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: pageSize,
      }),
      prisma.contentItem.count({ where }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      items,
      meta: {
        total,
        page,
        pageSize,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching verse/hadith items:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    
    // Handle different input methods
    let content;
    let title = body.title || '';
    
    if (body.fetchMethod === 'api') {
      // For API-fetched content
      const contentService = new ReligiousContentService();
      const contentType = body.contentType;
      
      if (contentType === 'QURAN_VERSE') {
        if (body.specificVerse && body.surahNumber && body.ayahNumber) {
          content = await contentService.getSpecificQuranVerse(body.surahNumber, body.ayahNumber);
        } else {
          content = await contentService.getRandomQuranVerse();
        }
        title = title || content.reference || 'Quran Verse of the Day';
      } else if (contentType === 'HADITH') {
        if (body.hadithNumber) {
          content = await contentService.getSpecificHadith(body.hadithCollection, body.hadithNumber);
        } else {
          content = await contentService.getRandomHadith(body.hadithCollection);
        }
        title = title || content.reference || `${body.hadithCollection.charAt(0).toUpperCase() + body.hadithCollection.slice(1)} Hadith of the Day`;
      } else {
        return new NextResponse('Invalid content type', { status: 400 });
      }
    } else {
      // For manually entered content
      if (!body.content) {
        return new NextResponse('Content is required', { status: 400 });
      }
      content = body.content;
      title = body.title || content.reference || 'Religious Content';
    }

    const newItem = await prisma.contentItem.create({
      data: {
        masjidId: user.masjidId,
        type: 'VERSE_HADITH',
        title: title,
        content: content,
        duration: body.duration || 30,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json(newItem);
  } catch (error) {
    console.error('Error creating verse/hadith item:', error);
    return new NextResponse('Internal Server Error: ' + (error instanceof Error ? error.message : 'Unknown error'), { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    
    if (!body.id) {
      return new NextResponse('Item ID is required', { status: 400 });
    }

    const existingItem = await prisma.contentItem.findFirst({
      where: {
        id: body.id,
        masjidId: user.masjidId,
      },
    });

    if (!existingItem) {
      return new NextResponse('Item not found', { status: 404 });
    }

    // Handle different input methods
    let content;
    let title = body.title || '';
    
    if (body.fetchMethod === 'api') {
      // For API-fetched content
      const contentService = new ReligiousContentService();
      const contentType = body.contentType;
      
      if (contentType === 'QURAN_VERSE') {
        if (body.specificVerse && body.surahNumber && body.ayahNumber) {
          content = await contentService.getSpecificQuranVerse(body.surahNumber, body.ayahNumber);
        } else {
          content = await contentService.getRandomQuranVerse();
        }
        title = title || content.reference || 'Quran Verse of the Day';
      } else if (contentType === 'HADITH') {
        if (body.hadithNumber) {
          content = await contentService.getSpecificHadith(body.hadithCollection, body.hadithNumber);
        } else {
          content = await contentService.getRandomHadith(body.hadithCollection);
        }
        title = title || content.reference || `${body.hadithCollection.charAt(0).toUpperCase() + body.hadithCollection.slice(1)} Hadith of the Day`;
      } else {
        return new NextResponse('Invalid content type', { status: 400 });
      }
    } else {
      // For manually entered content
      if (!body.content) {
        return new NextResponse('Content is required', { status: 400 });
      }
      content = body.content;
      title = body.title || content.reference || 'Religious Content';
    }

    const updatedItem = await prisma.contentItem.update({
      where: { id: body.id },
      data: {
        title: title,
        content: content,
        duration: body.duration || existingItem.duration,
        isActive: body.isActive ?? existingItem.isActive,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating verse/hadith item:', error);
    return new NextResponse('Internal Server Error: ' + (error instanceof Error ? error.message : 'Unknown error'), { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new NextResponse('Item ID is required', { status: 400 });
    }

    const item = await prisma.contentItem.findFirst({
      where: {
        id,
        masjidId: user.masjidId,
      },
    });

    if (!item) {
      return new NextResponse('Item not found', { status: 404 });
    }

    await prisma.contentItem.delete({
      where: { id },
    });

    return new NextResponse('Item deleted', { status: 200 });
  } catch (error) {
    console.error('Error deleting verse/hadith item:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 