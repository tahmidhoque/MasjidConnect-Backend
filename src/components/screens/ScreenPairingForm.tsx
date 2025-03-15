import { useState } from 'react';
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

interface ScreenPairingFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { pairingCode: string; name: string; location?: string }) => Promise<void>;
}

export default function ScreenPairingForm({
  open,
  onClose,
  onSubmit,
}: ScreenPairingFormProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name || !pairingCode) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        pairingCode,
        name,
        location,
      });
      handleClose();
    } catch (err) {
      console.error('Error pairing device:', err);
      setError(err instanceof Error ? err.message : 'Failed to pair device');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setLocation('');
    setPairingCode('');
    setError(null);
    onClose();
  };

  return (
    <ContentModal
      open={open}
      onClose={handleClose}
      title="Add New Screen"
      actions={
        <>
          <Button 
            variant="outlined" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleSubmit}
            disabled={!pairingCode || !name || isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Pairing...' : 'Pair Device'}
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
          title="Device Information"
          description="Enter the pairing code displayed on your device and provide a name for this screen."
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormTextField
                label="Pairing Code"
                value={pairingCode}
                onChange={(e) => setPairingCode(e.target.value.toUpperCase())}
                required
                inputProps={{ maxLength: 6 }}
                helperText="Enter the 6-character code displayed on your device"
              />
            </Grid>
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
                helperText="Optional: Specify where this screen is located"
              />
            </Grid>
          </Grid>
        </FormSection>
      </Box>
    </ContentModal>
  );
} 