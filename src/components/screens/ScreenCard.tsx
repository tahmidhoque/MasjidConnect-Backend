import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Typography,
  Stack,
  Divider,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ScreenShare as ScreenIcon,
  LocationOn as LocationIcon,
  DevicesOther as DeviceIcon,
  ScreenRotation as RotationIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { formatLastSeen } from '@/lib/screen-utils';
import StatusIndicator from '@/components/ui/StatusIndicator';
import { Screen } from '@prisma/client';

interface ScreenCardProps {
  screen: any; // Using any to avoid type conflicts
  onEdit: (screen: any) => void;
  onDelete: (screen: any) => void;
  onViewContent: (screenId: string) => void;
}

export default function ScreenCard({
  screen,
  onEdit,
  onDelete,
  onViewContent,
}: ScreenCardProps) {
  const theme = useTheme();

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      borderRadius: '12px',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
      },
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Status indicator bar at the top */}
      <Box sx={{ 
        height: '4px', 
        width: '100%', 
        bgcolor: screen.status === 'ONLINE' 
          ? theme.palette.success.main 
          : screen.status === 'PAIRING' 
            ? theme.palette.warning.main 
            : theme.palette.error.main 
      }} />
      
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              position: 'relative',
              mr: 2,
            }}>
              <ScreenIcon sx={{ 
                fontSize: 40, 
                color: 'primary.main',
                opacity: screen.status === 'OFFLINE' ? 0.7 : 1
              }} />
            </Box>
            <Box>
              <Typography variant="h6" component="div">
                {screen.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last seen: {screen.lastSeen ? formatLastSeen(new Date(screen.lastSeen)) : 'Never'}
              </Typography>
            </Box>
          </Box>
          <StatusIndicator status={screen.status} />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={1.5}>
          {screen.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {screen.location}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RotationIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {screen.orientation === 'LANDSCAPE' ? 'Landscape' : 'Portrait'} orientation
            </Typography>
          </Box>
          
          {screen.deviceType && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DeviceIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {screen.deviceType}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {screen.schedule 
                ? `Schedule: ${screen.schedule.name}${screen.schedule.isDefault ? ' (Default)' : ''}` 
                : 'No schedule assigned'}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => onViewContent(screen.id)}
          >
            View Content
          </Button>
          <Box>
            <Tooltip title="Edit Screen">
              <IconButton 
                size="small" 
                color="primary"
                onClick={() => onEdit(screen)}
                sx={{ mr: 1 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Screen">
              <IconButton 
                size="small" 
                color="error"
                onClick={() => onDelete(screen)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
} 