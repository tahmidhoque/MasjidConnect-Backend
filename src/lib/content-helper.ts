/**
 * Helper functions for content-related operations
 */

// Helper to safely get content type for Prisma queries
// This is needed because the ContentType enum in Prisma schema might be different than strings used in code
export function getContentTypeForPrisma(type: string): string {
  const contentTypeMap: Record<string, string> = {
    'VERSE_HADITH': 'VERSE_HADITH',
    'ANNOUNCEMENT': 'ANNOUNCEMENT',
    'EVENT': 'EVENT',
    'CUSTOM': 'CUSTOM',
  };
  
  return contentTypeMap[type] || type;
}

// Format duration in seconds to display format
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} seconds`;
  } else {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
}

// Get a readable content type for display
export function getReadableContentType(contentType: string): string {
  const typeMap: Record<string, string> = {
    'VERSE_HADITH': 'Verse/Hadith',
    'QURAN_VERSE': 'Quran Verse',
    'HADITH': 'Hadith',
    'ANNOUNCEMENT': 'Announcement',
    'EVENT': 'Event',
    'CUSTOM': 'Custom',
  };
  
  return typeMap[contentType] || contentType;
}

// Format date to display format
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
} 