import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface ContentModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  actions?: React.ReactNode;
}

/**
 * A reusable modal component for content creation/editing
 * Provides consistent styling across all content type modals
 */
export function ContentModal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'md',
  actions,
}: ContentModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
          px: 3,
          mb: 0,
        }}
      >
        <Typography 
          variant="h6" 
          component="div" 
          fontWeight={600}
        >
          {title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{ color: 'primary.contrastText' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent 
        sx={{ 
          p: 0, 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
        }}
      >
        {children}
      </DialogContent>
      {actions && (
        <>
          <Divider />
          <DialogActions 
            sx={{ 
              p: 2, 
              justifyContent: 'flex-end',
              bgcolor: 'background.paper',
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            {actions}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
} 