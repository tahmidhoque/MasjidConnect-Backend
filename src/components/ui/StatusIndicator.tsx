'use client';

import React from 'react';
import { Box, alpha, useTheme } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

export type StatusType = 'ONLINE' | 'OFFLINE' | 'PAIRING' | 'ACTIVE' | 'INACTIVE';

interface StatusIndicatorProps {
  status: StatusType;
  size?: 'small' | 'medium';
  withPulse?: boolean;
}

/**
 * A reusable status indicator component that displays a status with appropriate styling.
 * 
 * @param status - The status to display (ONLINE, OFFLINE, PAIRING, ACTIVE, INACTIVE)
 * @param size - The size of the indicator (small or medium)
 * @param withPulse - Whether to show a pulsing animation for active statuses
 */
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  size = 'medium',
  withPulse = true
}) => {
  const theme = useTheme();
  
  const getStatusColor = () => {
    switch (status) {
      case 'ONLINE':
      case 'ACTIVE':
        return theme.palette.success.main;
      case 'OFFLINE':
      case 'INACTIVE':
        return theme.palette.error.main;
      case 'PAIRING':
        return theme.palette.warning.main;
      default:
        return theme.palette.text.disabled;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'ONLINE':
        return 'Online';
      case 'OFFLINE':
        return 'Offline';
      case 'PAIRING':
        return 'Pairing';
      case 'ACTIVE':
        return 'Active';
      case 'INACTIVE':
        return 'Inactive';
      default:
        return 'Unknown';
    }
  };

  const isActive = status === 'ONLINE' || status === 'ACTIVE';
  const statusColor = getStatusColor();

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: size === 'small' ? 0.5 : 0.75,
      px: size === 'small' ? 1 : 1.5,
      py: size === 'small' ? 0.25 : 0.5,
      borderRadius: '16px',
      bgcolor: alpha(statusColor, 0.1),
      border: '1px solid',
      borderColor: alpha(statusColor, 0.2),
      fontSize: size === 'small' ? '0.7rem' : '0.75rem',
      fontWeight: 500,
      color: statusColor,
      maxHeight: size === 'small' ? '20px' : '24px',
    }}>
      <FiberManualRecordIcon sx={{ 
        fontSize: size === 'small' ? '8px' : '10px',
        animation: isActive && withPulse ? 'pulse 2s infinite' : 'none',
        '@keyframes pulse': {
          '0%': { opacity: 0.6 },
          '50%': { opacity: 1 },
          '100%': { opacity: 0.6 }
        }
      }} />
      {getStatusLabel()}
    </Box>
  );
};

export default StatusIndicator; 