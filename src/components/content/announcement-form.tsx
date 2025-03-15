import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  NotificationsActive as UrgentIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { ContentType } from '@prisma/client';
import { createContentItem, updateContentItem, ContentItemData } from '@/lib/services/content';
import { FormTextField, FormTextArea, FormDateTimePicker, FormDatePicker, FormSwitch } from '@/components/common/FormFields';
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext';
import { FormSection } from '@/components/common/FormSection';

interface AnnouncementFormProps {
  initialData?: ContentItemData;
  onSuccess?: () => void;
  onCancel?: () => void;
  setFormActions?: (actions: React.ReactNode) => void;
}

export function AnnouncementForm({ initialData, onSuccess, onCancel, setFormActions }: AnnouncementFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setHasUnsavedChanges } = useUnsavedChanges();
  
  // Extract meta data from content field if it exists
  const getInitialMetaData = () => {
    if (!initialData?.content) return { isUrgent: false };
    
    try {
      const content = typeof initialData.content === 'string' 
        ? JSON.parse(initialData.content) 
        : initialData.content;
        
      return {
        isUrgent: content.isUrgent || false
      };
    } catch (e) {
      console.error('Error parsing content data:', e);
      return { isUrgent: false };
    }
  };
  
  const { isUrgent } = getInitialMetaData();
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content?.text || '',
    type: ContentType.ANNOUNCEMENT,
    duration: initialData?.duration || 20,
    isActive: initialData?.isActive ?? true,
    startDate: initialData?.startDate ? dayjs(initialData.startDate) : null,
    endDate: initialData?.endDate ? dayjs(initialData.endDate) : null,
    isUrgent: isUrgent,
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
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create content object with meta data
      const contentData = {
        text: formData.content,
      };

      const apiData = {
        title: formData.title,
        type: ContentType.ANNOUNCEMENT,
        content: contentData,
        duration: formData.duration,
        isActive: formData.isActive,
        startDate: formData.startDate ? formData.startDate.toDate() : undefined,
        endDate: formData.endDate ? formData.endDate.toDate() : undefined,
      };

      console.log('Saving announcement:', initialData ? 'UPDATE' : 'CREATE', apiData);

      if (initialData) {
        await updateContentItem({ id: initialData.id, ...apiData });
        console.log('Announcement updated successfully');
      } else {
        await createContentItem(apiData);
        console.log('Announcement created successfully');
      }

      setHasUnsavedChanges(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving announcement:', error);
      
      // Provide more detailed error message
      if (error instanceof Error) {
        setError(`Failed to save: ${error.message}`);
      } else {
        setError('An unexpected error occurred while saving. Please try again.');
      }
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
            form="announcement-form"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Announcement' : 'Create Announcement'}
          </Button>
        </>
      );
    }
  }, [isLoading, initialData, onCancel, setFormActions]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box 
        component="form" 
        id="announcement-form"
        onSubmit={handleSubmit}
        noValidate
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormSection 
          title="Announcement Details" 
          description="Fill in the information below to create your announcement"
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
                helperText="Enter a concise title for your announcement"
                tooltip="A brief, descriptive title for your announcement that will be displayed on screens"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormTextArea
                label="Content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                helperText="Enter the main message of your announcement"
                tooltip="The detailed message that will be displayed to users"
                rows={4}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormTextField
                label="Display Duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                endAdornment="seconds"
                helperText="How long should this announcement be displayed on each cycle?"
                tooltip="Duration in seconds that the announcement will be shown before moving to the next content"
                inputProps={{ min: 5, max: 120 }}
                InputProps={{
                  startAdornment: <AccessTimeIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isUrgent}
                    onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                    color="warning"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <UrgentIcon color={formData.isUrgent ? "warning" : "disabled"} />
                    <Typography>Mark as Urgent</Typography>
                  </Box>
                }
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 9, mt: 0.5 }}>
                Urgent announcements are highlighted on the display
              </Typography>
            </Grid>
          </Grid>
        </FormSection>

        <FormSection 
          title="Display Schedule" 
          description="Set when this announcement should appear on your screens"
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormDatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(newValue) => setFormData({ ...formData, startDate: newValue })}
                helperText="When should this announcement start displaying?"
                tooltip="The date when this announcement will start appearing on screens (leave empty for immediate display)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormDatePicker
                label="End Date"
                value={formData.endDate}
                onChange={(newValue) => setFormData({ ...formData, endDate: newValue })}
                helperText="When should this announcement stop displaying?"
                tooltip="The date when this announcement will stop appearing on screens (leave empty to display indefinitely)"
              />
            </Grid>

            <Grid item xs={12}>
              <FormSwitch
                label="Active"
                checked={formData.isActive}
                onChange={(checked) => setFormData({ ...formData, isActive: checked })}
                helperText="Toggle to enable or disable this announcement from displaying"
                tooltip="When disabled, this announcement won't appear on any screens"
              />
            </Grid>
          </Grid>
        </FormSection>
      </Box>
    </LocalizationProvider>
  );
} 