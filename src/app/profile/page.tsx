"use client";

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Stack,
  IconButton,
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';

export default function ProfileSettings() {
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 8900',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle profile update
    console.log('Profile updated:', profileData);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Profile Settings
      </Typography>
      
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Box display="flex" justifyContent="center">
                <Box position="relative">
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      mb: 2,
                    }}
                  />
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: -10,
                      backgroundColor: 'background.paper',
                      '&:hover': { backgroundColor: 'background.paper' },
                    }}
                  >
                    <input hidden accept="image/*" type="file" />
                    <PhotoCameraIcon />
                  </IconButton>
                </Box>
              </Box>

              <TextField
                label="Full Name"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                fullWidth
              />

              <TextField
                label="Email"
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                fullWidth
              />

              <TextField
                label="Phone Number"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                fullWidth
              />

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