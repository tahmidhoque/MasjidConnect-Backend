'use client';

import { useEffect, useState, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that ensures its children are only rendered on the client.
 * This helps prevent hydration mismatches for components that:
 * - Use browser APIs (localStorage, window, document)
 * - Render different content on client vs server
 * - Use random values, dates, or other dynamic content
 */
export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Return fallback (or null) on server, children only on client
  return isClient ? <>{children}</> : <>{fallback}</>;
} 