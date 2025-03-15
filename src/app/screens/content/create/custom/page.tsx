'use client';

import React from 'react';
import { Box, Typography, Button, Divider, Container } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CustomForm } from '@/components/content/custom-form';
import { ContentType } from '@prisma/client';

export default function CustomContentPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/screens/content/custom');
  };

  const handleCancel = () => {
    router.push('/screens/content/custom');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Create Custom Content
          </Typography>
          <Button 
            variant="outlined" 
            onClick={handleCancel}
          >
            Back
          </Button>
        </Box>
        <Divider sx={{ mb: 4 }} />
      </Box>

      <CustomForm 
        initialData={{
          id: '',
          title: '',
          content: {
            text: '',
            isHTML: false
          },
          type: ContentType.CUSTOM,
          isActive: true,
          duration: 30,
          startDate: undefined,
          endDate: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </Container>
  );
} 