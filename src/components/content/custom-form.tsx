import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { ContentType } from '@prisma/client';
import { createContentItem, updateContentItem, ContentItemData } from '@/lib/services/content';
import { FormTextField, FormTextArea, FormDatePicker, FormSwitch } from '@/components/common/FormFields';
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext';
import { FormSection } from '@/components/common/FormSection';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// Menu bar component for the rich text editor
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ onClick, active, disabled, children, title }: any) => (
    <Button
      size="small"
      onClick={onClick}
      color={active ? "primary" : "inherit"}
      disabled={disabled}
      sx={{
        minWidth: 'auto',
        p: 0.5,
        borderRadius: 1,
        '&.Mui-disabled': {
          color: 'text.disabled',
        },
      }}
      title={title}
    >
      {children}
    </Button>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.5,
        p: 1,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        flexWrap: 'wrap',
      }}
    >
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Bold"
      >
        Bold
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Italic"
      >
        Italic
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Bullet List"
      >
        Bullet List
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Numbered List"
      >
        Numbered List
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
        title="Code"
      >
        Code
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        title="Clear Formatting"
      >
        Clear
      </ToolbarButton>
    </Box>
  );
};

interface CustomFormProps {
  initialData?: ContentItemData;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CustomForm({ initialData, onSuccess, onCancel }: CustomFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setHasUnsavedChanges } = useUnsavedChanges();
  
  // Extract meta data from content field if it exists
  const getInitialMetaData = () => {
    if (!initialData?.content) return { isHTML: false };
    
    try {
      const content = typeof initialData.content === 'string' 
        ? JSON.parse(initialData.content) 
        : initialData.content;
        
      return {
        isHTML: content.isHTML || false
      };
    } catch (e) {
      console.error('Error parsing content data:', e);
      return { isHTML: false };
    }
  };
  
  const { isHTML } = getInitialMetaData();
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content?.text || '',
    type: ContentType.CUSTOM,
    duration: initialData?.duration || 30,
    isActive: initialData?.isActive ?? true,
    startDate: initialData?.startDate ? dayjs(initialData.startDate) : null,
    endDate: initialData?.endDate ? dayjs(initialData.endDate) : null,
    isHTML: isHTML,
  });

  // Initialize the rich text editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: formData.content,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      setFormData(prev => ({ ...prev, content: newContent }));
    },
  });

  // Update editor content when formData.content changes
  useEffect(() => {
    if (editor && formData.content !== editor.getHTML()) {
      editor.commands.setContent(formData.content);
    }
  }, [formData.content, editor]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create content object with meta data
      const contentData = {
        text: formData.content,
        isHTML: formData.isHTML
      };

      const apiData = {
        title: formData.title,
        type: formData.type,
        content: contentData,
        duration: formData.duration,
        isActive: formData.isActive,
        startDate: formData.startDate ? formData.startDate.toDate() : undefined,
        endDate: formData.endDate ? formData.endDate.toDate() : undefined,
      };

      if (initialData) {
        await updateContentItem({ id: initialData.id, ...apiData });
      } else {
        await createContentItem(apiData);
      }

      setHasUnsavedChanges(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving custom content:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while saving');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component="form" onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <FormSection 
          title="Custom Content Details" 
          description="Fill in the information below to create your custom content"
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormTextField
                autoFocus
                label="Title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                helperText="Enter a concise title for your custom content"
                tooltip="A brief, descriptive title that will be displayed on screens"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isHTML}
                    onChange={(e) => setFormData({ ...formData, isHTML: e.target.checked })}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CodeIcon color={formData.isHTML ? "primary" : "disabled"} />
                    <Typography>Content contains HTML</Typography>
                  </Box>
                }
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 9, mt: 0.5 }}>
                {formData.isHTML ? "HTML content will be rendered directly in the display" : "Format your content using the editor below"}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              {formData.isHTML ? (
                <FormTextArea
                  label="HTML Content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  helperText="Enter your HTML content"
                  tooltip="HTML content will be rendered directly in the display"
                  rows={8}
                />
              ) : (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Content
                  </Typography>
                  <Box sx={{ 
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    overflow: 'hidden',
                    mb: 1,
                    '& .ProseMirror': {
                      minHeight: '200px',
                      outline: 'none',
                      p: 2,
                      '&:focus': {
                        outline: 'none',
                      },
                    },
                    '& .ProseMirror p.is-editor-empty:first-of-type::before': {
                      content: '"Start typing..."',
                      color: 'text.disabled',
                      pointerEvents: 'none',
                      float: 'left',
                    },
                  }}>
                    <MenuBar editor={editor} />
                    <EditorContent editor={editor} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Format your content using the toolbar above
                  </Typography>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <FormTextField
                label="Display Duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                endAdornment="seconds"
                helperText="How long should this content be displayed on each cycle?"
                tooltip="Duration in seconds that the content will be shown before moving to the next content"
                inputProps={{ min: 5, max: 300 }}
                InputProps={{
                  startAdornment: <AccessTimeIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
          </Grid>
        </FormSection>

        <FormSection 
          title="Display Schedule" 
          description="Set when this content should appear on your screens"
        >
          <Grid container spacing={3}>
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

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
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