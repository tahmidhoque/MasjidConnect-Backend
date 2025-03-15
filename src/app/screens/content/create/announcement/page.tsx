'use client';

import {
  Box,
  Typography,
  Button,
  Divider,
  Container,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Link from 'next/link';
import { AnnouncementForm } from '@/components/content/announcement-form';

export default function AnnouncementContentPage() {
  const router = useRouter();

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Create Announcement
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Create a new announcement to display on your screens
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
        
        <AnnouncementForm 
          onSuccess={() => {
            router.push('/screens/content');
          }}
          onCancel={() => router.push('/screens/content')}
        />
      </Box>
    </Container>
  );
} 