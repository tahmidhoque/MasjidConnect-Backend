'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Define the context type
interface TransitionContextType {
  isTransitioning: boolean;
  previousPath: string | null;
}

// Create the context with a default value
const TransitionContext = createContext<TransitionContextType>({
  isTransitioning: false,
  previousPath: null,
});

// Provider component
export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousPath, setPreviousPath] = useState<string | null>(null);
  const pathname = usePathname();

  // Track route changes
  useEffect(() => {
    // Skip the initial render
    if (previousPath === null) {
      setPreviousPath(pathname);
      return;
    }

    // If the path has changed
    if (pathname !== previousPath) {
      // Start transition
      setIsTransitioning(true);
      
      // Set a timeout to end the transition
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setPreviousPath(pathname);
      }, 300); // Duration should match the CSS transition
      
      return () => clearTimeout(timeout);
    }
  }, [pathname, previousPath]);

  return (
    <TransitionContext.Provider value={{ isTransitioning, previousPath }}>
      {children}
    </TransitionContext.Provider>
  );
}

// Custom hook for using the context
export const useTransition = () => useContext(TransitionContext); 