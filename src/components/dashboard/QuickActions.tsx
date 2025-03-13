import { Paper, Box, Typography, Divider, Grid, Button, Tooltip } from '@mui/material';
import { Bell as BellIcon, Monitor as MonitorIcon, Calendar as CalendarIcon, AlertTriangle as AlertTriangleIcon } from 'lucide-react';
import { useTheme } from '@mui/material/styles';

interface QuickAction {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  color: string;
}

export function QuickActions() {
  const theme = useTheme();

  const actions: QuickAction[] = [
    {
      icon: <BellIcon size={22} />,
      title: 'Emergency Alert',
      description: 'Display an urgent message on all screens',
      color: theme.palette.error.main,
      onClick: () => {
        // TODO: Implement emergency announcement
        console.log('Emergency announcement clicked');
      },
    },
    {
      icon: <MonitorIcon size={22} />,
      title: 'Screen Override',
      description: 'Override content on specific screens',
      color: theme.palette.primary.main,
      onClick: () => {
        // TODO: Implement screen override
        console.log('Screen override clicked');
      },
    },
    {
      icon: <CalendarIcon size={22} />,
      title: 'Prayer Time Adjustment',
      description: 'Adjust prayer times for today',
      color: theme.palette.secondary.main,
      onClick: () => {
        // TODO: Implement prayer time adjustment
        console.log('Prayer time adjustment clicked');
      },
    },
    {
      icon: <AlertTriangleIcon size={22} />,
      title: 'Screen Pairing',
      description: 'Generate pairing code for new screen',
      color: theme.palette.info.main,
      onClick: () => {
        // TODO: Implement screen pairing
        console.log('Screen pairing clicked');
      },
    },
  ];

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
      <Box sx={{ p: 2.5 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Quick Actions
        </Typography>
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 2.5 }}>
        <Grid container spacing={2}>
          {actions.map((action, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Tooltip title={action.description} placement="top">
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={action.onClick}
                  startIcon={
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: action.color,
                      }}
                    >
                      {action.icon}
                    </Box>
                  }
                  sx={{
                    py: 1,
                    justifyContent: 'flex-start',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'rgba(0,0,0,0.08)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.08)',
                      borderColor: `${action.color}40`,
                      bgcolor: 'rgba(0,0,0,0.01)',
                    }
                  }}
                >
                  <Typography variant="body2" fontWeight={600} color="text.primary" noWrap>
                    {action.title}
                  </Typography>
                </Button>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
} 