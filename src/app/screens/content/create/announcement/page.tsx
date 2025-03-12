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
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export default function AnnouncementContentPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [duration, setDuration] = useState('20');
  const [hasDateRange, setHasDateRange] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    if (hasDateRange && (!startDate || !endDate)) {
      setError('Please provide both start and end dates');
      return;
    }

    if (hasDateRange && startDate && endDate && startDate > endDate) {
      setError('End date must be after start date');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // This will be implemented to call the API
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
          startDate: hasDateRange ? startDate : null,
          endDate: hasDateRange ? endDate : null,
          isActive: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create announcement');
      }

      router.push('/screens/content');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Create Announcement
      </Typography>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {error && (
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
              />

              <TextField
                label="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                fullWidth
                required
                multiline
                rows={4}
              />

              <TextField
                label="Display Duration (seconds)"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                fullWidth
                required
                inputProps={{ min: 5, max: 120 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={hasDateRange}
                    onChange={(e) => setHasDateRange(e.target.checked)}
                  />
                }
                label="Set date range for this announcement"
              />
              
              <FormHelperText>
                If enabled, the announcement will only be shown during the specified date range
              </FormHelperText>

              {hasDateRange && (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Stack spacing={2}>
                    <DateTimePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(newValue: Date | null) => setStartDate(newValue)}
                      sx={{ width: '100%' }}
                    />
                    <DateTimePicker
                      label="End Date"
                      value={endDate}
                      onChange={(newValue: Date | null) => setEndDate(newValue)}
                      sx={{ width: '100%' }}
                    />
                  </Stack>
                </LocalizationProvider>
              )}

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
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
} 