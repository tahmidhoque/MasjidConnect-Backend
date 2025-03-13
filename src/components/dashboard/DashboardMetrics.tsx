import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import MonitorIcon from '@mui/icons-material/Monitor';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useRouter } from 'next/navigation';

interface DashboardMetricsProps {
  onlineScreens: number;
  activeSchedules: number;
  systemAlerts: number;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  onlineScreens = 0,
  activeSchedules = 0,
  systemAlerts = 0
}) => {
  const router = useRouter();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={4}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '8px',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            height: '100%',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              transform: 'translateY(-2px)'
            }
          }}
          onClick={() => router.push('/screens')}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Online Screens
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MonitorIcon sx={{ color: 'success.main', fontSize: 28 }} />
              <Typography variant="h3" component="div" color="success.main" fontWeight="bold">
                {onlineScreens}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={4}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '8px',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            height: '100%',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              transform: 'translateY(-2px)'
            }
          }}
          onClick={() => router.push('/content')}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Active Schedules
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarMonthIcon sx={{ color: 'primary.main', fontSize: 28 }} />
              <Typography variant="h3" component="div" color="primary.main" fontWeight="bold">
                {activeSchedules}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={4}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '8px',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            height: '100%',
            cursor: systemAlerts > 0 ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
            '&:hover': systemAlerts > 0 ? {
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              transform: 'translateY(-2px)'
            } : {}
          }}
          onClick={() => systemAlerts > 0 && window.scrollTo({ top: document.getElementById('system-alerts')?.offsetTop || 0, behavior: 'smooth' })}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              System Alerts
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningAmberIcon sx={{ color: systemAlerts > 0 ? 'error.main' : 'text.secondary', fontSize: 28 }} />
              <Typography 
                variant="h3" 
                component="div" 
                color={systemAlerts > 0 ? 'error.main' : 'text.secondary'} 
                fontWeight="bold"
              >
                {systemAlerts}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DashboardMetrics; 