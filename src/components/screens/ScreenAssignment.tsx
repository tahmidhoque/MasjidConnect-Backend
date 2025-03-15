import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  MenuItem,
  FormControl,
  Select,
  SelectChangeEvent,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  alpha,
  useTheme,
} from '@mui/material';
import MonitorIcon from '@mui/icons-material/Monitor';
import { Screen } from '@/types/screens';
import { ContentSchedule } from '@/types/dashboard';
import StatusIndicator from '@/components/ui/StatusIndicator';

interface ScreenAssignmentProps {
  screen: Screen;
  schedules: any[]; // Using any to avoid type conflicts between different ContentSchedule definitions
  defaultSchedule?: any; // Using any to avoid type conflicts
  onAssignSchedule: (screenId: string, scheduleId: string | null) => Promise<void>;
}

export default function ScreenAssignment({
  screen,
  schedules,
  defaultSchedule,
  onAssignSchedule,
}: ScreenAssignmentProps) {
  const theme = useTheme();
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    screen.scheduleId || null
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingScheduleId, setPendingScheduleId] = useState<string | null>(null);

  // Get the name of the currently assigned schedule
  const getScheduleName = () => {
    if (!selectedScheduleId) {
      return defaultSchedule ? `${defaultSchedule.name} (Default)` : 'None';
    }
    
    const schedule = schedules.find(s => s.id === selectedScheduleId);
    return schedule ? schedule.name : 'Unknown Schedule';
  };

  // Handle schedule selection
  const handleScheduleChange = (event: SelectChangeEvent<string>) => {
    const newScheduleId = event.target.value === 'default' ? null : event.target.value;
    setPendingScheduleId(newScheduleId);
    setConfirmOpen(true);
  };

  // Confirm schedule assignment
  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onAssignSchedule(screen.id, pendingScheduleId);
      setSelectedScheduleId(pendingScheduleId);
    } catch (error) {
      console.error('Error assigning schedule:', error);
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  // Cancel confirmation dialog
  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingScheduleId(null);
  };

  return (
    <Card sx={{ mb: 2, position: 'relative', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              position: 'relative',
              mr: 2,
            }}>
              <MonitorIcon sx={{ 
                fontSize: 40, 
                color: 'primary.main',
                opacity: screen.status === 'OFFLINE' ? 0.7 : 1
              }} />
              <Box sx={{ 
                position: 'absolute', 
                bottom: -4, 
                right: -4, 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                bgcolor: screen.status === 'ONLINE' ? theme.palette.success.main : theme.palette.error.main,
                border: '2px solid white',
              }} />
            </Box>
            <Box>
              <Typography variant="h6" component="div">
                {screen.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last seen: {screen.lastSeen ? new Date(screen.lastSeen).toLocaleString() : 'Never'}
              </Typography>
            </Box>
          </Box>
          <StatusIndicator status={screen.status} />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Current Schedule:
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {getScheduleName()}
          </Typography>

          <FormControl fullWidth size="small">
            <Select
              value={selectedScheduleId || 'default'}
              onChange={handleScheduleChange}
              displayEmpty
              disabled={loading}
            >
              <MenuItem value="default">Use Default Schedule</MenuItem>
              {schedules.map((schedule) => (
                <MenuItem key={schedule.id} value={schedule.id} disabled={!schedule.isActive}>
                  {schedule.name} {schedule.isDefault && '(Default)'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </CardContent>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={handleCancel}
      >
        <DialogTitle>Confirm Schedule Assignment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {pendingScheduleId ? 'assign' : 'reset'} the schedule for screen "{screen.name}"?
            {!pendingScheduleId && defaultSchedule && (
              <Box component="span" sx={{ display: 'block', mt: 1 }}>
                The screen will fall back to using the default schedule: {defaultSchedule.name}
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            color="primary" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Updating...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
} 