import { DashboardAlerts as AlertsType } from '@/types/dashboard';
import { Paper, Box, Typography, Divider, Grid, Chip, Button } from '@mui/material';
import { AlertTriangle as AlertTriangleIcon, WifiOff as WifiOffIcon, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useRouter } from 'next/navigation';

interface DashboardAlertsProps {
  alerts: AlertsType;
}

export function DashboardAlerts({ alerts }: DashboardAlertsProps) {
  const router = useRouter();
  const { missingPrayerTimes, offlineScreens } = alerts;
  
  // Determine if we're running out of prayer times
  const hasLowPrayerTimes = missingPrayerTimes.length > 0;
  const lastAvailableDate = hasLowPrayerTimes ? 
    format(addDays(new Date(), 5 - missingPrayerTimes.length), 'MMMM d, yyyy') :
    null;
  
  const hasAlerts = hasLowPrayerTimes || offlineScreens.length > 0;
  const totalAlerts = (hasLowPrayerTimes ? 1 : 0) + offlineScreens.length;

  const handleAddPrayerTimesClick = () => {
    // Navigate to the prayer times management page
    router.push('/prayer-times');
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 0,
        borderRadius: 2,
        border: hasAlerts ? '1px solid #ffcdd2' : '1px solid rgba(0,0,0,0.05)',
        bgcolor: hasAlerts ? '#ffebee' : 'background.paper',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AlertTriangleIcon size={20} color={hasAlerts ? "#d32f2f" : "#666666"} />
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
            System Alerts
          </Typography>
        </Box>
        {hasAlerts && (
          <Chip
            label={`${totalAlerts} Alert${totalAlerts !== 1 ? 's' : ''}`}
            color="error"
            size="small"
            sx={{ fontWeight: 500 }}
          />
        )}
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 2 }}>
        {!hasAlerts ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 3,
            }}
          >
            <Typography variant="body1" color="text.secondary" align="center">
              No active alerts
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              All systems are operational
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {offlineScreens.length > 0 && (
              <Grid item xs={12}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WifiOffIcon size={16} color="#d32f2f" />
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        color="error"
                        sx={{ ml: 1 }}
                      >
                        Offline Screens
                      </Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      color="error"
                      size="small"
                      sx={{ 
                        borderColor: '#d32f2f',
                        color: '#d32f2f',
                        '&:hover': {
                          borderColor: '#b71c1c',
                          bgcolor: 'rgba(211, 47, 47, 0.04)',
                        }
                      }}
                      onClick={() => router.push('/screens')}
                    >
                      Manage Screens
                    </Button>
                  </Box>
                  {offlineScreens.map((screen) => (
                    <Box
                      key={screen.id}
                      sx={{
                        p: 1.5,
                        mb: 1,
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                        border: '1px solid #ffcdd2',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="body2" fontWeight={500}>
                        {screen.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Last seen:{' '}
                        {screen.lastSeen
                          ? format(new Date(screen.lastSeen), 'MMM d, HH:mm')
                          : 'Never'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            )}

            {hasLowPrayerTimes && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    border: '1px solid #ffcdd2',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
                    <CalendarIcon size={16} color="#d32f2f" />
                    <Box sx={{ ml: 1.5 }}>
                      <Typography variant="subtitle2" fontWeight={600} color="error">
                        Prayer Times Data Required
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {missingPrayerTimes.length === 1 ? (
                          <>Prayer times available only until <b>{lastAvailableDate}</b></>
                        ) : (
                          <>Prayer times will run out on <b>{lastAvailableDate}</b></>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                  <Button 
                    variant="outlined" 
                    color="error"
                    size="small"
                    sx={{ 
                      borderColor: '#d32f2f',
                      color: '#d32f2f',
                      '&:hover': {
                        borderColor: '#b71c1c',
                        bgcolor: 'rgba(211, 47, 47, 0.04)',
                      }
                    }}
                    onClick={handleAddPrayerTimesClick}
                  >
                    Add Prayer Times
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </Box>
    </Paper>
  );
} 