import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ReligiousContentService } from '@/services/ReligiousContentService';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      fetchMethod, 
      contentType, 
      hadithCollection, 
      specificVerse, 
      surahNumber, 
      ayahNumber,
      hadithNumber
    } = body;

    if (fetchMethod !== 'api') {
      return NextResponse.json({ error: 'Invalid fetch method' }, { status: 400 });
    }

    const contentService = new ReligiousContentService();
    let content;

    if (contentType === 'QURAN_VERSE') {
      if (specificVerse) {
        if (!surahNumber || !ayahNumber) {
          return NextResponse.json({ error: 'Surah and Ayah numbers are required for specific verse' }, { status: 400 });
        }
        content = await contentService.getSpecificQuranVerse(surahNumber, ayahNumber);
      } else {
        content = await contentService.getRandomQuranVerse();
      }
    } else if (contentType === 'HADITH') {
      if (!hadithCollection) {
        return NextResponse.json({ error: 'Hadith collection is required' }, { status: 400 });
      }
      
      if (hadithNumber) {
        // Fetch a specific hadith by number
        content = await contentService.getSpecificHadith(hadithCollection, hadithNumber);
      } else {
        // Fetch a random hadith
        content = await contentService.getRandomHadith(hadithCollection);
      }
    } else {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error in verse_hadith preview API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
} 