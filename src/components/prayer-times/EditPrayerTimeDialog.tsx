import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from '@mui/material';
import { format } from 'date-fns';
import { PrayerTime } from './PrayerTimesTable';

interface EditPrayerTimeDialogProps {
  open: boolean;
  onClose: () => void;
  selectedTime: PrayerTime | null;
  onSave: () => void;
  onTimeChange: (field: keyof PrayerTime, value: string) => void;
}

const EditPrayerTimeDialog: React.FC<EditPrayerTimeDialogProps> = ({
  open,
  onClose,
  selectedTime,
  onSave,
  onTimeChange,
}) => {
  if (!selectedTime) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          m: 2,
          width: 'calc(100% - 32px)',
          maxWidth: { xs: 'calc(100% - 32px)', sm: '600px' }
        }
      }}
    >
      <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 'medium', pb: 1, px: '32px', pt: '24px' }}>
        Edit Prayer Times
      </DialogTitle>
      <DialogContent sx={{ pt: 2, pb: 2, px: '32px' }}>
        <Stack spacing={3}>
          <TextField
            label="Date"
            value={format(selectedTime.date, 'dd/MM/yyyy')}
            disabled
            variant="outlined"
            fullWidth
          />
          <TextField
            label="Fajr"
            value={selectedTime.fajr}
            onChange={(e) => onTimeChange('fajr', e.target.value)}
            variant="outlined"
            fullWidth
          />
          <TextField
            label="Fajr Jamaat"
            value={selectedTime.fajrJamaat || ''}
            onChange={(e) => onTimeChange('fajrJamaat', e.target.value)}
            variant="outlined"
            fullWidth
          />
          <TextField
            label="Sunrise"
            value={selectedTime.sunrise || ''}
            onChange={(e) => onTimeChange('sunrise', e.target.value)}
            variant="outlined"
            fullWidth
          />
          <TextField
            label="Zuhr"
            value={selectedTime.zuhr}
            onChange={(e) => onTimeChange('zuhr', e.target.value)}
            variant="outlined"
            fullWidth
          />
          <TextField
            label="Zuhr Jamaat"
            value={selectedTime.zuhrJamaat || ''}
            onChange={(e) => onTimeChange('zuhrJamaat', e.target.value)}
            variant="outlined"
            fullWidth
          />
          <TextField
            label="Asr"
            value={selectedTime.asr}
            onChange={(e) => onTimeChange('asr', e.target.value)}
            variant="outlined"
            fullWidth
          />
          <TextField
            label="Asr Jamaat"
            value={selectedTime.asrJamaat || ''}
            onChange={(e) => onTimeChange('asrJamaat', e.target.value)}
            variant="outlined"
            fullWidth
          />
          <TextField
            label="Maghrib"
            value={selectedTime.maghrib}
            onChange={(e) => onTimeChange('maghrib', e.target.value)}
            variant="outlined"
            fullWidth
          />
          <TextField
            label="Maghrib Jamaat"
            value={selectedTime.maghribJamaat || ''}
            onChange={(e) => onTimeChange('maghribJamaat', e.target.value)}
            variant="outlined"
            fullWidth
          />
          <TextField
            label="Isha"
            value={selectedTime.isha}
            onChange={(e) => onTimeChange('isha', e.target.value)}
            variant="outlined"
            fullWidth
          />
          <TextField
            label="Isha Jamaat"
            value={selectedTime.ishaJamaat || ''}
            onChange={(e) => onTimeChange('ishaJamaat', e.target.value)}
            variant="outlined"
            fullWidth
          />
          <TextField
            label="Jummah Khutbah"
            value={selectedTime.jummahKhutbah || ''}
            onChange={(e) => onTimeChange('jummahKhutbah', e.target.value)}
            variant="outlined"
            fullWidth
          />
          <TextField
            label="Jummah Jamaat"
            value={selectedTime.jummahJamaat || ''}
            onChange={(e) => onTimeChange('jummahJamaat', e.target.value)}
            variant="outlined"
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: '32px', pb: '24px' }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={onSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPrayerTimeDialog; 