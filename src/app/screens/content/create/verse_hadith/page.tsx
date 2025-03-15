'use client';

import React from 'react';
import { Box, Typography, Button, Divider, Container } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { VerseHadithForm } from '@/components/content/verse-hadith-form';
import { ContentType } from '@prisma/client';

export default function VerseHadithContentPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/screens/content/verse_hadith');
  };

  const handleCancel = () => {
    router.push('/screens/content/verse_hadith');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Create Verse/Hadith Content
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

      <VerseHadithForm 
        initialData={{
          id: '',
          title: '',
          content: {
            type: 'QURAN_VERSE',
            arabicText: '',
            translation: '',
            reference: '',
            source: '',
            grade: ''
          },
          type: ContentType.VERSE_HADITH,
          duration: 20,
          isActive: true,
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