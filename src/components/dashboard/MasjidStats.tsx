import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Tooltip
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import CampaignIcon from '@mui/icons-material/Campaign';
import EventIcon from '@mui/icons-material/Event';
import ScreenshotMonitorIcon from '@mui/icons-material/ScreenshotMonitor';

interface StatItem {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
}

interface MasjidStatsProps {
  stats: {
    attendees: number;
    announcements: number;
    events: number;
    screens: number;
  };
}

const MasjidStats: React.FC<MasjidStatsProps> = ({
  stats = {
    attendees: 0,
    announcements: 0,
    events: 0,
    screens: 0
  }
}) => {
  const statItems: StatItem[] = [
    {
      label: 'Attendees',
      value: stats.attendees.toLocaleString(),
      icon: <PeopleIcon />,
      color: '#4caf50',
      change: {
        value: 12,
        isPositive: true
      }
    },
    {
      label: 'Announcements',
      value: stats.announcements.toLocaleString(),
      icon: <CampaignIcon />,
      color: '#2196f3',
      change: {
        value: 5,
        isPositive: true
      }
    },
    {
      label: 'Events',
      value: stats.events.toLocaleString(),
      icon: <EventIcon />,
      color: '#ff9800',
      change: {
        value: 2,
        isPositive: true
      }
    },
    {
      label: 'Screens',
      value: stats.screens.toLocaleString(),
      icon: <ScreenshotMonitorIcon />,
      color: '#9c27b0',
      change: {
        value: 0,
        isPositive: true
      }
    }
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '8px',
        border: '1px solid rgba(0, 0, 0, 0.08)'
      }}
    >
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 3
      }}>
        <BarChartIcon sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography variant="h6" component="h2">
          Masjid Statistics
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {statItems.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Tooltip title={`${stat.label} statistics`} arrow>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'rgba(0,0,0,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: `${stat.color}20`,
                    color: stat.color,
                    mb: 1
                  }}
                >
                  {stat.icon}
                </Box>
                
                <Typography variant="h5" component="div" fontWeight={600} sx={{ mb: 0.5 }}>
                  {stat.value}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
                
                {stat.change && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: stat.change.isPositive ? 'success.main' : 'error.main',
                      display: 'flex',
                      alignItems: 'center',
                      mt: 0.5
                    }}
                  >
                    {stat.change.isPositive ? '+' : '-'}{stat.change.value}% this month
                  </Typography>
                )}
              </Box>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default MasjidStats; 