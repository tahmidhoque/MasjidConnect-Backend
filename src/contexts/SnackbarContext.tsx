'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

type SnackbarMessage = {
  message: string;
  severity: AlertColor;
  autoHideDuration?: number;
};

interface SnackbarContextType {
  showSnackbar: (message: string, severity?: AlertColor, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  hideSnackbar: () => void;
}

// Create context with a default value
const SnackbarContext = createContext<SnackbarContextType>({
  showSnackbar: () => {},
  showSuccess: () => {},
  showError: () => {},
  showInfo: () => {},
  showWarning: () => {},
  hideSnackbar: () => {},
});

// Custom hook for using the Snackbar context
export const useSnackbar = () => useContext(SnackbarContext);

interface SnackbarProviderProps {
  children: ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage>({
    message: '',
    severity: 'success',
    autoHideDuration: 6000,
  });

  const showSnackbar = (
    message: string, 
    severity: AlertColor = 'success', 
    autoHideDuration = 6000
  ) => {
    setSnackbarMessage({ message, severity, autoHideDuration });
    setOpen(true);
  };

  const showSuccess = (message: string, duration?: number) => {
    showSnackbar(message, 'success', duration);
  };

  const showError = (message: string, duration?: number) => {
    showSnackbar(message, 'error', duration);
  };

  const showInfo = (message: string, duration?: number) => {
    showSnackbar(message, 'info', duration);
  };

  const showWarning = (message: string, duration?: number) => {
    showSnackbar(message, 'warning', duration);
  };

  const hideSnackbar = () => {
    setOpen(false);
  };

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <SnackbarContext.Provider 
      value={{ 
        showSnackbar, 
        showSuccess, 
        showError, 
        showInfo, 
        showWarning, 
        hideSnackbar 
      }}
    >
      {children}
      <Snackbar
        open={open}
        autoHideDuration={snackbarMessage.autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleClose} 
          severity={snackbarMessage.severity} 
          sx={{ 
            width: '100%',
            boxShadow: 2,
            '& .MuiAlert-message': { fontWeight: 500 }
          }}
        >
          {snackbarMessage.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export default SnackbarContext; 