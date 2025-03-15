import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ContentScheduleService } from '@/lib/services/content-schedule-service';

/**
 * GET /api/schedules/:id
 * Get a specific content schedule by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract the dynamic parameter
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Schedule ID is required' }, 
        { status: 400 }
      );
    }

    // Get the current session to determine the user and masjid
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    // Use the masjid ID from the session
    const masjidId = session.user.masjidId || '1';
    
    try {
      // Get schedules for the masjid
      const schedules = await ContentScheduleService.getSchedules(masjidId);
      
      // Find the requested schedule
      const schedule = schedules.find(s => s.id === id);
      
      if (!schedule) {
        return NextResponse.json(
          { error: 'Schedule not found' }, 
          { status: 404 }
        );
      }
      
      return NextResponse.json(schedule);
    } catch (serviceError) {
      console.error('Error in ContentScheduleService.getSchedules:', serviceError);
      throw serviceError;
    }
  } catch (error) {
    console.error('Unhandled error fetching schedule:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch schedule' }, 
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/schedules/:id
 * Update a content schedule
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract the dynamic parameter
    const { id } = await params;
    
    console.log('PATCH request for schedule ID:', id);
    
    if (!id) {
      return NextResponse.json(
        { error: 'Schedule ID is required' }, 
        { status: 400 }
      );
    }

    // Get the current session to determine the user and masjid
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    // Use the masjid ID from the session
    const masjidId = session.user.masjidId || '1';
    console.log('Using masjid ID:', masjidId);
    
    // Parse the request body
    const data = await request.json();
    console.log('Request data:', JSON.stringify(data, null, 2));
    
    // Validate slides if provided
    if (data.slides) {
      console.log('Validating slides:', data.slides.length);
      console.log('Slide IDs:', data.slides.map((s: any) => s.id));
      
      // Check for empty slides array
      if (data.slides.length === 0) {
        console.log('Empty slides array provided');
        // This is valid - user might want to clear all items
      } else {
        // Ensure all slides have valid IDs
        const invalidSlides = data.slides.filter((slide: any) => 
          !slide.id || 
          typeof slide.id !== 'string' ||
          slide.id.startsWith('placeholder')
        );
        
        if (invalidSlides.length > 0) {
          console.error('Invalid slide IDs found:', invalidSlides);
          return NextResponse.json(
            { 
              error: 'Invalid slide IDs provided', 
              invalidSlides,
              details: 'Content item IDs must be valid IDs and not placeholders'
            }, 
            { status: 400 }
          );
        } else {
          console.log('All slide IDs are valid');
        }
        
        // Check for duplicate order values
        const orderValues = data.slides.map((slide: any) => slide.order);
        const uniqueOrderValues = new Set(orderValues);
        
        if (orderValues.length !== uniqueOrderValues.size) {
          console.error('Duplicate order values found:', orderValues);
          
          // Fix duplicate order values
          data.slides = data.slides.map((slide: any, index: number) => ({
            ...slide,
            order: index
          }));
          
          console.log('Fixed order values:', data.slides.map((s: any) => s.order));
        } else {
          // Ensure all slides have order property
          data.slides = data.slides.map((slide: any, index: number) => ({
            ...slide,
            order: slide.order !== undefined ? slide.order : index
          }));
        }
        
        console.log('Processed slides with order:', data.slides);
      }
    }
    
    try {
      // Update the schedule
      console.log('Calling ContentScheduleService.updateSchedule');
      const updatedSchedule = await ContentScheduleService.updateSchedule(
        masjidId,
        id,
        data
      );
      
      console.log('Schedule updated successfully');
      return NextResponse.json(updatedSchedule);
    } catch (serviceError) {
      console.error('Error in ContentScheduleService.updateSchedule:', serviceError);
      
      if (serviceError instanceof Error) {
        return NextResponse.json(
          { error: serviceError.message, details: 'Service error' }, 
          { status: 400 }
        );
      }
      
      throw serviceError;
    }
  } catch (error) {
    console.error('Unhandled error updating schedule:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message, details: 'Unhandled error' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update schedule', details: 'Unknown error' }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/schedules/:id
 * Delete a content schedule
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract the dynamic parameter
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Schedule ID is required' }, 
        { status: 400 }
      );
    }

    // Get the current session to determine the user and masjid
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    // Use the masjid ID from the session
    const masjidId = session.user.masjidId || '1';
    
    try {
      // Delete the schedule
      await ContentScheduleService.deleteSchedule(masjidId, id);
      
      return new NextResponse(null, { status: 204 });
    } catch (serviceError) {
      console.error('Error in ContentScheduleService.deleteSchedule:', serviceError);
      
      if (serviceError instanceof Error) {
        return NextResponse.json(
          { error: serviceError.message }, 
          { status: 400 }
        );
      }
      
      throw serviceError;
    }
  } catch (error) {
    console.error('Unhandled error deleting schedule:', error);
    
    if (error instanceof Error && error.message) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete schedule' }, 
      { status: 500 }
    );
  }
} 