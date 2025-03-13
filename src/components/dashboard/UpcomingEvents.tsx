import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  type: 'class' | 'lecture' | 'community' | 'other';
}

interface UpcomingEventsProps {
  events: Event[];
  onAddEvent: () => void;
  onViewAll: () => void;
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({
  events = [],
  onAddEvent = () => console.log('Add event clicked'),
  onViewAll = () => console.log('View all clicked')
}) => {
  const getTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'class': return 'primary';
      case 'lecture': return 'secondary';
      case 'community': return 'success';
      case 'other': return 'default';
      default: return 'default';
    }
  };

  const getTypeLabel = (type: Event['type']) => {
    switch (type) {
      case 'class': return 'Class';
      case 'lecture': return 'Lecture';
      case 'community': return 'Community';
      case 'other': return 'Other';
      default: return 'Event';
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

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
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
          <EventIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="h6" component="h2">
            Upcoming Events
          </Typography>
        </Box>

        <Chip
          label={`${events.length} Events`}
          size="small"
          color={events.length > 0 ? "primary" : "default"}
        />
      </Box>

      {events.length > 0 ? (
        <>
          <List sx={{ width: '100%', pt: 0, flex: 1 }}>
            {events.slice(0, 3).map((event, index) => (
              <React.Fragment key={event.id}>
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    mr: 2,
                    minWidth: 60,
                    textAlign: 'center'
                  }}>
                    <CalendarTodayIcon sx={{ mb: 0.5, color: getTypeColor(event.type) }} />
                    <Typography variant="caption" fontWeight={500} color="text.secondary">
                      {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Typography>
                    {isToday(new Date(event.startDate)) && (
                      <Chip 
                        label="Today" 
                        size="small" 
                        color="error" 
                        sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" component="span">
                          {event.title}
                        </Typography>
                        <Chip 
                          label={getTypeLabel(event.type)} 
                          size="small" 
                          color={getTypeColor(event.type)}
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
                          {event.description}
                        </Typography>
                        <Typography component="div" variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          {formatDate(event.startDate)}
                          {event.location && (
                            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              • {event.location}
                            </Typography>
                          )}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < events.slice(0, 3).length - 1 && (
                  <Divider component="li" />
                )}
              </React.Fragment>
            ))}
          </List>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<AddIcon />}
              onClick={onAddEvent}
            >
              Add Event
            </Button>
            <Button 
              variant="text" 
              size="small"
              endIcon={<ArrowForwardIcon />}
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
            No upcoming events.
          </Typography>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onAddEvent}
          >
            Add Event
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default UpcomingEvents; 