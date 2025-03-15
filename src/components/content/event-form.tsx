import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { ContentType } from '@prisma/client';
import { createContentItem, updateContentItem, ContentItemData } from '@/lib/services/content';
import { FormTextField, FormTextArea, FormDateTimePicker, FormDatePicker, FormSwitch } from '@/components/common/FormFields';
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext';
import { FormSection } from '@/components/common/FormSection';

interface EventFormProps {
  initialData?: ContentItemData;
  onSuccess?: () => void;
  onCancel?: () => void;
  setFormActions?: (actions: React.ReactNode) => void;
}

export function EventForm({ initialData, onSuccess, onCancel, setFormActions }: EventFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setHasUnsavedChanges } = useUnsavedChanges();
  
  // Extract meta data from content field if it exists
  const getInitialMetaData = () => {
    if (!initialData?.content) return { location: '', eventDate: null };
    
    try {
      const content = typeof initialData.content === 'string' 
        ? JSON.parse(initialData.content) 
        : initialData.content;
        
      return {
        location: content.location || '',
        eventDate: content.eventDate ? dayjs(content.eventDate) : null
      };
    } catch (e) {
      console.error('Error parsing content data:', e);
      return { location: '', eventDate: null };
    }
  };
  
  const { location, eventDate } = getInitialMetaData();
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content?.description || '',
    type: ContentType.EVENT,
    duration: initialData?.duration || 20,
    isActive: initialData?.isActive ?? true,
    startDate: initialData?.startDate ? dayjs(initialData.startDate) : null,
    endDate: initialData?.endDate ? dayjs(initialData.endDate) : null,
    location: location,
    eventDate: eventDate,
  });

  // Track original data for unsaved changes
  const [originalData, setOriginalData] = useState(formData);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasUnsavedChanges(hasChanges);
    
    return () => {
      setHasUnsavedChanges(false);
    };
  }, [formData, originalData, setHasUnsavedChanges]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.eventDate) {
      setError('Title, content, and event date are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create content object with meta data
      const contentData = {
        description: formData.content,
        location: formData.location,
        eventDate: formData.eventDate ? formData.eventDate.toISOString() : undefined,
        isHighlighted: false
      };

      const apiData = {
        title: formData.title,
        type: formData.type,
        content: contentData,
        duration: formData.duration,
        isActive: formData.isActive,
        startDate: formData.startDate ? formData.startDate.toDate() : undefined,
        endDate: formData.endDate ? formData.endDate.toDate() : undefined,
      };

      if (initialData) {
        await updateContentItem({ id: initialData.id, ...apiData });
      } else {
        await createContentItem(apiData);
      }

      setHasUnsavedChanges(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving event:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while saving');
    } finally {
      setIsLoading(false);
    }
  };

  // Create form actions
  useEffect(() => {
    if (setFormActions) {
      setFormActions(
        <>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="event-form"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Event' : 'Create Event'}
          </Button>
        </>
      );
    }
  }, [isLoading, initialData, onCancel, setFormActions]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box 
        component="form" 
        id="event-form"
        onSubmit={handleSubmit}
        noValidate
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormSection 
          title="Event Details" 
          description="Fill in the information below to create your event"
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormTextField
                autoFocus
                label="Title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                helperText="Enter a concise title for your event"
                tooltip="A brief, descriptive title for your event that will be displayed on screens"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormTextArea
                label="Description"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                helperText="Enter details about the event"
                tooltip="The detailed description that will be displayed to users"
                rows={4}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormTextField
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                helperText="Where will this event take place?"
                tooltip="Specify the location of the event (e.g., Main Hall, Classroom #3)"
                InputProps={{
                  startAdornment: <LocationIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormDateTimePicker
                label="Event Date & Time"
                value={formData.eventDate}
                onChange={(newValue) => setFormData({ ...formData, eventDate: newValue })}
                required
                helperText="When will this event take place?"
                tooltip="The date and time when the event will occur"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormTextField
                label="Display Duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                endAdornment="seconds"
                helperText="How long should this event be displayed on each cycle?"
                tooltip="Duration in seconds that the event will be shown before moving to the next content"
                inputProps={{ min: 5, max: 120 }}
                InputProps={{
                  startAdornment: <AccessTimeIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
          </Grid>
        </FormSection>

        <FormSection 
          title="Display Schedule" 
          description="Set when this event should appear on your screens"
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormDatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(newValue) => setFormData({ ...formData, startDate: newValue })}
                helperText="When should this event start displaying?"
                tooltip="The date when this event will start appearing on screens (leave empty for immediate display)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormDatePicker
                label="End Date"
                value={formData.endDate}
                onChange={(newValue) => setFormData({ ...formData, endDate: newValue })}
                helperText="When should this event stop displaying?"
                tooltip="The date when this event will stop appearing on screens (leave empty to display indefinitely)"
              />
            </Grid>

            <Grid item xs={12}>
              <FormSwitch
                label="Active"
                checked={formData.isActive}
                onChange={(checked) => setFormData({ ...formData, isActive: checked })}
                helperText="Toggle to enable or disable this event from displaying"
                tooltip="When disabled, this event won't appear on any screens"
              />
            </Grid>
          </Grid>
        </FormSection>
      </Box>
    </LocalizationProvider>
  );
} 