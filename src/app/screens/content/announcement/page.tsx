"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Grid,
  Tooltip,
  CircularProgress,
  Switch,
  FormControlLabel,
  Container,
  Divider,
  FormHelperText,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { ContentTypeTable } from '@/components/content/table/ContentTypeTable';
import { StatusChip } from '@/components/content/table/StatusChip';
import { formatDate, formatDuration } from '@/lib/content-helper';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    fetchItems();
  }, [page, pageSize]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/content/announcement?page=${page}&pageSize=${pageSize}`);
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data.items || data);
      if (data.meta) {
        setTotalItems(data.meta.total || 0);
        setTotalPages(data.meta.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

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
  };

  const handleSubmit = async () => {
    try {
      const url = editingItem 
        ? `/api/content/announcement/${editingItem.id}`
        : '/api/content/announcement';
      
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
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save item');
      
      await fetchItems();
      handleCloseModal();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/content/announcement/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete item');
      
      await fetchItems();
    } catch (err) {
      console.error('Error deleting announcement:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
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
                <Typography color="error">{error}</Typography>
              </Box>
            )}
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  label="Title"
                  type="text"
                  fullWidth
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  helperText="Enter a concise title for your announcement"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Content"
                  type="text"
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  helperText="Enter the main message of your announcement"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Display Duration"
                  type="number"
                  fullWidth
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">seconds</InputAdornment>,
                  }}
                  helperText="How long should this announcement be displayed on each cycle?"
                  inputProps={{ min: 5, max: 120 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isUrgent}
                      onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                      color="error"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>Mark as Urgent</Typography>
                      <Tooltip title="Urgent announcements can be styled differently on displays to grab attention">
                        <InfoIcon fontSize="small" color="action" />
                      </Tooltip>
                    </Box>
                  }
                />
                <FormHelperText>
                  Urgent announcements are highlighted to grab immediate attention
                </FormHelperText>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Date Range
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Optionally set a date range when this announcement should be visible. If no dates are specified, the announcement will always be shown.
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DateTimePicker
                      label="Start Date/Time"
                      value={formData.startDate}
                      onChange={(value) => setFormData({ ...formData, startDate: value })}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                          helperText: 'When should this announcement start showing?'
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DateTimePicker
                      label="End Date/Time"
                      value={formData.endDate}
                      onChange={(value) => setFormData({ ...formData, endDate: value })}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                          helperText: 'When should this announcement stop showing?'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: '32px', pb: '24px' }}>
            <Button onClick={handleCloseModal} variant="outlined">
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </Container>
  );
} 