'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  FormHelperText,
  Divider,
  Grid,
  InputAdornment,
  Tooltip,
  Paper,
  Container,
  Breadcrumbs,
  Snackbar,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Info as InfoIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function AnnouncementContentPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [duration, setDuration] = useState('20');
  const [isUrgent, setIsUrgent] = useState(false);
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    if (startDate && endDate && startDate.isAfter(endDate)) {
      setError('End date must be after start date');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'ANNOUNCEMENT',
          title,
          content,
          duration: parseInt(duration, 10),
          isUrgent,
          startDate: startDate?.toISOString() || null,
          endDate: endDate?.toISOString() || null,
          isActive: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to create announcement');
      }

      setSuccessMessage('Announcement created successfully');
      
      // Navigate after a short delay to allow the user to see the success message
      setTimeout(() => {
        router.push('/screens/content');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={() => router.push('/screens/content')}
              sx={{ mb: 2 }}
            >
              Back to Content
            </Button>
          </Stack>
          
          <Typography variant="h4" component="h1" gutterBottom>
            Create Announcement
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
            Create an announcement to share important information with your community
          </Typography>
          <Divider sx={{ mb: 4 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Paper elevation={1} sx={{ p: 0, borderRadius: '12px', overflow: 'hidden' }}>
            <Box sx={{ p: 3, bgcolor: 'background.default' }}>
              <Typography variant="h6">Announcement Details</Typography>
              <Typography variant="body2" color="text.secondary">
                Fill in the information below to create your announcement
              </Typography>
            </Box>
            <Divider />
            <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                    required
                    helperText="Enter a concise title for your announcement"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    fullWidth
                    required
                    multiline
                    rows={4}
                    helperText="Enter the main message of your announcement"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Display Duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    fullWidth
                    required
                    inputProps={{ min: 5, max: 120 }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">seconds</InputAdornment>,
                    }}
                    helperText="How long should this announcement be displayed on each cycle?"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isUrgent}
                        onChange={(e) => setIsUrgent(e.target.checked)}
                        color="error"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>Mark as Urgent</Typography>
                        <Tooltip title="Urgent announcements can be styled differently on displays to grab attention">
                          <InfoIcon fontSize="small" color="action" />
                        </Tooltip>
                      </Box>
                    }
                  />
                  <FormHelperText>
                    Urgent announcements are highlighted to grab immediate attention
                  </FormHelperText>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Date Range (Optional)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Optionally set a date range when this announcement should be visible. If no dates are specified, the announcement will always be shown.
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DateTimePicker
                        label="Start Date/Time"
                        value={startDate}
                        onChange={(value) => setStartDate(value)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            variant: 'outlined',
                            helperText: 'When should this announcement start showing?'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DateTimePicker
                        label="End Date/Time"
                        value={endDate}
                        onChange={(value) => setEndDate(value)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            variant: 'outlined',
                            helperText: 'When should this announcement stop showing?'
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => router.push('/screens/content')}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isLoading}
                      startIcon={isLoading ? <CircularProgress size={20} /> : null}
                    >
                      {isLoading ? 'Creating...' : 'Create Announcement'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>
        
        {/* Success message snackbar */}
        <Snackbar 
          open={!!successMessage} 
          autoHideDuration={6000} 
          onClose={() => setSuccessMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
} 