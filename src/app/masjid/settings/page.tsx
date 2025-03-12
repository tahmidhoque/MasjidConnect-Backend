"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { geocodeAddress } from '@/lib/geocoding';
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext';

export default function MasjidSettings() {
  const [masjidInfo, setMasjidInfo] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    latitude: 0,
    longitude: 0,
  });

  const [originalInfo, setOriginalInfo] = useState(masjidInfo);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { setHasUnsavedChanges } = useUnsavedChanges();

  useEffect(() => {
    fetchMasjidInfo();
  }, []);

  useEffect(() => {
    const hasChanges = JSON.stringify(masjidInfo) !== JSON.stringify(originalInfo);
    setHasUnsavedChanges(hasChanges);
  }, [masjidInfo, originalInfo, setHasUnsavedChanges]);

  const fetchMasjidInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/masjid/info');
      if (!response.ok) {
        throw new Error('Failed to fetch masjid information');
      }
      const data = await response.json();
      
      // Set the form data
      setMasjidInfo({
        name: data.name || '',
        address: data.addressComponents?.address || '',
        city: data.addressComponents?.city || '',
        state: data.addressComponents?.state || '',
        postalCode: data.addressComponents?.postalCode || '',
        country: data.addressComponents?.country || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
      });
      
      // Set original data for change tracking
      setOriginalInfo({
        name: data.name || '',
        address: data.addressComponents?.address || '',
        city: data.addressComponents?.city || '',
        state: data.addressComponents?.state || '',
        postalCode: data.addressComponents?.postalCode || '',
        country: data.addressComponents?.country || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching masjid info:', err);
      setError('Failed to load masjid information');
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMasjidInfo({
      ...masjidInfo,
      [name]: value,
    });
  };

  const handleGeocodeAddress = async () => {
    try {
      setGeocodeLoading(true);
      setError(null);
      
      // Construct full address
      const addressParts = [];
      if (masjidInfo.address) addressParts.push(masjidInfo.address);
      if (masjidInfo.city) addressParts.push(masjidInfo.city);
      if (masjidInfo.state) addressParts.push(masjidInfo.state);
      if (masjidInfo.postalCode) addressParts.push(masjidInfo.postalCode);
      if (masjidInfo.country) addressParts.push(masjidInfo.country);
      
      if (addressParts.length === 0) {
        setError('Please enter an address to geocode');
        setGeocodeLoading(false);
        return;
      }
      
      const fullAddress = addressParts.join(', ');
      const result = await geocodeAddress(fullAddress);
      
      if (result.success) {
        setMasjidInfo({
          ...masjidInfo,
          latitude: result.latitude,
          longitude: result.longitude,
        });
        setSuccess('Address geocoded successfully');
      } else {
        setError(`Failed to geocode address: ${result.error}`);
      }
      
      setGeocodeLoading(false);
    } catch (err) {
      console.error('Error geocoding address:', err);
      setError('An error occurred while geocoding the address');
      setGeocodeLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      setError(null);
      
      const response = await fetch('/api/masjid/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(masjidInfo),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update masjid information');
      }
      
      // Update original info to reflect saved changes
      setOriginalInfo(masjidInfo);
      setSuccess('Masjid information updated successfully');
      setSaveLoading(false);
    } catch (err) {
      console.error('Error saving masjid info:', err);
      setError('Failed to save masjid information');
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
        Masjid Settings
      </Typography>
      
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Basic Information
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Masjid Name"
                name="name"
                value={masjidInfo.name}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                Address Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Street Address"
                name="address"
                value={masjidInfo.address}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                name="city"
                value={masjidInfo.city}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="State/Province"
                name="state"
                value={masjidInfo.state}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Postal Code"
                name="postalCode"
                value={masjidInfo.postalCode}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                name="country"
                value={masjidInfo.country}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button 
                variant="outlined" 
                onClick={handleGeocodeAddress} 
                disabled={geocodeLoading}
                sx={{ mr: 2 }}
              >
                {geocodeLoading ? <CircularProgress size={24} /> : 'Get Coordinates from Address'}
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This will automatically fill the coordinates based on the address you provided.
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                Coordinates
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                These coordinates will be used for prayer time calculations. You can fill them automatically by clicking the button above, or enter them manually.
              </Alert>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Latitude"
                name="latitude"
                type="number"
                value={masjidInfo.latitude}
                onChange={handleInputChange}
                fullWidth
                InputProps={{
                  inputProps: { step: 0.0001 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Longitude"
                name="longitude"
                type="number"
                value={masjidInfo.longitude}
                onChange={handleInputChange}
                fullWidth
                InputProps={{
                  inputProps: { step: 0.0001 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSave}
                disabled={saveLoading}
                size="large"
              >
                {saveLoading ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        message={success}
      />
    </Box>
  );
} 