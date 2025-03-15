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
  Paper,
  TextField,
  InputAdornment,
  FormControlLabel,
  Switch,
  Autocomplete,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Search as SearchIcon,
  Casino as CasinoIcon,
  Translate as TranslateIcon,
  Language as LanguageIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { ContentType } from '@prisma/client';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { createContentItem, updateContentItem, ContentItemData } from '@/lib/services/content';
import { FormTextField, FormTextArea, FormDatePicker, FormSwitch } from '@/components/common/FormFields';
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext';
import { FormSection } from '@/components/common/FormSection';
import { useSnackbar } from '@/contexts/SnackbarContext';

// Interface for the 99 Names of Allah
interface AsmaAlHusnaName {
  id: number;
  arabic: string;
  transliteration: string;
  meaning: string;
}

// The 99 Names of Allah data
const asmaAlHusnaData: AsmaAlHusnaName[] = [
  { id: 1, arabic: 'الله', transliteration: 'Allah', meaning: 'The One and Only God' },
  { id: 2, arabic: 'الرحمن', transliteration: 'Ar-Rahman', meaning: 'The Most Merciful' },
  { id: 3, arabic: 'الرحيم', transliteration: 'Ar-Rahim', meaning: 'The Most Compassionate' },
  { id: 4, arabic: 'الملك', transliteration: 'Al-Malik', meaning: 'The King' },
  { id: 5, arabic: 'القدوس', transliteration: 'Al-Quddus', meaning: 'The Pure One' },
  { id: 6, arabic: 'السلام', transliteration: 'As-Salam', meaning: 'The Source of Peace' },
  { id: 7, arabic: 'المؤمن', transliteration: 'Al-Mu\'min', meaning: 'The Inspirer of Faith' },
  { id: 8, arabic: 'المهيمن', transliteration: 'Al-Muhaymin', meaning: 'The Guardian' },
  { id: 9, arabic: 'العزيز', transliteration: 'Al-Aziz', meaning: 'The Victorious' },
  { id: 10, arabic: 'الجبار', transliteration: 'Al-Jabbar', meaning: 'The Compeller' },
  { id: 11, arabic: 'المتكبر', transliteration: 'Al-Mutakabbir', meaning: 'The Greatest' },
  { id: 12, arabic: 'الخالق', transliteration: 'Al-Khaliq', meaning: 'The Creator' },
  { id: 13, arabic: 'البارئ', transliteration: 'Al-Bari\'', meaning: 'The Maker of Order' },
  { id: 14, arabic: 'المصور', transliteration: 'Al-Musawwir', meaning: 'The Shaper of Beauty' },
  { id: 15, arabic: 'الغفار', transliteration: 'Al-Ghaffar', meaning: 'The Forgiving' },
  { id: 16, arabic: 'القهار', transliteration: 'Al-Qahhar', meaning: 'The Subduer' },
  { id: 17, arabic: 'الوهاب', transliteration: 'Al-Wahhab', meaning: 'The Giver of All' },
  { id: 18, arabic: 'الرزاق', transliteration: 'Ar-Razzaq', meaning: 'The Sustainer' },
  { id: 19, arabic: 'الفتاح', transliteration: 'Al-Fattah', meaning: 'The Opener' },
  { id: 20, arabic: 'العليم', transliteration: 'Al-Alim', meaning: 'The Knower of All' },
  { id: 21, arabic: 'القابض', transliteration: 'Al-Qabid', meaning: 'The Constrictor' },
  { id: 22, arabic: 'الباسط', transliteration: 'Al-Basit', meaning: 'The Reliever' },
  { id: 23, arabic: 'الخافض', transliteration: 'Al-Khafid', meaning: 'The Abaser' },
  { id: 24, arabic: 'الرافع', transliteration: 'Ar-Rafi', meaning: 'The Exalter' },
  { id: 25, arabic: 'المعز', transliteration: 'Al-Mu\'izz', meaning: 'The Bestower of Honors' },
  { id: 26, arabic: 'المذل', transliteration: 'Al-Mudhill', meaning: 'The Humiliator' },
  { id: 27, arabic: 'السميع', transliteration: 'As-Sami', meaning: 'The Hearer of All' },
  { id: 28, arabic: 'البصير', transliteration: 'Al-Basir', meaning: 'The Seer of All' },
  { id: 29, arabic: 'الحكم', transliteration: 'Al-Hakam', meaning: 'The Judge' },
  { id: 30, arabic: 'العدل', transliteration: 'Al-Adl', meaning: 'The Just' },
  { id: 31, arabic: 'اللطيف', transliteration: 'Al-Latif', meaning: 'The Subtle One' },
  { id: 32, arabic: 'الخبير', transliteration: 'Al-Khabir', meaning: 'The All-Aware' },
  { id: 33, arabic: 'الحليم', transliteration: 'Al-Halim', meaning: 'The Forbearing' },
  { id: 34, arabic: 'العظيم', transliteration: 'Al-Azim', meaning: 'The Magnificent' },
  { id: 35, arabic: 'الغفور', transliteration: 'Al-Ghafur', meaning: 'The Forgiver and Hider of Faults' },
  { id: 36, arabic: 'الشكور', transliteration: 'Ash-Shakur', meaning: 'The Rewarder of Thankfulness' },
  { id: 37, arabic: 'العلي', transliteration: 'Al-Ali', meaning: 'The Highest' },
  { id: 38, arabic: 'الكبير', transliteration: 'Al-Kabir', meaning: 'The Greatest' },
  { id: 39, arabic: 'الحفيظ', transliteration: 'Al-Hafiz', meaning: 'The Preserver' },
  { id: 40, arabic: 'المقيت', transliteration: 'Al-Muqit', meaning: 'The Nourisher' },
  { id: 41, arabic: 'الحسيب', transliteration: 'Al-Hasib', meaning: 'The Accounter' },
  { id: 42, arabic: 'الجليل', transliteration: 'Al-Jalil', meaning: 'The Mighty' },
  { id: 43, arabic: 'الكريم', transliteration: 'Al-Karim', meaning: 'The Generous' },
  { id: 44, arabic: 'الرقيب', transliteration: 'Ar-Raqib', meaning: 'The Watchful One' },
  { id: 45, arabic: 'المجيب', transliteration: 'Al-Mujib', meaning: 'The Responder to Prayer' },
  { id: 46, arabic: 'الواسع', transliteration: 'Al-Wasi', meaning: 'The All-Comprehending' },
  { id: 47, arabic: 'الحكيم', transliteration: 'Al-Hakim', meaning: 'The Perfectly Wise' },
  { id: 48, arabic: 'الودود', transliteration: 'Al-Wadud', meaning: 'The Loving One' },
  { id: 49, arabic: 'المجيد', transliteration: 'Al-Majeed', meaning: 'The Majestic One' },
  { id: 50, arabic: 'الباعث', transliteration: 'Al-Ba\'ith', meaning: 'The Resurrector' },
  { id: 51, arabic: 'الشهيد', transliteration: 'Ash-Shahid', meaning: 'The Witness' },
  { id: 52, arabic: 'الحق', transliteration: 'Al-Haqq', meaning: 'The Truth' },
  { id: 53, arabic: 'الوكيل', transliteration: 'Al-Wakil', meaning: 'The Trustee' },
  { id: 54, arabic: 'القوى', transliteration: 'Al-Qawiyy', meaning: 'The Possessor of All Strength' },
  { id: 55, arabic: 'المتين', transliteration: 'Al-Matin', meaning: 'The Forceful One' },
  { id: 56, arabic: 'الولى', transliteration: 'Al-Waliyy', meaning: 'The Governor' },
  { id: 57, arabic: 'الحميد', transliteration: 'Al-Hamid', meaning: 'The Praised One' },
  { id: 58, arabic: 'المحصى', transliteration: 'Al-Muhsi', meaning: 'The Appraiser' },
  { id: 59, arabic: 'المبدئ', transliteration: 'Al-Mubdi\'', meaning: 'The Originator' },
  { id: 60, arabic: 'المعيد', transliteration: 'Al-Mu\'id', meaning: 'The Restorer' },
  { id: 61, arabic: 'المحيى', transliteration: 'Al-Muhyi', meaning: 'The Giver of Life' },
  { id: 62, arabic: 'المميت', transliteration: 'Al-Mumit', meaning: 'The Taker of Life' },
  { id: 63, arabic: 'الحي', transliteration: 'Al-Hayy', meaning: 'The Ever Living One' },
  { id: 64, arabic: 'القيوم', transliteration: 'Al-Qayyum', meaning: 'The Self-Existing One' },
  { id: 65, arabic: 'الواجد', transliteration: 'Al-Wajid', meaning: 'The Finder' },
  { id: 66, arabic: 'الماجد', transliteration: 'Al-Majid', meaning: 'The Glorious' },
  { id: 67, arabic: 'الواحد', transliteration: 'Al-Wahid', meaning: 'The Unique, The Single' },
  { id: 68, arabic: 'الاحد', transliteration: 'Al-Ahad', meaning: 'The One, The Indivisible' },
  { id: 69, arabic: 'الصمد', transliteration: 'As-Samad', meaning: 'The Satisfier of All Needs' },
  { id: 70, arabic: 'القادر', transliteration: 'Al-Qadir', meaning: 'The All Powerful' },
  { id: 71, arabic: 'المقتدر', transliteration: 'Al-Muqtadir', meaning: 'The Creator of All Power' },
  { id: 72, arabic: 'المقدم', transliteration: 'Al-Muqaddim', meaning: 'The Expediter' },
  { id: 73, arabic: 'المؤخر', transliteration: 'Al-Mu\'akhkhir', meaning: 'The Delayer' },
  { id: 74, arabic: 'الأول', transliteration: 'Al-Awwal', meaning: 'The First' },
  { id: 75, arabic: 'الأخر', transliteration: 'Al-Akhir', meaning: 'The Last' },
  { id: 76, arabic: 'الظاهر', transliteration: 'Az-Zahir', meaning: 'The Manifest One' },
  { id: 77, arabic: 'الباطن', transliteration: 'Al-Batin', meaning: 'The Hidden One' },
  { id: 78, arabic: 'الوالي', transliteration: 'Al-Wali', meaning: 'The Protecting Friend' },
  { id: 79, arabic: 'المتعالي', transliteration: 'Al-Muta\'ali', meaning: 'The Supreme One' },
  { id: 80, arabic: 'البر', transliteration: 'Al-Barr', meaning: 'The Doer of Good' },
  { id: 81, arabic: 'التواب', transliteration: 'At-Tawwab', meaning: 'The Guide to Repentance' },
  { id: 82, arabic: 'المنتقم', transliteration: 'Al-Muntaqim', meaning: 'The Avenger' },
  { id: 83, arabic: 'العفو', transliteration: 'Al-\'Afuww', meaning: 'The Forgiver' },
  { id: 84, arabic: 'الرؤوف', transliteration: 'Ar-Ra\'uf', meaning: 'The Clement' },
  { id: 85, arabic: 'مالك الملك', transliteration: 'Malik-al-Mulk', meaning: 'The Owner of All' },
  { id: 86, arabic: 'ذو الجلال و الإكرام', transliteration: 'Dhu-al-Jalal wa-al-Ikram', meaning: 'The Lord of Majesty and Bounty' },
  { id: 87, arabic: 'المقسط', transliteration: 'Al-Muqsit', meaning: 'The Equitable One' },
  { id: 88, arabic: 'الجامع', transliteration: 'Al-Jami\'', meaning: 'The Gatherer' },
  { id: 89, arabic: 'الغنى', transliteration: 'Al-Ghani', meaning: 'The Rich One' },
  { id: 90, arabic: 'المغنى', transliteration: 'Al-Mughni', meaning: 'The Enricher' },
  { id: 91, arabic: 'المانع', transliteration: 'Al-Mani\'', meaning: 'The Preventer of Harm' },
  { id: 92, arabic: 'الضار', transliteration: 'Ad-Darr', meaning: 'The Creator of The Harmful' },
  { id: 93, arabic: 'النافع', transliteration: 'An-Nafi\'', meaning: 'The Creator of Good' },
  { id: 94, arabic: 'النور', transliteration: 'An-Nur', meaning: 'The Light' },
  { id: 95, arabic: 'الهادي', transliteration: 'Al-Hadi', meaning: 'The Guide' },
  { id: 96, arabic: 'البديع', transliteration: 'Al-Badi', meaning: 'The Originator' },
  { id: 97, arabic: 'الباقي', transliteration: 'Al-Baqi', meaning: 'The Everlasting One' },
  { id: 98, arabic: 'الوارث', transliteration: 'Al-Warith', meaning: 'The Inheritor of All' },
  { id: 99, arabic: 'الرشيد', transliteration: 'Ar-Rashid', meaning: 'The Righteous Teacher' },
  { id: 100, arabic: 'الصبور', transliteration: 'As-Sabur', meaning: 'The Patient One' },
];

interface AsmaAlHusnaFormProps {
  initialData?: ContentItemData;
  onSuccess?: () => void;
  onCancel?: () => void;
  setFormActions?: (actions: React.ReactNode) => void;
}

export function AsmaAlHusnaForm({ initialData, onSuccess, onCancel, setFormActions }: AsmaAlHusnaFormProps) {
  // Hook for unsaved changes tracking
  const { setHasUnsavedChanges } = useUnsavedChanges();
  // Hook for showing snackbars/toasts
  const { showSnackbar } = useSnackbar();

  // Form state
  const [title, setTitle] = useState('');
  const [isRandom, setIsRandom] = useState(true);
  const [selectedNames, setSelectedNames] = useState<AsmaAlHusnaName[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [duration, setDuration] = useState<number>(10);
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle field changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleIsRandomChange = (checked: boolean) => {
    setIsRandom(checked);
    setHasUnsavedChanges(true);
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDuration(Number(e.target.value));
    setHasUnsavedChanges(true);
  };

  const handleStartDateChange = (date: dayjs.Dayjs | null) => {
    setStartDate(date);
    setHasUnsavedChanges(true);
  };

  const handleEndDateChange = (date: dayjs.Dayjs | null) => {
    setEndDate(date);
    setHasUnsavedChanges(true);
  };

  const handleIsActiveChange = (checked: boolean) => {
    setIsActive(checked);
    setHasUnsavedChanges(true);
  };

  const handleNamesChange = (_event: React.SyntheticEvent, value: AsmaAlHusnaName[]) => {
    setSelectedNames(value);
    setHasUnsavedChanges(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter names based on search term
  const filteredNames = asmaAlHusnaData.filter(
    (name) =>
      name.arabic.includes(searchTerm) ||
      name.transliteration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Initialize form with initial data if available
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      
      if (initialData.content) {
        const content = initialData.content as any;
        setIsRandom(content.isRandom || true);
        
        if (content.selectedNames) {
          // Find the names based on their IDs
          const names = content.selectedNames.map((nameId: number) => 
            asmaAlHusnaData.find(name => name.id === nameId)
          ).filter(Boolean);
          setSelectedNames(names);
        }
      }
      
      setDuration(initialData.duration || 10);
      setIsActive(initialData.isActive);
      
      if (initialData.startDate) {
        setStartDate(dayjs(initialData.startDate));
      }
      
      if (initialData.endDate) {
        setEndDate(dayjs(initialData.endDate));
      }
    }
  }, [initialData]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      
      // Prepare content data
      const contentData = {
        isRandom,
        selectedNames: isRandom ? [] : selectedNames.map(name => name.id),
      };
      
      if (initialData?.id) {
        // Update existing content
        await updateContentItem({
          id: initialData.id,
          title,
          type: "ASMA_AL_HUSNA" as ContentType,
          content: contentData,
          duration,
          isActive,
          startDate: startDate ? new Date(startDate.toString()) : undefined,
          endDate: endDate ? new Date(endDate.toString()) : undefined,
        });
        
        showSnackbar('Content updated successfully', 'success');
      } else {
        // Create new content
        await createContentItem({
          title,
          type: "ASMA_AL_HUSNA" as ContentType,
          content: contentData,
          duration,
          isActive,
          startDate: startDate ? new Date(startDate.toString()) : undefined,
          endDate: endDate ? new Date(endDate.toString()) : undefined,
        });
        
        showSnackbar('Content created successfully', 'success');
      }
      
      setHasUnsavedChanges(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('An error occurred while saving. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Create form actions
  useEffect(() => {
    if (setFormActions) {
      setFormActions(
        <>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="asma-al-husna-form"
            variant="contained"
            disabled={loading || (!isRandom && selectedNames.length === 0)}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
          </Button>
        </>
      );
    }
  }, [loading, isRandom, selectedNames.length, initialData, onCancel, setFormActions]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form id="asma-al-husna-form" onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <FormSection
          title="Basic Information"
          description="Enter the general information for this content"
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormTextField
                label="Title"
                value={title}
                onChange={handleTitleChange}
                required
                fullWidth
                placeholder="e.g., 99 Names of Allah Display"
                helperText="A descriptive title for this content"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormSwitch
                label="Random Name Display"
                checked={isRandom}
                onChange={handleIsRandomChange}
                helperText="Enable to randomly display a different name on each rotation"
                tooltip="When enabled, a random name from the 99 Names of Allah will be displayed each time this content is shown"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormTextField
                label="Duration (seconds)"
                value={duration}
                onChange={handleDurationChange}
                required
                fullWidth
                type="number"
                inputProps={{ min: 5 }}
                helperText="How long this content should be displayed on screen"
              />
            </Grid>
          </Grid>
        </FormSection>
        
        <FormSection
          title="Names Selection"
          description={isRandom ? "When using random mode, all 99 names will be included in the rotation" : "Select specific names to display"}
        >
          <Grid container spacing={3}>
            {!isRandom && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Search Names"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search by Arabic, transliteration, or meaning"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    id="selected-names"
                    options={filteredNames}
                    value={selectedNames}
                    onChange={handleNamesChange}
                    getOptionLabel={(option) => `${option.transliteration} (${option.meaning})`}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body1">{option.transliteration}</Typography>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontFamily: '"Scheherazade New", serif',
                                fontSize: '1.5rem',
                                direction: 'rtl'
                              }}
                            >
                              {option.arabic}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {option.meaning}
                          </Typography>
                        </Box>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Selected Names"
                        placeholder="Select names to display"
                        helperText={selectedNames.length === 0 ? "Please select at least one name" : `${selectedNames.length} name(s) selected`}
                      />
                    )}
                    renderTags={(tagValue, getTagProps) =>
                      tagValue.map((option, index) => (
                        <Box
                          component="span"
                          {...getTagProps({ index })}
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            m: 0.5,
                            p: 0.5,
                            borderRadius: 1,
                            bgcolor: 'action.selected',
                          }}
                        >
                          {`${option.transliteration}`}
                        </Box>
                      ))
                    }
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    filterOptions={(options) => options} // Use our custom filtering
                    freeSolo={false}
                    disableCloseOnSelect
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      maxHeight: '300px', 
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      Selected Names Preview
                    </Typography>
                    
                    {selectedNames.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No names selected. Please select at least one name.
                      </Typography>
                    ) : (
                      selectedNames.map((name) => (
                        <Box 
                          key={name.id} 
                          sx={{ 
                            p: 1, 
                            borderRadius: 1, 
                            bgcolor: 'background.neutral',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1">{name.transliteration}</Typography>
                            <Typography 
                              variant="h5" 
                              sx={{ 
                                fontFamily: '"Scheherazade New", serif',
                                direction: 'rtl'
                              }}
                            >
                              {name.arabic}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {name.meaning}
                          </Typography>
                        </Box>
                      ))
                    )}
                  </Paper>
                </Grid>
              </>
            )}
            
            {isRandom && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body1" paragraph>
                    Random mode is enabled. One of the 99 Names of Allah will be randomly selected and displayed each time this content is shown on screen.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Each name will be displayed with its Arabic text, transliteration, and meaning.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </FormSection>
        
        <FormSection
          title="Display Settings"
          description="Configure when this content should be active"
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormDatePicker
                label="Start Date"
                value={startDate}
                onChange={handleStartDateChange}
                helperText="Optional: Date when this content should start displaying"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormDatePicker
                label="End Date"
                value={endDate}
                onChange={handleEndDateChange}
                helperText="Optional: Date when this content should stop displaying"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormSwitch
                label="Active"
                checked={isActive}
                onChange={handleIsActiveChange}
                helperText="Toggle whether this content is currently active"
              />
            </Grid>
          </Grid>
        </FormSection>
      </form>
    </LocalizationProvider>
  );
} 