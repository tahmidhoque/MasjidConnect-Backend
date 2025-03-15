"use client";

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
  Chip,
  Stack,
  Alert,
  Tooltip,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  QrCode2 as QrCodeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
  ScreenShare as ScreenIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { formatLastSeen, isScreenOnline } from '@/lib/screen-utils';
import { ContentModal } from '@/components/common/ContentModal';
import { FormSection } from '@/components/common/FormSection';
import { FormTextField } from '@/components/common/FormFields';

interface Screen {
  id: string;
  name: string;
  status: 'ONLINE' | 'OFFLINE' | 'PAIRING';
  deviceType?: string;
  location?: string;
  orientation: 'LANDSCAPE' | 'PORTRAIT';
  lastSeen?: Date;
  pairingCode?: string;
  pairingCodeExpiry?: Date;
}

export default function ScreensPage() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pairingError, setPairingError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [newScreenName, setNewScreenName] = useState('');
  const [pairingDialog, setPairingDialog] = useState(false);
  const [pairingCode, setPairingCode] = useState('');
  const [location, setLocation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // New state for modal actions
  const [modalActions, setModalActions] = useState<React.ReactNode | null>(null);

  // Fetch screens
  const fetchMasjidScreens = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/screens');
      
      if (!response.ok) {
        throw new Error('Failed to fetch screens');
      }
      
      const data = await response.json();
      setScreens(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching screens:', error);
      setError('Failed to load screens. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasjidScreens();
  }, []);

  // Handle pairing
  const handlePairDevice = async () => {
    try {
      setPairingError(null);
      const response = await fetch('/api/screens/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pairingCode,
          name: newScreenName,
          location,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to pair device');
      }
      
      await fetchMasjidScreens();
      handleClosePairingDialog();
    } catch (error) {
      console.error('Error pairing device:', error);
      setPairingError(error instanceof Error ? error.message : 'Failed to pair device');
    }
  };

  // Delete screen
  const deleteScreen = async (id: string) => {
    if (!confirm('Are you sure you want to delete this screen?')) {
      return;
    }
    
    try {
      setDeleting(true);
      const response = await fetch(`/api/screens/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete screen');
      }
      
      setScreens(prev => prev.filter(screen => screen.id !== id));
      setDeleting(false);
      setSuccess('Screen deleted successfully');
    } catch (error) {
      console.error('Error deleting screen:', error);
      setError('Failed to delete screen. Please try again.');
      setDeleting(false);
    }
  };

  const handleOpenPairingDialog = () => {
    setNewScreenName('');
    setLocation('');
    setPairingCode('');
    setPairingError(null);
    setPairingDialog(true);
  };

  const handleClosePairingDialog = () => {
    setPairingDialog(false);
    setNewScreenName('');
    setLocation('');
    setPairingCode('');
    setPairingError(null);
  };

  // Update modal actions when relevant state changes
  useEffect(() => {
    setModalActions(
      <>
        <Button 
          variant="outlined" 
          onClick={handleClosePairingDialog}
        >
          Cancel
        </Button>
        <Button 
          variant="contained"
          onClick={handlePairDevice}
          disabled={!pairingCode || !newScreenName}
          startIcon={deleting ? <CircularProgress size={20} /> : null}
        >
          Pair Device
        </Button>
      </>
    );
  }, [pairingCode, newScreenName, deleting]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Screens
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenPairingDialog}
        >
          Add Screen
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {screens.map((screen) => (
          <Grid item xs={12} md={6} lg={4} key={screen.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ScreenIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" sx={{ flex: 1 }}>
                    {screen.name}
                  </Typography>
                  <IconButton size="small" onClick={() => deleteScreen(screen.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      size="small"
                      label={screen.status}
                      color={screen.status === 'ONLINE' ? 'success' : 'default'}
                    />
                    {screen.deviceType && (
                      <Chip size="small" label={screen.deviceType} />
                    )}
                    <Chip
                      size="small"
                      label={screen.orientation?.toLowerCase() || 'landscape'}
                    />
                  </Box>

                  {screen.location && (
                    <Typography variant="body2" color="text.secondary">
                      📍 {screen.location}
                    </Typography>
                  )}

                  <Typography variant="body2" color="text.secondary">
                    Last seen: {formatLastSeen(screen.lastSeen ? new Date(screen.lastSeen) : null)}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pair New Screen Dialog */}
      <ContentModal 
        open={pairingDialog} 
        onClose={handleClosePairingDialog}
        title="Add New Screen"
        actions={modalActions}
      >
        {pairingError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setPairingError(null)}>
            {pairingError}
          </Alert>
        )}
        
        <FormSection
          title="Pairing Information"
          description="Enter the pairing code shown on your display screen and provide a name for this screen"
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormTextField
                autoFocus
                label="Pairing Code"
                value={pairingCode}
                onChange={(e) => setPairingCode(e.target.value.toUpperCase())}
                required
                helperText="Enter the 6-digit code displayed on your screen"
                tooltip="This code is used to securely connect your screen to this admin panel"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <QrCodeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormTextField
                label="Screen Name"
                value={newScreenName}
                onChange={(e) => setNewScreenName(e.target.value)}
                required
                helperText="Give this screen a descriptive name"
                tooltip="A name that helps you identify this screen, e.g., 'Main Prayer Hall'"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormTextField
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                helperText="Optional: Specify where this screen is located"
                tooltip="The physical location of this screen, e.g., 'First Floor', 'Entrance Hall'"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </FormSection>
      </ContentModal>
    </Box>
  );
} 