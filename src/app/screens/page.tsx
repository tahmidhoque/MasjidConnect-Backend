"use client";

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  ScreenShare as ScreenIcon,
} from '@mui/icons-material';
import { useScreens } from '@/lib/hooks/use-screens';
import { useRouter } from 'next/navigation';
import ScreenCard from '@/components/screens/ScreenCard';
import PageHeader from '@/components/layouts/page-header';
import ScreenEditForm from '@/components/screens/ScreenEditForm';
import ScreenPairingForm from '@/components/screens/ScreenPairingForm';

export default function ScreensPage() {
  const router = useRouter();
  const { screens, loading, error, fetchScreens, updateScreen, deleteScreen } = useScreens();
  
  const [openPairingDialog, setOpenPairingDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle pairing
  const handlePairDevice = async (data: { pairingCode: string; name: string; location?: string }) => {
    try {
      const response = await fetch('/api/screens/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to pair device');
      }
      
      await fetchScreens();
    } catch (error) {
      console.error('Error pairing device:', error);
      throw error;
    }
  };

  // Update screen
  const handleUpdateScreen = async (data: { name: string; location?: string; orientation: 'LANDSCAPE' | 'PORTRAIT' }) => {
    if (!selectedScreen) return;
    
    try {
      await updateScreen(selectedScreen.id, data);
    } catch (error) {
      console.error('Error updating screen:', error);
      throw error;
    }
  };

  // Delete screen
  const handleDeleteScreen = async () => {
    if (!selectedScreen) return;
    
    try {
      setIsSubmitting(true);
      await deleteScreen(selectedScreen.id);
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error deleting screen:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenPairingDialog = () => {
    setOpenPairingDialog(true);
  };

  const handleClosePairingDialog = () => {
    setOpenPairingDialog(false);
  };

  const handleOpenEditDialog = (screen: any) => {
    setSelectedScreen(screen);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedScreen(null);
  };

  const handleOpenDeleteDialog = (screen: any) => {
    setSelectedScreen(screen);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedScreen(null);
  };

  const handleViewScreenContent = (screenId: string) => {
    router.push(`/screens/content?screenId=${screenId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <PageHeader
          title="Screens"
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenPairingDialog}
        >
          Add Screen
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {screens.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <ScreenIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Screens Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You haven't added any screens yet. Add a screen to start displaying content.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenPairingDialog}
          >
            Add Screen
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {screens.map((screen) => (
            <Grid item xs={12} md={6} lg={4} key={screen.id}>
              <ScreenCard
                screen={screen}
                onEdit={handleOpenEditDialog}
                onDelete={handleOpenDeleteDialog}
                onViewContent={handleViewScreenContent}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pairing Dialog */}
      <ScreenPairingForm
        open={openPairingDialog}
        onClose={handleClosePairingDialog}
        onSubmit={handlePairDevice}
      />

      {/* Edit Screen Dialog */}
      <ScreenEditForm
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        onSubmit={handleUpdateScreen}
        screen={selectedScreen}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'error.contrastText' }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText>
            Are you sure you want to delete the screen "{selectedScreen?.name}"? This action cannot be undone.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, fontWeight: 'bold' }}>
            Warning: This will permanently remove the screen from your masjid and any content assignments.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDeleteDialog}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteScreen}
            color="error"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Deleting...' : 'Delete Screen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 