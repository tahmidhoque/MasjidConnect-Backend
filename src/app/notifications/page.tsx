"use client";

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Stack,
  Button,
  Divider,
  FormGroup,
} from '@mui/material';

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    email: {
      prayerTimes: true,
      jumuah: true,
      events: true,
      announcements: true,
    },
    push: {
      prayerTimes: true,
      jumuah: true,
      events: false,
      announcements: true,
    },
    inApp: {
      prayerTimes: true,
      jumuah: true,
      events: true,
      announcements: true,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle notification settings update
    console.log('Notification settings updated:', settings);
  };

  const NotificationSection = ({ title, type }: { title: string; type: keyof typeof settings }) => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={settings[type].prayerTimes}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  [type]: {
                    ...settings[type],
                    prayerTimes: e.target.checked,
                  },
                })
              }
            />
          }
          label="Prayer Times"
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings[type].jumuah}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  [type]: {
                    ...settings[type],
                    jumuah: e.target.checked,
                  },
                })
              }
            />
          }
          label="Jumuah Reminders"
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings[type].events}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  [type]: {
                    ...settings[type],
                    events: e.target.checked,
                  },
                })
              }
            />
          }
          label="Events"
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings[type].announcements}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  [type]: {
                    ...settings[type],
                    announcements: e.target.checked,
                  },
                })
              }
            />
          }
          label="Announcements"
        />
      </FormGroup>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Notification Settings
      </Typography>
      
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <NotificationSection title="Email Notifications" type="email" />
              <Divider />
              <NotificationSection title="Push Notifications" type="push" />
              <Divider />
              <NotificationSection title="In-App Notifications" type="inApp" />

              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Save Changes
                </Button>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
} 