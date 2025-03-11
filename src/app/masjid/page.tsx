"use client";

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Grid,
} from '@mui/material';

export default function MasjidSettings() {
  const [masjidData, setMasjidData] = useState({
    name: 'Al-Falah Masjid',
    address: '123 Islamic Way',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    phone: '+1 234 567 8900',
    email: 'info@alfalahmasjid.com',
    website: 'www.alfalahmasjid.com',
    description: 'A welcoming community mosque serving the local Muslim community.',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle masjid details update
    console.log('Masjid details updated:', masjidData);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Masjid Details
      </Typography>
      
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Masjid Name"
                value={masjidData.name}
                onChange={(e) =>
                  setMasjidData({ ...masjidData, name: e.target.value })
                }
                fullWidth
              />

              <TextField
                label="Address"
                value={masjidData.address}
                onChange={(e) =>
                  setMasjidData({ ...masjidData, address: e.target.value })
                }
                fullWidth
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="City"
                    value={masjidData.city}
                    onChange={(e) =>
                      setMasjidData({ ...masjidData, city: e.target.value })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="State"
                    value={masjidData.state}
                    onChange={(e) =>
                      setMasjidData({ ...masjidData, state: e.target.value })
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="ZIP Code"
                    value={masjidData.zipCode}
                    onChange={(e) =>
                      setMasjidData({ ...masjidData, zipCode: e.target.value })
                    }
                    fullWidth
                  />
                </Grid>
              </Grid>

              <TextField
                label="Phone Number"
                value={masjidData.phone}
                onChange={(e) =>
                  setMasjidData({ ...masjidData, phone: e.target.value })
                }
                fullWidth
              />

              <TextField
                label="Email"
                type="email"
                value={masjidData.email}
                onChange={(e) =>
                  setMasjidData({ ...masjidData, email: e.target.value })
                }
                fullWidth
              />

              <TextField
                label="Website"
                value={masjidData.website}
                onChange={(e) =>
                  setMasjidData({ ...masjidData, website: e.target.value })
                }
                fullWidth
              />

              <TextField
                label="Description"
                value={masjidData.description}
                onChange={(e) =>
                  setMasjidData({ ...masjidData, description: e.target.value })
                }
                multiline
                rows={4}
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