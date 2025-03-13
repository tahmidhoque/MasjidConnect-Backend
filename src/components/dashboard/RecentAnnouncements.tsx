import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar,
  Divider,
  Chip
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import AddIcon from '@mui/icons-material/Add';
import NotificationsIcon from '@mui/icons-material/Notifications';

interface Announcement {
  id: string;
  title: string;
  message: string;
  createdAt: Date;
  type: 'general' | 'emergency' | 'prayer';
  active: boolean;
}

interface RecentAnnouncementsProps {
  announcements: Announcement[];
  onAddAnnouncement: () => void;
  onViewAll: () => void;
}

const RecentAnnouncements: React.FC<RecentAnnouncementsProps> = ({
  announcements = [],
  onAddAnnouncement = () => console.log('Add announcement clicked'),
  onViewAll = () => console.log('View all clicked')
}) => {
  const getTypeColor = (type: Announcement['type']) => {
    switch (type) {
      case 'emergency': return 'error';
      case 'prayer': return 'primary';
      case 'general': return 'success';
      default: return 'default';
    }
  };

  const getTypeLabel = (type: Announcement['type']) => {
    switch (type) {
      case 'emergency': return 'Emergency';
      case 'prayer': return 'Prayer';
      case 'general': return 'General';
      default: return 'Unknown';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '8px',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CampaignIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="h6" component="h2">
            Recent Announcements
          </Typography>
        </Box>

        <Chip
          label={`${announcements.length} Total`}
          size="small"
          color={announcements.length > 0 ? "primary" : "default"}
        />
      </Box>

      {announcements.length > 0 ? (
        <>
          <List sx={{ width: '100%', pt: 0, flex: 1 }}>
            {announcements.slice(0, 3).map((announcement, index) => (
              <React.Fragment key={announcement.id}>
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: `${getTypeColor(announcement.type)}.light` }}>
                      <NotificationsIcon sx={{ color: getTypeColor(announcement.type) }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" component="span">
                          {announcement.title}
                        </Typography>
                        <Chip 
                          label={getTypeLabel(announcement.type)} 
                          size="small" 
                          color={getTypeColor(announcement.type)}
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{ 
                            display: 'inline',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            WebkitBoxDisplay: '-webkit-box'
                          }}
                        >
                          {announcement.message}
                        </Typography>
                        <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {formatDate(announcement.createdAt)}
                          {announcement.active && (
                            <Chip 
                              label="Active" 
                              size="small" 
                              color="success" 
                              sx={{ ml: 1, height: 16, fontSize: '0.65rem' }}
                            />
                          )}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < announcements.slice(0, 3).length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
            ))}
          </List>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<AddIcon />}
              onClick={onAddAnnouncement}
            >
              New Announcement
            </Button>
            <Button 
              variant="text" 
              size="small"
              onClick={onViewAll}
            >
              View All
            </Button>
          </Box>
        </>
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            color: 'text.secondary',
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            flex: 1
          }}
        >
          <Typography variant="body1">
            No announcements found.
          </Typography>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onAddAnnouncement}
          >
            Create Announcement
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default RecentAnnouncements; 