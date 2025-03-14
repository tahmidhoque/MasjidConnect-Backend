import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ReligiousContentService } from '@/services/ReligiousContentService';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    // Temporarily commenting out for testing
    /*
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    */
    
    console.log("Search API called");
    const body = await req.json();
    console.log("Request body:", body);
    const { collection, query, limit } = body;

    if (!collection || !query) {
      return NextResponse.json({ error: 'Collection and query are required' }, { status: 400 });
    }

    const contentService = new ReligiousContentService();
    const results = await contentService.searchHadiths(collection, query, limit || 5);
    console.log("Search results:", results.length);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in hadith search API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
} 