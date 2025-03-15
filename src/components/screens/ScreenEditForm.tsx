import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import { FormSection } from '@/components/common/FormSection';
import { FormTextField } from '@/components/common/FormFields';
import { ContentModal } from '@/components/common/ContentModal';

interface ScreenEditFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; location?: string; orientation: 'LANDSCAPE' | 'PORTRAIT' }) => Promise<void>;
  screen: any | null;
  isNew?: boolean;
}

export default function ScreenEditForm({
  open,
  onClose,
  onSubmit,
  screen,
  isNew = false,
}: ScreenEditFormProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [orientation, setOrientation] = useState<'LANDSCAPE' | 'PORTRAIT'>('LANDSCAPE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (screen && open) {
      setName(screen.name || '');
      setLocation(screen.location || '');
      setOrientation(screen.orientation || 'LANDSCAPE');
    } else if (!screen && open) {
      // Reset form for new screen
      setName('');
      setLocation('');
      setOrientation('LANDSCAPE');
    }
  }, [screen, open]);

  const handleSubmit = async () => {
    if (!name) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        name,
        location,
        orientation,
      });
      onClose();
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ContentModal
      open={open}
      onClose={onClose}
      title={isNew ? "Add New Screen" : "Edit Screen"}
      actions={
        <>
          <Button 
            variant="outlined" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleSubmit}
            disabled={!name || isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Saving...' : isNew ? 'Add Screen' : 'Save Changes'}
          </Button>
        </>
      }
    >
      <Box sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <FormSection
          title="Screen Details"
          description={isNew 
            ? "Enter the details for the new screen." 
            : "Update the information for this screen."}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormTextField
                label="Screen Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                helperText="Give this screen a descriptive name"
              />
            </Grid>
            <Grid item xs={12}>
              <FormTextField
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                helperText="Specify where this screen is located"
              />
            </Grid>
            <Grid item xs={12}>
              <FormTextField
                label="Orientation"
                select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as 'LANDSCAPE' | 'PORTRAIT')}
                helperText="Select the screen orientation"
                SelectProps={{
                  native: true,
                }}
              >
                <option value="LANDSCAPE">Landscape</option>
                <option value="PORTRAIT">Portrait</option>
              </FormTextField>
            </Grid>
          </Grid>
        </FormSection>
      </Box>
    </ContentModal>
  );
} 