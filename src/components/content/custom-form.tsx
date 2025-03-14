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
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Code as CodeIcon,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  Code as CodeFormatIcon,
  FormatClear,
  Undo,
  Redo,
  FormatUnderlined,
  Link as LinkIcon,
  Title as TitleIcon,
  ArrowDropDown,
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
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import DOMPurify from 'dompurify';

// Menu bar component for the rich text editor
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const [headingAnchorEl, setHeadingAnchorEl] = useState<null | HTMLElement>(null);
  const headingMenuOpen = Boolean(headingAnchorEl);

  const handleHeadingClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setHeadingAnchorEl(event.currentTarget);
  };

  const handleHeadingClose = () => {
    setHeadingAnchorEl(null);
  };

  const handleHeadingSelect = (level: number) => {
    editor.chain().focus().toggleHeading({ level }).run();
    handleHeadingClose();
  };

  const setLink = () => {
    const url = window.prompt('URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const ToolbarButton = ({ onClick, active, disabled, children, title }: any) => (
    <IconButton
      size="small"
      onClick={onClick}
      color={active ? "primary" : "default"}
      disabled={disabled}
      sx={{
        borderRadius: 1,
        padding: '2px',
        margin: '0 1px',
        minWidth: '28px',
        height: '28px',
        '&.Mui-disabled': {
          color: 'text.disabled',
        },
        '&.MuiIconButton-colorPrimary': {
          backgroundColor: 'rgba(25, 118, 210, 0.08)',
        },
      }}
      title={title}
    >
      {children}
    </IconButton>
  );

  const Divider = () => (
    <Box
      sx={{
        height: 14,
        width: 0.5,
        bgcolor: 'divider',
        mx: 0.3,
        opacity: 0.5,
      }}
    />
  );

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0,
        p: 0.75,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        alignItems: 'center',
        flexWrap: 'wrap',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
      }}
    >
      {/* History Controls */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo fontSize="inherit" sx={{ fontSize: '18px' }} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo fontSize="inherit" sx={{ fontSize: '18px' }} />
      </ToolbarButton>

      <Divider />

      {/* Headings */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <ToolbarButton
          onClick={handleHeadingClick}
          active={
            editor.isActive('heading', { level: 1 }) ||
            editor.isActive('heading', { level: 2 }) ||
            editor.isActive('heading', { level: 3 })
          }
          title="Headings"
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TitleIcon fontSize="inherit" sx={{ fontSize: '18px' }} />
            <ArrowDropDown fontSize="inherit" sx={{ fontSize: '18px', ml: -0.5 }} />
          </Box>
        </ToolbarButton>
        <Menu
          anchorEl={headingAnchorEl}
          open={headingMenuOpen}
          onClose={handleHeadingClose}
        >
          <MenuItem 
            onClick={() => handleHeadingSelect(1)}
            sx={{ 
              fontWeight: editor.isActive('heading', { level: 1 }) ? 'bold' : 'normal',
              color: editor.isActive('heading', { level: 1 }) ? 'primary.main' : 'inherit'
            }}
          >
            Heading 1
          </MenuItem>
          <MenuItem 
            onClick={() => handleHeadingSelect(2)}
            sx={{ 
              fontWeight: editor.isActive('heading', { level: 2 }) ? 'bold' : 'normal',
              color: editor.isActive('heading', { level: 2 }) ? 'primary.main' : 'inherit'
            }}
          >
            Heading 2
          </MenuItem>
          <MenuItem 
            onClick={() => handleHeadingSelect(3)}
            sx={{ 
              fontWeight: editor.isActive('heading', { level: 3 }) ? 'bold' : 'normal',
              color: editor.isActive('heading', { level: 3 }) ? 'primary.main' : 'inherit'
            }}
          >
            Heading 3
          </MenuItem>
          <MenuItem 
            onClick={() => editor.chain().focus().setParagraph().run()}
            sx={{ 
              fontWeight: editor.isActive('paragraph') ? 'bold' : 'normal',
              color: editor.isActive('paragraph') ? 'primary.main' : 'inherit'
            }}
          >
            Normal Text
          </MenuItem>
        </Menu>
      </Box>

      <Divider />

      {/* Text Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Bold"
      >
        <FormatBold fontSize="inherit" sx={{ fontSize: '18px' }} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Italic"
      >
        <FormatItalic fontSize="inherit" sx={{ fontSize: '18px' }} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        title="Underline"
      >
        <FormatUnderlined fontSize="inherit" sx={{ fontSize: '18px' }} />
      </ToolbarButton>

      <Divider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <FormatListBulleted fontSize="inherit" sx={{ fontSize: '18px' }} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <FormatListNumbered fontSize="inherit" sx={{ fontSize: '18px' }} />
      </ToolbarButton>

      <Divider />

      {/* Link */}
      <ToolbarButton
        onClick={setLink}
        active={editor.isActive('link')}
        title="Insert Link"
      >
        <LinkIcon fontSize="inherit" sx={{ fontSize: '18px' }} />
      </ToolbarButton>

      <Divider />

      {/* Code and Clear */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
        title="Code"
      >
        <CodeFormatIcon fontSize="inherit" sx={{ fontSize: '18px' }} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        title="Clear Formatting"
      >
        <FormatClear fontSize="inherit" sx={{ fontSize: '18px' }} />
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
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        validate: (href: string) => /^https?:\/\//.test(href),
      }),
    ],
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
        text: formData.isHTML ? DOMPurify.sanitize(formData.content) : formData.content,
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
                  helperText="Enter your HTML content. Note: JavaScript will be sanitized for security."
                  tooltip="HTML content will be rendered directly in the display. For security, JavaScript will be removed."
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
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    '& .ProseMirror': {
                      minHeight: '200px',
                      outline: 'none',
                      p: 2,
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                      '&:focus': {
                        outline: 'none',
                        backgroundColor: 'rgba(0, 0, 0, 0.01)',
                      },
                      '& a': {
                        color: 'primary.main',
                        textDecoration: 'underline',
                      },
                      '& h1': {
                        fontSize: '1.5rem',
                        fontWeight: 500,
                        marginBottom: '0.5em',
                        marginTop: '0.5em',
                      },
                      '& h2': {
                        fontSize: '1.3rem',
                        fontWeight: 500,
                        marginBottom: '0.5em',
                        marginTop: '0.5em',
                      },
                      '& h3': {
                        fontSize: '1.1rem',
                        fontWeight: 500,
                        marginBottom: '0.5em',
                        marginTop: '0.5em',
                      },
                      '& ul, & ol': {
                        padding: '0 1rem',
                        margin: '0.5em 0',
                      },
                      '& li': {
                        margin: '0.2em 0',
                      },
                      '& code': {
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        padding: '0.1em 0.3em',
                        borderRadius: '3px',
                        fontSize: '0.85em',
                        fontFamily: 'monospace',
                      },
                      '& p': {
                        margin: '0.5em 0',
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