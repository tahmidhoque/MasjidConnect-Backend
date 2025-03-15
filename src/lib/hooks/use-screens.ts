import { useState, useEffect, useCallback } from 'react';
import { Screen } from '@/types/screens';
import { toast } from 'react-hot-toast';

export function useScreens() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all screens
  const fetchScreens = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/screens');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch screens: ${response.statusText}`);
      }
      
      const data = await response.json();
      setScreens(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching screens');
      console.error('Error fetching screens:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Assign a schedule to a screen
  const assignSchedule = useCallback(async (screenId: string, scheduleId: string | null) => {
    try {
      const response = await fetch(`/api/screens/${screenId}/assign-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scheduleId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to assign schedule: ${response.statusText}`);
      }
      
      const updatedScreen = await response.json();
      
      // Update the screens list with the updated screen
      setScreens(prevScreens => 
        prevScreens.map(screen => 
          screen.id === screenId ? { ...screen, ...updatedScreen } : screen
        )
      );
      
      toast.success(scheduleId 
        ? `Schedule assigned to "${updatedScreen.name}" successfully` 
        : `Custom schedule removed from "${updatedScreen.name}"`
      );
      
      return updatedScreen;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to assign schedule';
      toast.error(message);
      throw err;
    }
  }, []);

  // Load screens on mount
  useEffect(() => {
    fetchScreens();
  }, [fetchScreens]);

  return {
    screens,
    loading,
    error,
    fetchScreens,
    assignSchedule,
  };
} 