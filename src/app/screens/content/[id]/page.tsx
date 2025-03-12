'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Alert,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Divider,
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

// Define content types for filtering
enum ContentType {
  VERSE_HADITH = 'VERSE_HADITH',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  EVENT = 'EVENT',
  CUSTOM = 'CUSTOM',
}

// Content item interface
interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  duration: number;
  isActive: boolean;
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

// Get content type icon
function getContentTypeIcon(type: string) {
  switch (type) {
    case ContentType.VERSE_HADITH:
      return <VerseIcon />;
    case ContentType.ANNOUNCEMENT:
      return <AnnouncementIcon />;
    case ContentType.EVENT:
      return <EventIcon />;
    case ContentType.CUSTOM:
      return <CustomIcon />;
    default:
      return <CustomIcon />;
  }
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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{ mb: 2 }}
    >
      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: '8px !important'
        }}
      >
        <Box
          {...attributes}
          {...listeners}
          sx={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}
        >
          <DragIcon sx={{ color: 'text.disabled' }} />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="body2">
            {item.contentItem ? item.contentItem.type : "Unknown Content"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Item #{item.order + 1}
          </Typography>
        </Box>

        <Chip 
          icon={<TimeIcon sx={{ fontSize: '0.8rem !important' }} />}
          label={`${item.contentItem?.duration || 0}s`}
          size="small"
          sx={{ 
            height: '24px',
            bgcolor: 'action.hover',
            '& .MuiChip-label': { px: 1, fontSize: '0.75rem' },
            '& .MuiChip-icon': { ml: 0.5 }
          }}
        />

        <IconButton size="small" onClick={() => onDelete(item.id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardContent>
    </Card>
  );
}

export default function PlaylistEdit({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [value, setValue] = useState(0); // Start with General settings tab
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [scheduleItems, setScheduleItems] = useState<ContentScheduleItem[]>([]);
  const { schedules, updateSchedule } = useContentSchedules();

  // State for content item selector
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableContentItems, setAvailableContentItems] = useState<ContentItem[]>([]);
  const [selectedContentItems, setSelectedContentItems] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Find the current schedule
  const currentSchedule = schedules.find(s => s.id === resolvedParams.id);

  // Filter available content items
  const filteredContentItems = filterType === 'ALL'
    ? availableContentItems
    : availableContentItems.filter(item => item.type === filterType);

  // Set initial name and items when schedule is loaded
  useEffect(() => {
    if (currentSchedule) {
      setName(currentSchedule.name);
      setScheduleItems(currentSchedule.items || []);
    }
  }, [currentSchedule]);

  // Fetch available content items
  const fetchContentItems = async () => {
    setIsLoading(true);
    try {
      const items = await getContentItems();
      setAvailableContentItems(items);
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
      await updateSchedule(resolvedParams.id, {
        slides: scheduleItems.map(item => ({
          id: item.contentItemId,
          type: item.contentItem?.type || '',
          duration: item.contentItem?.duration || 20
        }))
      });
    } catch (error) {
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
      await updateSchedule(resolvedParams.id, {
        name: name.trim(),
      });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Content selector modal handlers
  const handleOpenAddModal = () => {
    fetchContentItems();
    setSelectedContentItems([]);
    setFilterType('ALL');
    setIsModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsModalOpen(false);
  };

  const handleToggleContentItem = (itemId: string) => {
    setSelectedContentItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilterType(event.target.value);
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
    setIsModalOpen(false);
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {currentSchedule?.name || 'Loading...'}
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
            <Stack spacing={3}>
              <Typography variant="h6">
                General Settings
              </Typography>

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
                error={!name.trim()}
                helperText={!name.trim() ? 'Name is required' : ''}
              />

              <Box>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={isSaving || !name.trim()}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Schedule Slides */}
      <TabPanel value={value} index={1}>
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Schedule Slides
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleSaveItems}
                  disabled={isSaving}
                  size="small"
                >
                  {isSaving ? <CircularProgress size={20} /> : 'Save Order'}
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
                  onClick={handleOpenAddModal}
                >
                  Add Content Items
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Add Content Items Modal */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseAddModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add Content Items
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ my: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="filter-type-label">Filter by Type</InputLabel>
              <Select
                labelId="filter-type-label"
                value={filterType}
                onChange={handleFilterChange}
                label="Filter by Type"
              >
                <MenuItem value="ALL">All Types</MenuItem>
                {Object.values(ContentType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : filteredContentItems.length === 0 ? (
                <Alert severity="info">
                  No content items found. Create some content items first.
                </Alert>
              ) : (
                <List sx={{ width: '100%' }}>
                  {filteredContentItems.map((item) => (
                    <div key={item.id}>
                      <ListItem disablePadding>
                        <ListItemButton onClick={() => handleToggleContentItem(item.id)}>
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={selectedContentItems.includes(item.id)}
                              tabIndex={-1}
                              disableRipple
                            />
                          </ListItemIcon>
                          <ListItemIcon>
                            {getContentTypeIcon(item.type)}
                          </ListItemIcon>
                          <ListItemText 
                            primary={item.title}
                            secondary={`${item.type.replace('_', ' ')} - ${item.duration}s`}
                          />
                        </ListItemButton>
                      </ListItem>
                      <Divider />
                    </div>
                  ))}
                </List>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddModal}>Cancel</Button>
          <Button 
            onClick={handleAddContentItems} 
            variant="contained"
            disabled={selectedContentItems.length === 0}
          >
            Add Selected ({selectedContentItems.length})
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 