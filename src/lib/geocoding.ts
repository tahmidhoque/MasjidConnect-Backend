/**
 * Utility functions for geocoding (converting addresses to coordinates)
 */

type GeocodeResult = {
  latitude: number;
  longitude: number;
  formatted_address: string;
  success: boolean;
  error?: string;
};

/**
 * Geocode an address to get coordinates
 * Uses the OpenStreetMap Nominatim API, which is free but has usage limits
 * For production, consider using a paid service like Google Maps, Mapbox, etc.
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  try {
    // URL encode the address
    const encodedAddress = encodeURIComponent(address);
    
    // Use OpenStreetMap Nominatim API (free, but has usage limits)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
      {
        headers: {
          'User-Agent': 'MasjidConnect App', // Required by Nominatim
          'Accept-Language': 'en-US,en', // Request English results
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      return {
        success: false,
        latitude: 0,
        longitude: 0,
        formatted_address: '',
        error: 'Address not found',
      };
    }

    const result = data[0];
    
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      formatted_address: result.display_name,
      success: true,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      success: false,
      latitude: 0,
      longitude: 0,
      formatted_address: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Reverse geocode coordinates to get an address
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<{ formatted_address: string; success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'User-Agent': 'MasjidConnect App', // Required by Nominatim
          'Accept-Language': 'en-US,en', // Request English results
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Reverse geocoding request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || data.error) {
      return {
        formatted_address: '',
        success: false,
        error: data.error || 'No results found',
      };
    }

    return {
      formatted_address: data.display_name,
      success: true,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      formatted_address: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
} 