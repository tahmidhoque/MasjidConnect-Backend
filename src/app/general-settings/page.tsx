"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

export default function GeneralSettings() {
  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        General Settings
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Appearance
          </Typography>
          <FormControlLabel
            control={<Switch />}
            label="Dark Mode"
          />
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Language
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="language-select-label">Select Language</InputLabel>
            <Select
              labelId="language-select-label"
              id="language-select"
              value="en"
              label="Select Language"
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="ar">Arabic</MenuItem>
              <MenuItem value="bn">Bengali</MenuItem>
              <MenuItem value="ur">Urdu</MenuItem>
            </Select>
          </FormControl>
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Email Notifications"
          />
          <Box mt={1}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Push Notifications"
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
} 