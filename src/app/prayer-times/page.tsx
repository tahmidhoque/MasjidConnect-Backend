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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Save as SaveIcon, Close as CloseIcon, Download as DownloadIcon } from '@mui/icons-material';
import { format, parse } from 'date-fns';
import { calculatePrayerTimes, generatePrayerTimesForMonth, generatePrayerTimesForYear } from '@/lib/prayer-times';
import React from 'react';

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

  // Load initial data
  React.useEffect(() => {
    fetchPrayerTimes();
  }, []);

  const fetchPrayerTimes = async () => {
    try {
      const response = await fetch('/api/prayer-times');
      if (!response.ok) throw new Error('Failed to fetch prayer times');
      const data = await response.json();
      setPrayerTimes(data);
    } catch (err) {
      setError('Failed to load prayer times');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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
        const timeObj: any = {};
        headers.forEach((header: string, index: number) => {
          if (header === 'Date') {
            try {
              let date;
              try {
                date = parse(row[index], 'MM/dd/yyyy', new Date());
                if (isNaN(date.getTime())) {
                  date = parse(row[index], 'dd/MM/yyyy', new Date());
                }
              } catch {
                date = parse(row[index], 'dd/MM/yyyy', new Date());
              }
              timeObj.date = date;
            } catch (err) {
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

        return timeObj;
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
      const times = generatePrayerTimesForMonth(calculationSettings, calculationSettings.month, calculationSettings.year);
      setPrayerTimes(times);
      setError(null);
    } catch (err) {
      setError('Error calculating prayer times. Please check your settings.');
    }
  };

  const handleCalculateYear = () => {
    try {
      const times = generatePrayerTimesForYear(calculationSettings, calculationSettings.year);
      setPrayerTimes(times);
      setError(null);
    } catch (err) {
      setError('Error calculating prayer times for the year. Please check your settings.');
    }
  };

  const handleEditTime = (time: PrayerTime) => {
    setSelectedTime(time);
    setIsEditDialogOpen(true);
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
      setError('Error saving changes. Please try again.');
    }
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Prayer Times Management
          </Typography>

          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              mb: 3
            }}
          >
            <Tab label="Calculate Times" />
            <Tab label="Upload CSV" />
            <Tab label="View/Edit Times" />
          </Tabs>

          {activeTab === 0 && (
            <Box>
            <Stack spacing={3}>
                <Typography variant="h6">Calculation Settings</Typography>
                <Grid container spacing={2}>
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
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
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
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
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
                  <Grid item xs={12} sm={6}>
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
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Year"
                      type="number"
                      value={calculationSettings.year}
                      onChange={(e) => setCalculationSettings({
                        ...calculationSettings,
                        year: parseInt(e.target.value),
                      })}
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <Typography variant="h6">Adjustments (minutes)</Typography>
                <Grid container spacing={2}>
                  {Object.keys(calculationSettings.adjustments).map((prayer) => (
                    <Grid item xs={12} sm={6} md={4} key={prayer}>
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
                    />
                  </Grid>
                ))}
              </Grid>

                <Stack direction="row" spacing={2}>
                  <Button variant="contained" onClick={handleCalculate}>
                    Calculate Month
                  </Button>
                  <Button variant="outlined" onClick={handleCalculateYear}>
                    Calculate Year
                  </Button>
                </Stack>
              </Stack>
            </Box>
          )}

          {activeTab === 1 && (
              <Box>
              <Stack spacing={2}>
                <Typography variant="body1">
                  Upload a CSV file with prayer times. The file should include the following columns:
                  Date (DD/MM/YYYY), Fajr, Sunrise, Zuhr, Asr, Maghrib, Isha, and optional Jamaat times.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                  variant="contained"
                    component="label"
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
                  >
                    Download Example CSV
                </Button>
                </Box>
                <Alert severity="info" sx={{ mt: 2 }}>
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
            </Box>
          )}

          {activeTab === 2 && (
            <Box sx={{ margin: -3 }}>
              <TableContainer component={Paper} sx={{ 
                borderRadius: 0,
                '& .MuiTable-root': {
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                },
                '& .MuiTableCell-root': {
                  borderBottom: '1px solid rgba(224, 224, 224, 1)',
                  '&:first-of-type': {
                    pl: 3
                  },
                  '&:last-of-type': {
                    pr: 3
                  }
                },
                '& .MuiTableHead-root .MuiTableCell-root': {
                  background: (theme) => theme.palette.grey[50],
                  fontWeight: 600
                }
              }}>
                <Table size="small" stickyHeader>
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
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }} 
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <DialogTitle>Edit Prayer Times</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {selectedTime && (
              <>
                <TextField
                  label="Date"
                  value={format(selectedTime.date, 'dd/MM/yyyy')}
                  disabled
                />
                <TextField
                  label="Fajr"
                  value={selectedTime.fajr}
                  onChange={(e) => setSelectedTime({ ...selectedTime, fajr: e.target.value })}
                />
                <TextField
                  label="Fajr Jamaat"
                  value={selectedTime.fajrJamaat}
                  onChange={(e) => setSelectedTime({ ...selectedTime, fajrJamaat: e.target.value })}
                />
                <TextField
                  label="Sunrise"
                  value={selectedTime.sunrise}
                  onChange={(e) => setSelectedTime({ ...selectedTime, sunrise: e.target.value })}
                />
                <TextField
                  label="Zuhr"
                  value={selectedTime.zuhr}
                  onChange={(e) => setSelectedTime({ ...selectedTime, zuhr: e.target.value })}
                />
                <TextField
                  label="Zuhr Jamaat"
                  value={selectedTime.zuhrJamaat}
                  onChange={(e) => setSelectedTime({ ...selectedTime, zuhrJamaat: e.target.value })}
                />
                <TextField
                  label="Asr"
                  value={selectedTime.asr}
                  onChange={(e) => setSelectedTime({ ...selectedTime, asr: e.target.value })}
                />
                <TextField
                  label="Asr Jamaat"
                  value={selectedTime.asrJamaat}
                  onChange={(e) => setSelectedTime({ ...selectedTime, asrJamaat: e.target.value })}
                />
                <TextField
                  label="Maghrib"
                  value={selectedTime.maghrib}
                  onChange={(e) => setSelectedTime({ ...selectedTime, maghrib: e.target.value })}
                />
                <TextField
                  label="Maghrib Jamaat"
                  value={selectedTime.maghribJamaat}
                  onChange={(e) => setSelectedTime({ ...selectedTime, maghribJamaat: e.target.value })}
                />
                <TextField
                  label="Isha"
                  value={selectedTime.isha}
                  onChange={(e) => setSelectedTime({ ...selectedTime, isha: e.target.value })}
                />
                <TextField
                  label="Isha Jamaat"
                  value={selectedTime.ishaJamaat}
                  onChange={(e) => setSelectedTime({ ...selectedTime, ishaJamaat: e.target.value })}
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 