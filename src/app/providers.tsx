'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SessionProvider } from 'next-auth/react';
import theme from '@/lib/theme';
import { UserProvider } from '@/contexts/UserContext';
import { UnsavedChangesProvider } from '@/contexts/UnsavedChangesContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <UserProvider>
          <UnsavedChangesProvider>
            <div suppressHydrationWarning>
              {children}
            </div>
          </UnsavedChangesProvider>
        </UserProvider>
      </ThemeProvider>
    </SessionProvider>
  );
} 