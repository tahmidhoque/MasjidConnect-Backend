'use client';

import { useEffect, useState, ReactNode } from 'react';

interface DynamicContentProps {
  children: ReactNode;
  fallback?: ReactNode;
  clientOnly?: boolean;
}

/**
 * A component for handling dynamic content that might cause hydration mismatches
 * 
 * - In SSR, it renders static fallback content
 * - After hydration, it renders the actual dynamic content
 * - If clientOnly is true, it renders nothing during SSR and only renders on client
 */
export default function DynamicContent({ 
  children, 
  fallback = null, 
  clientOnly = false 
}: DynamicContentProps) {
  const [isClient, setIsClient] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Mark as client-side rendered
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Mark as hydrated after component is mounted and initial render is complete
  useEffect(() => {
    if (isClient) {
      // Use requestAnimationFrame to wait for the next paint 
      // This ensures hydration is complete
      const raf = requestAnimationFrame(() => {
        setHydrated(true);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isClient]);

  // If client-only mode, render nothing during SSR
  if (clientOnly) {
    return isClient ? <>{children}</> : <>{fallback}</>;
  }

  // For hybrid mode, render fallback during SSR and initial hydration
  // Then swap to real content after hydration is complete
  return (
    <>
      <div style={{ display: hydrated ? 'none' : 'block' }}>
        {fallback}
      </div>
      <div style={{ display: hydrated ? 'block' : 'none' }}>
        {children}
      </div>
    </>
  );
} 