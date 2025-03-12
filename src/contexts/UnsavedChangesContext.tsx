'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography 
} from '@mui/material';

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

  // Add warning before browser/tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const confirmNavigation = (callback: () => void) => {
    if (hasUnsavedChanges) {
      setIsConfirmDialogOpen(true);
      setPendingNavigation(() => callback);
    } else {
      callback();
    }
  };

  const handleContinueNavigation = () => {
    setIsConfirmDialogOpen(false);
    setHasUnsavedChanges(false);
    
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  };

  const handleCancelNavigation = () => {
    setIsConfirmDialogOpen(false);
    setPendingNavigation(null);
  };

  const resetNavigationState = () => {
    setHasUnsavedChanges(false);
    setPendingNavigation(null);
    setIsConfirmDialogOpen(false);
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
      >
        <DialogTitle id="unsaved-changes-dialog-title">
          Unsaved Changes
        </DialogTitle>
        <DialogContent>
          <Typography id="unsaved-changes-dialog-description">
            You have unsaved changes. If you leave this page, your changes will be lost.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelNavigation} color="primary">
            Stay on Page
          </Button>
          <Button onClick={handleContinueNavigation} color="error" autoFocus>
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