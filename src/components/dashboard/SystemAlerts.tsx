import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import CustomAlert from '@/components/ui/CustomAlert';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
}

interface SystemAlertsProps {
  alerts: SystemAlert[];
}

const SystemAlerts: React.FC<SystemAlertsProps> = ({ alerts }) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        borderRadius: '8px',
        border: '1px solid rgba(0, 0, 0, 0.08)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <WarningAmberIcon sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography variant="h6" component="h2">
          System Alerts
        </Typography>
      </Box>

      {alerts.length > 0 ? (
        <Box sx={{ mt: 2 }}>
          {alerts.map((alert) => (
            <CustomAlert
              key={alert.id}
              severity={alert.type}
              title={alert.title}
              sx={{ mb: 2 }}
            >
              <Typography variant="body2">{alert.message}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {alert.timestamp.toLocaleString()}
              </Typography>
            </CustomAlert>
          ))}
        </Box>
      ) : (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 4,
            color: 'text.secondary',
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            borderRadius: '4px'
          }}
        >
          <Typography variant="body1" sx={{ mb: 1 }}>
            No active alerts
          </Typography>
          <Typography variant="body2">
            All systems are operational
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default SystemAlerts; 