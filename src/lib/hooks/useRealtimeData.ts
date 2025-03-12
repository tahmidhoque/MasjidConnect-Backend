import { useState, useEffect } from 'react';

export interface RealtimeConfig {
  refreshInterval?: number; // in milliseconds
  enabled?: boolean;
}

export function useRealtimeData<T>(
  fetchFn: () => Promise<T>,
  config: RealtimeConfig = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    refreshInterval = 30000, // Default 30 seconds
    enabled = true,
  } = config;

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        const result = await fetchFn();
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('An error occurred'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const startPolling = () => {
      fetchData();
      timeoutId = setInterval(fetchData, refreshInterval);
    };

    if (enabled) {
      startPolling();
    }

    return () => {
      mounted = false;
      if (timeoutId) {
        clearInterval(timeoutId);
      }
    };
  }, [fetchFn, refreshInterval, enabled]);

  return { data, error, isLoading };
} 