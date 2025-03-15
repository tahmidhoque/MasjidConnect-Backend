'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  IconButton,
  Button,
  TextField,
  Stack,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Checkbox,
  Grid,
  Paper,
  Divider,
  Tooltip,
  FormControlLabel,
  Switch,
  FormHelperText,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  AccessTime as TimeIcon,
  Add as AddIcon,
  Event as EventIcon,
  Announcement as AnnouncementIcon,
  MenuBook as VerseIcon,
  Code as CustomIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
  CalendarMonth as CalendarIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  MenuBook as MenuBookIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { useContentSchedules, ContentScheduleItem } from '@/lib/hooks/use-content-schedules';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getContentItems } from '@/lib/services/content';
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext';
import { format } from 'date-fns';
import { useContentCreation } from '@/components/content/ContentCreationContext';
import Image from 'next/image';

// Define content types for filtering
enum ContentType {
  VERSE_HADITH = 'VERSE_HADITH',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  EVENT = 'EVENT',
  CUSTOM = 'CUSTOM',
  ASMA_AL_HUSNA = 'ASMA_AL_HUSNA',
}

// Content item interface
interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  content?: any;
  duration: number;
  isActive: boolean;
  startDate?: Date | string;
  endDate?: Date | string;
}

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
      id={`playlist-tabpanel-${index}`}
      aria-labelledby={`playlist-tab-${index}`}
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

// Custom Asma Al-Husna icon component
const AsmaAlHusnaIcon = ({ sx = {} }: { sx?: React.CSSProperties }) => (
  <div style={{ position: 'relative', width: sx.fontSize || 16, height: sx.fontSize || 16 }}>
    <Image 
      src="/icons/asma-al-husna.svg" 
      alt="99 Names of Allah" 
      width={Number(sx.fontSize) || 16}
      height={Number(sx.fontSize) || 16}
      style={{ filter: 'brightness(0) saturate(100%) invert(8%) sepia(37%) saturate(1254%) hue-rotate(182deg) brightness(96%) contrast(96%)' }} // Makes the SVG #0A2647 color
    />
  </div>
);

// Get content type icon
function getContentTypeIcon(type: string) {
  const iconStyle = { fontSize: 16 };
  
  switch (type) {
    case ContentType.VERSE_HADITH:
      return <VerseIcon sx={iconStyle} />;
    case ContentType.ANNOUNCEMENT:
      return <AnnouncementIcon sx={iconStyle} />;
    case ContentType.EVENT:
      return <EventIcon sx={iconStyle} />;
    case ContentType.CUSTOM:
      return <CustomIcon sx={iconStyle} />;
    case ContentType.ASMA_AL_HUSNA:
      return <AsmaAlHusnaIcon sx={iconStyle} />;
    default:
      return <CustomIcon sx={iconStyle} />;
  }
}

// Get content type display name
function getContentTypeName(type: string): string {
  switch (type) {
    case ContentType.VERSE_HADITH:
      return 'Verse / Hadith';
    case ContentType.ANNOUNCEMENT:
      return 'Announcement';
    case ContentType.EVENT:
      return 'Event';
    case ContentType.CUSTOM:
      return 'Custom Content';
    case ContentType.ASMA_AL_HUSNA:
      return '99 Names of Allah';
    default:
      return 'Unknown';
  }
}

// Format date for display
function formatDate(date: Date | string | undefined): string {
  if (!date) return 'Not set';
  return format(new Date(date), 'MMM d, yyyy');
}

// Check if a content item is currently active based on dates
function isContentActive(item: any): boolean {
  if (!item.isActive) return false;
  
  const now = new Date();
  
  // Check start date if it exists
  if (item.startDate && new Date(item.startDate) > now) {
    return false;
  }
  
  // Check end date if it exists
  if (item.endDate && new Date(item.endDate) < now) {
    return false;
  }
  
  return true;
}

// Sortable item component for drag and drop
interface SortableItemProps {
  item: ContentScheduleItem;
  onDelete: (id: string) => void;
}

function SortableItem({ item, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Cast contentItem to any to avoid type issues
  const contentItem = item.contentItem as any;
  const isActive = contentItem ? isContentActive(contentItem) : true;
  const hasDateRestrictions = contentItem?.startDate || contentItem?.endDate;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{ 
        mb: 1.5,
        borderRadius: 1.5,
        border: !isActive ? '1px solid' : 'none',
        borderColor: 'warning.light',
        bgcolor: !isActive ? 'rgba(255, 152, 0, 0.05)' : 'background.paper',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
        },
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          py: '10px !important',
          px: 2,
          '&:last-child': { pb: '10px !important' }
        }}
      >
        <Box
          {...attributes}
          {...listeners}
          sx={{ 
            cursor: 'grab', 
            display: 'flex', 
            alignItems: 'center',
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' }
          }}
        >
          <DragIcon fontSize="small" />
        </Box>

        <Box 
          sx={{ 
            width: 28, 
            height: 28, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: '50%',
            bgcolor: 'action.hover',
            color: contentItem?.type ? 'primary.main' : 'text.secondary',
            mr: 0.5,
            '& svg': {
              display: 'block'
            }
          }}
        >
          {contentItem ? getContentTypeIcon(contentItem.type) : <CustomIcon sx={{ fontSize: 16 }} />}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight={500}>
            {contentItem?.title || "Unknown Content"}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {contentItem ? getContentTypeName(contentItem.type) : "Unknown Type"}
            </Typography>
            
            {hasDateRestrictions && (
              <Tooltip
                title={
                  <Box>
                    {!isActive && (
                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', mb: 1 }}>
                        This item is not currently active
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      Start: {formatDate(contentItem?.startDate)}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      End: {formatDate(contentItem?.endDate)}
                    </Typography>
                  </Box>
                }
              >
                <Box component="span" sx={{ display: 'inline-flex', ml: 1 }}>
                  <CalendarIcon 
                    fontSize="small" 
                    sx={{ 
                      fontSize: '0.75rem', 
                      color: isActive ? 'text.secondary' : 'warning.main' 
                    }} 
                  />
                </Box>
              </Tooltip>
            )}
            
            {!isActive && !contentItem?.isActive && (
              <Tooltip title="This content item is disabled">
                <Box component="span" sx={{ display: 'inline-flex', ml: 1 }}>
                  <WarningIcon 
                    fontSize="small" 
                    sx={{ fontSize: '0.75rem', color: 'warning.main' }} 
                  />
                </Box>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Chip 
          icon={<TimeIcon sx={{ fontSize: '0.75rem !important' }} />}
          label={`${contentItem?.duration || 0}s`}
          size="small"
          sx={{ 
            height: '24px',
            bgcolor: 'action.hover',
            borderRadius: 1,
            '& .MuiChip-label': { px: 1, fontSize: '0.75rem' },
            '& .MuiChip-icon': { ml: 0.5 }
          }}
        />

        <IconButton 
          size="small" 
          onClick={() => onDelete(item.id)}
          sx={{ 
            ml: 0.5, 
            color: 'text.secondary',
            '&:hover': { 
              color: 'error.main',
              bgcolor: 'error.lighter'
            }
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardContent>
    </Card>
  );
}

// Content type tile component
interface ContentTypeTileProps {
  type: ContentType;
  onClick: () => void;
}

function ContentTypeTile({ type, onClick }: ContentTypeTileProps) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        cursor: 'pointer',
        transition: 'all 0.2s',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          borderColor: 'primary.main',
          bgcolor: 'primary.50',
        },
      }}
      onClick={onClick}
    >
      <Box 
        sx={{ 
          p: 1.5, 
          borderRadius: '50%', 
          bgcolor: 'primary.50',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 56,
          height: 56,
          '& svg': {
            display: 'block'
          }
        }}
      >
        {React.cloneElement(getContentTypeIcon(type), { sx: { fontSize: 28 } })}
      </Box>
      <Typography variant="body1" align="center" fontWeight={500}>
        {getContentTypeName(type)}
      </Typography>
    </Paper>
  );
}

export default function PlaylistEdit({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [value, setValue] = useState(0); // Start with General settings tab
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Set initial loading state to true
  const [saveError, setSaveError] = useState<string | null>(null);
  const [scheduleItems, setScheduleItems] = useState<ContentScheduleItem[]>([]);
  const [originalItems, setOriginalItems] = useState<ContentScheduleItem[]>([]);
  const [originalData, setOriginalData] = useState({ name: '', description: '', isActive: true });
  const { schedules, updateSchedule } = useContentSchedules();
  const { setHasUnsavedChanges } = useUnsavedChanges();
  const { openContentCreationModal } = useContentCreation();

  // State for content item selector
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [availableContentItems, setAvailableContentItems] = useState<ContentItem[]>([]);
  const [selectedContentItems, setSelectedContentItems] = useState<string[]>([]);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Find the current schedule
  const currentSchedule = schedules.find(s => s.id === resolvedParams.id);

  // Filter available content items by selected type
  const filteredContentItems = selectedType 
    ? availableContentItems.filter(item => item.type === selectedType)
    : [];

  // Set initial name and items when schedule is loaded
  useEffect(() => {
    if (currentSchedule) {
      setName(currentSchedule.name);
      setDescription(currentSchedule.description || '');
      setIsActive(currentSchedule.isActive);
      setScheduleItems(currentSchedule.items || []);
      setOriginalItems(currentSchedule.items || []);
      setOriginalData({
        name: currentSchedule.name,
        description: currentSchedule.description || '',
        isActive: currentSchedule.isActive
      });
      setIsLoading(false); // Set loading to false once data is loaded
    }
  }, [currentSchedule]);

  // Track unsaved changes
  useEffect(() => {
    const hasGeneralChanges = 
      name !== originalData.name || 
      description !== originalData.description || 
      isActive !== originalData.isActive;
    
    const hasItemChanges = JSON.stringify(scheduleItems) !== JSON.stringify(originalItems);
    
    setHasUnsavedChanges(hasGeneralChanges || hasItemChanges);
    
    return () => {
      setHasUnsavedChanges(false);
    };
  }, [name, description, isActive, scheduleItems, originalData, originalItems, setHasUnsavedChanges]);

  // Fetch available content items
  const fetchContentItems = async () => {
    setIsLoading(true);
    try {
      const items = await getContentItems();
      // Cast to any to avoid type issues with potentially missing properties
      setAvailableContentItems(items as any[]);
    } catch (error) {
      console.error('Error fetching content items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Are you sure you want to remove this item from the schedule?')) {
      setScheduleItems(scheduleItems.filter(item => item.id !== itemId));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setScheduleItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex).map((item, index) => ({
          ...item,
          order: index
        }));
      });
    }
  };

  const handleSaveItems = async () => {
    if (!scheduleItems.length) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // Create a map to deduplicate items by contentItemId
      const uniqueItems = new Map();
      
      // Process items to ensure unique order values
      scheduleItems.forEach((item, index) => {
        console.log('Processing item:', item);
        if (item.contentItemId && !item.contentItemId.startsWith('placeholder')) {
          uniqueItems.set(item.contentItemId, {
            id: item.contentItemId,
            type: item.contentItem?.type || '',
            duration: item.contentItem?.duration || 20,
            order: index
          });
        } else {
          console.log('Skipping item with invalid ID:', item.contentItemId);
        }
      });
      
      // Convert map to array
      const slides = Array.from(uniqueItems.values());
      
      console.log('Unique slides to save:', slides);
      
      if (slides.length === 0) {
        console.error('No valid content items to save');
        setSaveError('No valid content items to save');
        return;
      }
      
      const payload = { slides };
      
      console.log('Saving schedule items with payload:', JSON.stringify(payload, null, 2));
      console.log('Schedule ID:', resolvedParams.id);
      
      const updatedSchedule = await updateSchedule(resolvedParams.id, payload);
      
      if (updatedSchedule) {
        console.log('Schedule updated successfully:', updatedSchedule);
        // Update original items to reflect saved state
        setOriginalItems(updatedSchedule.items || []);
      }
    } catch (error) {
      console.error('Error saving schedule items:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setSaveError('Name is required');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const updatedSchedule = await updateSchedule(resolvedParams.id, {
        name: name.trim(),
        description,
        isActive
      });
      
      if (updatedSchedule) {
        // Update original data to reflect saved state
        setOriginalData({
          name: updatedSchedule.name,
          description: updatedSchedule.description || '',
          isActive: updatedSchedule.isActive
        });
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Content selector modal handlers
  const handleOpenTypeModal = () => {
    setIsTypeModalOpen(true);
  };

  const handleTypeSelection = (type: ContentType) => {
    setSelectedType(type);
    setSelectedContentItems([]);
    fetchContentItems();
    setIsTypeModalOpen(false);
    setIsItemsModalOpen(true);
  };

  const handleBackToTypes = () => {
    setIsItemsModalOpen(false);
    setIsTypeModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsTypeModalOpen(false);
    setIsItemsModalOpen(false);
  };

  const handleToggleContentItem = (itemId: string) => {
    setSelectedContentItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleAddContentItems = () => {
    // Get selected content items and add them to the schedule
    const newItems = selectedContentItems.map(id => {
      const contentItem = availableContentItems.find(item => item.id === id);
      return {
        id: Math.random().toString(36).substr(2, 9), // Generate temporary ID
        contentItemId: id,
        contentItem,
        order: scheduleItems.length + selectedContentItems.indexOf(id),
      };
    });
    
    setScheduleItems([...scheduleItems, ...newItems]);
    setIsItemsModalOpen(false);
  };

  const handleCreateNewItem = () => {
    if (selectedType) {
      // Use the content creation context to open the modal
      openContentCreationModal(selectedType as any, () => {
        // After successful creation, refresh the content items
        fetchContentItems();
      });
    }
  };

  // Fetch content items when initially selecting a type
  useEffect(() => {
    if (selectedType) {
      fetchContentItems();
    }
  }, [selectedType]);

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {isLoading ? 'Loading Schedule...' : (currentSchedule?.name || 'Schedule')}
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="General settings" />
          <Tab label="Schedule Slides" />
        </Tabs>
      </Box>

      {/* General Settings */}
      <TabPanel value={value} index={0}>
        <Card>
          <CardContent>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" component="div" gutterBottom>
                    General Settings
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configure the basic settings for this content schedule.
                  </Typography>
                </Box>

                {saveError && (
                  <Alert severity="error" onClose={() => setSaveError(null)}>
                    {saveError}
                  </Alert>
                )}

                <TextField
                  label="Schedule Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  required
                  error={!isLoading && !name.trim()}
                  helperText={(!isLoading && !name.trim()) ? 'Name is required' : ''}
                />

                <TextField
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  helperText="Optional description for this schedule"
                />

                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Active"
                  />
                  <Tooltip title="When active, this schedule can be assigned to displays">
                    <IconButton size="small" sx={{ ml: 1, mt: -0.5 }}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <FormHelperText>
                    Inactive schedules won't be shown on displays
                  </FormHelperText>
                </Box>

                <Box>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={isSaving || !name.trim()}
                    sx={{
                      borderRadius: 1.5,
                      px: 2.5,
                      py: 0.75,
                      fontWeight: 500,
                      boxShadow: 1
                    }}
                  >
                    {isSaving ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Stack>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Schedule Slides */}
      <TabPanel value={value} index={1}>
        <Card>
          <CardContent>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" component="div" gutterBottom>
                    Schedule Slides
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add and arrange content items that will be displayed in this schedule. Drag items to change their order.
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    onClick={handleSaveItems}
                    disabled={isSaving}
                    startIcon={isSaving ? <CircularProgress size={20} /> : null}
                    sx={{
                      borderRadius: 1.5,
                      px: 2.5,
                      py: 0.75,
                      fontWeight: 500,
                      boxShadow: 1
                    }}
                  >
                    {isSaving ? 'Saving...' : 'Save Order'}
                  </Button>
                </Box>

                {saveError && (
                  <Alert severity="error" onClose={() => setSaveError(null)}>
                    {saveError}
                  </Alert>
                )}

                {!scheduleItems.length ? (
                  <Alert severity="info">
                    No content items added to this schedule yet. Add content items to display in this schedule.
                  </Alert>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={scheduleItems.map(item => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {scheduleItems.map((item) => (
                        <SortableItem
                          key={item.id}
                          item={item}
                          onDelete={handleDeleteItem}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}

                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<AddIcon />}
                    onClick={handleOpenTypeModal}
                    sx={{
                      borderRadius: 1.5,
                      py: 1,
                      fontWeight: 500,
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      '&:hover': {
                        borderStyle: 'dashed',
                        borderWidth: 2,
                      }
                    }}
                  >
                    Add Content Items
                  </Button>
                </Box>
              </Stack>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Content Type Selection Modal */}
      <Dialog
        open={isTypeModalOpen}
        onClose={handleCloseModals}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          py: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" component="div" fontWeight={600}>
            Choose Content Type
          </Typography>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={handleCloseModals}
            sx={{ color: 'primary.contrastText' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 1.5, pb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
            Select the type of content you want to add to your schedule. Each content type has different features and display options.
          </Typography>
          <Grid container spacing={3} sx={{ py: 1 }}>
            {Object.values(ContentType).map((type) => (
              <Grid item xs={12} sm={6} key={type}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                      borderColor: 'primary.main',
                      bgcolor: 'primary.50',
                    },
                  }}
                  onClick={() => handleTypeSelection(type)}
                >
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      borderRadius: '50%', 
                      bgcolor: 'primary.50',
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 56,
                      height: 56,
                      '& svg': {
                        display: 'block'
                      }
                    }}
                  >
                    {React.cloneElement(getContentTypeIcon(type), { sx: { fontSize: 28 } })}
                  </Box>
                  <Typography variant="body1" align="center" fontWeight={500}>
                    {getContentTypeName(type)}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleCloseModals} variant="outlined" sx={{ borderRadius: 1.5 }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Content Items Selection Modal */}
      <Dialog
        open={isItemsModalOpen}
        onClose={handleCloseModals}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          py: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              edge="start" 
              color="inherit" 
              onClick={handleBackToTypes}
              sx={{ mr: 1, color: 'primary.contrastText' }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" component="div" fontWeight={600}>
              {selectedType && getContentTypeName(selectedType)} Content
            </Typography>
          </Box>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={handleCloseModals}
            sx={{ color: 'primary.contrastText' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, pt: 1.5, pb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
              Select the content items you want to add to your schedule. You can select multiple items at once.
            </Typography>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : filteredContentItems.length === 0 ? (
              <Alert 
                severity="info" 
                variant="outlined"
                sx={{ 
                  borderRadius: 2,
                  mt: 2
                }}
                action={
                  <Button 
                    color="primary" 
                    size="small" 
                    variant="contained"
                    onClick={handleCreateNewItem}
                    sx={{ borderRadius: 1.5 }}
                  >
                    Create New
                  </Button>
                }
              >
                <AlertTitle>No content found</AlertTitle>
                No {selectedType && getContentTypeName(selectedType)} content items found. Create a new one to get started.
              </Alert>
            ) : (
              <>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Typography variant="subtitle2" color="text.primary">
                    {filteredContentItems.length} items available
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    onClick={handleCreateNewItem}
                    size="small"
                    sx={{ borderRadius: 1.5 }}
                  >
                    Create New
                  </Button>
                </Box>
                
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    maxHeight: '350px', 
                    overflow: 'auto',
                    borderRadius: 2,
                    mb: 2
                  }}
                >
                  <List disablePadding>
                    {filteredContentItems.map((item: any, index) => (
                      <div key={item.id}>
                        <ListItem 
                          disablePadding 
                          secondaryAction={
                            <Chip 
                              icon={<TimeIcon sx={{ fontSize: '0.75rem !important' }} />}
                              label={`${item.duration}s`}
                              size="small"
                              sx={{ 
                                height: '24px',
                                bgcolor: 'action.hover',
                                borderRadius: 1,
                                '& .MuiChip-label': { px: 1, fontSize: '0.75rem' },
                                '& .MuiChip-icon': { ml: 0.5 }
                              }}
                            />
                          }
                        >
                          <ListItemButton 
                            onClick={() => handleToggleContentItem(item.id)}
                            sx={{ 
                              py: 1.5,
                              '&.Mui-selected': {
                                bgcolor: 'primary.50',
                              },
                              '&.Mui-selected:hover': {
                                bgcolor: 'primary.100',
                              }
                            }}
                            selected={selectedContentItems.includes(item.id)}
                          >
                            <ListItemIcon>
                              <Checkbox
                                edge="start"
                                checked={selectedContentItems.includes(item.id)}
                                tabIndex={-1}
                                disableRipple
                                color="primary"
                              />
                            </ListItemIcon>
                            <Box 
                              sx={{ 
                                width: 28, 
                                height: 28, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                borderRadius: '50%',
                                bgcolor: 'action.hover',
                                color: 'primary.main',
                                mr: 1.5,
                                '& svg': {
                                  display: 'block'
                                }
                              }}
                            >
                              {React.cloneElement(getContentTypeIcon(item.type), { sx: { fontSize: 16 } })}
                            </Box>
                            <ListItemText 
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography variant="body2" fontWeight={selectedContentItems.includes(item.id) ? 600 : 400}>
                                    {item.title}
                                  </Typography>
                                  {(!item.isActive || item.startDate || item.endDate) && (
                                    <Tooltip
                                      title={
                                        <Box>
                                          {!item.isActive && (
                                            <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                                              This item is disabled
                                            </Typography>
                                          )}
                                          {(item.startDate || item.endDate) && (
                                            <>
                                              <Typography variant="caption" sx={{ display: 'block' }}>
                                                Start: {formatDate(item.startDate)}
                                              </Typography>
                                              <Typography variant="caption" sx={{ display: 'block' }}>
                                                End: {formatDate(item.endDate)}
                                              </Typography>
                                            </>
                                          )}
                                        </Box>
                                      }
                                    >
                                      <Box component="span" sx={{ display: 'inline-flex', ml: 1 }}>
                                        {!item.isActive ? (
                                          <WarningIcon fontSize="small" color="warning" />
                                        ) : (item.startDate || item.endDate) ? (
                                          <CalendarIcon fontSize="small" color="info" />
                                        ) : null}
                                      </Box>
                                    </Tooltip>
                                  )}
                                </Box>
                              }
                              secondary={
                                <Typography variant="caption" color="text.secondary">
                                  {item.content?.text ? 
                                    (item.content.text.length > 60 ? 
                                      `${item.content.text.substring(0, 60)}...` : 
                                      item.content.text) : 
                                    'No preview available'}
                                </Typography>
                              }
                            />
                          </ListItemButton>
                        </ListItem>
                        {index < filteredContentItems.length - 1 && <Divider />}
                      </div>
                    ))}
                  </List>
                </Paper>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider', justifyContent: 'space-between' }}>
          <Button 
            onClick={handleCloseModals} 
            variant="outlined"
            sx={{ borderRadius: 1.5 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddContentItems} 
            variant="contained"
            disabled={selectedContentItems.length === 0}
            startIcon={selectedContentItems.length > 0 ? <AddIcon /> : null}
            sx={{ borderRadius: 1.5 }}
          >
            {selectedContentItems.length > 0 ? 
              `Add Selected (${selectedContentItems.length})` : 
              'Select Items to Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 