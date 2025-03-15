import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MonitorIcon from '@mui/icons-material/Monitor';
import { useRouter } from 'next/navigation';

export default function NoScreensState() {
  const router = useRouter();
  
  const handleGoToScreens = () => {
    router.push('/screens');
  };

  return (
    <Paper 
      sx={{ 
        p: 4, 
        my: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center'
      }}
    >
      <MonitorIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
      
      <Typography variant="h6" gutterBottom>
        No Screens Paired
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
        You currently don't have any screens paired with your masjid. 
        Add and pair screens first before assigning content schedules to them.
      </Typography>
      
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleGoToScreens}
        >
          Add Screens
        </Button>
      </Stack>
    </Paper>
  );
} 