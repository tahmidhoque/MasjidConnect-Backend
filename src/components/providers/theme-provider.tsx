'use client';

import { ThemeProvider as MUIThemeProvider } from '@emotion/react'
import { createTheme } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import EmotionRegistry from '@/lib/registry'

const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
      dark: '#45a049',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <EmotionRegistry>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </EmotionRegistry>
  );
} 