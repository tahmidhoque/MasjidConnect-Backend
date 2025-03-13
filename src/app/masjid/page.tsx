"use client";

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Grid,
  Container,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  FormControl,
  FormHelperText,
  FormLabel,
} from '@mui/material';
import { geocodeAddress } from '@/lib/geocoding';
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext';
import PageHeader from '@/components/layouts/page-header';

interface MasjidFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  latitude: number;
  longitude: number;
}

export default function MasjidSettings() {
  // Form state
  const [masjidData, setMasjidData] = useState<MasjidFormData>({
    name: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    latitude: 0,
    longitude: 0,
  });

  // Track original data for unsaved changes
  const [originalData, setOriginalData] = useState<MasjidFormData | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof MasjidFormData, string>>>({});
  
  // Get unsaved changes context
  const { setHasUnsavedChanges } = useUnsavedChanges();

  // Fetch masjid data on mount
  useEffect(() => {
    fetchMasjidData();
  }, []);

  // Track unsaved changes
  useEffect(() => {
    if (originalData) {
      const hasChanges = JSON.stringify(masjidData) !== JSON.stringify(originalData);
      setHasUnsavedChanges(hasChanges);
    }
  }, [masjidData, originalData, setHasUnsavedChanges]);

  const fetchMasjidData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/masjid/info');
      
      if (!response.ok) {
        throw new Error('Failed to fetch masjid information');
      }
      
      const data = await response.json();
      
      const formattedData = {
        name: data.name || '',
        address: data.addressComponents?.address || '',
        city: data.addressComponents?.city || '',
        state: data.addressComponents?.state || '',
        postalCode: data.addressComponents?.postalCode || '',
        country: data.addressComponents?.country || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        description: data.description || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
      };
      
      setMasjidData(formattedData);
      setOriginalData(formattedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching masjid data:', err);
      setError('Failed to load masjid information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof MasjidFormData, string>> = {};
    
    // Required fields
    if (!masjidData.name.trim()) {
      errors.name = 'Masjid name is required';
    }
    
    if (!masjidData.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (!masjidData.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!masjidData.state.trim()) {
      errors.state = 'State is required';
    }
    
    if (!masjidData.postalCode.trim()) {
      errors.postalCode = 'Postal code is required';
    }
    
    // Email validation
    if (masjidData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(masjidData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Website validation
    if (masjidData.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(masjidData.website)) {
      errors.website = 'Please enter a valid website URL';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please correct the errors in the form.');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch('/api/masjid/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(masjidData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update masjid information');
      }
      
      
      // Update original data to reflect saved state
      setOriginalData(masjidData);
      setHasUnsavedChanges(false);
      setSuccess('Masjid information updated successfully');
      
      // Clear success message after 6 seconds
      setTimeout(() => setSuccess(null), 6000);
    } catch (err) {
      console.error('Error saving masjid info:', err);
      setError('Failed to save masjid information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof MasjidFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setMasjidData((prev) => ({
      ...prev,
      [field]: field === 'latitude' || field === 'longitude' 
        ? parseFloat(e.target.value) || 0 
        : e.target.value,
    }));
    
    // Clear validation error for this field if it exists
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleGeocodeAddress = async () => {
    try {
      setGeocodeLoading(true);
      setError(null);
      
      // Construct full address
      const addressParts = [];
      if (masjidData.address) addressParts.push(masjidData.address);
      if (masjidData.city) addressParts.push(masjidData.city);
      if (masjidData.state) addressParts.push(masjidData.state);
      if (masjidData.postalCode) addressParts.push(masjidData.postalCode);
      if (masjidData.country) addressParts.push(masjidData.country);
      
      if (addressParts.length === 0) {
        setError('Please enter an address to geocode');
        setGeocodeLoading(false);
        return;
      }
      
      const fullAddress = addressParts.join(', ');
      const result = await geocodeAddress(fullAddress);
      
      if (result.success) {
        setMasjidData(prev => ({
          ...prev,
          latitude: result.latitude,
          longitude: result.longitude,
        }));
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

  const renderFormField = (
    field: keyof MasjidFormData,
    label: string,
    required: boolean = false,
    props: any = {}
  ) => (
    <FormControl 
      error={!!validationErrors[field]} 
      fullWidth 
      required={required}
      sx={{ mb: 2 }}
    >
      <FormLabel 
        sx={{ 
          mb: 1,
          fontWeight: 500,
          color: 'text.primary',
          '&.Mui-focused': { color: 'text.primary' },
        }}
      >
        {label}
      </FormLabel>
      <TextField
        value={masjidData[field]}
        onChange={handleInputChange(field)}
        fullWidth
        variant="outlined"
        size="small"
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.paper',
          },
        }}
        {...props}
      />
      {validationErrors[field] && (
        <FormHelperText>{validationErrors[field]}</FormHelperText>
      )}
    </FormControl>
  );

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <>
      <PageHeader title="Masjid Details" />
      
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Update your masjid's information and contact details.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h5" gutterBottom>
                  Basic Information
                </Typography>
                <Divider />
              </Box>
              
              <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                  <Box>
                    {renderFormField('name', 'Masjid Name', true)}
                    {renderFormField('address', 'Address', true)}
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        {renderFormField('city', 'City', true)}
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        {renderFormField('state', 'State', true)}
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        {renderFormField('postalCode', 'Postal Code', true)}
                      </Grid>
                    </Grid>

                    {renderFormField('country', 'Country', true)}

                    <Box mt={3} mb={2}>
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
                    </Box>

                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Coordinates
                    </Typography>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      These coordinates will be used for prayer time calculations.
                    </Alert>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        {renderFormField('latitude', 'Latitude', false, {
                          type: 'number',
                          InputProps: { inputProps: { step: 0.0001 } }
                        })}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        {renderFormField('longitude', 'Longitude', false, {
                          type: 'number',
                          InputProps: { inputProps: { step: 0.0001 } }
                        })}
                      </Grid>
                    </Grid>
                  </Box>

                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Contact Information
                    </Typography>
                    <Divider />
                  </Box>

                  <Box>
                    {renderFormField('phone', 'Phone Number')}
                    {renderFormField('email', 'Email', false, { type: 'email' })}
                    {renderFormField('website', 'Website')}
                    {renderFormField('description', 'Description', false, {
                      multiline: true,
                      rows: 4,
                    })}

                    <Box mt={4}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={saving}
                      >
                        {saving ? <CircularProgress size={24} /> : 'Save Changes'}
                      </Button>
                    </Box>
                  </Box>
                </Stack>
              </form>
            </Stack>
          </CardContent>
        </Card>

        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
} 