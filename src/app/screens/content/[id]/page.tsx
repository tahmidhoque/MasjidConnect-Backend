'use client';

import { useState } from 'react';
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
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';

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

export default function PlaylistEdit({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [value, setValue] = useState(3); // Playlist Slides tab
  const [slides, setSlides] = useState<PlaylistSlide[]>([
    { id: '1', type: 'Verse / Hadith of the day', subtype: 'Verse of the day', duration: 20 },
    { id: '2', type: 'Next prayer', subtype: '', duration: 20 },
    { id: '3', type: 'Verse / Hadith of the day', subtype: 'Hadith of the day', duration: 20 },
    { id: '4', type: 'App download', subtype: '', duration: 20 },
  ]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleDeleteSlide = (id: string) => {
    setSlides(slides.filter(slide => slide.id !== id));
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Validation Alert */}
      <Alert 
        severity="info" 
        sx={{ mb: 3 }}
        action={
          <Button color="inherit" size="small">
            Validate my account
          </Button>
        }
      >
        We need to ensure that you are authorised by the mosque. Having a validated account will unlock more features and solutions insha'a Allah.
      </Alert>

      <Typography variant="h5" gutterBottom>
        Playlist
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Details" />
          <Tab label="General settings" />
          <Tab label="Colors" />
          <Tab label="Playlist Slides" />
          <Tab label="Playlist Schedule" />
        </Tabs>
      </Box>

      {/* Playlist Slides */}
      <TabPanel value={value} index={3}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          You are using the free version of Masjidbox Screens, on this version only a maximum of 5 free slides will be displayed.
        </Alert>

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