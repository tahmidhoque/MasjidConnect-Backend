"use client";

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  AlertTitle,
  Divider,
  Switch,
  FormControlLabel,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Delete as DeleteIcon, Save as SaveIcon, Download as DownloadIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import { format, parse } from 'date-fns';
import { generatePrayerTimesForMonth, generatePrayerTimesForYear } from '@/lib/prayer-times';
import React from 'react';
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext';

interface PrayerTime {
  date: Date;
  fajr: string;
  sunrise: string;
  zuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  fajrJamaat: string;
  zuhrJamaat: string;
  asrJamaat: string;
  maghribJamaat: string;
  ishaJamaat: string;
  jummahKhutbah?: string;
  jummahJamaat?: string;
  isManuallySet?: boolean;
  source?: string;
}

const CALCULATION_METHODS = [
  { value: 'MWL', label: 'Muslim World League' },
  { value: 'ISNA', label: 'Islamic Society of North America' },
  { value: 'Egypt', label: 'Egyptian General Authority' },
  { value: 'Makkah', label: 'Umm Al-Qura University, Makkah' },
  { value: 'Karachi', label: 'University of Islamic Sciences, Karachi' },
  { value: 'Tehran', label: 'Institute of Geophysics, Tehran' },
  { value: 'Singapore', label: 'Singapore' },
];

const MADHABS = [
  { value: 'Shafi', label: 'Shafi' },
  { value: 'Hanafi', label: 'Hanafi' },
];

interface EditableCellProps {
  value: string;
  row: PrayerTime;
  field: keyof PrayerTime;
  onSave: (row: PrayerTime, field: keyof PrayerTime, value: string) => void;
}

function EditableCell({ value, row, field, onSave }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(value);
  };

  const handleBlur = () => {
    if (editValue !== value) {
      onSave(row, field, editValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editValue !== value) {
        onSave(row, field, editValue);
      }
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      setTimeout(() => {
        const input = inputRef.current?.querySelector('input');
        if (input) {
          input.focus();
          input.select();
        }
      }, 0);
    }
  }, [isEditing]);

  if (!isEditing) {
    return (
      <TableCell onDoubleClick={handleDoubleClick} sx={{ cursor: 'pointer' }}>
        {value}
      </TableCell>
    );
  }

  return (
    <TableCell padding="none">
      <TextField
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        variant="standard"
        size="small"
        fullWidth
        autoFocus
        inputProps={{
          style: { 
            padding: '8px',
            fontSize: 'inherit',
          }
        }}
      />
    </TableCell>
  );
}

export default function PrayerTimesAdmin() {
  const [activeTab, setActiveTab] = useState(0);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [selectedTime, setSelectedTime] = useState<PrayerTime | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use the global unsaved changes context
  const { hasUnsavedChanges, setHasUnsavedChanges, confirmNavigation } = useUnsavedChanges();
  
  // Add a page title
  const pageTitle = "Prayer Times";
  
  // Calculation settings
  const [calculationSettings, setCalculationSettings] = useState({
    latitude: 51.5074, // Default to London
    longitude: -0.1278,
    calculationMethod: 'MWL',
    madhab: 'Shafi',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    adjustments: {
      fajr: 0,
      sunrise: 0,
      zuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0,
    },
  });
  
  // Original calculation settings from database (for tracking changes)
  const [originalSettings, setOriginalSettings] = useState(calculationSettings);

  // Add new state variables for location mode
  const [useManualCoordinates, setUseManualCoordinates] = useState(false);
  const [masjidAddress, setMasjidAddress] = useState<string | null>(null);

  // Load initial data
  React.useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchPrayerTimes(),
          fetchCalculationSettings(),
          fetchMasjidInfo()
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAllData();
  }, []);

  // Check for unsaved changes when calculation settings change
  React.useEffect(() => {
    const hasChanges = JSON.stringify(calculationSettings) !== JSON.stringify(originalSettings);
    setHasUnsavedChanges(hasChanges);
  }, [calculationSettings, originalSettings, setHasUnsavedChanges]);

  // Add function to fetch masjid info
  const fetchMasjidInfo = async () => {
    try {
      const response = await fetch('/api/masjid/info');
      if (!response.ok) {
        throw new Error('Failed to fetch masjid info');
      }
      const data = await response.json();
      
      if (data.address) {
        setMasjidAddress(data.address);
      }
    } catch (error) {
      console.error('Error fetching masjid info:', error);
    }
  };

  const fetchPrayerTimes = async () => {
    try {
      const response = await fetch('/api/prayer-times');
      if (!response.ok) throw new Error('Failed to fetch prayer times');
      const data = await response.json();
      setPrayerTimes(data);
    } catch (error) {
      setFatalError('Failed to load prayer times');
    }
  };

  const fetchCalculationSettings = async () => {
    try {
      console.log('Fetching calculation settings...');
      const response = await fetch('/api/prayer-times/settings');
      if (!response.ok) {
        console.error('Failed to fetch calculation settings:', response.status, response.statusText);
        throw new Error('Failed to fetch calculation settings');
      }
      const data = await response.json();
      console.log('Calculation settings received:', data);
      
      // Apply settings from database if available
      if (data && Object.keys(data).length > 0) {
        setCalculationSettings(data);
        setOriginalSettings(data);
        // Set the manual coordinates flag
        setUseManualCoordinates(data.useManualCoordinates || false);
        console.log('Applied calculation settings from database');
      } else {
        console.warn('No calculation settings found in database, using defaults');
      }
    } catch (error) {
      console.error('Error in fetchCalculationSettings:', error);
      setError('Failed to load calculation settings, using defaults');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    confirmNavigation(() => {
      setActiveTab(newValue);
    });
  };

  const handleSaveSettings = async () => {
    try {
      const settingsToSave = {
        ...calculationSettings,
        useManualCoordinates,
      };

      const response = await fetch('/api/prayer-times/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsToSave),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      // Update original settings to match current settings
      setOriginalSettings(calculationSettings);
      setHasUnsavedChanges(false);
      setError(null);
    } catch (error) {
      setError('Error saving calculation settings. Please try again.');
    }
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = text.split(/\r?\n/).filter(row => row.trim()).map(row => row.split(',').map(cell => cell.trim()));
      const headers = rows[0].map(header => header.trim());

      // Validate CSV format
      const requiredColumns = ['Date', 'Fajr', 'Sunrise', 'Zuhr', 'Asr', 'Maghrib', 'Isha'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      
      if (missingColumns.length > 0) {
        setError(`Missing required columns: ${missingColumns.join(', ')}`);
        return;
      }

      // Parse CSV data
      const parsedTimes = rows.slice(1).map(row => {
        const timeObj: Record<string, any> = {}; // Use Record for dynamic property access
        headers.forEach((header: string, index: number) => {
          if (header === 'Date') {
            try {
              let date: Date;
              try {
                date = parse(row[index], 'yyyy-MM-dd', new Date());
                if (isNaN(date.getTime())) {
                  date = parse(row[index], 'MM/dd/yyyy', new Date());
                }
              } catch {
                date = parse(row[index], 'dd/MM/yyyy', new Date());
              }
              timeObj.date = date;
            } catch (error) {
              throw new Error(`Invalid date format in row: ${row.join(', ')}`);
            }
          } else {
            const key = header.toLowerCase().replace(/\s+/g, '');
            timeObj[key] = row[index];
          }
        });

        // Validate time format
        const timeFields = ['fajr', 'sunrise', 'zuhr', 'asr', 'maghrib', 'isha'];
        timeFields.forEach(field => {
          if (timeObj[field] && !timeObj[field].match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
            throw new Error(`Invalid time format for ${field} in row: ${row.join(', ')}`);
          }
        });
        
        // Cast the dynamically built object to PrayerTime
        return timeObj as unknown as PrayerTime;
      });

      // Save to database
      const response = await fetch('/api/prayer-times', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedTimes),
      });

      if (!response.ok) {
        throw new Error('Failed to save prayer times');
      }

      await fetchPrayerTimes();
      setActiveTab(2);
      setError(null);
    } catch (err) {
      setError(`Error processing CSV file: ${err instanceof Error ? err.message : 'Please ensure it matches the required format.'}`);
    }
  };

  const handleCalculate = () => {
    try {
      // If not using manual coordinates, fetch the latest masjid coordinates
      if (!useManualCoordinates) {
        fetchLatestMasjidCoordinates().then(() => {
          const times = generatePrayerTimesForMonth(calculationSettings, calculationSettings.month, calculationSettings.year);
          setPrayerTimes(times);
          setError(null);
        });
      } else {
        const times = generatePrayerTimesForMonth(calculationSettings, calculationSettings.month, calculationSettings.year);
        setPrayerTimes(times);
        setError(null);
      }
    } catch (error) {
      console.error('Error calculating prayer times:', error);
      setError('Error calculating prayer times. Please check your settings.');
    }
  };

  const handleCalculateYear = () => {
    try {
      // If not using manual coordinates, fetch the latest masjid coordinates
      if (!useManualCoordinates) {
        fetchLatestMasjidCoordinates().then(() => {
          const times = generatePrayerTimesForYear(calculationSettings, calculationSettings.year);
          setPrayerTimes(times);
          setError(null);
        });
      } else {
        const times = generatePrayerTimesForYear(calculationSettings, calculationSettings.year);
        setPrayerTimes(times);
        setError(null);
      }
    } catch (error) {
      console.error('Error calculating prayer times for the year:', error);
      setError('Error calculating prayer times for the year. Please check your settings.');
    }
  };

  // Add function to fetch the latest masjid coordinates
  const fetchLatestMasjidCoordinates = async () => {
    try {
      const response = await fetch('/api/masjid/info');
      if (!response.ok) {
        throw new Error('Failed to fetch masjid info');
      }
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        // Update calculation settings with the latest masjid coordinates
        setCalculationSettings(prev => ({
          ...prev,
          latitude: data.latitude,
          longitude: data.longitude,
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error fetching masjid coordinates:', error);
      setError('Failed to fetch masjid coordinates. Please enter them manually.');
      return false;
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedTime) return;

    try {
      const response = await fetch('/api/prayer-times', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedTime),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      await fetchPrayerTimes();
      setIsEditDialogOpen(false);
      setSelectedTime(null);
    } catch (error) {
      setError('Error saving changes. Please try again.');
    }
  };

  const handleDeleteTime = async (time: PrayerTime) => {
    try {
      const response = await fetch(`/api/prayer-times?date=${time.date.toISOString()}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      await fetchPrayerTimes();
    } catch (error) {
      setError('Error deleting entry. Please try again.');
    }
  };

  const handleInlineSave = async (row: PrayerTime, field: keyof PrayerTime, value: string) => {
    try {
      if (field !== 'date' && field !== 'source' && !value.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
        setError('Invalid time format. Please use HH:mm format.');
        return;
      }

      const response = await fetch('/api/prayer-times', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...row,
          [field]: value,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      await fetchPrayerTimes();
      setError(null);
    } catch (error) {
      setError('Error saving changes. Please try again.');
    }
  };

  // Toggle between automatic and manual coordinates
  const handleCoordinatesToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseManualCoordinates(event.target.checked);
    setHasUnsavedChanges(true);
  };

  // Component render
  if (fatalError) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Alert severity="error">{fatalError}</Alert>
      </Box>
    );
  }

  // Show loading indicator when loading initial data
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      p: 3,
      maxWidth: '1400px',
      mx: 'auto'
    }}>
      {/* Page Title */}
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
        {pageTitle}
      </Typography>

      {/* Description */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Manage and customize prayer times for your masjid.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You can calculate prayer times automatically, upload prayer times via CSV, or manually edit individual entries.
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Calculate Times" />
          <Tab label="Upload CSV" />
          <Tab label="View/Edit Times" />
        </Tabs>
      </Box>

      {/* Display non-fatal errors */}
      {error && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          <Typography variant="body1">{error}</Typography>
        </Alert>
      )}

      {activeTab === 0 && (
        <Card sx={{ mb: 3, mx: 'auto', width: '100%', maxWidth: '1200px' }}>
          <CardContent sx={{ p: '32px 40px' }}>
            <Stack spacing={4}>
              <Typography variant="h5" fontWeight="medium">Calculation Settings</Typography>
              <Grid container spacing={3} sx={{ px: { xs: 0, sm: 1 } }}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={useManualCoordinates}
                        onChange={handleCoordinatesToggle}
                        color="primary"
                      />
                    }
                    label="Use manual coordinates"
                  />
                  
                  {!useManualCoordinates && masjidAddress && (
                    <Alert 
                      severity="info" 
                      icon={<LocationIcon />}
                      sx={{ mt: 2, display: 'flex', alignItems: 'center' }}
                    >
                      <AlertTitle>Using Masjid Location</AlertTitle>
                      <Typography variant="body2">
                        {masjidAddress}
                      </Typography>
                    </Alert>
                  )}
                  
                  {!useManualCoordinates && !masjidAddress && (
                    <Alert 
                      severity="warning"
                      sx={{ mt: 2 }}
                    >
                      <AlertTitle>No Address Found</AlertTitle>
                      <Typography variant="body2">
                        Please update your masjid address in the settings or use manual coordinates.
                      </Typography>
                    </Alert>
                  )}
                  
                  {useManualCoordinates && (
                    <>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Latitude"
                            type="number"
                            value={calculationSettings.latitude}
                            onChange={(e) => setCalculationSettings({
                              ...calculationSettings,
                              latitude: parseFloat(e.target.value),
                            })}
                            fullWidth
                            variant="outlined"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LocationIcon fontSize="small" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Longitude"
                            type="number"
                            value={calculationSettings.longitude}
                            onChange={(e) => setCalculationSettings({
                              ...calculationSettings,
                              longitude: parseFloat(e.target.value),
                            })}
                            fullWidth
                            variant="outlined"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LocationIcon fontSize="small" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                      </Grid>
                    </>
                  )}
                </Grid>
                <Grid item xs={12} sm={6} sx={{ pr: { sm: 2 } }}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Calculation Method</InputLabel>
                    <Select
                      value={calculationSettings.calculationMethod}
                      label="Calculation Method"
                      onChange={(e) => setCalculationSettings({
                        ...calculationSettings,
                        calculationMethod: e.target.value,
                      })}
                    >
                      {CALCULATION_METHODS.map((method) => (
                        <MenuItem key={method.value} value={method.value}>
                          {method.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} sx={{ pr: { sm: 2 } }}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Madhab</InputLabel>
                    <Select
                      value={calculationSettings.madhab}
                      label="Madhab"
                      onChange={(e) => setCalculationSettings({
                        ...calculationSettings,
                        madhab: e.target.value,
                      })}
                    >
                      {MADHABS.map((madhab) => (
                        <MenuItem key={madhab.value} value={madhab.value}>
                          {madhab.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} sx={{ pr: { sm: 2 } }}>
                  <TextField
                    label="Month"
                    type="number"
                    value={calculationSettings.month}
                    onChange={(e) => setCalculationSettings({
                      ...calculationSettings,
                      month: parseInt(e.target.value),
                    })}
                    inputProps={{ min: 1, max: 12 }}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6} sx={{ pr: { sm: 2 } }}>
                  <TextField
                    label="Year"
                    type="number"
                    value={calculationSettings.year}
                    onChange={(e) => setCalculationSettings({
                      ...calculationSettings,
                      year: parseInt(e.target.value),
                    })}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
              </Grid>

              <Divider />

              <Typography variant="h5" fontWeight="medium">Adjustments (minutes)</Typography>
              <Grid container spacing={3} sx={{ px: { xs: 0, sm: 1 } }}>
                {Object.keys(calculationSettings.adjustments).map((prayer) => (
                  <Grid item xs={12} sm={6} md={4} key={prayer} sx={{ pr: { sm: 2 } }}>
                    <TextField
                      label={`${prayer.charAt(0).toUpperCase() + prayer.slice(1)} Adjustment`}
                      type="number"
                      value={calculationSettings.adjustments[prayer as keyof typeof calculationSettings.adjustments]}
                      onChange={(e) => setCalculationSettings({
                        ...calculationSettings,
                        adjustments: {
                          ...calculationSettings.adjustments,
                          [prayer]: parseInt(e.target.value) || 0,
                        },
                      })}
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ pt: 2 }}>
                <Stack direction="row" spacing={2}>
                  <Button 
                    variant="contained" 
                    onClick={handleCalculate}
                    size="large"
                    sx={{ px: 3, py: 1 }}
                  >
                    Calculate Month
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={handleCalculateYear}
                    size="large"
                    sx={{ px: 3, py: 1 }}
                  >
                    Calculate Year
                  </Button>
                  {hasUnsavedChanges && (
                    <Button 
                      variant="contained" 
                      color="secondary"
                      onClick={handleSaveSettings}
                      size="large"
                      sx={{ px: 3, py: 1 }}
                      startIcon={<SaveIcon />}
                    >
                      Save Settings
                    </Button>
                  )}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card sx={{ mb: 3, mx: 'auto', width: '100%', maxWidth: '1200px' }}>
          <CardContent sx={{ p: '32px 40px' }}>
            <Stack spacing={3}>
              <Typography variant="h5" fontWeight="medium">Upload Prayer Times</Typography>
              <Typography variant="body1">
                Upload a CSV file with prayer times. The file should include the following columns:
                Date (DD/MM/YYYY), Fajr, Sunrise, Zuhr, Asr, Maghrib, Isha, and optional Jamaat times.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', pt: 1 }}>
                <Button
                  variant="contained"
                  component="label"
                  size="large"
                  sx={{ px: 3, py: 1 }}
                >
                  Upload CSV File
                  <input
                    type="file"
                    hidden
                    accept=".csv"
                    onChange={handleCSVUpload}
                  />
                </Button>
                <Button
                  variant="outlined"
                  component="a"
                  href="/example-timetable.csv"
                  download
                  startIcon={<DownloadIcon />}
                  size="large"
                  sx={{ px: 3, py: 1 }}
                >
                  Download Example CSV
                </Button>
              </Box>
              <Alert severity="info" sx={{ mt: 1 }}>
                <AlertTitle>CSV Format Guidelines</AlertTitle>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  <li>Date must be in DD/MM/YYYY format</li>
                  <li>Times must be in 24-hour format (HH:mm)</li>
                  <li>Required columns: Date, Fajr, Sunrise, Zuhr, Asr, Maghrib, Isha</li>
                  <li>Optional columns: Fajr Jamaat, Zuhr Jamaat, Asr Jamaat, Maghrib Jamaat, Isha Jamaat</li>
                  <li>For Fridays, you can include Jummah Khutbah and Jummah Jamaat times</li>
                </ul>
              </Alert>
              {error && (
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card sx={{ mb: 3, mx: 'auto', width: '100%', maxWidth: '1200px' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: '32px 40px', pb: 2 }}>
              <Typography variant="h5" fontWeight="medium" sx={{ mb: 3 }}>Prayer Times Table</Typography>
            </Box>
            <Box>
              <TableContainer component={Paper} sx={{ 
                borderRadius: 0,
                boxShadow: 'none',
                '& .MuiTable-root': {
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                },
                '& .MuiTableCell-root': {
                  borderBottom: '1px solid rgba(224, 224, 224, 1)',
                  padding: '12px 16px',
                  '&:first-of-type': {
                    pl: '40px'
                  },
                  '&:last-of-type': {
                    pr: '40px'
                  }
                },
                '& .MuiTableHead-root .MuiTableCell-root': {
                  background: (theme) => theme.palette.grey[50],
                  fontWeight: 600
                }
              }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Fajr</TableCell>
                      <TableCell>Fajr Jamaat</TableCell>
                      <TableCell>Sunrise</TableCell>
                      <TableCell>Zuhr</TableCell>
                      <TableCell>Zuhr Jamaat</TableCell>
                      <TableCell>Asr</TableCell>
                      <TableCell>Asr Jamaat</TableCell>
                      <TableCell>Maghrib</TableCell>
                      <TableCell>Maghrib Jamaat</TableCell>
                      <TableCell>Isha</TableCell>
                      <TableCell>Isha Jamaat</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {prayerTimes.map((time) => (
                      <TableRow 
                        key={time.date.toString()}
                        sx={{
                          backgroundColor: time.isManuallySet ? 'rgba(255, 255, 0, 0.1)' : 'inherit',
                        }}
                      >
                        <TableCell>{format(time.date, 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{time.source || 'N/A'}</TableCell>
                        <EditableCell value={time.fajr} row={time} field="fajr" onSave={handleInlineSave} />
                        <EditableCell value={time.fajrJamaat} row={time} field="fajrJamaat" onSave={handleInlineSave} />
                        <EditableCell value={time.sunrise} row={time} field="sunrise" onSave={handleInlineSave} />
                        <EditableCell value={time.zuhr} row={time} field="zuhr" onSave={handleInlineSave} />
                        <EditableCell value={time.zuhrJamaat} row={time} field="zuhrJamaat" onSave={handleInlineSave} />
                        <EditableCell value={time.asr} row={time} field="asr" onSave={handleInlineSave} />
                        <EditableCell value={time.asrJamaat} row={time} field="asrJamaat" onSave={handleInlineSave} />
                        <EditableCell value={time.maghrib} row={time} field="maghrib" onSave={handleInlineSave} />
                        <EditableCell value={time.maghribJamaat} row={time} field="maghribJamaat" onSave={handleInlineSave} />
                        <EditableCell value={time.isha} row={time} field="isha" onSave={handleInlineSave} />
                        <EditableCell value={time.ishaJamaat} row={time} field="ishaJamaat" onSave={handleInlineSave} />
                        <TableCell>
                          <IconButton size="small" onClick={() => handleDeleteTime(time)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </CardContent>
        </Card>
      )}

      <Dialog 
        open={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            m: 2,
            width: 'calc(100% - 32px)',
            maxWidth: { xs: 'calc(100% - 32px)', sm: '600px' }
          }
        }}
      >
        <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 'medium', pb: 1, px: '32px', pt: '24px' }}>
          Edit Prayer Times
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 2, px: '32px' }}>
          <Stack spacing={3}>
            {selectedTime && (
              <>
                <TextField
                  label="Date"
                  value={format(selectedTime.date, 'dd/MM/yyyy')}
                  disabled
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  label="Fajr"
                  value={selectedTime.fajr}
                  onChange={(e) => setSelectedTime({ ...selectedTime, fajr: e.target.value })}
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  label="Fajr Jamaat"
                  value={selectedTime.fajrJamaat}
                  onChange={(e) => setSelectedTime({ ...selectedTime, fajrJamaat: e.target.value })}
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  label="Sunrise"
                  value={selectedTime.sunrise}
                  onChange={(e) => setSelectedTime({ ...selectedTime, sunrise: e.target.value })}
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  label="Zuhr"
                  value={selectedTime.zuhr}
                  onChange={(e) => setSelectedTime({ ...selectedTime, zuhr: e.target.value })}
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  label="Zuhr Jamaat"
                  value={selectedTime.zuhrJamaat}
                  onChange={(e) => setSelectedTime({ ...selectedTime, zuhrJamaat: e.target.value })}
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  label="Asr"
                  value={selectedTime.asr}
                  onChange={(e) => setSelectedTime({ ...selectedTime, asr: e.target.value })}
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  label="Asr Jamaat"
                  value={selectedTime.asrJamaat}
                  onChange={(e) => setSelectedTime({ ...selectedTime, asrJamaat: e.target.value })}
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  label="Maghrib"
                  value={selectedTime.maghrib}
                  onChange={(e) => setSelectedTime({ ...selectedTime, maghrib: e.target.value })}
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  label="Maghrib Jamaat"
                  value={selectedTime.maghribJamaat}
                  onChange={(e) => setSelectedTime({ ...selectedTime, maghribJamaat: e.target.value })}
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  label="Isha"
                  value={selectedTime.isha}
                  onChange={(e) => setSelectedTime({ ...selectedTime, isha: e.target.value })}
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  label="Isha Jamaat"
                  value={selectedTime.ishaJamaat}
                  onChange={(e) => setSelectedTime({ ...selectedTime, ishaJamaat: e.target.value })}
                  variant="outlined"
                  fullWidth
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: '32px', pb: '24px', pt: 2 }}>
          <Button 
            onClick={() => setIsEditDialogOpen(false)} 
            size="large"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained" 
            size="large"
            sx={{ px: 3, py: 1 }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 