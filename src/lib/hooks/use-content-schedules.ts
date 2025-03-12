import { useState, useEffect } from 'react';

// Define interfaces for our data types
export interface ContentItem {
  id: string;
  type: string;
  duration: number;
}

export interface ContentScheduleItem {
  id: string;
  order: number;
  contentItemId: string;
  contentItem?: ContentItem;
}

export interface ContentSchedule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  isDefault: boolean;
  items: ContentScheduleItem[];
}

export interface CreateScheduleData {
  name: string;
  description: string;
  isActive?: boolean;
  slides: { id: string; type: string; duration: number }[];
}

/**
 * Hook to manage content schedules with proper error handling
 */
export function useContentSchedules() {
  const [schedules, setSchedules] = useState<ContentSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/schedules');
      if (!response.ok) {
        throw new Error('Failed to fetch schedules');
      }
      const data = await response.json();
      setSchedules(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async (data: CreateScheduleData) => {
    try {
      // Don't include placeholder slides, create an empty schedule first
      const scheduleData = {
        ...data,
        slides: data.slides.filter(slide => 
          !slide.id.startsWith('placeholder') && slide.id.match(/^[0-9a-f]{24}$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
        )
      };

      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create schedule');
      }
      
      const newSchedule = await response.json();
      // Update our local state
      setSchedules([...schedules, newSchedule]);
      return newSchedule;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      throw err;
    }
  };

  const updateSchedule = async (id: string, data: Partial<CreateScheduleData>) => {
    try {
      // Filter out placeholder IDs
      const scheduleData = {
        ...data,
        slides: data.slides?.filter(slide => 
          !slide.id.startsWith('placeholder') && slide.id.match(/^[0-9a-f]{24}$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
        )
      };

      const response = await fetch(`/api/schedules/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update schedule');
      }
      
      const updatedSchedule = await response.json();
      // Update our local state
      setSchedules(schedules.map(schedule => 
        schedule.id === id ? updatedSchedule : schedule
      ));
      return updatedSchedule;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      throw err;
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete schedule');
      }
      
      // Update our local state
      setSchedules(schedules.filter(schedule => schedule.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      throw err;
    }
  };

  const setDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/schedules/${id}/default`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to set default schedule');
      }
      
      // Refetch all schedules to get updated default status
      await fetchSchedules();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      throw err;
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/schedules/${id}/active`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle schedule active status');
      }
      
      const updatedSchedule = await response.json();
      // Update our local state
      setSchedules(schedules.map(schedule => 
        schedule.id === id ? updatedSchedule : schedule
      ));
      return updatedSchedule;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      throw err;
    }
  };

  const duplicateSchedule = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/schedules/${id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to duplicate schedule');
      }
      
      const newSchedule = await response.json();
      // Update our local state
      setSchedules([...schedules, newSchedule]);
      return newSchedule;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      throw err;
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    setDefault,
    toggleActive,
    duplicateSchedule,
  };
} 