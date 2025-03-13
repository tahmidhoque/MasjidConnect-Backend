"use client";

import { useState, useCallback, useEffect } from 'react';
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
  IconButton,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid,
  Divider,
  Switch,
  FormControlLabel,
  InputAdornment,
  CircularProgress,
  TablePagination,
} from '@mui/material';
import { Delete as DeleteIcon, Save as SaveIcon, Download as DownloadIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import { format, parse } from 'date-fns';
import { generatePrayerTimesForMonth, generatePrayerTimesForYear } from '@/lib/prayer-times';
import React from 'react';
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext';
import PageHeader from '@/components/layouts/page-header';
import PrayerTimesTable, { PrayerTime } from '@/components/prayer-times/PrayerTimesTable';
import EditPrayerTimeDialog from '@/components/prayer-times/EditPrayerTimeDialog';
import CalculationSettings from '@/components/prayer-times/CalculationSettings';
import CsvUploader from '@/components/prayer-times/CsvUploader';
import CustomAlert from '@/components/ui/CustomAlert';

export default function PrayerTimesAdmin() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [selectedTime, setSelectedTime] = useState<PrayerTime | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [masjidAddress, setMasjidAddress] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  
  // Month filter state
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [filteredPrayerTimes, setFilteredPrayerTimes] = useState<PrayerTime[]>([]);
  
  // Use the global unsaved changes context
  const { hasUnsavedChanges, setHasUnsavedChanges, confirmNavigation } = useUnsavedChanges();
  
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
      setIsLoading(true);
      const response = await fetch('/api/prayer-times');
      if (!response.ok) throw new Error('Failed to fetch prayer times');
      const data = await response.json();
      
      // Convert date strings to Date objects
      const formattedData = data.map((item: any) => ({
        ...item,
        date: new Date(item.date)
      }));
      
      setPrayerTimes(formattedData);
    } catch (error) {
      setFatalError('Failed to load prayer times');
    } finally {
      setIsLoading(false);
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
      setSaving(true);
      const text = await file.text();
      const rows = text.split(/\r?\n/).filter(row => row.trim()).map(row => row.split(',').map(cell => cell.trim()));
      const headers = rows[0].map(header => header.trim());

      // Validate CSV format
      const requiredColumns = ['Date', 'Fajr', 'Sunrise', 'Zuhr', 'Asr', 'Maghrib', 'Isha'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      
      if (missingColumns.length > 0) {
        setError(`Missing required columns: ${missingColumns.join(', ')}`);
        setSaving(false);
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
      setSuccess('Prayer times uploaded and saved successfully');
      // Clear success message after 6 seconds
      setTimeout(() => setSuccess(null), 6000);
      setError(null);
    } catch (err) {
      setError(`Error processing CSV file: ${err instanceof Error ? err.message : 'Please ensure it matches the required format.'}`);
    } finally {
      setSaving(false);
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
      console.error('Error calculating prayer times for year:', error);
      setError('Error calculating prayer times for year. Please check your settings.');
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

  // Filter prayer times by month
  const filterPrayerTimesByMonth = useCallback(() => {
    if (selectedMonth === 'all') {
      setFilteredPrayerTimes(prayerTimes);
    } else {
      const monthNumber = parseInt(selectedMonth);
      const filtered = prayerTimes.filter(time => {
        const date = new Date(time.date);
        return date.getMonth() + 1 === monthNumber;
      });
      setFilteredPrayerTimes(filtered);
    }
    // Reset to first page when filter changes
    setPage(0);
  }, [prayerTimes, selectedMonth]);

  // Update filtered data when prayer times or selected month changes
  useEffect(() => {
    filterPrayerTimesByMonth();
  }, [prayerTimes, selectedMonth, filterPrayerTimesByMonth]);

  // Handle month filter change
  const handleMonthFilterChange = (event: SelectChangeEvent<string>) => {
    setSelectedMonth(event.target.value);
  };

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Save calculated prayer times to the database
  const handleSaveCalculatedTimes = async () => {
    if (!prayerTimes || prayerTimes.length === 0) {
      setError('Please calculate prayer times first');
      return;
    }

    try {
      setSaving(true);
      
      // Ensure all times have the source set to CALCULATION
      const timesToSave = prayerTimes.map(time => ({
        ...time,
        source: 'CALCULATION',
        isManuallySet: false
      }));
      
      const response = await fetch('/api/prayer-times', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(timesToSave),
      });

      if (!response.ok) {
        throw new Error('Failed to save calculated prayer times');
      }

      setSuccess('Prayer times saved successfully');
      // Clear success message after 6 seconds
      setTimeout(() => setSuccess(null), 6000);
      
      // Refresh the prayer times from the database
      await fetchPrayerTimes();
      
      // Switch to the view/edit tab
      setActiveTab(0);
    } catch (error) {
      console.error('Error saving calculated prayer times:', error);
      setError('Failed to save calculated prayer times. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Export prayer times as CSV
  const handleExportCSV = () => {
    if (!filteredPrayerTimes || filteredPrayerTimes.length === 0) {
      setError('No prayer times to export');
      return;
    }

    try {
      // Define CSV headers
      const headers = [
        'Date',
        'Fajr',
        'Sunrise',
        'Zuhr',
        'Asr',
        'Maghrib',
        'Isha',
        'Fajr Jamaat',
        'Zuhr Jamaat',
        'Asr Jamaat',
        'Maghrib Jamaat',
        'Isha Jamaat',
        'Jummah Khutbah',
        'Jummah Jamaat'
      ];

      // Format the data
      const csvData = filteredPrayerTimes.map(time => {
        const date = new Date(time.date);
        return [
          format(date, 'dd/MM/yyyy'),
          time.fajr,
          time.sunrise || '',
          time.zuhr,
          time.asr,
          time.maghrib,
          time.isha,
          time.fajrJamaat || '',
          time.zuhrJamaat || '',
          time.asrJamaat || '',
          time.maghribJamaat || '',
          time.ishaJamaat || '',
          time.jummahKhutbah || '',
          time.jummahJamaat || ''
        ];
      });

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      
      // Set filename based on filter
      const filename = selectedMonth === 'all' 
        ? `prayer-times-${calculationSettings.year}.csv`
        : `prayer-times-${calculationSettings.year}-${selectedMonth}.csv`;
      
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setError('Failed to export CSV. Please try again.');
    }
  };

  // Component render
  if (fatalError) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CustomAlert severity="error">{fatalError}</CustomAlert>
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
    <>
      <PageHeader title="Prayer Times" />
      
      <Box sx={{ 
        width: '100%', 
        maxWidth: '1400px',
        mx: 'auto'
      }}>
        {/* Subtitle */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Manage and customize prayer times for your masjid. You can calculate prayer times automatically or upload prayer times via CSV.
        </Typography>
        
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Calculate Times" />
            <Tab label="Upload CSV" />
          </Tabs>
        </Box>

        {/* Display non-fatal errors */}
        {error && (
          <CustomAlert 
            severity="warning" 
            sx={{ mb: 3 }}
            onClose={() => setError(null)}
          >
            <Typography variant="body1">{error}</Typography>
          </CustomAlert>
        )}
        
        {/* Display success messages */}
        {success && (
          <CustomAlert 
            severity="success" 
            sx={{ mb: 3 }}
            onClose={() => setSuccess(null)}
          >
            <Typography variant="body1">{success}</Typography>
          </CustomAlert>
        )}

        {activeTab === 0 && (
          <>
            <Box sx={{ 
              width: '100%', 
              maxWidth: '100%',
              overflowX: 'hidden'
            }}>
              <CalculationSettings
                calculationSettings={calculationSettings}
                originalSettings={originalSettings}
                useManualCoordinates={useManualCoordinates}
                masjidAddress={masjidAddress}
                hasUnsavedChanges={hasUnsavedChanges}
                saving={saving}
                onCalculationSettingsChange={setCalculationSettings}
                onCoordinatesToggle={handleCoordinatesToggle}
                onCalculate={handleCalculate}
                onCalculateYear={handleCalculateYear}
                onSaveSettings={handleSaveSettings}
              />
            </Box>

            {prayerTimes && prayerTimes.length > 0 && (
              <>
                <Divider sx={{ my: 4 }} />
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" fontWeight="medium" sx={{ mb: 3 }}>View/Edit Prayer Times</Typography>
                  
                  <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                    <Button 
                      variant="contained" 
                      onClick={handleSaveCalculatedTimes}
                      disabled={saving}
                      startIcon={<SaveIcon />}
                      size="large"
                      sx={{ px: 3, py: 1 }}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      onClick={handleExportCSV}
                      disabled={saving}
                      startIcon={<DownloadIcon />}
                      size="large"
                      sx={{ px: 3, py: 1 }}
                    >
                      Export as CSV
                    </Button>
                  </Stack>
                  
                  <PrayerTimesTable
                    prayerTimes={prayerTimes}
                    filteredPrayerTimes={filteredPrayerTimes}
                    selectedMonth={selectedMonth}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onMonthFilterChange={handleMonthFilterChange}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    onInlineSave={handleInlineSave}
                    onDeleteTime={handleDeleteTime}
                  />
                </Box>
              </>
            )}
          </>
        )}

        {activeTab === 1 && (
          <>
            <CsvUploader
              saving={saving}
              onCsvUpload={handleCSVUpload}
            />

            {prayerTimes && prayerTimes.length > 0 && (
              <>
                <Divider sx={{ my: 4 }} />
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" fontWeight="medium" sx={{ mb: 3 }}>View/Edit Prayer Times</Typography>
                  
                  <PrayerTimesTable
                    prayerTimes={prayerTimes}
                    filteredPrayerTimes={filteredPrayerTimes}
                    selectedMonth={selectedMonth}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onMonthFilterChange={handleMonthFilterChange}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    onInlineSave={handleInlineSave}
                    onDeleteTime={handleDeleteTime}
                    highlightManuallySet={true}
                  />
                </Box>
              </>
            )}
          </>
        )}

        <EditPrayerTimeDialog
          open={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          selectedTime={selectedTime}
          onSave={handleSaveEdit}
          onTimeChange={(field, value) => {
            if (selectedTime) {
              setSelectedTime({
                ...selectedTime,
                [field]: value
              });
            }
          }}
        />
      </Box>
    </>
  );
} 