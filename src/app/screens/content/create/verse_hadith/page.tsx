'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  Paper,
  FormControlLabel,
  Switch,
  Tooltip,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { Info as InfoIcon } from '@mui/icons-material';

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
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function VerseHadithContentPage() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any | null>(null);

  // Common fields
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('20');
  
  // Manual input fields
  const [contentType, setContentType] = useState('QURAN_VERSE'); // QURAN_VERSE or HADITH
  const [arabicText, setArabicText] = useState('');
  const [translation, setTranslation] = useState('');
  const [reference, setReference] = useState('');
  const [source, setSource] = useState('');
  const [grade, setGrade] = useState('');
  
  // API fetch fields
  const [hadithCollection, setHadithCollection] = useState('bukhari');
  const [fetchType, setFetchType] = useState('QURAN_VERSE');
  const [specificVerse, setSpecificVerse] = useState(false);
  const [surahNumber, setSurahNumber] = useState('');
  const [ayahNumber, setAyahNumber] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePreview = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (tabValue === 0) { // Manual input
        // Create preview from manual input
        setPreview({
          type: contentType,
          arabicText: arabicText,
          translation: translation,
          reference: reference,
          source: source,
          grade: contentType === 'HADITH' ? grade : undefined,
        });
      } else { // API fetch
        // Fetch preview from API
        const response = await fetch('/api/content/verse_hadith/preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fetchMethod: 'api',
            contentType: fetchType,
            hadithCollection: hadithCollection,
            specificVerse: specificVerse,
            surahNumber: specificVerse ? parseInt(surahNumber, 10) : undefined,
            ayahNumber: specificVerse ? parseInt(ayahNumber, 10) : undefined,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch preview');
        }
        
        const data = await response.json();
        setPreview(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (tabValue === 0 && (!title.trim() || !translation.trim() || !reference.trim())) {
      setError('Title, translation, and reference are required');
      return;
    }
    
    if (tabValue === 0 && contentType === 'QURAN_VERSE' && !arabicText.trim()) {
      setError('Arabic text is required for Quranic verses');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = tabValue === 0 
        ? {
            // Manual input
            title,
            type: 'VERSE_HADITH',
            content: {
              type: contentType,
              arabicText: arabicText,
              translation: translation,
              reference: reference,
              source: source || undefined,
              grade: contentType === 'HADITH' ? (grade || undefined) : undefined,
            },
            duration: parseInt(duration, 10),
            isActive: true,
          }
        : {
            // API fetch
            title: title || 'Verse/Hadith of the Day',
            fetchMethod: 'api',
            contentType: fetchType,
            hadithCollection: hadithCollection,
            specificVerse: specificVerse,
            surahNumber: specificVerse ? parseInt(surahNumber, 10) : undefined,
            ayahNumber: specificVerse ? parseInt(ayahNumber, 10) : undefined,
            duration: parseInt(duration, 10),
          };
      
      const response = await fetch('/api/content/verse_hadith', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create content');
      }

      router.push('/screens/content/verse_hadith');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Create Verse/Hadith Content
      </Typography>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="verse hadith input method tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Manual Input" id="verse-hadith-tab-0" aria-controls="verse-hadith-tabpanel-0" />
            <Tab label="Fetch from API" id="verse-hadith-tab-1" aria-controls="verse-hadith-tabpanel-1" />
          </Tabs>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {error && (
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <TextField
                label="Title (Optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                helperText="Leave blank to use reference as title"
              />

              <TabPanel value={tabValue} index={0}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="content-type-label">Content Type</InputLabel>
                  <Select
                    labelId="content-type-label"
                    value={contentType}
                    label="Content Type"
                    onChange={(e) => setContentType(e.target.value)}
                  >
                    <MenuItem value="QURAN_VERSE">Quran Verse</MenuItem>
                    <MenuItem value="HADITH">Hadith</MenuItem>
                  </Select>
                </FormControl>

                {contentType === 'QURAN_VERSE' && (
                  <TextField
                    label="Arabic Text"
                    value={arabicText}
                    onChange={(e) => setArabicText(e.target.value)}
                    fullWidth
                    required
                    multiline
                    rows={3}
                    sx={{ mb: 3, direction: 'rtl' }}
                    inputProps={{ style: { fontSize: '1.5rem' } }}
                  />
                )}

                <TextField
                  label="Translation"
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                  fullWidth
                  required
                  multiline
                  rows={4}
                  sx={{ mb: 3 }}
                />

                <TextField
                  label="Reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  fullWidth
                  required
                  helperText={contentType === 'QURAN_VERSE' ? "e.g., 'Al-Baqarah (2:255)'" : "e.g., 'Sahih Bukhari, Book 1, Hadith 1'"}
                  sx={{ mb: 3 }}
                />

                {contentType === 'QURAN_VERSE' && (
                  <TextField
                    label="Source (Optional)"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    fullWidth
                    helperText="e.g., 'Sahih International'"
                    sx={{ mb: 3 }}
                  />
                )}

                {contentType === 'HADITH' && (
                  <>
                    <TextField
                      label="Arabic Text (Optional)"
                      value={arabicText}
                      onChange={(e) => setArabicText(e.target.value)}
                      fullWidth
                      multiline
                      rows={3}
                      sx={{ mb: 3, direction: 'rtl' }}
                      inputProps={{ style: { fontSize: '1.5rem' } }}
                    />
                    <TextField
                      label="Grade (Optional)"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      fullWidth
                      helperText="e.g., 'Sahih', 'Hasan', etc."
                      sx={{ mb: 3 }}
                    />
                  </>
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="fetch-type-label">Content Type</InputLabel>
                  <Select
                    labelId="fetch-type-label"
                    value={fetchType}
                    label="Content Type"
                    onChange={(e) => setFetchType(e.target.value)}
                  >
                    <MenuItem value="QURAN_VERSE">Quran Verse</MenuItem>
                    <MenuItem value="HADITH">Hadith</MenuItem>
                  </Select>
                </FormControl>

                {fetchType === 'QURAN_VERSE' && (
                  <>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={specificVerse}
                          onChange={(e) => setSpecificVerse(e.target.checked)}
                        />
                      }
                      label="Specify verse (instead of random)"
                      sx={{ mb: 2 }}
                    />

                    {specificVerse && (
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                          <TextField
                            label="Surah Number"
                            value={surahNumber}
                            onChange={(e) => setSurahNumber(e.target.value)}
                            fullWidth
                            required
                            type="number"
                            inputProps={{ min: 1, max: 114 }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Ayah Number"
                            value={ayahNumber}
                            onChange={(e) => setAyahNumber(e.target.value)}
                            fullWidth
                            required
                            type="number"
                            inputProps={{ min: 1 }}
                          />
                        </Grid>
                      </Grid>
                    )}
                  </>
                )}

                {fetchType === 'HADITH' && (
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="hadith-collection-label">Hadith Collection</InputLabel>
                    <Select
                      labelId="hadith-collection-label"
                      value={hadithCollection}
                      label="Hadith Collection"
                      onChange={(e) => setHadithCollection(e.target.value)}
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
                )}

                <Button
                  variant="outlined"
                  onClick={handlePreview}
                  disabled={isLoading}
                  sx={{ mb: 3 }}
                >
                  {isLoading ? 'Loading...' : 'Preview Content'}
                </Button>

                {preview && (
                  <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
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
                )}
              </TabPanel>

              <TextField
                label="Display Duration (seconds)"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                fullWidth
                required
                inputProps={{ min: 5, max: 120 }}
              />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/screens/content/verse_hadith')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                  {isLoading ? 'Creating...' : 'Create Content'}
                </Button>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
} 