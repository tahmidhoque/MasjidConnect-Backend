import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid,
  Chip
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface PrayerTime {
  name: string;
  time: string;
  jamaatTime?: string;
  isNext: boolean;
  isCurrent: boolean;
}

interface PrayerTimesOverviewProps {
  prayerTimes: PrayerTime[];
  date: Date;
  onViewAll: () => void;
}

const PrayerTimesOverview: React.FC<PrayerTimesOverviewProps> = ({
  prayerTimes = [],
  date = new Date(),
  onViewAll = () => console.log('View all clicked')
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '8px',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="h6" component="h2">
            Prayer Times
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary">
          {formatDate(date)}
        </Typography>
      </Box>

      {prayerTimes.length > 0 ? (
        <>
          <Grid container spacing={2} sx={{ mb: 2, flex: 1 }}>
            {prayerTimes.map((prayer) => (
              <Grid item xs={12} key={prayer.name}>
                <Box 
                  sx={{ 
                    p: 2, 
                    borderRadius: 1, 
                    border: '1px solid',
                    borderColor: prayer.isNext ? 'primary.main' : 'rgba(0,0,0,0.05)',
                    bgcolor: prayer.isNext ? 'primary.light' : prayer.isCurrent ? 'success.light' : 'transparent',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography 
                        variant="subtitle2" 
                        component="div"
                        color={prayer.isNext || prayer.isCurrent ? 'white' : 'text.primary'}
                      >
                        {prayer.name}
                        {prayer.isNext && (
                          <Chip 
                            label="Next" 
                            size="small" 
                            color="primary"
                            sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                        {prayer.isCurrent && (
                          <Chip 
                            label="Current" 
                            size="small" 
                            color="success"
                            sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Typography>
                      
                      {prayer.jamaatTime && (
                        <Typography 
                          variant="caption" 
                          color={prayer.isNext || prayer.isCurrent ? 'white' : 'text.secondary'}
                        >
                          Jamaat: {prayer.jamaatTime}
                        </Typography>
                      )}
                    </Box>
                    
                    <Typography 
                      variant="h6" 
                      component="div"
                      color={prayer.isNext || prayer.isCurrent ? 'white' : 'text.primary'}
                      fontWeight={prayer.isNext || prayer.isCurrent ? 700 : 500}
                    >
                      {prayer.time}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="text" 
              endIcon={<ArrowForwardIcon />}
              onClick={onViewAll}
            >
              View All Prayer Times
            </Button>
          </Box>
        </>
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
            gap: 2,
            flex: 1
          }}
        >
          <Typography variant="body1">
            No prayer times available for today.
          </Typography>

          <Button
            variant="outlined"
            onClick={onViewAll}
          >
            Configure Prayer Times
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default PrayerTimesOverview; 