import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Paper,
} from '@mui/material';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  sx?: any;
}

/**
 * A reusable form section component for content forms
 * Provides consistent styling across all content type forms
 */
export function FormSection({
  title,
  description,
  children,
  className,
  sx = {},
}: FormSectionProps) {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 0, 
        borderRadius: '0',
        overflow: 'hidden', 
        mb: 0,
        ...sx 
      }}
      className={className}
    >
      <Box sx={{ p: 3, bgcolor: 'background.default' }}>
        <Typography variant="h6">{title}</Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
      <Divider />
      <Box sx={{ p: 3 }}>
        {children}
      </Box>
    </Paper>
  );
} 