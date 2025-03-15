"use client";

import { useSession } from "next-auth/react";
import { Box, Grid, Typography, Paper, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert } from '@mui/material';
import { Suspense, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { 
  ScreenManagement, 
  QuickActions,
  RecentAnnouncements,
  PrayerTimesOverview,
  UpcomingEvents,
  MasjidStats,
  SystemAlerts,
  DashboardMetrics
} from '@/components/dashboard';
import { ContentSchedules } from '@/components/dashboard/ContentSchedules';
import { DashboardAlerts } from '@/components/dashboard/DashboardAlerts';
import { DashboardData, DashboardScreen } from '@/types/dashboard';
import { useRealtimeData } from '@/lib/hooks/useRealtimeData';
import PageHeader from '@/components/layouts/page-header';

async function fetchDashboardData(): Promise<DashboardData> {
  const response = await fetch('/api/dashboard', {
    next: { tags: ['dashboard'] },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }

  return response.json();
}

export default function DashboardPage() {
  const theme = useTheme();
  const { data: session } = useSession();
  const { data, error, isLoading, mutate } = useRealtimeData<DashboardData>(
    fetchDashboardData,
    { refreshInterval: 30000 } // Refresh every 30 seconds
  );

  // Add screen modal state
  const [pairingDialog, setPairingDialog] = useState(false);
  const [newScreenName, setNewScreenName] = useState('');
  const [location, setLocation] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [pairingError, setPairingError] = useState<string | null>(null);

  // Handle opening the pairing dialog
  const handleOpenPairingDialog = () => {
    setNewScreenName('');
    setLocation('');
    setPairingCode('');
    setPairingError(null);
    setPairingDialog(true);
  };

  // Handle closing the pairing dialog
  const handleClosePairingDialog = () => {
    setPairingDialog(false);
    setNewScreenName('');
    setLocation('');
    setPairingCode('');
    setPairingError(null);
  };

  // Handle pairing a device
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

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to pair device');
      }
      
      // Refresh dashboard data after successful pairing
      mutate();
      handleClosePairingDialog();
    } catch (error) {
      console.error('Error pairing device:', error);
      setPairingError(error instanceof Error ? error.message : 'Failed to pair device');
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: 2, 
            bgcolor: '#FFF1F0', 
            color: '#D32F2F',
            border: '1px solid #FFDAD6'
          }}
        >
          <Typography>Error loading dashboard data: {error.message}</Typography>
        </Paper>
      </Box>
    );
  }

  if (isLoading || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  // Calculate some metrics
  const totalScreens = data.screens.length;
  const onlineScreensCount = data.screens.filter((s: DashboardScreen) => s.status === 'ONLINE').length;
  const schedulesCount = data.contentSchedules.length;
  const missingPrayerTimesAlert = data.alerts.missingPrayerTimes.length > 0 ? 1 : 0;
  const alertsCount = missingPrayerTimesAlert + data.alerts.offlineScreens.length;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <PageHeader title="Dashboard" />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Welcome to your MasjidConnect dashboard. Monitor your screens, content schedules, and system status.
      </Typography>
      
      <Grid container spacing={3}>
        {/* Dashboard Metrics - Full width */}
        <Grid item xs={12}>
          <Suspense fallback={<Box sx={{ height: 100, bgcolor: 'background.paper', borderRadius: 2, p: 2 }} />}>
            <DashboardMetrics 
              onlineScreens={onlineScreensCount}
              activeSchedules={schedulesCount}
              systemAlerts={alertsCount}
            />
          </Suspense>
        </Grid>

        {/* System Alerts - Always show at the top */}
        <Grid item xs={12} id="system-alerts">
          <Suspense fallback={<Box sx={{ height: 100, bgcolor: 'background.paper', borderRadius: 2, p: 2 }} />}>
            <DashboardAlerts alerts={data.alerts} />
          </Suspense>
        </Grid>

        {/* Quick Actions - Full width */}
        <Grid item xs={12}>
          <Suspense fallback={<Box sx={{ height: 100, bgcolor: 'background.paper', borderRadius: 2, p: 2 }} />}>
            <QuickActions />
          </Suspense>
        </Grid>
        
        {/* Screen Management - Full width */}
        <Grid item xs={12}>
          <Suspense fallback={<Box sx={{ height: 300, bgcolor: 'background.paper', borderRadius: 2, p: 2 }} />}>
            <ScreenManagement 
              screens={data.screens} 
              onAddScreen={handleOpenPairingDialog}
            />
          </Suspense>
        </Grid>
        
        {/* Content Schedules - Full width */}
        <Grid item xs={12}>
          <Suspense fallback={<Box sx={{ height: 300, bgcolor: 'background.paper', borderRadius: 2, p: 2 }} />}>
            <ContentSchedules schedules={data.contentSchedules} />
          </Suspense>
        </Grid>
      </Grid>

      {/* Pair New Screen Dialog */}
      <Dialog 
        open={pairingDialog} 
        onClose={handleClosePairingDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            Add New Screen
          </Typography>
        </DialogTitle>
        <DialogContent>
          {pairingError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPairingError(null)}>
              {pairingError}
            </Alert>
          )}
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the pairing code shown on your display screen
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Pairing Code"
            fullWidth
            value={pairingCode}
            onChange={(e) => setPairingCode(e.target.value.toUpperCase())}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Screen Name"
            fullWidth
            value={newScreenName}
            onChange={(e) => setNewScreenName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Location (Optional)"
            fullWidth
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePairingDialog}>Cancel</Button>
          <Button 
            onClick={handlePairDevice}
            variant="contained"
            disabled={!pairingCode || !newScreenName}
          >
            Pair Device
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 