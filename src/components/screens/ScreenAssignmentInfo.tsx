import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CheckIcon from '@mui/icons-material/Check';
import MonitorIcon from '@mui/icons-material/Monitor';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import CustomAlert from '@/components/ui/CustomAlert';

export default function ScreenAssignmentInfo() {
  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <InfoIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            About Screen Assignments
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          This page allows you to manage which content schedule is displayed on each of your screens. 
          You can assign a specific schedule to each screen or let screens use the default schedule.
        </Typography>
        
        <CustomAlert severity="info" title="Important" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Only one schedule can be assigned to a screen at a time. 
            If no schedule is assigned, the screen will automatically use the default schedule.
          </Typography>
        </CustomAlert>
        
        <Divider sx={{ my: 2 }} />
        
        <List dense>
          <ListItem>
            <ListItemIcon>
              <MonitorIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Screen Status" 
              secondary="Screens can be online (active), offline, or in pairing mode. Only online screens will display content."
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <ScheduleIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Custom Schedules" 
              secondary="Assign a custom schedule when you want a screen to show specific content different from other screens."
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <SettingsBackupRestoreIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Default Schedule" 
              secondary="When 'Use Default Schedule' is selected, the screen will use the content schedule marked as default in your masjid settings."
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Immediate Updates" 
              secondary="Schedule assignments take effect immediately on active screens. Offline screens will update when they next connect."
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
} 