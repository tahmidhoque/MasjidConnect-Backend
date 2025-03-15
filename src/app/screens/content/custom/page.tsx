"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Timer as DurationIcon,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  Link as LinkIcon,
  Code,
  FormatClear,
  Undo,
  Redo,
} from '@mui/icons-material';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext';
import { ContentModal } from '@/components/common/ContentModal';
import { CustomForm } from '@/components/content/custom-form';
import { ContentType } from '@prisma/client';
import DOMPurify from 'dompurify';

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ onClick, active, disabled, children, title }: any) => (
    <IconButton
      size="small"
      onClick={onClick}
      color={active ? "primary" : "default"}
      disabled={disabled}
      sx={{
        borderRadius: 1,
        '&.Mui-disabled': {
          color: 'text.disabled',
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
        height: 16,
        width: 0.5,
        bgcolor: 'divider',
        mx: 0.5,
        opacity: 0.5,
      }}
    />
  );

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.25,
        p: 0.5,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        alignItems: 'center',
      }}
    >
      {/* History Controls */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo fontSize="small" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo fontSize="small" />
      </ToolbarButton>

      <Divider />

      {/* Text Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Bold"
      >
        <FormatBold fontSize="small" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Italic"
      >
        <FormatItalic fontSize="small" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        title="Underline"
      >
        <FormatUnderlined fontSize="small" />
      </ToolbarButton>

      <Divider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <FormatListBulleted fontSize="small" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <FormatListNumbered fontSize="small" />
      </ToolbarButton>

      <Divider />

      {/* Additional Controls */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
        title="Code"
      >
        <Code fontSize="small" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        title="Clear Formatting"
      >
        <FormatClear fontSize="small" />
      </ToolbarButton>
    </Box>
  );
};

interface CustomContentItem {
  id: string;
  title: string;
  content: string;
  duration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CustomContentPage() {
  const [items, setItems] = useState<CustomContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomContentItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    duration: 30,
    isActive: true,
  });
  const [originalData, setOriginalData] = useState<typeof formData | null>(null);
  const [modalActions, setModalActions] = useState<React.ReactNode | null>(null);
  
  const { setHasUnsavedChanges } = useUnsavedChanges();

  const editor = useEditor({
    extensions: [StarterKit],
    content: formData.content,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      setFormData(prev => ({ ...prev, content: newContent }));
    },
  });

  useEffect(() => {
    if (editor && formData.content !== editor.getHTML()) {
      editor.commands.setContent(formData.content);
    }
  }, [formData.content, editor]);

  // Track unsaved changes
  useEffect(() => {
    if (originalData) {
      const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
      setHasUnsavedChanges(hasChanges);
    } else {
      // If no original data (new item), check if any required fields are filled
      const hasChanges = formData.title.trim() !== '' || formData.content.trim() !== '';
      setHasUnsavedChanges(hasChanges);
    }
  }, [formData, originalData, setHasUnsavedChanges]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/content/custom');
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: CustomContentItem) => {
    if (item) {
      const itemData = {
        title: item.title,
        content: item.content,
        duration: item.duration,
        isActive: item.isActive,
      };
      setEditingItem(item);
      setFormData(itemData);
      setOriginalData(itemData);
    } else {
      const newItemData = {
        title: '',
        content: '',
        duration: 30,
        isActive: true,
      };
      setEditingItem(null);
      setFormData(newItemData);
      setOriginalData(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    const hasChanges = originalData ? 
      JSON.stringify(formData) !== JSON.stringify(originalData) : 
      formData.title.trim() !== '' || formData.content.trim() !== '';
    
    if (hasChanges) {
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
      content: '',
      duration: 30,
      isActive: true,
    });
    setOriginalData(null);
    setHasUnsavedChanges(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const url = editingItem 
        ? `/api/content/custom/${editingItem.id}`
        : '/api/content/custom';
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save item');
      
      await fetchItems();
      setHasUnsavedChanges(false);
      closeModalAndResetState();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const response = await fetch(`/api/content/custom/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete item');
      
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
        <Typography variant="h5" component="h1">
          Custom Content
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
        >
          Add New
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {items.length === 0 ? (
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
                bgcolor: 'background.paper',
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No custom content found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Click the &quot;Add New&quot; button to create your first custom content.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenModal()}
              >
                Add New
              </Button>
            </Box>
          </Grid>
        ) : (
          items.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {item.title}
                    {!item.isActive && (
                      <Tooltip title="Inactive">
                        <Box
                          component="span"
                          sx={{
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'text.disabled',
                            ml: 1,
                            verticalAlign: 'middle',
                          }}
                        />
                      </Tooltip>
                    )}
                  </Typography>
                  <Box
                    sx={{
                      mb: 1,
                      '& .ql-editor': {
                        p: 0,
                        maxHeight: 100,
                        overflow: 'hidden',
                      },
                    }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.content) }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DurationIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      Duration: {item.duration} seconds
                    </Typography>
                  </Box>
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

      <ContentModal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Edit Custom Content' : 'Add Custom Content'}
        actions={modalActions}
      >
        <CustomForm
          initialData={editingItem ? {
            id: editingItem.id,
            title: editingItem.title,
            content: {
              text: editingItem.content,
              isHTML: editingItem.content.startsWith('<') && editingItem.content.includes('</') // Basic HTML detection
            },
            type: ContentType.CUSTOM,
            duration: editingItem.duration,
            isActive: editingItem.isActive,
            startDate: undefined,
            endDate: undefined,
            createdAt: new Date(editingItem.createdAt),
            updatedAt: new Date(editingItem.updatedAt)
          } : undefined}
          onSuccess={() => {
            closeModalAndResetState();
            fetchItems();
          }}
          onCancel={handleCloseModal}
          setFormActions={setModalActions}
        />
      </ContentModal>
    </Box>
  );
} 