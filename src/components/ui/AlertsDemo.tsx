import React from 'react';
import { Box, Typography, Stack, Paper } from '@mui/material';
import CustomAlert from './CustomAlert';

const AlertsDemo: React.FC = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Alert Styles Demo</Typography>
      <Typography variant="body1" paragraph>
        This page demonstrates the updated alert styles with improved readability.
      </Typography>
      
      <Paper elevation={1} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Alerts with Titles</Typography>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <CustomAlert severity="success" title="Success Alert">
            <Typography variant="body1">
              This is a success alert with a title. The green accent indicates a successful operation.
            </Typography>
          </CustomAlert>
          
          <CustomAlert severity="info" title="Information Alert">
            <Typography variant="body1">
              This is an information alert with a title. The blue accent provides general information.
            </Typography>
          </CustomAlert>
          
          <CustomAlert severity="warning" title="Warning Alert">
            <Typography variant="body1">
              This is a warning alert with a title. The orange accent indicates a warning that requires attention.
            </Typography>
          </CustomAlert>
          
          <CustomAlert severity="error" title="Error Alert">
            <Typography variant="body1">
              This is an error alert with a title. The red accent indicates an error that needs to be addressed.
            </Typography>
          </CustomAlert>
        </Stack>
      </Paper>
      
      <Paper elevation={1} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>Alerts without Titles</Typography>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <CustomAlert severity="success">
            <Typography variant="body1">
              This is a success alert without a title. The text is now more readable with the improved styling.
            </Typography>
          </CustomAlert>
          
          <CustomAlert severity="info">
            <Typography variant="body1">
              This is an information alert without a title. The subtle background with colored accent provides clear visual cues.
            </Typography>
          </CustomAlert>
          
          <CustomAlert severity="warning">
            <Typography variant="body1">
              This is a warning alert without a title. The left border clearly indicates the alert type while maintaining readability.
            </Typography>
          </CustomAlert>
          
          <CustomAlert severity="error">
            <Typography variant="body1">
              This is an error alert without a title. The black text on light background ensures optimal readability.
            </Typography>
          </CustomAlert>
        </Stack>
      </Paper>
    </Box>
  );
};

export default AlertsDemo; 