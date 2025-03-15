'use client';

import React from 'react';
import { Box, Typography, Button, Divider, Container } from '@mui/material';
import { useRouter } from 'next/navigation';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { AsmaAlHusnaForm } from '@/components/content/asma-al-husna-form';
import { ContentType } from '@prisma/client';
import PageHeader from '@/components/layouts/page-header';

export default function AsmaAlHusnaContentPage() {
  const router = useRouter();
  const [formActions, setFormActions] = React.useState<React.ReactNode | null>(null);

  const handleSuccess = () => {
    router.push('/screens/content/asma_al_husna');
  };

  const handleCancel = () => {
    router.push('/screens/content/asma_al_husna');
  };

  return (
    <Container maxWidth="xl">
      <PageHeader title="Create 99 Names of Allah Content" />
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Create 99 Names of Allah Content
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Create new content displaying the beautiful names of Allah (Asma Al-Husna)
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleCancel}
          >
            Back to Content
          </Button>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        <AsmaAlHusnaForm 
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          setFormActions={setFormActions}
        />
        
        {formActions && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            {formActions}
          </Box>
        )}
      </Box>
    </Container>
  );
} 