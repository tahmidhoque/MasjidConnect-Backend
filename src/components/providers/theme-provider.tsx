'use client';

import { ThemeProvider as MUIThemeProvider } from '@emotion/react'
import { createTheme } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import EmotionRegistry from '@/lib/registry'
import { customColors } from '@/theme/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
      dark: '#45a049',
    },
    background: {
      default: '#f5f5f5',
    },
    warning: customColors.warning,
    error: customColors.error,
    info: customColors.info,
    success: customColors.success,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardWarning: {
          backgroundColor: 'rgba(231, 111, 81, 0.08)',
          color: '#000000',
          '& .MuiAlert-icon': {
            color: customColors.warning.main,
          },
        },
        standardError: {
          backgroundColor: 'rgba(214, 40, 40, 0.08)',
          color: '#000000',
          '& .MuiAlert-icon': {
            color: customColors.error.main,
          },
        },
        standardInfo: {
          backgroundColor: 'rgba(33, 158, 188, 0.08)',
          color: '#000000',
          '& .MuiAlert-icon': {
            color: customColors.info.main,
          },
        },
        standardSuccess: {
          backgroundColor: 'rgba(42, 157, 143, 0.08)',
          color: '#000000',
          '& .MuiAlert-icon': {
            color: customColors.success.main,
          },
        },
        root: {
          borderRadius: '4px',
          padding: '16px',
          alignItems: 'flex-start',
          '& .MuiAlert-icon': {
            padding: '0',
            marginRight: '12px',
            fontSize: '20px',
          },
          '& .MuiAlert-message': {
            padding: '0',
          },
          '& .MuiAlertTitle-root': {
            marginBottom: '8px',
            fontWeight: 600,
            fontSize: '1rem',
          },
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