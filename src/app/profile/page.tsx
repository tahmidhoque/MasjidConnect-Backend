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
  Container,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext';
import PageHeader from '@/components/layouts/page-header';

interface ProfileFormData {
  name: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfileSettings() {
  // Form state
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: '',
    email: '',
  });

  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Password visibility state
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // Track original data for unsaved changes
  const [originalData, setOriginalData] = useState<ProfileFormData | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [passwordValidationErrors, setPasswordValidationErrors] = useState<Partial<Record<keyof PasswordFormData, string>>>({});
  
  // Get unsaved changes context
  const { setHasUnsavedChanges } = useUnsavedChanges();

  // Fetch profile data on mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  // Track unsaved changes
  useEffect(() => {
    if (originalData) {
      const hasChanges = JSON.stringify(profileData) !== JSON.stringify(originalData);
      setHasUnsavedChanges(hasChanges);
    }
  }, [profileData, originalData, setHasUnsavedChanges]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile/info');
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile information');
      }
      
      const data = await response.json();
      
      const formattedData = {
        name: data.name || '',
        email: data.email || '',
      };
      
      setProfileData(formattedData);
      setOriginalData(formattedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('Failed to load profile information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ProfileFormData, string>> = {};
    
    // Required fields
    if (!profileData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!profileData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const errors: Partial<Record<keyof PasswordFormData, string>> = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordValidationErrors(errors);
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
      
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile information');
      }
      
      const updatedData = await response.json();
      
      // Update original data to reflect saved state
      setOriginalData(profileData);
      setHasUnsavedChanges(false);
      setSuccess('Profile information updated successfully');
      
      // Clear success message after 6 seconds
      setTimeout(() => setSuccess(null), 6000);
    } catch (err) {
      console.error('Error saving profile info:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      setPasswordError('Please correct the errors in the form.');
      return;
    }
    
    try {
      setChangingPassword(true);
      setPasswordError(null);
      
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to change password');
      }
      
      // Clear password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setSuccess('Password changed successfully');
      
      // Clear success message after 6 seconds
      setTimeout(() => setSuccess(null), 6000);
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleInputChange = (field: keyof ProfileFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    
    // Clear validation error for this field if it exists
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handlePasswordChange = (field: keyof PasswordFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    
    // Clear validation error for this field if it exists
    if (passwordValidationErrors[field]) {
      setPasswordValidationErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => () => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const renderFormField = (
    field: keyof ProfileFormData,
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
        value={profileData[field]}
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

  const renderPasswordField = (
    field: keyof PasswordFormData,
    label: string,
    required: boolean = false,
    props: any = {}
  ) => (
    <FormControl 
      error={!!passwordValidationErrors[field]} 
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
        type={showPasswords[field] ? 'text' : 'password'}
        value={passwordData[field]}
        onChange={handlePasswordChange(field)}
        fullWidth
        variant="outlined"
        size="small"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={togglePasswordVisibility(field)}
                edge="end"
              >
                {showPasswords[field] ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.paper',
          },
        }}
        {...props}
      />
      {passwordValidationErrors[field] && (
        <FormHelperText>{passwordValidationErrors[field]}</FormHelperText>
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
    <Container maxWidth="lg">
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 2 }}>
        <PageHeader title="Profile Settings" />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Manage your personal information and account security.
        </Typography>
        
        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}
      </Box>
      
      <Stack spacing={4}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h5" gutterBottom>
                  Personal Information
                </Typography>
                <Divider />
              </Box>
              
              <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                  <Box>
                    {renderFormField('name', 'Full Name', true)}
                    {renderFormField('email', 'Email', true, { type: 'email' })}

                    <Box mt={4}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Box>
                  </Box>
                </Stack>
              </form>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h5" gutterBottom>
                  Change Password
                </Typography>
                <Divider />
              </Box>
              
              {passwordError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {passwordError}
                </Alert>
              )}
              
              <form onSubmit={handlePasswordSubmit}>
                <Stack spacing={4}>
                  <Box>
                    {renderPasswordField('currentPassword', 'Current Password', true)}
                    {renderPasswordField('newPassword', 'New Password', true)}
                    {renderPasswordField('confirmPassword', 'Confirm New Password', true)}

                    <Box mt={4}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={changingPassword}
                      >
                        {changingPassword ? 'Changing Password...' : 'Change Password'}
                      </Button>
                    </Box>
                  </Box>
                </Stack>
              </form>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

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
    </Container>
  );
} 