import { DashboardScreen } from '@/types/dashboard';
import { Paper, Box, Typography, Divider, Chip, Grid, Avatar } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { Monitor as MonitorIcon, WifiOff as WifiOffIcon, CheckCircle, AlertCircle } from 'lucide-react';

interface ScreenManagementProps {
  screens: DashboardScreen[];
}

export function ScreenManagement({ screens }: ScreenManagementProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return '#4caf50';
      case 'OFFLINE':
        return '#f44336';
      case 'PAIRING':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return 'Online';
      case 'OFFLINE':
        return 'Offline';
      case 'PAIRING':
        return 'Pairing';
      default:
        return status;
    }
  };

  const getLastSeenText = (lastSeen: Date | null) => {
    if (!lastSeen) return 'Never';
    return formatDistanceToNow(new Date(lastSeen), { addSuffix: true });
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 0, 
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        border: '1px solid',
        borderColor: 'rgba(0,0,0,0.05)',
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MonitorIcon size={20} />
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
            Screen Management
          </Typography>
        </Box>
        <Chip 
          label={`${screens.length} Screen${screens.length !== 1 ? 's' : ''}`} 
          variant="outlined"
          size="small"
        />
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {screens.map((screen) => (
            <Grid item xs={12} key={screen.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
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
                    {screen.status === 'ONLINE' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  </Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="body1" fontWeight={500}>
                      {screen.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {screen.location || 'No location set'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ textAlign: 'right', mr: 2 }}>
                    <Chip
                      label={getStatusLabel(screen.status)}
                      size="small"
                      sx={{
                        bgcolor: `${getStatusColor(screen.status)}20`,
                        color: getStatusColor(screen.status),
                        fontWeight: 500,
                        mb: 0.5
                      }}
                    />
                    <Typography variant="caption" display="block" color="text.secondary">
                      Last seen: {getLastSeenText(screen.lastSeen)}
                    </Typography>
                  </Box>
                  {screen.status === 'OFFLINE' && (
                    <WifiOffIcon size={18} color="#f44336" />
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}

          {screens.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No screens found. Add a screen to get started.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </Paper>
  );
} 