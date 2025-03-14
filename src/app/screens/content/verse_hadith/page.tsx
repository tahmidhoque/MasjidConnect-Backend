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
  Container,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  MenuBook as MenuBookIcon,
  Translate as TranslateIcon,
  Source as SourceIcon,
  Bookmark as BookmarkIcon,
  StarRate as StarRateIcon,
  Timer as TimerIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { ContentTypeTable } from '@/components/content/table/ContentTypeTable';
import { StatusChip } from '@/components/content/table/StatusChip';
import { formatDuration, getReadableContentType } from '@/lib/content-helper';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext';

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
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const { showSnackbar } = useSnackbar();
  const { setHasUnsavedChanges } = useUnsavedChanges();

  useEffect(() => {
    fetchItems();
  }, [page, pageSize]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/content/verse_hadith?page=${page}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      const data = await response.json();
      setItems(data.items || []);
      setTotalItems(data.meta?.total || 0);
      setTotalPages(data.meta?.totalPages || 0);
    } catch (err) {
      console.error('Error fetching verse/hadith items:', err);
      showSnackbar(err instanceof Error ? err.message : 'An error occurred while fetching items', 'error');
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
    if (hasFormChanges()) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        closeModalAndResetState();
      }
    } else {
      closeModalAndResetState();
    }
  };

  const closeModalAndResetState = () => {
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
    setHasUnsavedChanges(false);
  };

  const hasFormChanges = () => {
    if (!editingItem) {
      // For new items, check if any required fields have been filled
      if (inputMethod === 'manual') {
        if (formData.translation || formData.reference) {
          return true;
        }
      } else if (inputMethod === 'search') {
        if (tabValue === 0 && selectedVerse) {
          return true;
        } else if (tabValue === 1 && selectedHadith) {
          return true;
        }
      }
      return false;
    }
    
    // For editing existing items
    if (editingItem.content.type !== formData.contentType) {
      return true;
    }
    
    if (editingItem.title !== formData.title) {
      return true;
    }
    
    if (editingItem.content.arabicText !== formData.arabicText) {
      return true;
    }
    
    if (editingItem.content.translation !== formData.translation) {
      return true;
    }
    
    if (editingItem.content.reference !== formData.reference) {
      return true;
    }
    
    if (editingItem.content.source !== formData.source) {
      return true;
    }
    
    if (editingItem.content.grade !== formData.grade) {
      return true;
    }
    
    if (editingItem.duration.toString() !== formData.duration) {
      return true;
    }
    
    return false;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setFormData({
      ...formData,
      contentType: newValue === 0 ? 'QURAN_VERSE' : 'HADITH',
    });
    setPreview(null);
    setHasUnsavedChanges(true);
  };

  const handleInputMethodChange = (method: 'random' | 'manual' | 'search') => {
    setInputMethod(method);
    setPreview(null);
    setHasUnsavedChanges(true);
  };

  const handleSearchQuranVerse = async () => {
    if (!surahNumber || !ayahNumber) {
      showSnackbar("Surah and Ayah numbers are required for search", 'error');
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
      showSnackbar(err instanceof Error ? err.message : 'An error occurred while searching for verses', 'error');
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
      setHasUnsavedChanges(true);
    } catch (err) {
      console.error("Error fetching verse:", err);
      showSnackbar(err instanceof Error ? err.message : 'An error occurred while fetching verse', 'error');
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
        // Validate required fields for manual input
        if (contentType === 'QURAN_VERSE') {
          if (!formData.translation || !formData.reference) {
            throw new Error('Translation and reference are required for Quran verses');
          }
        } else {
          if (!formData.translation || !formData.reference) {
            throw new Error('Translation and reference are required for Hadiths');
          }
        }
        
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
      showSnackbar(err instanceof Error ? err.message : 'An error occurred while generating preview', 'error');
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
      
      showSnackbar(`${contentType === 'QURAN_VERSE' ? 'Verse' : 'Hadith'} ${editingItem ? 'updated' : 'created'} successfully`, 'success');
      await fetchItems();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving item:', err);
      showSnackbar(err instanceof Error ? err.message : 'An error occurred while saving', 'error');
    } finally {
      setIsSaving(false);
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/content/verse_hadith?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      
      showSnackbar('Item deleted successfully', 'success');
      // Refresh the items list
      fetchItems();
    } catch (err) {
      console.error('Error deleting item:', err);
      showSnackbar(err instanceof Error ? err.message : 'An error occurred while deleting', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      showSnackbar("Please enter search keywords", 'error');
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
        showSnackbar('No hadith results found. Try different keywords.', 'info');
      }
    } catch (err) {
      console.error("Search error:", err);
      showSnackbar(err instanceof Error ? err.message : 'An error occurred during hadith search', 'error');
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
      showSnackbar("Cannot select hadith with unknown number", 'error');
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
      setHasUnsavedChanges(true);
    } catch (err) {
      console.error("Error fetching hadith:", err);
      showSnackbar(err instanceof Error ? err.message : 'An error occurred while fetching hadith', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Table columns configuration
  const columns = [
    {
      id: 'title',
      label: 'Title',
      render: (item: VerseHadithItem) => item.title,
    },
    {
      id: 'type',
      label: 'Type',
      render: (item: VerseHadithItem) => getReadableContentType(item.content.type),
      filterable: true,
      filterOptions: [
        { value: 'QURAN_VERSE', label: 'Quran Verse' },
        { value: 'HADITH', label: 'Hadith' },
      ],
    },
    {
      id: 'translation',
      label: 'Translation',
      render: (item: VerseHadithItem) => (
        <Tooltip title={item.content.translation} placement="top">
          <Typography noWrap sx={{ maxWidth: 250 }}>
            {item.content.translation}
          </Typography>
        </Tooltip>
      ),
    },
    {
      id: 'reference',
      label: 'Reference',
      render: (item: VerseHadithItem) => item.content.reference,
    },
    {
      id: 'duration',
      label: 'Duration',
      render: (item: VerseHadithItem) => formatDuration(item.duration),
    },
    {
      id: 'status',
      label: 'Status',
      render: (item: VerseHadithItem) => <StatusChip isActive={item.isActive} />,
      filterable: true,
      filterOptions: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Verses & Hadiths
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage Quranic verses and hadith content to display on your screens
          </Typography>
          <Divider sx={{ mt: 2 }} />
        </Box>

        <ContentTypeTable
          items={items}
          isLoading={loading}
          subtitle="Display meaningful verses and hadiths from the Quran and authentic collections"
          emptyMessage="No verses or hadiths have been added yet. Click 'Add New' to create your first item."
          searchEmptyMessage="No verses or hadiths match your search criteria."
          addButtonLabel="Add New"
          onAdd={() => handleOpenModal()}
          onEdit={(item: VerseHadithItem) => handleOpenModal(item)}
          onDelete={handleDelete}
          onRefresh={fetchItems}
          getItemId={(item: VerseHadithItem) => item.id}
          columns={columns}
        />
      </Box>
      
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            m: 2,
            borderRadius: '12px',
            maxWidth: { xs: 'calc(100% - 32px)', sm: '700px' }
          }
        }}
      >
        <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 'medium', pb: 1, px: '32px', pt: '24px' }}>
          {editingItem ? 'Edit Verse/Hadith' : 'Add New Verse/Hadith'}
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'text.secondary',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 2, px: '32px', paddingTop: '20px !important' }}>
          {/* Error alerts removed as we're now using snackbars */}
          
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
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                setHasUnsavedChanges(true);
              }}
              fullWidth
              placeholder="Leave blank to use reference as title"
              sx={{ mb: 3 }}
              helperText="Optional: Custom title for this content (reference will be used if left blank)"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BookmarkIcon color="action" />
                  </InputAdornment>
                ),
              }}
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

          {/* Manual Input sections with improved styling */}
          {inputMethod === 'manual' && (
            <Stack spacing={3}>
              {tabValue === 0 && (
                <>
                  <TextField
                    label="Arabic Text"
                    value={formData.arabicText}
                    onChange={(e) => {
                      setFormData({ ...formData, arabicText: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    fullWidth
                    required
                    multiline
                    rows={3}
                    sx={{ direction: 'rtl' }}
                    inputProps={{ style: { fontSize: '1.5rem', fontFamily: 'Scheherazade New, serif' } }}
                    helperText="Enter the Quranic verse in Arabic"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                          <MenuBookIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Translation"
                    value={formData.translation}
                    onChange={(e) => {
                      setFormData({ ...formData, translation: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    fullWidth
                    required
                    multiline
                    rows={4}
                    helperText="Enter the English translation of the verse"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                          <TranslateIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Reference"
                    value={formData.reference}
                    onChange={(e) => {
                      setFormData({ ...formData, reference: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    fullWidth
                    required
                    helperText="Citation format: 'Surah Name (Chapter:Verse)' e.g., 'Al-Baqarah (2:255)'"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Source (Optional)"
                    value={formData.source}
                    onChange={(e) => {
                      setFormData({ ...formData, source: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    fullWidth
                    helperText="Translation source e.g., 'Sahih International', 'Yusuf Ali'"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SourceIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </>
              )}

              {tabValue === 1 && (
                <>
                  <TextField
                    label="Arabic Text (Optional)"
                    value={formData.arabicText}
                    onChange={(e) => {
                      setFormData({ ...formData, arabicText: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    fullWidth
                    multiline
                    rows={3}
                    sx={{ direction: 'rtl' }}
                    inputProps={{ style: { fontSize: '1.5rem', fontFamily: 'Scheherazade New, serif' } }}
                    helperText="Optional: Original Arabic text of the hadith"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                          <MenuBookIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Translation"
                    value={formData.translation}
                    onChange={(e) => {
                      setFormData({ ...formData, translation: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    fullWidth
                    required
                    multiline
                    rows={4}
                    helperText="English translation of the hadith"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                          <TranslateIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Reference"
                    value={formData.reference}
                    onChange={(e) => {
                      setFormData({ ...formData, reference: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    fullWidth
                    required
                    helperText="Citation format: 'Collection, Book Number, Hadith Number' e.g., 'Sahih Bukhari, Book 1, Hadith 1'"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Grade (Optional)"
                    value={formData.grade}
                    onChange={(e) => {
                      setFormData({ ...formData, grade: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    fullWidth
                    helperText="Authentication status of the hadith e.g., 'Sahih', 'Hasan', 'Daif'"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <StarRateIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </>
              )}
            </Stack>
          )}

          {inputMethod === 'search' && (
            <Stack spacing={3}>
              {tabValue === 0 && (
                <>
                  <Alert severity="info" sx={{ mb: 2, borderRadius: '8px' }}>
                    To search for a specific Quran verse, enter the Surah and Ayah numbers below.
                  </Alert>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <TextField
                      label="Surah Number"
                      value={surahNumber}
                      onChange={(e) => setSurahNumber(e.target.value)}
                      required
                      type="number"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: 1, max: 114 }}
                      sx={{ width: '120px' }}
                      helperText="1-114"
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
                      helperText="Verse number"
                    />
                    <Button 
                      variant="contained"
                      onClick={handleSearchQuranVerse}
                      disabled={!surahNumber || !ayahNumber || isLoading}
                      sx={{ height: '40px', alignSelf: 'flex-start', mt: '8px', borderRadius: '8px' }}
                      startIcon={isLoading ? <CircularProgress size={20} /> : <SearchIcon />}
                    >
                      {isLoading ? 'Searching...' : 'Search'}
                    </Button>
                  </Box>
                  
                  {selectedVerse && (
                    <Paper elevation={2} sx={{ p: 2, mt: 2, bgcolor: 'action.selected', borderRadius: '8px' }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Selected: Surah {selectedVerse.surah}, Ayah {selectedVerse.ayah}
                        {selectedVerse.surahName && ` (${selectedVerse.surahName})`}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={() => setSelectedVerse(null)}
                          sx={{ borderRadius: '8px' }}
                        >
                          Clear Selection
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained" 
                          onClick={handlePreview}
                          disabled={isLoading}
                          sx={{ borderRadius: '8px' }}
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
                      sx={{ borderRadius: '8px' }}
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

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
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
                      helperText="Enter words or phrases to find relevant hadiths"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleSearch}
                      disabled={isSearching || !searchQuery.trim()}
                      sx={{ minWidth: '100px', height: '40px', mt: '8px', borderRadius: '8px' }}
                      startIcon={isSearching ? <CircularProgress size={20} /> : null}
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                    </Button>
                  </Box>

                  {selectedHadith && (
                    <Paper elevation={2} sx={{ p: 2, mt: 2, bgcolor: 'action.selected', borderRadius: '8px' }}>
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
                          sx={{ borderRadius: '8px' }}
                        >
                          Clear Selection
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained" 
                          onClick={handlePreview}
                          disabled={isLoading}
                          sx={{ borderRadius: '8px' }}
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
            onChange={(e) => {
              setFormData({ ...formData, duration: e.target.value });
              setHasUnsavedChanges(true);
            }}
            fullWidth
            required
            inputProps={{ min: 5, max: 120 }}
            sx={{ mt: 3 }}
            helperText="How long this content should display on screens (in seconds)"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TimerIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={handlePreview}
              disabled={isLoading}
              sx={{ borderRadius: '8px', height: '40px' }}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Loading...' : 'Preview Content'}
            </Button>
          </Box>

          {preview && (
            <Paper elevation={2} sx={{ p: 3, mt: 3, bgcolor: 'background.default', borderRadius: '8px' }}>
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
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button onClick={handleCloseModal} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
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
        PaperProps={{
          sx: {
            m: 2,
            borderRadius: '12px',
            maxWidth: { xs: 'calc(100% - 32px)', sm: '700px' }
          }
        }}
      >
        <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 'medium', pb: 1, px: '32px', pt: '24px' }}>
          Search Results
          <IconButton
            aria-label="close"
            onClick={handleCloseSearchModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'text.secondary',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 2, px: '32px', paddingTop: '20px !important' }}>
          {/* Error alerts removed as we're now using snackbars */}
          
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
                      borderRadius: '8px',
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
                      {result.text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {result.reference}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button 
                        size="small" 
                        variant="contained"
                        onClick={() => handleSelectHadith(result.number)}
                        sx={{ borderRadius: '8px' }}
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
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button onClick={handleCloseSearchModal} color="inherit">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={quranSearchModalOpen}
        onClose={handleCloseQuranSearchModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            m: 2,
            borderRadius: '12px',
            maxWidth: { xs: 'calc(100% - 32px)', sm: '700px' }
          }
        }}
      >
        <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 'medium', pb: 1, px: '32px', pt: '24px' }}>
          Quran Verse Search Results
          <IconButton
            aria-label="close"
            onClick={handleCloseQuranSearchModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'text.secondary',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 2, px: '32px', paddingTop: '20px !important' }}>
          {/* Error alerts removed as we're now using snackbars */}
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {quranSearchResults.length === 0 ? (
                <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
                  No results found for the specified criteria.
                </Typography>
              ) : (
                <>
                  <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                    <Typography variant="subtitle1">
                      Found {quranSearchResults.length} verses
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Click on a verse to select it
                    </Typography>
                  </Box>
                  <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
                    {quranSearchResults.map((verse, index) => (
                      <Paper 
                        key={`verse-result-${index}`}
                        elevation={2} 
                        sx={{ 
                          mb: 2, 
                          p: 2,
                          bgcolor: 'background.paper',
                          borderRadius: '8px',
                          borderLeft: verse.isTarget ? '4px solid' : 'none',
                          borderColor: 'primary.main',
                          '&:hover': {
                            bgcolor: 'action.hover',
                            cursor: 'pointer'
                          }
                        }}
                      >
                        <Typography variant="subtitle1" gutterBottom color="primary">
                          {verse.surahName} ({verse.surah}:{verse.ayah})
                        </Typography>
                        {verse.arabicText && (
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              mb: 1.5, 
                              fontFamily: 'Scheherazade New, serif',
                              direction: 'rtl', 
                              textAlign: 'right' 
                            }}
                          >
                            {verse.arabicText}
                          </Typography>
                        )}
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {verse.text}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button 
                            size="small" 
                            variant="contained"
                            onClick={() => handleSelectVerse(verse.surah, verse.ayah, verse.surahName)}
                            sx={{ borderRadius: '8px' }}
                          >
                            Select
                          </Button>
                        </Box>
                      </Paper>
                    ))}
                  </List>
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button onClick={handleCloseQuranSearchModal} color="inherit">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 