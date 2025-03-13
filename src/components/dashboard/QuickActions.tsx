import React from 'react';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MonitorIcon from '@mui/icons-material/Monitor';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LinkIcon from '@mui/icons-material/Link';

interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
}

interface QuickActionsProps {
  actions?: QuickAction[];
}

const defaultActions: QuickAction[] = [
  {
    id: 'emergency-alert',
    title: 'Emergency Alert',
    icon: <NotificationsActiveIcon />,
    onClick: () => console.log('Emergency Alert clicked'),
    color: '#D62828', // Using error color
  },
  {
    id: 'screen-override',
    title: 'Screen Override',
    icon: <MonitorIcon />,
    onClick: () => console.log('Screen Override clicked'),
  },
  {
    id: 'prayer-time-adjustment',
    title: 'Prayer Time Adjustment',
    icon: <AccessTimeIcon />,
    onClick: () => console.log('Prayer Time Adjustment clicked'),
    color: '#2A9D8F', // Using success color
  },
  {
    id: 'screen-pairing',
    title: 'Screen Pairing',
    icon: <LinkIcon />,
    onClick: () => console.log('Screen Pairing clicked'),
    color: '#219EBC', // Using info color
  },
];

const QuickActions: React.FC<QuickActionsProps> = ({ actions = defaultActions }) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        borderRadius: '8px',
        border: '1px solid rgba(0, 0, 0, 0.08)'
      }}
    >
      <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
        Quick Actions
      </Typography>

      <Grid container spacing={2}>
        {actions.map((action) => (
          <Grid item xs={12} sm={6} md={3} key={action.id}>
            <Button
              variant="outlined"
              startIcon={action.icon}
              onClick={action.onClick}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                p: 2,
                borderColor: 'rgba(0, 0, 0, 0.12)',
                color: action.color || 'text.primary',
                '&:hover': {
                  borderColor: action.color || 'primary.main',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                },
                '& .MuiButton-startIcon': {
                  color: action.color || 'inherit',
                },
              }}
            >
              {action.title}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default QuickActions; 