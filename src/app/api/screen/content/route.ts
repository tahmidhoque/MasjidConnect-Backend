import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { applyCorsHeaders, handleCorsOptions } from '@/lib/cors';
import type { NextRequest } from 'next/server';

export async function OPTIONS(req: NextRequest) {
  return handleCorsOptions(req);
}

export async function GET(req: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleCorsOptions(req);
  if (corsResponse) return corsResponse;

  try {
    // Authentication is handled by middleware
    // Extract screen ID from headers
    const screenId = req.headers.get('X-Screen-ID');
    
    if (!screenId) {
      const errorResponse = NextResponse.json(
        { error: 'Screen ID is required' }, 
        { status: 400 }
      );
      return applyCorsHeaders(req, errorResponse);
    }
    
    // Get screen details with its schedule
    const screen = await prisma.screen.findUnique({
      where: { id: screenId },
      include: {
        schedule: {
          include: {
            items: {
              include: {
                contentItem: true
              },
              orderBy: {
                order: 'asc'
              }
            }
          }
        },
        masjid: {
          select: {
            name: true,
            timezone: true
          }
        },
        contentOverrides: true
      }
    });
    
    if (!screen) {
      const errorResponse = NextResponse.json(
        { error: 'Screen not found' }, 
        { status: 404 }
      );
      return applyCorsHeaders(req, errorResponse);
    }
    
    if (!screen.masjidId) {
      const errorResponse = NextResponse.json(
        { error: 'Screen not associated with a masjid' }, 
        { status: 400 }
      );
      return applyCorsHeaders(req, errorResponse);
    }
    
    // Get the latest prayer times for this masjid
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const prayerTimes = await prisma.prayerTime.findMany({
      where: {
        masjidId: screen.masjidId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });
    
    // Construct the response with all necessary data
    const response = {
      screen: {
        id: screen.id,
        name: screen.name,
        orientation: screen.orientation,
        contentConfig: screen.contentConfig
      },
      masjid: screen.masjid,
      schedule: screen.schedule,
      prayerTimes: prayerTimes[0] || null,
      contentOverrides: screen.contentOverrides,
      lastUpdated: new Date()
    };
    
    const successResponse = NextResponse.json(response);
    return applyCorsHeaders(req, successResponse);
  } catch (error) {
    console.error('Error fetching screen content:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch screen content' },
      { status: 500 }
    );
    return applyCorsHeaders(req, errorResponse);
  }
} 