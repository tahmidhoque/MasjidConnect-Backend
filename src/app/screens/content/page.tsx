'use client';

import { Suspense, lazy, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Tooltip,
  Switch,
  Stack,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CampaignIcon from '@mui/icons-material/Campaign';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { useContentSchedules } from '@/lib/hooks/use-content-schedules';
import PageHeader from '@/components/layouts/page-header';

// Content type constants
const CONTENT_TYPES = {
  VERSE_HADITH: 'VERSE_HADITH',
  ANNOUNCEMENT: 'ANNOUNCEMENT',
  EVENT: 'EVENT'
} as const;

// Content type display names
const CONTENT_TYPE_NAMES = {
  VERSE_HADITH: 'Verse/Hadith',
  ANNOUNCEMENT: 'Announcement',
  EVENT: 'Event'
} as const;

// Content type icons mapping
const CONTENT_TYPE_ICONS = {
  VERSE_HADITH: <AutoStoriesIcon sx={{ fontSize: 20 }} />,
  ANNOUNCEMENT: <CampaignIcon sx={{ fontSize: 20 }} />,
  EVENT: <EventNoteIcon sx={{ fontSize: 20 }} />
} as const;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`content-tabpanel-${index}`}
      aria-labelledby={`content-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Main component content
function ContentManagementContent() {
  const router = useRouter();
  const [value, setValue] = useState(0);
  const {
    schedules,
    loading,
    error,
    deleteSchedule,
    toggleActive,
    setDefault,
    duplicateSchedule,
    createSchedule
  } = useContentSchedules();

  // Add a title at the top of the page
  const pageTitle = "Content Management";

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleDelete = async (scheduleId: string) => {
    // Prevent deleting if it's the last schedule
    if (schedules.length <= 1) {
      alert('Cannot delete the last content schedule. At least one schedule must exist.');
      return;
    }

    // Prevent deleting if it's the default schedule
    const scheduleToDelete = schedules.find(s => s.id === scheduleId);
    if (scheduleToDelete?.isDefault) {
      alert('Cannot delete the default content schedule. Please set another schedule as default first.');
      return;
    }

    if (confirm('Are you sure you want to delete this content schedule?')) {
      try {
        await deleteSchedule(scheduleId);
      } catch (error) {
        alert('Failed to delete schedule. Please try again.');
      }
    }
  };

  const handleDuplicate = async (scheduleId: string) => {
    const scheduleToDuplicate = schedules.find(s => s.id === scheduleId);
    if (!scheduleToDuplicate) return;

    try {
      await duplicateSchedule(
        scheduleId,
        `${scheduleToDuplicate.name} (Copy)`
      );
    } catch (error) {
      alert('Failed to duplicate schedule. Please try again.');
    }
  };

  const handleToggleActive = async (scheduleId: string, newActiveState: boolean) => {
    try {
      await toggleActive(scheduleId, newActiveState);
    } catch (error) {
      alert('Failed to update schedule status. Please try again.');
    }
  };

  const handleSetDefault = async (scheduleId: string) => {
    try {
      await setDefault(scheduleId);
    } catch (error) {
      alert('Failed to set default schedule. Please try again.');
    }
  };

  const handleCreateNew = async () => {
    try {
      const newSchedule = await createSchedule({
        name: 'New Schedule',
        description: '',
        isActive: true,
        slides: [] // Don't include placeholder slides that will cause foreign key constraint issues
      });
      
      // Navigate to edit page if we have an ID
      if (newSchedule && newSchedule.id) {
        // Show alert that content items need to be added
        alert('Schedule created successfully. Please add content items to it.');
        router.push(`/screens/content/${newSchedule.id}`);
      }
    } catch (error) {
      console.error('Failed to create schedule:', error);
      alert('Failed to create new schedule. Please try again.');
    }
  };

  const renderEmptyState = () => (
    <Card>
      <CardContent sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" gutterBottom>
          No Content Schedules
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Create your first content schedule to start managing your display content.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          Create Content Schedule
        </Button>
      </CardContent>
    </Card>
  );

  // If there's a serious error, show a full page error
  if (error && !loading && (!schedules || schedules.length === 0)) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">Failed to load content schedules</Typography>
          <Typography variant="body2">{error}</Typography>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outlined" 
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <PageHeader title={pageTitle} />
      
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Content Schedules" />
          <Tab label="Screen Assignments" />
        </Tabs>
      </Box>

      {/* Description */}
      <Box sx={{ mt: 2, mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Manage and customize the content of your digital screens.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your screens will be updated automatically within 5 minutes maximum.
        </Typography>
      </Box>

      {/* Non-fatal error message */}
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Content Schedules */}
      <TabPanel value={value} index={0}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : !schedules || schedules.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {schedules.map((schedule) => (
              <Card key={schedule.id || `schedule-${Math.random()}`} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="h6">
                        {schedule.name || 'Unnamed Schedule'}
                        {schedule.isDefault && (
                          <Typography 
                            component="span" 
                            variant="caption" 
                            sx={{ ml: 1, color: 'text.secondary' }}
                          >
                            (Default)
                          </Typography>
                        )}
                      </Typography>
                      {!schedule.isDefault && (
                        <>
                          <Switch
                            size="small"
                            checked={!!schedule.isActive}
                            onChange={(e) => handleToggleActive(schedule.id, e.target.checked)}
                          />
                          <Typography 
                            variant="caption" 
                            color={schedule.isActive ? "success.main" : "text.secondary"}
                          >
                            {schedule.isActive ? "Active" : "Inactive"}
                          </Typography>
                        </>
                      )}
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Button 
                        size="small" 
                        onClick={() => router.push(`/screens/content/${schedule.id}`)}
                      >
                        Edit
                      </Button>
                      {!schedule.isDefault && (
                        <Button 
                          size="small"
                          onClick={() => handleSetDefault(schedule.id)}
                          color="secondary"
                          disabled={true}
                          title="This feature is temporarily disabled due to a known issue"
                        >
                          Set as Default
                        </Button>
                      )}
                      <Button 
                        size="small"
                        onClick={() => handleDuplicate(schedule.id)}
                      >
                        Duplicate
                      </Button>
                      {!schedule.isDefault && (
                        <Button 
                          size="small" 
                          color="error"
                          onClick={() => handleDelete(schedule.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </Stack>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1,
                    flexWrap: 'wrap',
                    '& > div': {
                      width: '80px',
                      height: '48px',
                      bgcolor: 'action.hover',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1,
                      mb: 1
                    }
                  }}>
                    {schedule.items && schedule.items.length > 0 ? (
                      schedule.items.map((item, index) => {
                        // Safely access potentially undefined properties
                        const contentItem = item.contentItem || {} as { type?: string; duration?: number };
                        const contentType = contentItem.type as keyof typeof CONTENT_TYPE_NAMES;
                        const contentTypeName = contentType && CONTENT_TYPE_NAMES[contentType] 
                          ? CONTENT_TYPE_NAMES[contentType] 
                          : 'Unknown';
                        const contentDuration = contentItem.duration || 0;
                        const contentIcon = contentType && CONTENT_TYPE_ICONS[contentType] 
                          ? CONTENT_TYPE_ICONS[contentType] 
                          : <AutoStoriesIcon sx={{ fontSize: 20 }} />;
                        
                        return (
                          <Tooltip 
                            key={item.id || `item-${index}`} 
                            title={`${contentTypeName} - ${contentDuration}s`}
                          >
                            <Box>
                              {contentIcon}
                              <Typography 
                                variant="caption" 
                                display="block" 
                                textAlign="center" 
                                color="text.secondary" 
                                sx={{ 
                                  mt: 0.5,
                                  fontSize: '0.65rem'
                                }}
                              >
                                {contentDuration}s
                              </Typography>
                            </Box>
                          </Tooltip>
                        );
                      })
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        No content items
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleCreateNew}
            >
              New Content Schedule
            </Button>
          </>
        )}
      </TabPanel>

      {/* Screen Assignments */}
      <TabPanel value={value} index={1}>
        {/* TODO: Implement screen assignments view */}
        <Typography>Screen assignments coming soon...</Typography>
      </TabPanel>
    </Box>
  );
}

// Error fallback component for client-side errors
function ErrorFallback({ error }: { error: Error }) {
  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="error" sx={{ mb: 2 }}>
        <Typography variant="h6">Something went wrong</Typography>
        <Typography variant="body2">{error.message}</Typography>
        <Button onClick={() => window.location.reload()} variant="outlined" sx={{ mt: 2 }}>
          Try again
        </Button>
      </Alert>
    </Box>
  );
}

// Loading component for Suspense fallback
function LoadingFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress />
    </Box>
  );
}

// Main export with error boundary and suspense
export default function ContentManagement() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ContentManagementContent />
    </Suspense>
  );
} 