'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SessionProvider } from 'next-auth/react';
import theme from '@/lib/theme';
import { UserProvider } from '@/contexts/UserContext';
import { UnsavedChangesProvider } from '@/contexts/UnsavedChangesContext';
import { SnackbarProvider } from '@/contexts/SnackbarContext';
import { ContentCreationProvider } from '@/components/content/ContentCreationContext';
import { ContentCreationModal } from '@/components/content/ContentCreationModal';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <UserProvider>
          <UnsavedChangesProvider>
            <SnackbarProvider>
              <ContentCreationProvider>
                {/* <div suppressHydrationWarning> */}
                  {children}
                  <ContentCreationModal />
                {/* </div> */}
              </ContentCreationProvider>
            </SnackbarProvider>
          </UnsavedChangesProvider>
        </UserProvider>
      </ThemeProvider>
    </SessionProvider>
  );
} 