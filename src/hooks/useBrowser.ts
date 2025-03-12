'use client';

import { useState, useEffect } from 'react';

/**
 * Hook that provides safe access to browser APIs
 * Returns information about the browser environment and utility functions
 * Only accesses browser APIs on the client side to prevent hydration mismatches
 */
export function useBrowser() {
  const [isBrowser, setIsBrowser] = useState(false);
  
  useEffect(() => {
    setIsBrowser(true);
  }, []);
  
  // Safe localStorage wrapper functions
  const getLocalStorageItem = <T,>(key: string): T | null => {
    if (!isBrowser) return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting localStorage item ${key}:`, error);
      return null;
    }
  };
  
  const setLocalStorageItem = <T,>(key: string, value: T): boolean => {
    if (!isBrowser) return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting localStorage item ${key}:`, error);
      return false;
    }
  };
  
  const removeLocalStorageItem = (key: string): boolean => {
    if (!isBrowser) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage item ${key}:`, error);
      return false;
    }
  };
  
  // Returns window dimensions, defaults to reasonable values for server
  const getWindowDimensions = () => {
    if (!isBrowser) return { width: 1024, height: 768 };
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  };
  
  return {
    isBrowser,
    getLocalStorageItem,
    setLocalStorageItem,
    removeLocalStorageItem,
    getWindowDimensions,
  };
} 