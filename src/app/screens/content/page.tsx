'use client';

import { Suspense, lazy, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  Card,
  CardContent,
  Tooltip,
  Switch,
  Stack,
  CircularProgress,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CampaignIcon from '@mui/icons-material/Campaign';
import EventNoteIcon from '@mui/icons-material/EventNote';
import MonitorIcon from '@mui/icons-material/Monitor';
import Image from 'next/image';
import { useContentSchedules } from '@/lib/hooks/use-content-schedules';
import { useScreens } from '@/lib/hooks/use-screens';
import PageHeader from '@/components/layouts/page-header';
import ScreenAssignment from '@/components/screens/ScreenAssignment';
import ScreenAssignmentInfo from '@/components/screens/ScreenAssignmentInfo';
import NoScreensState from '@/components/screens/NoScreensState';
import CustomAlert from '@/components/ui/CustomAlert';

// Custom Asma Al-Husna icon component
const AsmaAlHusnaIcon = () => (
  <div style={{ position: 'relative', width: 20, height: 20 }}>
    <Image 
      src="/icons/asma-al-husna.svg" 
      alt="99 Names of Allah" 
      width={20} 
      height={20}
      style={{ filter: 'brightness(0) saturate(100%) invert(8%) sepia(37%) saturate(1254%) hue-rotate(182deg) brightness(96%) contrast(96%)' }} // Makes the SVG #0A2647 color
    />
  </div>
);

// Content type constants
const CONTENT_TYPES = {
  VERSE_HADITH: 'VERSE_HADITH',
  ANNOUNCEMENT: 'ANNOUNCEMENT',
  EVENT: 'EVENT',
  ASMA_AL_HUSNA: 'ASMA_AL_HUSNA'
} as const;

// Content type display names
const CONTENT_TYPE_NAMES = {
  VERSE_HADITH: 'Verse/Hadith',
  ANNOUNCEMENT: 'Announcement',
  EVENT: 'Event',
  ASMA_AL_HUSNA: '99 Names of Allah'
} as const;

// Content type icons mapping
const CONTENT_TYPE_ICONS = {
  VERSE_HADITH: <AutoStoriesIcon sx={{ fontSize: 20 }} />,
  ANNOUNCEMENT: <CampaignIcon sx={{ fontSize: 20 }} />,
  EVENT: <EventNoteIcon sx={{ fontSize: 20 }} />,
  ASMA_AL_HUSNA: <AsmaAlHusnaIcon />
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
    loading: schedulesLoading,
    error: schedulesError,
    deleteSchedule,
    toggleActive,
    setDefault,
    duplicateSchedule,
    createSchedule
  } = useContentSchedules();
  
  const {
    screens,
    loading: screensLoading,
    error: screensError,
    assignSchedule,
  } = useScreens();

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

  // Get the default schedule
  const getDefaultSchedule = () => {
    return schedules.find(schedule => schedule.isDefault) || null;
  };

  // Handle schedule assignment
  const handleAssignSchedule = async (screenId: string, scheduleId: string | null) => {
    await assignSchedule(screenId, scheduleId);
  };

  // If there's a serious error, show a full page error
  if (schedulesError && !schedulesLoading && (!schedules || schedules.length === 0)) {
    return (
      <Box sx={{ p: 3 }}>
        <CustomAlert severity="error" title="Failed to load content schedules" sx={{ mb: 2 }}>
          <Typography variant="body2">{schedulesError}</Typography>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outlined" 
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </CustomAlert>
      </Box>
    );
  }

  // If there's no default schedule, inform the user
  const [hasDefaultSchedule, setHasDefaultSchedule] = useState(false);

  useEffect(() => {
    if (!schedulesLoading && schedules.length > 0) {
      const hasDefault = schedules.some(s => s.isDefault);
      setHasDefaultSchedule(hasDefault);
    }
  }, [schedules, schedulesLoading]);

  return (
    <Box sx={{ width: '100%' }}>
      <PageHeader title={pageTitle} />
      
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="content management tabs"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab
          icon={<AutoStoriesIcon sx={{ fontSize: 18 }} />}
          iconPosition="start"
          label="Content Schedules"
          id="content-tab-0"
          aria-controls="content-tabpanel-0"
        />
        <Tab
          icon={<MonitorIcon sx={{ fontSize: 18 }} />}
          iconPosition="start"
          label="Screen Assignments"
          id="content-tab-1"
          aria-controls="content-tabpanel-1"
        />
      </Tabs>

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
      {schedulesError && (
        <CustomAlert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">{schedulesError}</Typography>
        </CustomAlert>
      )}

      {/* Content Schedules */}
      <TabPanel value={value} index={0}>
        {schedulesLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : schedulesError ? (
          <CustomAlert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">Error loading schedules: {schedulesError}</Typography>
          </CustomAlert>
        ) : schedules.length === 0 ? (
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
        {schedulesLoading || screensLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : schedulesError || screensError ? (
          <CustomAlert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">Error loading data: {schedulesError || screensError}</Typography>
          </CustomAlert>
        ) : screens.length === 0 ? (
          <NoScreensState />
        ) : (
          <>
            <ScreenAssignmentInfo />
            
            <Typography variant="h6" sx={{ mb: 2 }}>
              Your Screens ({screens.length})
            </Typography>
            
            <Grid container spacing={2}>
              {screens.map((screen) => (
                <Grid item xs={12} md={6} key={screen.id}>
                  <ScreenAssignment
                    screen={screen}
                    schedules={schedules}
                    defaultSchedule={getDefaultSchedule()}
                    onAssignSchedule={handleAssignSchedule}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </TabPanel>
    </Box>
  );
}

// Error fallback component for client-side errors
function ErrorFallback({ error }: { error: Error }) {
  return (
    <Box sx={{ p: 3 }}>
      <CustomAlert severity="error" title="Something went wrong" sx={{ mb: 2 }}>
        <Typography variant="body2">{error.message}</Typography>
        <Button onClick={() => window.location.reload()} variant="outlined" sx={{ mt: 2 }}>
          Try again
        </Button>
      </CustomAlert>
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