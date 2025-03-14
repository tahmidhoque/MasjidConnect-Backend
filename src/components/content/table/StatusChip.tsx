"use client";

import React from 'react';
import { Chip } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

interface StatusChipProps {
  isActive: boolean;
}

export const StatusChip: React.FC<StatusChipProps> = ({ isActive }) => {
  return (
    <Chip
      label={isActive ? 'Active' : 'Inactive'}
      color={isActive ? 'success' : 'default'}
      size="small"
      variant={isActive ? "filled" : "outlined"}
      icon={isActive ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
      sx={{ 
        minWidth: '90px',
        fontWeight: 500,
        '& .MuiChip-icon': {
          marginLeft: '4px',
        }
      }}
    />
  );
}; 