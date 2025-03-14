"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Grid,
  Tooltip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface VerseHadithItem {
  id: string;
  title: string;
  content: {
    type: 'QURAN_VERSE' | 'HADITH';
    arabicText?: string;
    translation: string;
    reference: string;
    source?: string;
    grade?: string;
  };
  duration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  title: string;
  contentType: 'QURAN_VERSE' | 'HADITH';
  arabicText: string;
  translation: string;
  reference: string;
  source: string;
  grade: string;
  duration: string;
}

export default function VerseHadithPage() {
  const [items, setItems] = useState<VerseHadithItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VerseHadithItem | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    contentType: 'QURAN_VERSE',
    arabicText: '',
    translation: '',
    reference: '',
    source: '',
    grade: '',
    duration: '20',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [inputMethod, setInputMethod] = useState<'random' | 'manual' | 'search'>('random');
  const [preview, setPreview] = useState<any | null>(null);
  const [hadithCollection, setHadithCollection] = useState('bukhari');
  const [surahNumber, setSurahNumber] = useState('');
  const [ayahNumber, setAyahNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedHadith, setSelectedHadith] = useState<number | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchResultsLoading, setSearchResultsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [quranSearchResults, setQuranSearchResults] = useState<any[]>([]);
  const [quranSearchModalOpen, setQuranSearchModalOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<{surah: number, ayah: number, surahName?: string} | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/content/verse_hadith');
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: VerseHadithItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        contentType: item.content.type,
        arabicText: item.content.arabicText || '',
        translation: item.content.translation,
        reference: item.content.reference,
        source: item.content.source || '',
        grade: item.content.grade || '',
        duration: item.duration.toString(),
      });
      setTabValue(item.content.type === 'QURAN_VERSE' ? 0 : 1);
      setInputMethod('manual');
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        contentType: 'QURAN_VERSE',
        arabicText: '',
        translation: '',
        reference: '',
        source: '',
        grade: '',
        duration: '20',
      });
      setTabValue(0);
      setInputMethod('random');
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setFormData({
      title: '',
      contentType: 'QURAN_VERSE',
      arabicText: '',
      translation: '',
      reference: '',
      source: '',
      grade: '',
      duration: '20',
    });
    setTabValue(0);
    setInputMethod('random');
    setPreview(null);
    setSurahNumber('');
    setAyahNumber('');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedHadith(null);
    setSearchModalOpen(false);
    setQuranSearchModalOpen(false);
    setSelectedVerse(null);
    setError(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setFormData({
      ...formData,
      contentType: newValue === 0 ? 'QURAN_VERSE' : 'HADITH',
    });
    setPreview(null);
  };

  const handleInputMethodChange = (method: 'random' | 'manual' | 'search') => {
    setInputMethod(method);
    setPreview(null);
  };

  const handleSearchQuranVerse = async () => {
    if (!surahNumber || !ayahNumber) {
      setError("Surah and Ayah numbers are required for search");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const surahNum = parseInt(surahNumber, 10);
      const ayahNum = parseInt(ayahNumber, 10);
      
      if (surahNum < 1 || surahNum > 114) {
        throw new Error("Surah number must be between 1 and 114");
      }
      
      // Fetch the surah to get information
      const surahResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNum}`);
      if (!surahResponse.ok) {
        throw new Error("Failed to fetch surah information");
      }
      
      const surahData = await surahResponse.json();
      const totalAyahs = surahData.data.numberOfAyahs;
      
      if (ayahNum < 1 || ayahNum > totalAyahs) {
        throw new Error(`Ayah number must be between 1 and ${totalAyahs} for Surah ${surahNum}`);
      }
      
      // Create a range of ayahs to display (5 before and 5 after the requested ayah)
      const startAyah = Math.max(1, ayahNum - 5);
      const endAyah = Math.min(totalAyahs, ayahNum + 5);
      
      const results = [];
      
      for (let i = startAyah; i <= endAyah; i++) {
        // Fetch the specific verse
        const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNum}:${i}/en.sahih`);
        if (!response.ok) {
          continue;
        }
        
        const data = await response.json();
        results.push({
          surah: surahNum,
          ayah: i,
          text: data.data.text,
          surahName: surahData.data.englishName,
          reference: `${surahData.data.englishName} (${surahNum}:${i})`,
          isTarget: i === ayahNum
        });
      }
      
      if (results.length === 0) {
        throw new Error("No verses found. Please try different Surah or Ayah numbers.");
      }
      
      setQuranSearchResults(results);
      setQuranSearchModalOpen(true);
    } catch (err) {
      console.error("Error searching Quran verse:", err);
      setError(err instanceof Error ? err.message : 'An error occurred while searching for verses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseQuranSearchModal = () => {
    setQuranSearchModalOpen(false);
    // Only clear errors related to Quran search
    if (error && error.includes('verse') || error && error.includes('Surah') || error && error.includes('Ayah')) {
      setError(null);
    }
  };

  const handleSelectVerse = async (surah: number, ayah: number, surahName: string) => {
    setIsLoading(true);
    setError(null);
    setQuranSearchModalOpen(false);
    
    try {
      const response = await fetch('/api/content/verse_hadith/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fetchMethod: 'api',
          contentType: 'QURAN_VERSE',
          specificVerse: true,
          surahNumber: surah,
          ayahNumber: ayah,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch verse');
      }
      
      const data = await response.json();
      setPreview(data);
      setSelectedVerse({ surah, ayah, surahName });
      setSurahNumber(surah.toString());
      setAyahNumber(ayah.toString());
    } catch (err) {
      console.error("Error fetching verse:", err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const contentType = tabValue === 0 ? 'QURAN_VERSE' : 'HADITH';
      
      if (inputMethod === 'manual') {
        setPreview({
          type: contentType,
          arabicText: formData.arabicText,
          translation: formData.translation,
          reference: formData.reference,
          source: formData.source,
          grade: contentType === 'HADITH' ? formData.grade : undefined,
        });
      } else if (inputMethod === 'random' || inputMethod === 'search') {
        if (inputMethod === 'random') {
          const response = await fetch('/api/content/verse_hadith/preview', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fetchMethod: 'api',
              contentType: contentType,
              hadithCollection: hadithCollection,
              specificVerse: false,
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch preview');
          }
          
          const data = await response.json();
          setPreview(data);
        } else if (contentType === 'QURAN_VERSE' && surahNumber && ayahNumber) {
          // For search with specific verse
          await handleSearchQuranVerse();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      
      if (!preview) {
        await handlePreview();
      }
      
      const url = editingItem 
        ? `/api/content/verse_hadith/${editingItem.id}`
        : '/api/content/verse_hadith';
      
      const contentType = tabValue === 0 ? 'QURAN_VERSE' : 'HADITH';
      
      // For random and search, generate appropriate titles based on content
      let title = formData.title;
      if (inputMethod !== 'manual') {
        if (contentType === 'QURAN_VERSE' && preview) {
          // For Quran, use reference (which contains Surah name and ayah number)
          title = preview.reference || 'Quran Verse of the Day';
        } else if (contentType === 'HADITH' && preview) {
          // For Hadith, use the hadith collection and number
          title = preview.reference || `${hadithCollection.charAt(0).toUpperCase() + hadithCollection.slice(1)} Hadith of the Day`;
        } else {
          title = contentType === 'QURAN_VERSE' ? 'Quran Verse of the Day' : 'Hadith of the Day';
        }
      }
      
      const payload = inputMethod === 'manual' 
        ? {
            title: title,
            content: {
              type: contentType,
              arabicText: formData.arabicText || undefined,
              translation: formData.translation,
              reference: formData.reference,
              source: formData.source || undefined,
              grade: contentType === 'HADITH' ? (formData.grade || undefined) : undefined,
            },
            duration: parseInt(formData.duration, 10),
            isActive: true,
          }
        : {
            title: title,
            fetchMethod: 'api',
            contentType: contentType,
            hadithCollection: hadithCollection,
            specificVerse: inputMethod === 'search' && contentType === 'QURAN_VERSE',
            surahNumber: selectedVerse?.surah || undefined,
            ayahNumber: selectedVerse?.ayah || undefined,
            hadithNumber: selectedHadith || undefined,
            duration: parseInt(formData.duration, 10),
          };
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save item');
      
      await fetchItems();
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const response = await fetch(`/api/content/verse_hadith/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete item');
      
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter search keywords");
      return;
    }
    
    console.log("Search initiated with query:", searchQuery, "in collection:", hadithCollection);
    setIsSearching(true);
    setError(null);
    setSearchResultsLoading(true);
    
    try {
      const collectionMap: Record<string, string> = {
        'bukhari': 'bukhari',
        'muslim': 'muslim',
        'abudawud': 'abudawud',
        'tirmidhi': 'tirmidhi',
        'nasai': 'nasai',
        'ibnmajah': 'ibnmajah',
        'malik': 'malik'
      };
      
      const collectionId = collectionMap[hadithCollection] || 'bukhari';
      
      console.log("Fetching collection:", collectionId);
      const response = await fetch(
        `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-${collectionId}.min.json`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch hadiths from ${hadithCollection}`);
      }
      
      const data = await response.json();
      console.log("Collection fetched, searching...");
      
      const results = data.hadiths
        .filter((hadith: any) => 
          hadith.text.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 20)
        .map((hadith: any) => {
          let hadithNumber = null;
          if (hadith.number) {
            hadithNumber = parseInt(hadith.number, 10);
            if (isNaN(hadithNumber)) {
              const matches = hadith.reference?.match(/\d+/);
              if (matches && matches.length > 0) {
                hadithNumber = parseInt(matches[0], 10);
              }
            }
          }
          
          if (hadithNumber === null || isNaN(hadithNumber)) {
            hadithNumber = data.hadiths.indexOf(hadith) + 1;
          }
          
          return {
            number: hadithNumber,
            text: hadith.text,
            reference: `${hadithCollection}, Hadith ${hadithNumber}`,
          };
        });
      
      console.log("Search results:", results.length);
      setSearchResults(results);
      
      if (results.length > 0) {
        console.log("Opening search modal with", results.length, "results");
        setSearchModalOpen(true);
      } else {
        console.log("No results found");
        setError('No hadith results found. Try different keywords.');
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err instanceof Error ? err.message : 'An error occurred during hadith search');
    } finally {
      setIsSearching(false);
      setSearchResultsLoading(false);
    }
  };

  const handleCloseSearchModal = () => {
    setSearchModalOpen(false);
    // Only clear errors related to search
    if (error && error.includes('search')) {
      setError(null);
    }
  };

  const handleSelectHadith = async (hadithNumber: number | null) => {
    if (hadithNumber === null) {
      setError("Cannot select hadith with unknown number");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSearchModalOpen(false);
    
    try {
      console.log("Fetching hadith number:", hadithNumber, "from collection:", hadithCollection);
      
      const collectionMap: Record<string, string> = {
        'bukhari': 'bukhari',
        'muslim': 'muslim',
        'abudawud': 'abudawud',
        'tirmidhi': 'tirmidhi',
        'nasai': 'nasai',
        'ibnmajah': 'ibnmajah',
        'malik': 'malik'
      };
      
      const collectionId = collectionMap[hadithCollection] || 'bukhari';
      
      const engResponse = await fetch(
        `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-${collectionId}/${hadithNumber}.min.json`
      );
      
      if (!engResponse.ok) {
        throw new Error(`Failed to fetch hadith from ${hadithCollection}`);
      }
      
      const engData = await engResponse.json();
      
      let arabicText = '';
      try {
        const araResponse = await fetch(
          `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${collectionId}/${hadithNumber}.min.json`
        );
        if (araResponse.ok) {
          const araData = await araResponse.json();
          arabicText = araData.hadiths[0]?.text || '';
        }
      } catch (error) {
        console.warn('Arabic hadith not available, continuing with English only');
      }
      
      const collectionNames: Record<string, string> = {
        'bukhari': 'Sahih Bukhari',
        'muslim': 'Sahih Muslim',
        'abudawud': 'Abu Dawud',
        'tirmidhi': 'Tirmidhi',
        'nasai': 'Nasai',
        'ibnmajah': 'Ibn Majah',
        'malik': 'Malik\'s Muwatta'
      };
      
      const displayName = collectionNames[hadithCollection] || hadithCollection;
      
      const hadithData = {
        type: 'HADITH',
        arabicText: arabicText,
        translation: engData.hadiths[0]?.text || '',
        reference: `${displayName}, Hadith ${hadithNumber}`,
        grade: hadithCollection === 'bukhari' || hadithCollection === 'muslim' 
          ? 'Sahih (Authentic)' 
          : 'Varies',
      };
      
      console.log("Hadith data:", hadithData);
      setPreview(hadithData);
      setSelectedHadith(hadithNumber);
    } catch (err) {
      console.error("Error fetching hadith:", err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Verse/Hadith Content
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
        >
          Add New
        </Button>
      </Box>

      <Grid container spacing={3}>
        {loading ? (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          </Grid>
        ) : items.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No verse/hadith content items yet
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleOpenModal()}
                sx={{ mt: 2 }}
              >
                Add Your First Verse/Hadith
              </Button>
            </Paper>
          </Grid>
        ) : (
          items.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {item.title}
                  </Typography>
                  {item.content.arabicText && (
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 2,
                        textAlign: 'right',
                        fontFamily: 'Scheherazade New, serif',
                        direction: 'rtl',
                        fontSize: '1.25rem',
                      }}
                    >
                      {item.content.arabicText}
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.content.translation}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Reference: {item.content.reference}
                  </Typography>
                  {item.content.source && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Source: {item.content.source}
                    </Typography>
                  )}
                  {item.content.grade && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Grade: {item.content.grade}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenModal(item)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(item.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingItem ? 'Edit Verse/Hadith' : 'Add New Verse/Hadith'}
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="verse hadith content type tabs"
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
            centered
          >
            <Tab 
              label="Quran" 
              id="verse-hadith-tab-0" 
              aria-controls="verse-hadith-tabpanel-0"
              sx={{ fontWeight: 'bold' }}
            />
            <Tab 
              label="Hadith" 
              id="verse-hadith-tab-1" 
              aria-controls="verse-hadith-tabpanel-1"
              sx={{ fontWeight: 'bold' }}
            />
          </Tabs>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Selection Method:
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button 
                variant={inputMethod === 'random' ? 'contained' : 'outlined'}
                onClick={() => handleInputMethodChange('random')}
                sx={{ flex: 1 }}
              >
                Random
              </Button>
              <Button 
                variant={inputMethod === 'manual' ? 'contained' : 'outlined'}
                onClick={() => handleInputMethodChange('manual')}
                sx={{ flex: 1 }}
              >
                Manual Input
              </Button>
              <Button 
                variant={inputMethod === 'search' ? 'contained' : 'outlined'}
                onClick={() => handleInputMethodChange('search')}
                sx={{ flex: 1 }}
              >
                Search
              </Button>
            </Stack>
          </Box>

          {/* Only show title field for manual input */}
          {inputMethod === 'manual' && (
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              placeholder="Leave blank to use reference as title"
              sx={{ mb: 3 }}
            />
          )}

          {/* Random Selection */}
          {inputMethod === 'random' && (
            <Stack spacing={3}>
              {tabValue === 0 && (
                <Typography variant="body2" color="text.secondary">
                  A random verse from the Quran will be selected each time this content is displayed.
                </Typography>
              )}

              {tabValue === 1 && (
                <FormControl fullWidth>
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
            </Stack>
          )}

          {inputMethod === 'manual' && (
            <Stack spacing={3}>
              {tabValue === 0 && (
                <>
                  <TextField
                    label="Arabic Text"
                    value={formData.arabicText}
                    onChange={(e) => setFormData({ ...formData, arabicText: e.target.value })}
                    fullWidth
                    required
                    multiline
                    rows={3}
                    sx={{ direction: 'rtl' }}
                    inputProps={{ style: { fontSize: '1.5rem', fontFamily: 'Scheherazade New, serif' } }}
                  />
                  <TextField
                    label="Translation"
                    value={formData.translation}
                    onChange={(e) => setFormData({ ...formData, translation: e.target.value })}
                    fullWidth
                    required
                    multiline
                    rows={4}
                  />
                  <TextField
                    label="Reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    fullWidth
                    required
                    helperText="e.g., 'Al-Baqarah (2:255)'"
                  />
                  <TextField
                    label="Source (Optional)"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    fullWidth
                    helperText="e.g., 'Sahih International'"
                  />
                </>
              )}

              {tabValue === 1 && (
                <>
                  <TextField
                    label="Arabic Text (Optional)"
                    value={formData.arabicText}
                    onChange={(e) => setFormData({ ...formData, arabicText: e.target.value })}
                    fullWidth
                    multiline
                    rows={3}
                    sx={{ direction: 'rtl' }}
                    inputProps={{ style: { fontSize: '1.5rem', fontFamily: 'Scheherazade New, serif' } }}
                  />
                  <TextField
                    label="Translation"
                    value={formData.translation}
                    onChange={(e) => setFormData({ ...formData, translation: e.target.value })}
                    fullWidth
                    required
                    multiline
                    rows={4}
                  />
                  <TextField
                    label="Reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    fullWidth
                    required
                    helperText="e.g., 'Sahih Bukhari, Book 1, Hadith 1'"
                  />
                  <TextField
                    label="Grade (Optional)"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    fullWidth
                    helperText="e.g., 'Sahih', 'Hasan', etc."
                  />
                </>
              )}
            </Stack>
          )}

          {inputMethod === 'search' && (
            <Stack spacing={3}>
              {tabValue === 0 && (
                <>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    To search for a specific Quran verse, enter the Surah and Ayah numbers below.
                  </Alert>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                      label="Surah Number"
                      value={surahNumber}
                      onChange={(e) => setSurahNumber(e.target.value)}
                      required
                      type="number"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: 1, max: 114 }}
                      sx={{ width: '120px' }}
                    />
                    <TextField
                      label="Ayah Number"
                      value={ayahNumber}
                      onChange={(e) => setAyahNumber(e.target.value)}
                      required
                      type="number"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: 1 }}
                      sx={{ width: '120px' }}
                    />
                    <Button 
                      variant="contained"
                      onClick={handleSearchQuranVerse}
                      disabled={!surahNumber || !ayahNumber || isLoading}
                    >
                      {isLoading ? <CircularProgress size={24} /> : 'Search'}
                    </Button>
                  </Box>
                  
                  {selectedVerse && (
                    <Paper elevation={2} sx={{ p: 2, mt: 2, bgcolor: 'action.selected' }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Selected: Surah {selectedVerse.surah}, Ayah {selectedVerse.ayah}
                        {selectedVerse.surahName && ` (${selectedVerse.surahName})`}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={() => setSelectedVerse(null)}
                        >
                          Clear Selection
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained" 
                          onClick={handlePreview}
                          disabled={isLoading}
                        >
                          {isLoading ? <CircularProgress size={20} /> : 'View Selected Verse'}
                        </Button>
                      </Box>
                    </Paper>
                  )}
                </>
              )}

              {tabValue === 1 && (
                <>
                  <FormControl fullWidth sx={{ mb: 2 }}>
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

                  <Box sx={{ display: 'flex', alignItems: 'stretch', mb: 2 }}>
                    <TextField
                      label="Search by keywords"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      fullWidth
                      placeholder="Enter keywords to search for"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                      sx={{ flexGrow: 1, mr: 2 }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleSearch}
                      disabled={isSearching || !searchQuery.trim()}
                      sx={{ minWidth: '100px' }}
                    >
                      {isSearching ? <CircularProgress size={24} /> : 'Search'}
                    </Button>
                  </Box>

                  {selectedHadith && (
                    <Paper elevation={2} sx={{ p: 2, mt: 2, bgcolor: 'action.selected' }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Selected: Hadith #{selectedHadith} from {hadithCollection === 'bukhari' ? 'Sahih Bukhari' : 
                                        hadithCollection === 'muslim' ? 'Sahih Muslim' : 
                                        hadithCollection === 'abudawud' ? 'Abu Dawud' : 
                                        hadithCollection === 'tirmidhi' ? 'Tirmidhi' : 
                                        hadithCollection === 'nasai' ? 'Nasai' : 
                                        hadithCollection === 'ibnmajah' ? 'Ibn Majah' : 
                                        hadithCollection === 'malik' ? 'Malik\'s Muwatta' : 
                                        hadithCollection}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={() => setSelectedHadith(null)}
                        >
                          Clear Selection
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained" 
                          onClick={handlePreview}
                          disabled={isLoading}
                        >
                          {isLoading ? <CircularProgress size={20} /> : 'View Selected Hadith'}
                        </Button>
                      </Box>
                    </Paper>
                  )}
                </>
              )}
            </Stack>
          )}

          <TextField
            label="Display Duration (seconds)"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            fullWidth
            required
            inputProps={{ min: 5, max: 120 }}
            sx={{ mt: 3 }}
          />

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={handlePreview}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Preview Content'}
            </Button>
          </Box>

          {preview && (
            <Paper elevation={2} sx={{ p: 3, mt: 3, bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom>
                Preview
              </Typography>
              {selectedVerse && tabValue === 0 && (
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Selected: {selectedVerse.surah}:{selectedVerse.ayah} from {selectedVerse.surahName}
                </Typography>
              )}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={isLoading || isSaving}
          >
            {isSaving ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={searchModalOpen}
        onClose={handleCloseSearchModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Search Results
          <IconButton
            aria-label="close"
            onClick={handleCloseSearchModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {error && searchModalOpen && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {searchResultsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                <Typography variant="h6" gutterBottom>
                  {hadithCollection === 'bukhari' ? 'Sahih Bukhari' : 
                   hadithCollection === 'muslim' ? 'Sahih Muslim' : 
                   hadithCollection === 'abudawud' ? 'Abu Dawud' : 
                   hadithCollection === 'tirmidhi' ? 'Tirmidhi' : 
                   hadithCollection === 'nasai' ? 'Nasai' : 
                   hadithCollection === 'ibnmajah' ? 'Ibn Majah' : 
                   hadithCollection === 'malik' ? 'Malik\'s Muwatta' : 
                   hadithCollection}
                </Typography>
                <Typography variant="subtitle1">
                  Found {searchResults.length} results for "{searchQuery}"
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Select a hadith to use it in your content
                </Typography>
              </Box>
              <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
                {searchResults.map((result, index) => (
                  <Paper 
                    key={`hadith-result-${index}`}
                    elevation={2} 
                    sx={{ 
                      mb: 2, 
                      p: 2,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      borderLeft: result.number === selectedHadith ? '4px solid' : 'none',
                      borderColor: 'primary.main',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      }
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Hadith {result.number}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {result.text.length > 300 
                        ? `${result.text.substring(0, 300)}...` 
                        : result.text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {result.reference}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button 
                        size="small" 
                        variant="contained"
                        onClick={() => handleSelectHadith(result.number)}
                      >
                        Select
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSearchModal}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={quranSearchModalOpen}
        onClose={handleCloseQuranSearchModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Quran Verse Search Results
          <IconButton
            aria-label="close"
            onClick={handleCloseQuranSearchModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {error && quranSearchModalOpen && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                <Typography variant="h6" gutterBottom>
                  Surah {surahNumber}, Ayah {ayahNumber} and surrounding verses
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Select a verse to use it in your content
                </Typography>
              </Box>
              <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
                {quranSearchResults.map((result, index) => (
                  <Paper 
                    key={`quran-result-${index}`}
                    elevation={2} 
                    sx={{ 
                      mb: 2, 
                      p: 2,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      borderLeft: result.isTarget ? '4px solid' : 'none',
                      borderColor: 'primary.main',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      }
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      {result.text.length > 300 ? `${result.text.substring(0, 300)}...` : result.text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {result.reference}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button 
                        size="small" 
                        variant="contained"
                        onClick={() => handleSelectVerse(result.surah, result.ayah, result.surahName)}
                      >
                        Select
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQuranSearchModal}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 