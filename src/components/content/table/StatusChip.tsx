"use client";

import React from 'react';
import StatusIndicator from '@/components/ui/StatusIndicator';

interface StatusChipProps {
  isActive: boolean;
}

export const StatusChip: React.FC<StatusChipProps> = ({ isActive }) => {
  return (
    <StatusIndicator 
      status={isActive ? 'ACTIVE' : 'INACTIVE'} 
      size="small"
    />
  );
}; 