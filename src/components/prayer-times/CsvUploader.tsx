import React from 'react';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import CustomAlert from '@/components/ui/CustomAlert';

interface CsvUploaderProps {
  saving: boolean;
  onCsvUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CsvUploader: React.FC<CsvUploaderProps> = ({
  saving,
  onCsvUpload,
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" fontWeight="medium" sx={{ mb: 3 }}>Upload Prayer Times</Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Upload a CSV file with prayer times. The file should include the following columns:
        Date (DD/MM/YYYY), Fajr, Sunrise, Zuhr, Asr, Maghrib, Isha, and optional Jamaat times.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          component="label"
          size="large"
          sx={{ px: 3, py: 1 }}
          disabled={saving}
        >
          {saving ? 'Uploading...' : 'Upload CSV File'}
          <input
            type="file"
            hidden
            accept=".csv"
            onChange={onCsvUpload}
            disabled={saving}
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
          disabled={saving}
        >
          Download Example CSV
        </Button>
      </Box>
      <CustomAlert 
        severity="info" 
        sx={{ mb: 3 }}
        title="CSV Format Guidelines"
      >
        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
          <li>Date must be in DD/MM/YYYY format</li>
          <li>Times must be in 24-hour format (HH:mm)</li>
          <li>Required columns: Date, Fajr, Sunrise, Zuhr, Asr, Maghrib, Isha</li>
          <li>Optional columns: Fajr Jamaat, Zuhr Jamaat, Asr Jamaat, Maghrib Jamaat, Isha Jamaat</li>
          <li>For Fridays, you can include Jummah Khutbah and Jummah Jamaat times</li>
        </ul>
      </CustomAlert>
    </Box>
  );
};

export default CsvUploader; 