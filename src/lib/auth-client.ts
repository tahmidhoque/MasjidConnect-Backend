'use client';

/**
 * Client-side authentication utilities
 */
import { setLocalStorageItem, removeLocalStorageItem } from './storage';

// How long to keep cached data (in milliseconds)
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Prefetch and store user-related data in local storage
 * Call this after successful login
 */
export async function prefetchUserData(userId: string, masjidId: string, userName: string): Promise<void> {
  try {
    // Store basic user info with timestamp
    const userData = {
      id: userId,
      name: userName,
      masjidId: masjidId,
      timestamp: Date.now(),
    };
    setLocalStorageItem('userData', userData);
    
    // Fetch masjid data
    const masjidResponse = await fetch(`/api/masjid/${masjidId}`);
    if (!masjidResponse.ok) {
      throw new Error('Failed to fetch masjid data');
    }
    
    const masjidData = await masjidResponse.json();
    // Add timestamp to track cache freshness
    const masjidWithTimestamp = {
      ...masjidData,
      timestamp: Date.now()
    };
    setLocalStorageItem('masjidData', masjidWithTimestamp);

    // Could add more prefetching here (user profile, preferences, etc.)
    
  } catch (error) {
    console.error('Error prefetching user data:', error);
    // Clear any partially stored data
    clearUserData();
    throw error; // Re-throw the error to be handled by the caller
  }
}

/**
 * Clear all user data from localStorage when user logs out
 * This should only be called on the client side or in event handlers
 */
export function clearUserData(): void {
  if (typeof window === 'undefined') return;
  
  // List of all keys to clear
  const keysToRemove = [
    'userData', 
    'masjidData',
    'userDataHasBeenLoaded',
    // Add any other user-related keys here
  ];
  
  // Remove all keys
  keysToRemove.forEach(key => {
    removeLocalStorageItem(key);
  });
}

/**
 * Check if stored data is valid (not expired)
 * We consider data valid if it's less than 24 hours old
 * This should only be called on the client side or in event handlers
 */
export function isStoredDataValid(key: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const item = localStorage.getItem(key);
    if (!item) return false;
    
    const data = JSON.parse(item);
    if (!data.timestamp) return false;
    
    // Consider data valid if less than 24 hours old
    const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const now = Date.now();
    const timestamp = data.timestamp;
    
    return (now - timestamp) < MAX_AGE;
  } catch (error) {
    console.error(`Error checking if stored data is valid for ${key}:`, error);
    return false;
  }
} 