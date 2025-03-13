"use client";

import React from 'react';
import AlertsDemo from '@/components/ui/AlertsDemo';
import PageHeader from '@/components/layouts/page-header';
import { Box } from '@mui/material';

export default function UIDemo() {
  return (
    <>
      <PageHeader title="UI Components Demo" />
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        <AlertsDemo />
      </Box>
    </>
  );
} 