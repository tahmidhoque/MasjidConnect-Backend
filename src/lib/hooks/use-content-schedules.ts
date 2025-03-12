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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch schedules on mount
  useEffect(() => {
    fetchSchedules();
  }, []);

  // Get schedules from API or localStorage fallback
  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/schedules');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch schedules: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Validate and normalize data to prevent hydration issues
      const normalizedSchedules = data.map((schedule: any) => ({
        id: schedule.id || '',
        name: schedule.name || 'Unnamed Schedule',
        description: schedule.description || '',
        isActive: schedule.isActive === undefined ? true : schedule.isActive,
        isDefault: schedule.isDefault === undefined ? false : schedule.isDefault,
        items: Array.isArray(schedule.items) ? schedule.items.map((item: any) => ({
          id: item.id || '',
          order: item.order || 0,
          contentItemId: item.contentItemId || '',
          contentItem: item.contentItem ? {
            id: item.contentItem.id || '',
            type: item.contentItem.type || 'VERSE_HADITH',
            duration: item.contentItem.duration || 20,
          } : undefined
        })) : []
      }));
      
      setSchedules(normalizedSchedules);
      
      // Cache in localStorage as fallback
      try {
        localStorage.setItem('contentSchedules', JSON.stringify(normalizedSchedules));
      } catch (e) {
        console.warn('Failed to cache schedules in localStorage');
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('Failed to load content schedules');
      
      // Try to load from localStorage as fallback
      try {
        const cached = localStorage.getItem('contentSchedules');
        if (cached) {
          setSchedules(JSON.parse(cached));
        }
      } catch (e) {
        // If both API and localStorage fail, set empty array
        setSchedules([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete a schedule
  const deleteSchedule = async (scheduleId: string) => {
    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete schedule: ${response.statusText}`);
      }
      
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
      
      // Update localStorage
      try {
        localStorage.setItem('contentSchedules', JSON.stringify(
          schedules.filter(s => s.id !== scheduleId)
        ));
      } catch (e) {
        console.warn('Failed to update localStorage');
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting schedule:', err);
      throw err;
    }
  };

  // Toggle active status
  const toggleActive = async (scheduleId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/schedules/${scheduleId}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update schedule status: ${response.statusText}`);
      }
      
      const updatedSchedule = await response.json();
      
      setSchedules(prev => prev.map(s => 
        s.id === scheduleId ? { ...s, isActive } : s
      ));
      
      // Update localStorage
      try {
        localStorage.setItem('contentSchedules', JSON.stringify(
          schedules.map(s => s.id === scheduleId ? { ...s, isActive } : s)
        ));
      } catch (e) {
        console.warn('Failed to update localStorage');
      }
      
      return updatedSchedule;
    } catch (err) {
      console.error('Error toggling schedule active state:', err);
      throw err;
    }
  };

  // Set default schedule
  const setDefault = async (scheduleId: string) => {
    try {
      const response = await fetch(`/api/schedules/${scheduleId}/set-default`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to set default schedule: ${response.statusText}`);
      }
      
      const updatedSchedule = await response.json();
      
      setSchedules(prev => prev.map(s => ({
        ...s,
        isDefault: s.id === scheduleId,
        // Ensure default schedule is always active
        isActive: s.id === scheduleId ? true : s.isActive
      })));
      
      // Update localStorage
      try {
        localStorage.setItem('contentSchedules', JSON.stringify(
          schedules.map(s => ({
            ...s,
            isDefault: s.id === scheduleId,
            isActive: s.id === scheduleId ? true : s.isActive
          }))
        ));
      } catch (e) {
        console.warn('Failed to update localStorage');
      }
      
      return updatedSchedule;
    } catch (err) {
      console.error('Error setting default schedule:', err);
      throw err;
    }
  };

  // Duplicate a schedule
  const duplicateSchedule = async (scheduleId: string, name: string) => {
    try {
      const response = await fetch(`/api/schedules/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sourceScheduleId: scheduleId, name }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to duplicate schedule: ${response.statusText}`);
      }
      
      const newSchedule = await response.json();
      
      setSchedules(prev => [...prev, newSchedule]);
      
      // Update localStorage
      try {
        localStorage.setItem('contentSchedules', JSON.stringify([...schedules, newSchedule]));
      } catch (e) {
        console.warn('Failed to update localStorage');
      }
      
      return newSchedule;
    } catch (err) {
      console.error('Error duplicating schedule:', err);
      throw err;
    }
  };

  // Create a new schedule
  const createSchedule = async (data: CreateScheduleData) => {
    try {
      const response = await fetch(`/api/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create schedule: ${response.statusText}`);
      }
      
      const newSchedule = await response.json();
      
      setSchedules(prev => [...prev, newSchedule]);
      
      // Update localStorage
      try {
        localStorage.setItem('contentSchedules', JSON.stringify([...schedules, newSchedule]));
      } catch (e) {
        console.warn('Failed to update localStorage');
      }
      
      return newSchedule;
    } catch (err) {
      console.error('Error creating schedule:', err);
      throw err;
    }
  };

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    deleteSchedule,
    toggleActive,
    setDefault,
    duplicateSchedule,
    createSchedule
  };
} 