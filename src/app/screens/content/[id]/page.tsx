'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Alert,
  Card,
  CardContent,
  IconButton,
  Button,
  TextField,
  Stack,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { useContentSchedules } from '@/lib/hooks/use-content-schedules';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`playlist-tabpanel-${index}`}
      aria-labelledby={`playlist-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface PlaylistSlide {
  id: string;
  type: string;
  subtype: string;
  duration: number;
}

export default function PlaylistEdit({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [value, setValue] = useState(0); // Start with General settings tab
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [slides, setSlides] = useState<PlaylistSlide[]>([
    { id: '1', type: 'Verse / Hadith of the day', subtype: 'Verse of the day', duration: 20 },
    { id: '2', type: 'Next prayer', subtype: '', duration: 20 },
    { id: '3', type: 'Verse / Hadith of the day', subtype: 'Hadith of the day', duration: 20 },
    { id: '4', type: 'App download', subtype: '', duration: 20 },
  ]);
  const { schedules, updateSchedule } = useContentSchedules();

  // Find the current schedule
  const currentSchedule = schedules.find(s => s.id === resolvedParams.id);

  // Set initial name when schedule is loaded
  useEffect(() => {
    if (currentSchedule) {
      setName(currentSchedule.name);
    }
  }, [currentSchedule]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleDeleteSlide = (id: string) => {
    setSlides(slides.filter(slide => slide.id !== id));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setSaveError('Name is required');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await updateSchedule(resolvedParams.id, {
        name: name.trim(),
      });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {currentSchedule?.name || 'Loading...'}
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="General settings" />
          <Tab label="Schedule Slides" />
        </Tabs>
      </Box>

      {/* General Settings */}
      <TabPanel value={value} index={0}>
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Typography variant="h6">
                General Settings
              </Typography>

              {saveError && (
                <Alert severity="error" onClose={() => setSaveError(null)}>
                  {saveError}
                </Alert>
              )}

              <TextField
                label="Schedule Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                required
                error={!name.trim()}
                helperText={!name.trim() ? 'Name is required' : ''}
              />

              <Box>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={isSaving || !name.trim()}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Playlist Slides */}
      <TabPanel value={value} index={1}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {slides.map((slide, index) => (
            <Card key={slide.id}>
              <CardContent sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 2,
                py: '8px !important'
              }}>
                <DragIcon sx={{ color: 'text.disabled' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">
                    {slide.type}
                  </Typography>
                  {slide.subtype && (
                    <Typography variant="caption" color="text.secondary">
                      {slide.subtype}
                    </Typography>
                  )}
                </Box>
                <Typography variant="body2" sx={{ mx: 2 }}>
                  {slide.duration}
                </Typography>
                <IconButton size="small">
                  <SettingsIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleDeleteSlide(slide.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 2 }}
          >
            + New component
          </Button>
        </Box>
      </TabPanel>
    </Box>
  );
} 