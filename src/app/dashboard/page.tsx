"use client";

import { useSession } from "next-auth/react";
import { Box, Container, Grid, Typography, Paper, CircularProgress } from '@mui/material';
import { Suspense, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { ScreenManagement } from '@/components/dashboard/ScreenManagement';
import { ContentSchedules } from '@/components/dashboard/ContentSchedules';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { DashboardAlerts } from '@/components/dashboard/DashboardAlerts';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import { DashboardData } from '@/types/dashboard';
import { useRealtimeData } from '@/lib/hooks/useRealtimeData';

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
  const { data, error, isLoading } = useRealtimeData<DashboardData>(
    fetchDashboardData,
    { refreshInterval: 30000 } // Refresh every 30 seconds
  );

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
  const onlineScreensCount = data.screens.filter(s => s.status === 'ONLINE').length;
  const schedulesCount = data.contentSchedules.length;
  const missingPrayerTimesAlert = data.alerts.missingPrayerTimes.length > 0 ? 1 : 0;
  const alertsCount = missingPrayerTimesAlert + data.alerts.offlineScreens.length;

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Typography color="text.secondary">
          Welcome back, {session?.user?.name || 'Admin'}. Here's the current status of your masjid.
        </Typography>
      </Box>
      
      {/* Dashboard metrics */}
      <DashboardMetrics 
        metrics={[
          { 
            label: 'Online Screens', 
            value: onlineScreensCount, 
            total: totalScreens > 0 ? totalScreens : undefined, 
            color: theme.palette.success.main 
          },
          { 
            label: 'Active Schedules', 
            value: schedulesCount, 
            color: theme.palette.info.main 
          },
          { 
            label: 'System Alerts', 
            value: alertsCount, 
            color: alertsCount > 0 ? theme.palette.error.main : theme.palette.success.main 
          }
        ]} 
      />
      
      <Grid container spacing={3}>
        {/* System Alerts - Always show at the top */}
        <Grid item xs={12}>
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
            <ScreenManagement screens={data.screens} />
          </Suspense>
        </Grid>
        
        {/* Content Schedules - Full width */}
        <Grid item xs={12}>
          <Suspense fallback={<Box sx={{ height: 300, bgcolor: 'background.paper', borderRadius: 2, p: 2 }} />}>
            <ContentSchedules schedules={data.contentSchedules} />
          </Suspense>
        </Grid>
      </Grid>
    </Box>
  );
} 