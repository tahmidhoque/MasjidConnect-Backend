'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Only redirect once we have a definitive session state
    if (status === 'loading') return;
    
    // Use replace instead of push to avoid adding to history
    if (session) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [session, status, router]);

  // Show loading state while determining session
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent w-8 h-8" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return null;
}
