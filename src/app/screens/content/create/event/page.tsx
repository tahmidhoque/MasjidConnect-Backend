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
  Grid,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

export default function EventContentPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState<dayjs.Dayjs | null>(null);
  const [duration, setDuration] = useState('20');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !eventDate) {
      setError('Title, description, and event date are required');
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
          type: 'EVENT',
          title,
          content: description,
          meta: {
            location,
            eventDate: eventDate.toISOString(),
          },
          duration: parseInt(duration, 10),
          isActive: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
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
        Create Event
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
                label="Event Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
              />

              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                required
                multiline
                rows={4}
              />

              <TextField
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                fullWidth
                placeholder="e.g., Main Hall, Classroom #3"
              />

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Event Date & Time"
                  value={eventDate}
                  onChange={(newValue) => setEventDate(newValue)}
                  sx={{ width: '100%' }}
                />
              </LocalizationProvider>

              <TextField
                label="Display Duration (seconds)"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                fullWidth
                required
                inputProps={{ min: 5, max: 120 }}
              />

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
                  {isLoading ? 'Creating...' : 'Create Event'}
                </Button>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
} 