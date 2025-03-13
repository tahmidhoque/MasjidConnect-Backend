import React from 'react';
import { Box, Typography, Paper, Button, Chip, Avatar } from '@mui/material';
import MonitorIcon from '@mui/icons-material/Monitor';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { ScreenStatus } from '@prisma/client';

interface Screen {
  id: string;
  name: string;
  status: ScreenStatus;
  lastSeen?: Date | null;
}

interface ScreenManagementProps {
  screens: Screen[];
  onAddScreen: () => void;
}

const ScreenManagement: React.FC<ScreenManagementProps> = ({ 
  screens = [], 
  onAddScreen = () => console.log('Add screen clicked') 
}) => {
  const getStatusColor = (status: ScreenStatus) => {
    switch (status) {
      case 'ONLINE': return 'success.main';
      case 'OFFLINE': return 'error.main';
      case 'PAIRING': return 'warning.main';
      default: return 'text.secondary';
    }
  };

  const getStatusLabel = (status: ScreenStatus) => {
    switch (status) {
      case 'ONLINE': return 'Online';
      case 'OFFLINE': return 'Offline';
      case 'PAIRING': return 'Pairing';
      default: return 'Unknown';
    }
  };

  const getLastSeenText = (lastSeen?: Date | null) => {
    if (!lastSeen) return 'Never';
    
    // Simple formatting for demo purposes
    return lastSeen.toLocaleString();
  };

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
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MonitorIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="h6" component="h2">
            Screen Management
          </Typography>
        </Box>
        
        <Chip 
          label={`${screens.length} Screens`} 
          size="small" 
          color={screens.length > 0 ? "primary" : "default"}
        />
      </Box>

      {screens.length > 0 ? (
        <Box>
          {screens.map((screen) => (
            <Paper
              key={screen.id}
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid',
                borderColor: 'rgba(0,0,0,0.05)',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.01)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 38, 
                    height: 38, 
                    bgcolor: `${getStatusColor(screen.status)}20`,
                    color: getStatusColor(screen.status)
                  }}
                >
                  {screen.status === 'ONLINE' ? <CheckCircleIcon fontSize="small" /> : <ErrorIcon fontSize="small" />}
                </Avatar>
                <Box sx={{ ml: 2 }}>
                  <Typography variant="body1" fontWeight={500}>
                    {screen.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last seen: {getLastSeenText(screen.lastSeen)}
                  </Typography>
                </Box>
              </Box>
              
              <Chip
                label={getStatusLabel(screen.status)}
                size="small"
                sx={{
                  bgcolor: `${getStatusColor(screen.status)}20`,
                  color: getStatusColor(screen.status),
                  fontWeight: 500
                }}
              />
            </Paper>
          ))}
        </Box>
      ) : (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 4,
            color: 'text.secondary',
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant="body1">
            No screens found. Add a screen to get started.
          </Typography>
          
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            onClick={onAddScreen}
          >
            Add a screen
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ScreenManagement; 