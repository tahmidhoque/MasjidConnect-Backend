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
  Divider,
  InputAdornment,
  Chip,
  Container,
} from '@mui/material';
import {
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  Description as DescriptionIcon,
  AccessTime as AccessTimeIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { ContentTypeTable } from '@/components/content/table/ContentTypeTable';
import { formatDate } from '@/lib/content-helper';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { FormTextField, FormTextArea, FormDateTimePicker, FormSwitch } from '@/components/common/FormFields';
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext';
import { ContentForm } from '@/components/content/content-form';
import { EventForm } from '@/components/content/event-form';
import { ContentType } from '@prisma/client';
import { ContentItemData } from '@/lib/services/content';
import { ContentModal } from '@/components/common/ContentModal';
import CustomAlert from '@/components/ui/CustomAlert';
import StatusIndicator, { StatusType } from '@/components/ui/StatusIndicator';

// Custom status chip component for event status
interface StatusChipProps {
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

const StatusChip: React.FC<StatusChipProps> = ({ label, color }) => {
  // Map the color and label to a status type
  const getStatusType = (): StatusType => {
    if (label === 'Active' || label === 'Yes') return 'ACTIVE';
    if (label === 'Inactive' || label === 'No') return 'INACTIVE';
    if (color === 'success') return 'ACTIVE';
    if (color === 'error') return 'INACTIVE';
    return label === 'Online' ? 'ONLINE' : 'OFFLINE';
  };
  
  return (
    <StatusIndicator 
      status={getStatusType()} 
      size="small"
    />
  );
};

interface EventItem {
  id: string;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  isHighlighted: boolean;
  duration: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function EventPage() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EventItem | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalActions, setModalActions] = useState<React.ReactNode | null>(null);
  
  const { showSnackbar } = useSnackbar();
  const { setHasUnsavedChanges } = useUnsavedChanges();

  // Fetch items function
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/content/event?page=${page}&pageSize=${pageSize}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setItems(data.items || data);
      if (data.meta) {
        setTotalItems(data.meta.total || 0);
        setTotalPages(data.meta.totalPages || 0);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleOpenModal = (item?: EventItem) => {
    setEditingItem(item || null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/content/event?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete event');
      }

      showSnackbar('Event deleted successfully', 'success');
      fetchItems();
    } catch (err) {
      console.error('Error deleting event:', err);
      showSnackbar(err instanceof Error ? err.message : 'An error occurred while deleting', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Define columns for the ContentTypeTable
  const columns = [
    {
      id: 'title',
      label: 'Title',
      render: (item: EventItem) => (
        <Tooltip title={item.title} placement="top">
          <Typography variant="body2" noWrap sx={{ fontWeight: 'medium' }}>
            {item.title}
          </Typography>
        </Tooltip>
      )
    },
    {
      id: 'description',
      label: 'Description',
      render: (item: EventItem) => (
        <Tooltip title={item.description} placement="top">
          <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
            {item.description || 'No description provided'}
          </Typography>
        </Tooltip>
      )
    },
    {
      id: 'location',
      label: 'Location',
      render: (item: EventItem) => (
        <Tooltip title={item.location} placement="top">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="body2" noWrap>
              {item.location || 'No location specified'}
            </Typography>
          </Box>
        </Tooltip>
      ),
      filterable: true,
      filterOptions: [
        { value: 'all', label: 'All Locations' },
        { value: 'Online', label: 'Online' },
        { value: 'Main Hall', label: 'Main Hall' },
        { value: 'Meeting Room', label: 'Meeting Room' },
        { value: 'Prayer Hall', label: 'Prayer Hall' },
        { value: 'Community Center', label: 'Community Center' }
      ]
    },
    {
      id: 'eventDate',
      label: 'Event Date',
      render: (item: EventItem) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EventIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2">
            {item.eventDate ? formatDate(item.eventDate) : 'N/A'}
          </Typography>
        </Box>
      )
    },
    {
      id: 'duration',
      label: 'Display Duration',
      render: (item: EventItem) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2">
            {item.duration || 15} seconds
          </Typography>
        </Box>
      )
    },
    {
      id: 'dateRange',
      label: 'Display Period',
      render: (item: EventItem) => (
        <Tooltip 
          title={
            item.startDate && item.endDate ? 
            `From ${formatDate(item.startDate)} to ${formatDate(item.endDate)}` : 
            'No specific display period set'
          } 
          placement="top"
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DateRangeIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="body2" noWrap>
              {item.startDate && item.endDate ? 
                `${formatDate(item.startDate)} - ${formatDate(item.endDate)}` : 
                <Typography component="span" color="text.secondary" sx={{ fontStyle: 'italic' }}>Always visible</Typography>
              }
            </Typography>
          </Box>
        </Tooltip>
      )
    },
    {
      id: 'isActive',
      label: 'Status',
      render: (item: EventItem) => (
        <StatusChip 
          label={item.isActive ? 'Active' : 'Inactive'} 
          color={item.isActive ? 'success' : 'error'} 
        />
      ),
      filterable: true,
      filterOptions: [
        { value: 'all', label: 'All' },
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' }
      ]
    },
    {
      id: 'isHighlighted',
      label: 'Highlighted',
      render: (item: EventItem) => (
        <StatusChip 
          label={item.isHighlighted ? 'Yes' : 'No'} 
          color={item.isHighlighted ? 'primary' : 'default'} 
        />
      ),
      filterable: true,
      filterOptions: [
        { value: 'all', label: 'All' },
        { value: 'Yes', label: 'Yes' },
        { value: 'No', label: 'No' }
      ]
    }
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {error && (
          <CustomAlert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            <Typography variant="body2">{error}</Typography>
          </CustomAlert>
        )}
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Events
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Create and manage events to display on your screens
          </Typography>
          <Divider sx={{ mt: 2 }} />
        </Box>

        <ContentTypeTable
          items={items}
          isLoading={loading}
          subtitle="Schedule and promote upcoming events for your community"
          emptyMessage="No events found. Click 'Add Event' to create your first event."
          searchEmptyMessage="No events match your search criteria."
          addButtonLabel="Add Event"
          onAdd={() => handleOpenModal()}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          onRefresh={fetchItems}
          getItemId={(item) => item.id}
          columns={columns}
        />
      </Box>

      <ContentModal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Edit Event' : 'Create Event'}
        actions={modalActions}
      >
        <EventForm
          initialData={editingItem ? {
            id: editingItem.id,
            title: editingItem.title,
            content: {
              description: editingItem.description,
              location: editingItem.location,
              eventDate: editingItem.eventDate,
              isHighlighted: false
            },
            type: ContentType.EVENT,
            duration: editingItem.duration,
            isActive: editingItem.isActive,
            startDate: editingItem.startDate ? new Date(editingItem.startDate) : undefined,
            endDate: editingItem.endDate ? new Date(editingItem.endDate) : undefined,
            createdAt: new Date(editingItem.createdAt),
            updatedAt: new Date(editingItem.updatedAt)
          } : undefined}
          onSuccess={() => {
            handleCloseModal();
            fetchItems();
            showSnackbar(editingItem ? 'Event updated successfully' : 'Event created successfully', 'success');
          }}
          onCancel={handleCloseModal}
          setFormActions={setModalActions}
        />
      </ContentModal>
    </Container>
  );
} 