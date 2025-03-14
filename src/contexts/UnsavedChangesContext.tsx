'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography,
  Box,
  Paper,
  IconButton,
  Stack,
  Divider,
  Alert,
  AlertTitle,
  useTheme
} from '@mui/material';
import { 
  Warning as WarningIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  ExitToApp as ExitIcon
} from '@mui/icons-material';

interface UnsavedChangesContextType {
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  confirmNavigation: (callback: () => void) => void;
  resetNavigationState: () => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | undefined>(undefined);

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [isExternalNavigation, setIsExternalNavigation] = useState(false);
  const theme = useTheme();

  // Handle browser/tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        setIsConfirmDialogOpen(true);
        setIsExternalNavigation(true);
        // Cancel the event and show our custom dialog
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const confirmNavigation = (callback: () => void) => {
    if (hasUnsavedChanges) {
      setIsConfirmDialogOpen(true);
      setIsExternalNavigation(false);
      setPendingNavigation(() => callback);
    } else {
      callback();
    }
  };

  const handleContinueNavigation = () => {
    setIsConfirmDialogOpen(false);
    setHasUnsavedChanges(false);
    
    if (!isExternalNavigation && pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
    setIsExternalNavigation(false);
  };

  const handleCancelNavigation = () => {
    setIsConfirmDialogOpen(false);
    setPendingNavigation(null);
    setIsExternalNavigation(false);
  };

  const resetNavigationState = () => {
    setHasUnsavedChanges(false);
    setPendingNavigation(null);
    setIsConfirmDialogOpen(false);
    setIsExternalNavigation(false);
  };

  return (
    <UnsavedChangesContext.Provider
      value={{
        hasUnsavedChanges,
        setHasUnsavedChanges,
        confirmNavigation,
        resetNavigationState,
      }}
    >
      {children}
      <Dialog
        open={isConfirmDialogOpen}
        onClose={handleCancelNavigation}
        aria-labelledby="unsaved-changes-dialog-title"
        aria-describedby="unsaved-changes-dialog-description"
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            maxWidth: '500px',
            width: '100%',
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle 
          id="unsaved-changes-dialog-title"
          sx={{ 
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            py: 2.5,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontWeight: 600,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <WarningIcon sx={{ fontSize: 24 }} />
            <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
              Unsaved Changes
            </Typography>
          </Box>
          <IconButton 
            size="small" 
            onClick={handleCancelNavigation}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': { 
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.1)' 
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 4, pb: 3, px: 3 }}>
          <Alert 
            severity="warning" 
            variant="outlined"
            icon={<WarningIcon sx={{ color: '#E76F51' }}/>}
            sx={{ 
              mb: 3,
              mt: 1,
              borderColor: '#E76F51',
              borderWidth: 1,
              '& .MuiAlert-icon': {
                color: '#E76F51',
              },
              borderRadius: 1.5,
              py: 1.5,
              px: 2,
              bgcolor: 'rgba(231, 111, 81, 0.05)'
            }}
          >
            <AlertTitle sx={{ fontWeight: 600, color: '#5F3F23' }}>Your changes will be lost</AlertTitle>
            <Typography color="#5F3F23">
              You have unsaved changes on this page. If you navigate away without saving, all your changes will be lost.
            </Typography>
          </Alert>
          
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
            Would you like to save your changes before leaving, or discard them?
          </Typography>
        </DialogContent>
        
        <Divider />
        
        <DialogActions sx={{ px: 3, py: 2.5, justifyContent: 'space-between' }}>
          <Button 
            onClick={handleCancelNavigation} 
            variant="outlined"
            color="primary"
            startIcon={<SaveIcon />}
            sx={{ 
              fontWeight: 500,
              borderRadius: 1.5,
              px: 3,
              py: 1,
              borderColor: '#0A2647',
              color: '#0A2647',
              '&:hover': {
                borderColor: '#0A2647',
                bgcolor: 'rgba(10, 38, 71, 0.05)'
              }
            }}
          >
            Stay & Save
          </Button>
          <Button 
            onClick={handleContinueNavigation} 
            variant="contained"
            color="error"
            startIcon={<ExitIcon />}
            sx={{ 
              fontWeight: 500,
              borderRadius: 1.5,
              px: 3,
              py: 1,
              bgcolor: '#D62828',
              '&:hover': {
                bgcolor: '#A31F1F',
              }
            }}
          >
            Discard Changes
          </Button>
        </DialogActions>
      </Dialog>
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges() {
  const context = useContext(UnsavedChangesContext);
  if (context === undefined) {
    throw new Error('useUnsavedChanges must be used within an UnsavedChangesProvider');
  }
  return context;
} 