"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Tooltip,
  CircularProgress,
  Container,
  Divider,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { ContentTypeTable } from '@/components/content/table/ContentTypeTable';
import { StatusChip } from '@/components/content/table/StatusChip';
import { formatDate, formatDuration } from '@/lib/content-helper';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { useDataOperation } from '@/components/common/DataOperationHandler';
import { FormTextField, FormTextArea, FormDateTimePicker, FormSwitch } from '@/components/common/FormFields';

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  isUrgent: boolean;
  startDate: string;
  endDate: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export default function AnnouncementPage() {
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isUrgent: false,
    duration: 20,
    startDate: null as dayjs.Dayjs | null,
    endDate: null as dayjs.Dayjs | null,
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch items function that will be passed to the data operation hook
  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch(`/api/content/announcement?page=${page}&pageSize=${pageSize}`);
      if (!response.ok) throw new Error('Failed to fetch announcements');
      const data = await response.json();
      setItems(data.items || data);
      if (data.meta) {
        setTotalItems(data.meta.total || 0);
        setTotalPages(data.meta.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch announcements');
    }
  }, [page, pageSize]);

  // Initialize the data operation hook
  const { 
    loading, 
    error, 
    setError, 
    createItem, 
    updateItem, 
    deleteItem 
  } = useDataOperation({
    resourceName: 'announcement',
    fetchItems,
  });

  useEffect(() => {
    // Initial data fetch
    const loadData = async () => {
      try {
        await fetchItems();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load announcements');
      }
    };

    loadData();
  }, [fetchItems, setError]);

  const handleOpenModal = (item?: AnnouncementItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        content: item.content,
        isUrgent: item.isUrgent,
        duration: item.duration || 20,
        startDate: item.startDate ? dayjs(item.startDate) : null,
        endDate: item.endDate ? dayjs(item.endDate) : null,
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        content: '',
        isUrgent: false,
        duration: 20,
        startDate: null,
        endDate: null,
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setFormData({
      title: '',
      content: '',
      isUrgent: false,
      duration: 20,
      startDate: null,
      endDate: null,
    });
    setError(null);
  };

  const handleSubmit = async () => {
    // Validate form data
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }
    
    if (formData.startDate && formData.endDate && formData.startDate.isAfter(formData.endDate)) {
      setError('End date must be after start date');
      return;
    }
    
    const payload = {
      title: formData.title,
      content: formData.content,
      isUrgent: formData.isUrgent,
      duration: formData.duration,
      startDate: formData.startDate ? formData.startDate.toISOString() : null,
      endDate: formData.endDate ? formData.endDate.toISOString() : null,
    };
    
    const operation = editingItem ? updateItem : createItem;
    const operationName = editingItem ? 'update' : 'create';
    const successMessage = editingItem 
      ? 'Announcement updated successfully' 
      : 'Announcement created successfully';

    const result = await operation(async () => {
      const url = editingItem 
        ? `/api/content/announcement/${editingItem.id}` 
        : '/api/content/announcement';
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData?.message || `Failed to ${operationName} announcement`);
      }
      
      return responseData;
    }, successMessage);

    if (result.success) {
      handleCloseModal();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    await deleteItem(async () => {
      const response = await fetch(`/api/content/announcement/${id}`, {
        method: 'DELETE',
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData?.message || 'Failed to delete announcement');
      }
      
      return responseData;
    });
  };

  // Table columns configuration
  const columns = [
    {
      id: 'title',
      label: 'Title',
      render: (item: AnnouncementItem) => item.title,
    },
    {
      id: 'content',
      label: 'Content',
      render: (item: AnnouncementItem) => (
        <Tooltip title={item.content} placement="top">
          <Typography noWrap sx={{ maxWidth: 250 }}>
            {item.content}
          </Typography>
        </Tooltip>
      ),
    },
    {
      id: 'urgent',
      label: 'Urgent',
      render: (item: AnnouncementItem) => (
        item.isUrgent ? 
        <Tooltip title="This announcement is marked as urgent">
          <Typography color="error" fontWeight="medium">Urgent</Typography>
        </Tooltip> : 
        <Typography color="text.secondary">Normal</Typography>
      ),
      filterable: true,
      filterOptions: [
        { value: 'true', label: 'Urgent' },
        { value: 'false', label: 'Normal' },
      ],
    },
    {
      id: 'duration',
      label: 'Duration',
      render: (item: AnnouncementItem) => (
        <Typography>
          {item.duration || 20} seconds
        </Typography>
      ),
    },
    {
      id: 'dateRange',
      label: 'Date Range',
      render: (item: AnnouncementItem) => (
        item.startDate && item.endDate ? 
        `${formatDate(item.startDate)} - ${formatDate(item.endDate)}` : 
        <Typography color="text.secondary" fontStyle="italic">Always visible</Typography>
      ),
    },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Announcements
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Create and manage announcements to display on your screens
          </Typography>
          <Divider sx={{ mt: 2 }} />
        </Box>

        <ContentTypeTable
          items={items}
          isLoading={loading}
          subtitle="Share important information with your community through announcements"
          emptyMessage="No announcements have been added yet. Click 'Add New' to create your first announcement."
          searchEmptyMessage="No announcements match your search criteria."
          addButtonLabel="Add New"
          onAdd={() => handleOpenModal()}
          onEdit={(item: AnnouncementItem) => handleOpenModal(item)}
          onDelete={handleDelete}
          onRefresh={fetchItems}
          getItemId={(item: AnnouncementItem) => item.id}
          columns={columns}
        />
      </Box>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Dialog 
          open={modalOpen} 
          onClose={handleCloseModal} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              m: 2,
              borderRadius: '12px',
              maxWidth: { xs: 'calc(100% - 32px)', sm: '700px' }
            }
          }}
        >
          <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 'medium', pb: 1, px: '32px', pt: '24px' }}>
            {editingItem ? 'Edit Announcement' : 'New Announcement'}
            <IconButton
              aria-label="close"
              onClick={handleCloseModal}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'text.secondary',
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 2, pb: 2, px: '32px' }}>
            {error && (
              <Box sx={{ mb: 3 }}>
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              </Box>
            )}
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormTextField
                  autoFocus
                  label="Title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  helperText="Enter a concise title for your announcement"
                  tooltip="A brief, descriptive title for your announcement"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormTextArea
                  label="Content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  helperText="Enter the main message of your announcement"
                  tooltip="The detailed message that will be displayed to users"
                  rows={4}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormTextField
                  label="Display Duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  endAdornment="seconds"
                  helperText="How long should this announcement be displayed on each cycle?"
                  tooltip="Duration in seconds that the announcement will be shown before moving to the next content"
                  inputProps={{ min: 5, max: 120 }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormSwitch
                  label="Mark as Urgent"
                  checked={formData.isUrgent}
                  onChange={(checked) => setFormData({ ...formData, isUrgent: checked })}
                  helperText="Urgent announcements are highlighted on the display"
                  tooltip="Enable this to make the announcement stand out with special styling"
                  color="error"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormDateTimePicker
                  label="Start Date/Time"
                  value={formData.startDate}
                  onChange={(value) => setFormData({ ...formData, startDate: value })}
                  helperText="When should this announcement start showing?"
                  tooltip="If not set, the announcement will be shown immediately"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormDateTimePicker
                  label="End Date/Time"
                  value={formData.endDate}
                  onChange={(value) => setFormData({ ...formData, endDate: value })}
                  helperText="When should this announcement stop showing?"
                  tooltip="If not set, the announcement will be shown indefinitely"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: '32px', pb: '24px' }}>
            <Button onClick={handleCloseModal} variant="outlined">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                  {editingItem ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingItem ? 'Update' : 'Create'
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </Container>
  );
} 