"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  Divider,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import Image from 'next/image';
import { ContentType } from '@prisma/client';
import { formatDate } from '@/lib/content-helper';
import { ContentTypeTable } from '@/components/content/table/ContentTypeTable';
import { useContentCreation } from '@/components/content/ContentCreationContext';
import { useSnackbar } from '@/contexts/SnackbarContext';

// Define interface for 99 Names of Allah content items
interface AsmaAlHusnaItem {
  id: string;
  title: string;
  content: {
    isRandom: boolean;
    selectedNames?: number[];
  };
  duration: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AsmaAlHusnaPage() {
  const { openContentCreationModal } = useContentCreation();
  const { showSnackbar } = useSnackbar();
  
  // State
  const [items, setItems] = useState<AsmaAlHusnaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Fetch content items
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/content/asma_al_husna');
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('Failed to load content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);
  
  // Initial fetch
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);
  
  // Handle creating a new item
  const handleCreateItem = () => {
    openContentCreationModal('ASMA_AL_HUSNA' as ContentType, fetchItems);
  };
  
  // Handle editing an item
  const handleEditItem = (item: AsmaAlHusnaItem) => {
    // Navigate to the content edit page instead of trying to open the modal with the item
    window.location.href = `/screens/content/${item.id}`;
  };
  
  // Handle deleting an item
  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/content/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete content');
        }
        
        // Refresh the list
        fetchItems();
        showSnackbar('Content deleted successfully', 'success');
      } catch (err) {
        console.error('Error deleting content:', err);
        showSnackbar('Failed to delete content', 'error');
      }
    }
  };
  
  // Table column definition
  const columns = [
    {
      id: 'title',
      label: 'Title',
      render: (item: AsmaAlHusnaItem) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
              position: 'relative',
            }}
          >
            <Image 
              src="/icons/asma-al-husna.svg" 
              alt="99 Names of Allah" 
              width={20} 
              height={20}
              style={{ filter: 'brightness(0) saturate(100%) invert(8%) sepia(37%) saturate(1254%) hue-rotate(182deg) brightness(96%) contrast(96%)' }} // Makes the SVG #0A2647 color
            />
          </Box>
          <Box>
            <Typography variant="body1" fontWeight={500}>
              {item.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.content.isRandom 
                ? 'Random selection from 99 names' 
                : `${item.content.selectedNames?.length || 0} selected names`}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'duration',
      label: 'Duration',
      render: (item: AsmaAlHusnaItem) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'action.active' }} />
          <Typography variant="body2">
            {item.duration} seconds
          </Typography>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (item: AsmaAlHusnaItem) => (
        item.isActive ? 
        <Typography color="success.main" fontWeight="medium">Active</Typography> : 
        <Typography color="text.secondary">Inactive</Typography>
      ),
      filterable: true,
      filterOptions: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
    {
      id: 'dateRange',
      label: 'Display Period',
      render: (item: AsmaAlHusnaItem) => (
        <Box>
          {item.startDate || item.endDate ? (
            <Typography variant="body2">
              {item.startDate ? formatDate(item.startDate) : 'Always'} - {item.endDate ? formatDate(item.endDate) : 'Forever'}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Always displayed
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (item: AsmaAlHusnaItem) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(item.createdAt)}
        </Typography>
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
            99 Names of Allah
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage and create content displaying the 99 names of Allah (Asma Al-Husna)
          </Typography>
          <Divider sx={{ mt: 2 }} />
        </Box>
      
        <ContentTypeTable
          items={items}
          isLoading={isLoading}
          subtitle="Display the beautiful names of Allah (Asma Al-Husna) on your screens"
          emptyMessage="No Asma Al-Husna content items found. Click 'Add New' to create your first one."
          searchEmptyMessage="No content matches your search criteria."
          addButtonLabel="Add New"
          onAdd={handleCreateItem}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          onRefresh={fetchItems}
          getItemId={(item: AsmaAlHusnaItem) => item.id}
          columns={columns}
        />
      </Box>
    </Container>
  );
} 