import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Paper,
  FormControlLabel,
  Switch,
  InputAdornment,
} from '@mui/material';
import {
  MenuBook as MenuBookIcon,
  Translate as TranslateIcon,
  Source as SourceIcon,
  Bookmark as BookmarkIcon,
  StarRate as StarRateIcon,
  Timer as TimerIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { ContentType } from '@prisma/client';
import { createContentItem, updateContentItem, ContentItemData } from '@/lib/services/content';
import { FormTextField, FormTextArea, FormDatePicker, FormSwitch } from '@/components/common/FormFields';
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext';
import { FormSection } from '@/components/common/FormSection';
import { useSnackbar } from '@/contexts/SnackbarContext';

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
      id={`verse-hadith-tabpanel-${index}`}
      aria-labelledby={`verse-hadith-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

interface VerseHadithFormProps {
  initialData?: ContentItemData;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function VerseHadithForm({ initialData, onSuccess, onCancel }: VerseHadithFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setHasUnsavedChanges } = useUnsavedChanges();
  const { showSnackbar } = useSnackbar();
  const [tabValue, setTabValue] = useState(0);
  const [preview, setPreview] = useState<any | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  
  // Extract content data from initialData if it exists
  const getInitialContentData = () => {
    if (!initialData?.content) return { 
      type: 'QURAN_VERSE', 
      arabicText: '', 
      translation: '', 
      reference: '', 
      source: '', 
      grade: '' 
    };
    
    try {
      const content = typeof initialData.content === 'string' 
        ? JSON.parse(initialData.content) 
        : initialData.content;
        
      return {
        type: content.type || 'QURAN_VERSE',
        arabicText: content.arabicText || '',
        translation: content.translation || '',
        reference: content.reference || '',
        source: content.source || '',
        grade: content.grade || '',
      };
    } catch (e) {
      console.error('Error parsing content data:', e);
      return { 
        type: 'QURAN_VERSE', 
        arabicText: '', 
        translation: '', 
        reference: '', 
        source: '', 
        grade: '' 
      };
    }
  };
  
  const contentData = getInitialContentData();
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    contentType: contentData.type,
    arabicText: contentData.arabicText,
    translation: contentData.translation,
    reference: contentData.reference,
    source: contentData.source,
    grade: contentData.grade,
    duration: initialData?.duration || 20,
    isActive: initialData?.isActive ?? true,
    startDate: initialData?.startDate ? dayjs(initialData.startDate) : null,
    endDate: initialData?.endDate ? dayjs(initialData.endDate) : null,
    // API fetch fields
    inputMethod: 'manual' as 'manual' | 'random' | 'search',
    hadithCollection: 'bukhari',
    specificVerse: false,
    surahNumber: '',
    ayahNumber: '',
  });

  // Track original data for unsaved changes
  const [originalData, setOriginalData] = useState(formData);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasUnsavedChanges(hasChanges);
    
    return () => {
      setHasUnsavedChanges(false);
    };
  }, [formData, originalData, setHasUnsavedChanges]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setFormData(prev => ({
      ...prev,
      contentType: newValue === 0 ? 'QURAN_VERSE' : 'HADITH'
    }));
  };

  const handleInputMethodChange = (method: 'random' | 'manual' | 'search') => {
    setFormData(prev => ({
      ...prev,
      inputMethod: method
    }));
  };

  const handlePreview = async () => {
    if (formData.inputMethod === 'manual') {
      // Create preview from manual input
      setPreview({
        type: formData.contentType,
        arabicText: formData.arabicText,
        translation: formData.translation,
        reference: formData.reference,
        source: formData.source,
        grade: formData.contentType === 'HADITH' ? formData.grade : undefined,
      });
      return;
    }
    
    setIsPreviewLoading(true);
    setError(null);
    
    try {
      // Fetch preview from API
      const response = await fetch('/api/content/verse_hadith/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fetchMethod: 'api',
          contentType: formData.contentType,
          hadithCollection: formData.hadithCollection,
          specificVerse: formData.specificVerse,
          surahNumber: formData.specificVerse ? parseInt(formData.surahNumber, 10) : undefined,
          ayahNumber: formData.specificVerse ? parseInt(formData.ayahNumber, 10) : undefined,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch preview');
      }
      
      const data = await response.json();
      setPreview(data);
    } catch (error) {
      console.error('Error fetching preview:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching preview');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.inputMethod === 'manual') {
      if (!formData.translation.trim() || !formData.reference.trim()) {
        setError('Translation and reference are required');
        return;
      }
      
      if (formData.contentType === 'QURAN_VERSE' && !formData.arabicText.trim()) {
        setError('Arabic text is required for Quranic verses');
        return;
      }
    } else if (formData.inputMethod === 'random') {
      // No validation needed for random
    } else if (formData.inputMethod === 'search') {
      if (formData.specificVerse && (!formData.surahNumber || !formData.ayahNumber)) {
        setError('Surah and Ayah numbers are required when specifying a verse');
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = formData.inputMethod === 'manual' 
        ? {
            // Manual input
            title: formData.title || formData.reference,
            type: ContentType.VERSE_HADITH,
            content: {
              type: formData.contentType,
              arabicText: formData.arabicText,
              translation: formData.translation,
              reference: formData.reference,
              source: formData.source || undefined,
              grade: formData.contentType === 'HADITH' ? (formData.grade || undefined) : undefined,
            },
            duration: formData.duration,
            isActive: formData.isActive,
            startDate: formData.startDate ? formData.startDate.toDate() : undefined,
            endDate: formData.endDate ? formData.endDate.toDate() : undefined,
          }
        : {
            // API fetch
            title: formData.title || 'Verse/Hadith of the Day',
            type: ContentType.VERSE_HADITH,
            content: {
              fetchMethod: 'api',
              contentType: formData.contentType,
              hadithCollection: formData.hadithCollection,
              specificVerse: formData.specificVerse,
              surahNumber: formData.specificVerse ? parseInt(formData.surahNumber, 10) : undefined,
              ayahNumber: formData.specificVerse ? parseInt(formData.ayahNumber, 10) : undefined,
            },
            duration: formData.duration,
            isActive: formData.isActive,
            startDate: formData.startDate ? formData.startDate.toDate() : undefined,
            endDate: formData.endDate ? formData.endDate.toDate() : undefined,
          };
      
      if (initialData) {
        await updateContentItem({ id: initialData.id, ...payload });
        showSnackbar('Verse/Hadith updated successfully', 'success');
      } else {
        await createContentItem(payload);
        showSnackbar('Verse/Hadith created successfully', 'success');
      }

      setHasUnsavedChanges(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving verse/hadith:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while saving');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component="form" onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mx: 3, mt: 3, mb: 0 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <FormSection 
          title="Content Type" 
          description="Select the type of content you want to create"
        >
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="verse hadith content type tabs"
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
            centered
          >
            <Tab 
              label="Quran Verse" 
              id="verse-hadith-tab-0" 
              aria-controls="verse-hadith-tabpanel-0"
              sx={{ fontWeight: 'bold' }}
              icon={<MenuBookIcon />}
              iconPosition="start"
            />
            <Tab 
              label="Hadith" 
              id="verse-hadith-tab-1" 
              aria-controls="verse-hadith-tabpanel-1"
              sx={{ fontWeight: 'bold' }}
              icon={<MenuBookIcon />}
              iconPosition="start"
            />
          </Tabs>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Selection Method:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Button 
                  fullWidth
                  variant={formData.inputMethod === 'random' ? 'contained' : 'outlined'}
                  onClick={() => handleInputMethodChange('random')}
                >
                  Random
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button 
                  fullWidth
                  variant={formData.inputMethod === 'manual' ? 'contained' : 'outlined'}
                  onClick={() => handleInputMethodChange('manual')}
                >
                  Manual Input
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button 
                  fullWidth
                  variant={formData.inputMethod === 'search' ? 'contained' : 'outlined'}
                  onClick={() => handleInputMethodChange('search')}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </Box>
        </FormSection>

        {formData.inputMethod === 'manual' && (
          <FormSection 
            title="Content Details" 
            description={`Enter the details for your ${formData.contentType === 'QURAN_VERSE' ? 'Quranic verse' : 'hadith'}`}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormTextField
                  label="Title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  helperText="Optional: Custom title for this content (reference will be used if left blank)"
                  tooltip="A custom title for this content. If left blank, the reference will be used as the title."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BookmarkIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {formData.contentType === 'QURAN_VERSE' && (
                <Grid item xs={12}>
                  <FormTextArea
                    label="Arabic Text"
                    value={formData.arabicText}
                    onChange={(e) => setFormData({ ...formData, arabicText: e.target.value })}
                    required
                    helperText="Enter the Arabic text of the verse"
                    tooltip="The original Arabic text of the Quranic verse"
                    rows={3}
                    sx={{ direction: 'rtl' }}
                    inputProps={{ style: { fontSize: '1.5rem', fontFamily: 'Scheherazade New, serif' } }}
                  />
                </Grid>
              )}
              
              <Grid item xs={12}>
                <FormTextArea
                  label="Translation"
                  value={formData.translation}
                  onChange={(e) => setFormData({ ...formData, translation: e.target.value })}
                  required
                  helperText="Enter the translation of the verse or hadith"
                  tooltip="The English translation of the verse or hadith"
                  rows={4}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TranslateIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormTextField
                  label="Reference"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  required
                  helperText={formData.contentType === 'QURAN_VERSE' ? "e.g., 'Al-Baqarah (2:255)'" : "e.g., 'Sahih Bukhari, Book 1, Hadith 1'"}
                  tooltip="The reference for this verse or hadith"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SourceIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {formData.contentType === 'QURAN_VERSE' && (
                <Grid item xs={12}>
                  <FormTextField
                    label="Source"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    helperText="e.g., 'Sahih International'"
                    tooltip="The source of the translation"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SourceIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}
              
              {formData.contentType === 'HADITH' && (
                <>
                  <Grid item xs={12}>
                    <FormTextArea
                      label="Arabic Text"
                      value={formData.arabicText}
                      onChange={(e) => setFormData({ ...formData, arabicText: e.target.value })}
                      helperText="Optional: Enter the Arabic text of the hadith"
                      tooltip="The original Arabic text of the hadith"
                      rows={3}
                      sx={{ direction: 'rtl' }}
                      inputProps={{ style: { fontSize: '1.5rem', fontFamily: 'Scheherazade New, serif' } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormTextField
                      label="Grade"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      helperText="e.g., 'Sahih', 'Hasan', etc."
                      tooltip="The authenticity grade of the hadith"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <StarRateIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </FormSection>
        )}

        {formData.inputMethod === 'random' && (
          <FormSection 
            title="Random Content" 
            description={`A random ${formData.contentType === 'QURAN_VERSE' ? 'verse from the Quran' : 'hadith'} will be selected each time this content is displayed`}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormTextField
                  label="Title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  helperText={`Optional: Custom title (defaults to "${formData.contentType === 'QURAN_VERSE' ? 'Verse' : 'Hadith'} of the Day")`}
                  tooltip="A custom title for this content"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BookmarkIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {formData.contentType === 'HADITH' && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="hadith-collection-label">Hadith Collection</InputLabel>
                    <Select
                      labelId="hadith-collection-label"
                      value={formData.hadithCollection}
                      label="Hadith Collection"
                      onChange={(e) => setFormData({ ...formData, hadithCollection: e.target.value })}
                    >
                      <MenuItem value="bukhari">Sahih Bukhari</MenuItem>
                      <MenuItem value="muslim">Sahih Muslim</MenuItem>
                      <MenuItem value="abudawud">Abu Dawud</MenuItem>
                      <MenuItem value="tirmidhi">Tirmidhi</MenuItem>
                      <MenuItem value="nasai">Nasai</MenuItem>
                      <MenuItem value="ibnmajah">Ibn Majah</MenuItem>
                      <MenuItem value="malik">Malik's Muwatta</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  onClick={handlePreview}
                  disabled={isPreviewLoading}
                >
                  {isPreviewLoading ? 'Loading...' : 'Preview Content'}
                </Button>
              </Grid>
              
              {preview && (
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, bgcolor: 'background.default' }}>
                    <Typography variant="h6" gutterBottom>
                      Preview
                    </Typography>
                    {preview.arabicText && (
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          mb: 2, 
                          textAlign: 'right',
                          fontFamily: 'Scheherazade New, serif',
                          direction: 'rtl'
                        }}
                      >
                        {preview.arabicText}
                      </Typography>
                    )}
                    <Typography variant="body1" paragraph>
                      {preview.translation}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      {preview.reference}
                    </Typography>
                    {preview.grade && (
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Grade: {preview.grade}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              )}
            </Grid>
          </FormSection>
        )}

        {formData.inputMethod === 'search' && (
          <FormSection 
            title="Search Content" 
            description={`Search for a specific ${formData.contentType === 'QURAN_VERSE' ? 'verse from the Quran' : 'hadith'}`}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormTextField
                  label="Title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  helperText="Optional: Custom title for this content"
                  tooltip="A custom title for this content"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BookmarkIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {formData.contentType === 'QURAN_VERSE' && (
                <>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.specificVerse}
                          onChange={(e) => setFormData({ ...formData, specificVerse: e.target.checked })}
                        />
                      }
                      label="Specify verse (instead of random)"
                    />
                  </Grid>

                  {formData.specificVerse && (
                    <>
                      <Grid item xs={12} md={6}>
                        <FormTextField
                          label="Surah Number"
                          type="number"
                          value={formData.surahNumber}
                          onChange={(e) => setFormData({ ...formData, surahNumber: e.target.value })}
                          required
                          helperText="Enter a number between 1 and 114"
                          tooltip="The chapter number in the Quran"
                          inputProps={{ min: 1, max: 114 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormTextField
                          label="Ayah Number"
                          type="number"
                          value={formData.ayahNumber}
                          onChange={(e) => setFormData({ ...formData, ayahNumber: e.target.value })}
                          required
                          helperText="Enter the verse number"
                          tooltip="The verse number within the surah"
                          inputProps={{ min: 1 }}
                        />
                      </Grid>
                    </>
                  )}
                </>
              )}
              
              {formData.contentType === 'HADITH' && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="hadith-collection-label">Hadith Collection</InputLabel>
                    <Select
                      labelId="hadith-collection-label"
                      value={formData.hadithCollection}
                      label="Hadith Collection"
                      onChange={(e) => setFormData({ ...formData, hadithCollection: e.target.value })}
                    >
                      <MenuItem value="bukhari">Sahih Bukhari</MenuItem>
                      <MenuItem value="muslim">Sahih Muslim</MenuItem>
                      <MenuItem value="abudawud">Abu Dawud</MenuItem>
                      <MenuItem value="tirmidhi">Tirmidhi</MenuItem>
                      <MenuItem value="nasai">Nasai</MenuItem>
                      <MenuItem value="ibnmajah">Ibn Majah</MenuItem>
                      <MenuItem value="malik">Malik's Muwatta</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  onClick={handlePreview}
                  disabled={isPreviewLoading}
                >
                  {isPreviewLoading ? 'Loading...' : 'Preview Content'}
                </Button>
              </Grid>
              
              {preview && (
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, bgcolor: 'background.default' }}>
                    <Typography variant="h6" gutterBottom>
                      Preview
                    </Typography>
                    {preview.arabicText && (
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          mb: 2, 
                          textAlign: 'right',
                          fontFamily: 'Scheherazade New, serif',
                          direction: 'rtl'
                        }}
                      >
                        {preview.arabicText}
                      </Typography>
                    )}
                    <Typography variant="body1" paragraph>
                      {preview.translation}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      {preview.reference}
                    </Typography>
                    {preview.grade && (
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Grade: {preview.grade}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              )}
            </Grid>
          </FormSection>
        )}

        <FormSection 
          title="Display Settings" 
          description="Configure how and when this content should be displayed"
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormTextField
                label="Display Duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                endAdornment="seconds"
                helperText="How long should this content be displayed on each cycle?"
                tooltip="Duration in seconds that the content will be shown before moving to the next content"
                inputProps={{ min: 5, max: 120 }}
                InputProps={{
                  startAdornment: <AccessTimeIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormDatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(newValue) => setFormData({ ...formData, startDate: newValue })}
                helperText="When should this content start displaying?"
                tooltip="The date when this content will start appearing on screens (leave empty for immediate display)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormDatePicker
                label="End Date"
                value={formData.endDate}
                onChange={(newValue) => setFormData({ ...formData, endDate: newValue })}
                helperText="When should this content stop displaying?"
                tooltip="The date when this content will stop appearing on screens (leave empty to display indefinitely)"
              />
            </Grid>

            <Grid item xs={12}>
              <FormSwitch
                label="Active"
                checked={formData.isActive}
                onChange={(checked) => setFormData({ ...formData, isActive: checked })}
                helperText="Toggle to enable or disable this content from displaying"
                tooltip="When disabled, this content won't appear on any screens"
              />
            </Grid>
          </Grid>
        </FormSection>

        <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end', gap: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Content' : 'Create Content'}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
} 