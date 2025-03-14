'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Container,
  Paper,
  Divider,
  IconButton,
  Breadcrumbs,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Link from 'next/link';
import { EventForm } from '@/components/content/event-form';

export default function EventContentPage() {
  const router = useRouter();

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
              <Link href="/screens/content" passHref style={{ textDecoration: 'none', color: 'text.secondary' }}>
                Content
              </Link>
              <Typography color="text.primary">Create Event</Typography>
            </Breadcrumbs>
            <Typography variant="h4" component="h1" gutterBottom>
              Create Event
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Create a new event to display on your screens
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/screens/content')}
          >
            Back to Content
          </Button>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        <EventForm 
          onSuccess={() => {
            router.push('/screens/content');
          }}
          onCancel={() => router.push('/screens/content')}
        />
      </Box>
    </Container>
  );
} 