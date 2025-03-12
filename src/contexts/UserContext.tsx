"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { isStoredDataValid } from '@/lib/auth-client';
import { useBrowser } from '@/hooks/useBrowser';
import ClientOnly from '@/components/ClientOnly';

// Define types
interface MasjidData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  calculationMethod: string;
  madhab: string;
  timestamp?: number;
}

interface UserData {
  id: string;
  name: string;
  masjidId: string;
  timestamp?: number;
}

interface UserContextType {
  masjidName: string | null;
  userName: string | null;
  isLoading: boolean;
  isInitialized: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Inner provider that only renders on the client side
function UserProviderInner({ children }: { children: ReactNode }) {
  const { isBrowser, getLocalStorageItem, setLocalStorageItem } = useBrowser();
  
  // Initialize all state with null/false values
  const [masjidName, setMasjidName] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { data: session, status } = useSession();

  // Initialize from localStorage on first render
  useEffect(() => {
    if (!isBrowser) return;
    
    const hasLoadedDataKey = 'userDataHasBeenLoaded';
    const loadedBefore = localStorage.getItem(hasLoadedDataKey) === 'true';
    
    // Get data from localStorage
    const masjidData = getLocalStorageItem<MasjidData>('masjidData');
    const userData = getLocalStorageItem<UserData>('userData');
    
    // Update state based on localStorage data
    if (masjidData?.name) {
      setMasjidName(masjidData.name);
    }
    
    if (userData?.name) {
      setUserName(userData.name);
    }
    
    // Only show loading if we don't have data AND have never loaded before
    setIsLoading(!loadedBefore && (!masjidData || !userData));
    setIsInitialized(!!masjidData || !!userData || loadedBefore);
  }, [isBrowser, getLocalStorageItem]);

  // Fetch data from API if needed
  useEffect(() => {
    if (!isBrowser) return;
    
    // Skip if we're not initialized yet or session is loading
    if (!isInitialized || status === 'loading') return;
    
    // Skip if we have both pieces of data and user is logged in
    if (masjidName && userName && session?.user) return;
    
    const getMasjidData = async () => {
      // We need to fetch if:
      // 1. User is logged in but we don't have data in state
      // 2. Data in localStorage is expired
      const shouldRefresh = (!masjidName || !userName || !isStoredDataValid('masjidData') || !isStoredDataValid('userData'));
      
      // Only set loading if we're actually going to fetch
      if (shouldRefresh && session?.user?.masjidId) {
        // Check if we've loaded data before
        const hasLoadedDataKey = 'userDataHasBeenLoaded';
        const loadedBefore = localStorage.getItem(hasLoadedDataKey) === 'true';
        
        // Only show loading if we don't have any data at all AND we've never loaded before
        if ((!masjidName || !userName) && !loadedBefore) {
          setIsLoading(true);
        }
        
        try {
          const response = await fetch('/api/masjid/current');
          if (response.ok) {
            const data = await response.json();
            setMasjidName(data.name);
            
            // Store in localStorage
            const masjidWithTimestamp = {
              ...data,
              timestamp: Date.now()
            };
            setLocalStorageItem('masjidData', masjidWithTimestamp);
            
            // Also store/update user data
            if (session.user) {
              const userData = {
                id: session.user.id,
                name: session.user.name || 'User',
                masjidId: session.user.masjidId,
                timestamp: Date.now(),
              };
              setLocalStorageItem('userData', userData);
              setUserName(userData.name);
              
              // Mark as having loaded data, so we never show loading indicators again
              localStorage.setItem('userDataHasBeenLoaded', 'true');
            }
          }
        } catch (error) {
          console.error('Error fetching masjid data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    getMasjidData();
  }, [session, status, isInitialized, masjidName, userName, isBrowser, setLocalStorageItem]);

  return (
    <UserContext.Provider value={{ 
      masjidName, 
      userName, 
      isLoading, 
      isInitialized 
    }}>
      {children}
    </UserContext.Provider>
  );
}

// Main provider that wraps the inner provider with ClientOnly
export function UserProvider({ children }: { children: ReactNode }) {
  return (
    <ClientOnly>
      <UserProviderInner>{children}</UserProviderInner>
    </ClientOnly>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
} 