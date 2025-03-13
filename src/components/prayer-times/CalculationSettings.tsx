import React from 'react';
import {
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Switch,
  InputAdornment,
  Button,
  Stack,
  Divider,
  Paper,
} from '@mui/material';
import { LocationOn as LocationIcon, Save as SaveIcon } from '@mui/icons-material';
import CustomAlert from '@/components/ui/CustomAlert';

interface CalculationMethod {
  value: string;
  label: string;
}

interface Madhab {
  value: string;
  label: string;
}

interface Adjustments {
  fajr: number;
  sunrise: number;
  zuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

interface CalculationSettingsType {
  latitude: number;
  longitude: number;
  calculationMethod: string;
  madhab: string;
  month: number;
  year: number;
  adjustments: Adjustments;
  useManualCoordinates?: boolean;
}

interface CalculationSettingsProps {
  calculationSettings: CalculationSettingsType;
  originalSettings: CalculationSettingsType;
  useManualCoordinates: boolean;
  masjidAddress: string;
  hasUnsavedChanges: boolean;
  saving: boolean;
  onCalculationSettingsChange: (settings: CalculationSettingsType) => void;
  onCoordinatesToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCalculate: () => void;
  onCalculateYear: () => void;
  onSaveSettings: () => void;
}

const CALCULATION_METHODS: CalculationMethod[] = [
  { value: 'MWL', label: 'Muslim World League' },
  { value: 'ISNA', label: 'Islamic Society of North America' },
  { value: 'Egypt', label: 'Egyptian General Authority' },
  { value: 'Makkah', label: 'Umm Al-Qura University, Makkah' },
  { value: 'Karachi', label: 'University of Islamic Sciences, Karachi' },
  { value: 'Tehran', label: 'Institute of Geophysics, Tehran' },
  { value: 'Singapore', label: 'Singapore' },
];

const MADHABS: Madhab[] = [
  { value: 'Shafi', label: 'Shafi' },
  { value: 'Hanafi', label: 'Hanafi' },
];

const CalculationSettings: React.FC<CalculationSettingsProps> = ({
  calculationSettings,
  originalSettings,
  useManualCoordinates,
  masjidAddress,
  hasUnsavedChanges,
  saving,
  onCalculationSettingsChange,
  onCoordinatesToggle,
  onCalculate,
  onCalculateYear,
  onSaveSettings,
}) => {
  const handleSettingChange = (field: keyof CalculationSettingsType, value: any) => {
    onCalculationSettingsChange({
      ...calculationSettings,
      [field]: value,
    });
  };

  const handleAdjustmentChange = (prayer: keyof Adjustments, value: number) => {
    onCalculationSettingsChange({
      ...calculationSettings,
      adjustments: {
        ...calculationSettings.adjustments,
        [prayer]: value,
      },
    });
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight="medium" sx={{ mb: 3 }}>Calculation Settings</Typography>
        <Grid container spacing={3} sx={{ px: { xs: 0, sm: 1 } }}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={useManualCoordinates}
                  onChange={onCoordinatesToggle}
                  color="primary"
                />
              }
              label="Use manual coordinates"
            />
            
            {!useManualCoordinates && masjidAddress && (
              <CustomAlert 
                severity="info" 
                icon={<LocationIcon />}
                sx={{ 
                  mt: 2, 
                  display: 'flex', 
                  alignItems: 'center',
                  width: '100%',
                  boxSizing: 'border-box',
                  wordBreak: 'break-word'
                }}
                title="Using Masjid Location"
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto',
                    maxWidth: '100%'
                  }}
                >
                  {masjidAddress}
                </Typography>
              </CustomAlert>
            )}
            
            {!useManualCoordinates && !masjidAddress && (
              <CustomAlert 
                severity="warning"
                sx={{ 
                  mt: 2,
                  width: '100%',
                  boxSizing: 'border-box',
                  wordBreak: 'break-word'
                }}
                title="No Address Found"
              >
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  Please update your masjid address in the settings or use manual coordinates.
                </Typography>
              </CustomAlert>
            )}
          </Grid>
          
          {useManualCoordinates && (
            <>
              <Grid item xs={12} sm={6} sx={{ pr: { sm: 2 } }}>
                <TextField
                  label="Latitude"
                  type="number"
                  value={calculationSettings.latitude}
                  onChange={(e) => handleSettingChange('latitude', parseFloat(e.target.value))}
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
              <Grid item xs={12} sm={6} sx={{ pr: { sm: 2 } }}>
                <TextField
                  label="Longitude"
                  type="number"
                  value={calculationSettings.longitude}
                  onChange={(e) => handleSettingChange('longitude', parseFloat(e.target.value))}
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
            </>
          )}
          <Grid item xs={12} sm={6} sx={{ pr: { sm: 2 } }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Calculation Method</InputLabel>
              <Select
                value={calculationSettings.calculationMethod}
                label="Calculation Method"
                onChange={(e) => handleSettingChange('calculationMethod', e.target.value)}
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
                onChange={(e) => handleSettingChange('madhab', e.target.value)}
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
              onChange={(e) => handleSettingChange('month', parseInt(e.target.value))}
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
              onChange={(e) => handleSettingChange('year', parseInt(e.target.value))}
              fullWidth
              variant="outlined"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>Adjustments (minutes)</Typography>
        <Grid container spacing={3} sx={{ px: { xs: 0, sm: 1 } }}>
          {Object.keys(calculationSettings.adjustments).map((prayer) => (
            <Grid item xs={12} sm={6} md={4} key={prayer} sx={{ pr: { sm: 2 } }}>
              <TextField
                label={`${prayer.charAt(0).toUpperCase() + prayer.slice(1)} Adjustment`}
                type="number"
                value={calculationSettings.adjustments[prayer as keyof Adjustments]}
                onChange={(e) => handleAdjustmentChange(
                  prayer as keyof Adjustments, 
                  parseInt(e.target.value) || 0
                )}
                fullWidth
                variant="outlined"
              />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ pt: 3 }}>
          <Stack direction="row" spacing={2}>
            <Button 
              variant="contained" 
              onClick={onCalculate}
              disabled={saving}
              size="large"
              sx={{ px: 3, py: 1 }}
            >
              Calculate Month
            </Button>
            <Button 
              variant="outlined" 
              onClick={onCalculateYear}
              size="large"
              sx={{ px: 3, py: 1 }}
            >
              Calculate Year
            </Button>
            {hasUnsavedChanges && (
              <Button 
                variant="contained" 
                color="secondary"
                onClick={onSaveSettings}
                size="large"
                sx={{ px: 3, py: 1 }}
                startIcon={<SaveIcon />}
              >
                Save Settings
              </Button>
            )}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default CalculationSettings; 