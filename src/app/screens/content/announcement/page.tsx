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
  Card,
  CardContent,
  CardActions,
  Grid,
  Tooltip,
  CircularProgress,
  Switch,
  FormControlLabel,
  Container,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { ContentTypeTable } from '@/components/content/table/ContentTypeTable';
import { StatusChip } from '@/components/content/table/StatusChip';
import { formatDate, formatDuration } from '@/lib/content-helper';

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  isUrgent: boolean;
  startDate: string;
  endDate: string;
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
    startDate: '',
    endDate: '',
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
        startDate: item.startDate.split('T')[0], // Format date for input
        endDate: item.endDate.split('T')[0],
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        content: '',
        isUrgent: false,
        startDate: '',
        endDate: '',
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
      startDate: '',
      endDate: '',
    });
  };

  const handleSubmit = async () => {
    try {
      const url = editingItem 
        ? `/api/content/announcement/${editingItem.id}`
        : '/api/content/announcement';
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save item');
      
      await fetchItems();
      handleCloseModal();
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
      id: 'dateRange',
      label: 'Date Range',
      render: (item: AnnouncementItem) => (
        `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`
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

      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Announcement' : 'New Announcement'}
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Content"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.isUrgent}
                onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
              />
            }
            label="Urgent"
            sx={{ mb: 2, display: 'block' }}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="End Date"
                type="date"
                fullWidth
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 