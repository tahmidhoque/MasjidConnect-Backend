'use client';

/**
 * IMPORTANT: These functions should only be used in useEffect or event handlers,
 * never during component rendering to avoid hydration mismatches.
 * 
 * For component rendering, use the useBrowser hook instead.
 */

/**
 * Utility functions for working with browser storage
 */

/**
 * Save data to localStorage with error handling
 */
export function setLocalStorageItem(key: string, data: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Get data from localStorage with error handling
 */
export function getLocalStorageItem<T>(key: string, defaultValue: T | null = null): T | null {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error retrieving from localStorage (${key}):`, error);
    return defaultValue;
  }
}

/**
 * Remove data from localStorage with error handling
 */
export function removeLocalStorageItem(key: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Clear all data in localStorage with error handling
 */
export function clearLocalStorage(): boolean {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Checks if an item exists in localStorage
 */
export function hasLocalStorageItem(key: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`Error checking localStorage item ${key}:`, error);
    return false;
  }
} 