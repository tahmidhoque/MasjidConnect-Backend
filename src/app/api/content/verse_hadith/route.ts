import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ReligiousContentService } from '@/services/ReligiousContentService';

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
        type: 'VERSE_HADITH',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching verse/hadith items:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, masjidId: true },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const data = await req.json();
    
    // Handle API fetching
    if (data.fetchMethod === 'api') {
      const contentService = new ReligiousContentService();
      let contentData;
      
      if (data.contentType === 'QURAN_VERSE') {
        if (data.specificVerse && data.surahNumber && data.ayahNumber) {
          contentData = await contentService.getSpecificQuranVerse(data.surahNumber, data.ayahNumber);
        } else {
          contentData = await contentService.getRandomQuranVerse();
        }
      } else if (data.contentType === 'HADITH') {
        if (data.hadithNumber) {
          // Fetch a specific hadith by number
          contentData = await contentService.getSpecificHadith(data.hadithCollection, data.hadithNumber);
        } else {
          // Fetch a random hadith
          contentData = await contentService.getRandomHadith(data.hadithCollection);
        }
      } else {
        return new NextResponse('Invalid content type', { status: 400 });
      }
      
      // Create the content item with the fetched data
      const contentItem = await prisma.contentItem.create({
        data: {
          masjidId: user.masjidId,
          type: 'VERSE_HADITH',
          title: data.title && data.title.trim() !== '' ? data.title : contentData.reference,
          content: contentData,
          duration: data.duration,
          isActive: true,
        },
      });
      
      return NextResponse.json(contentItem);
    }
    
    // Handle manual creation (existing code)
    const contentItem = await prisma.contentItem.create({
      data: {
        masjidId: user.masjidId,
        type: 'VERSE_HADITH',
        title: data.title && data.title.trim() !== '' ? data.title : data.content.reference,
        content: data.content,
        duration: data.duration,
        isActive: data.isActive !== undefined ? data.isActive : true,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });

    return NextResponse.json(contentItem);
  } catch (error) {
    console.error('Error creating verse/hadith item:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 