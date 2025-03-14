"use client";

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Stack,
  Alert,
  SelectChangeEvent,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  FilterAlt as FilterIcon,
} from '@mui/icons-material';

export interface ContentTypeTableProps<T> {
  items: T[];
  isLoading: boolean;
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  searchEmptyMessage?: string;
  addButtonLabel?: string;
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  getItemId: (item: T) => string;
  columns: {
    id: string;
    label: string;
    render: (item: T) => React.ReactNode;
    filterable?: boolean;
    filterOptions?: { value: string; label: string }[];
  }[];
}

export function ContentTypeTable<T>({
  items,
  isLoading,
  title,
  subtitle,
  emptyMessage = 'No items found',
  searchEmptyMessage = 'No matching items found',
  addButtonLabel = 'Add New',
  onAdd,
  onEdit,
  onDelete,
  onRefresh,
  getItemId,
  columns,
}: ContentTypeTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  // Apply search and filters to items
  const filteredItems = items.filter((item) => {
    // Check if item passes all filters
    const passesFilters = Object.entries(filters).every(([columnId, filterValue]) => {
      if (!filterValue || filterValue === 'all') return true;
      
      const column = columns.find(col => col.id === columnId);
      if (!column) return true;
      
      const cellValue = String(column.render(item)).toLowerCase();
      return cellValue.includes(filterValue.toLowerCase());
    });
    
    // Check if item matches search term
    const matchesSearch = searchTerm === '' || 
      Object.values(item as Record<string, any>)
        .some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
    
    return passesFilters && matchesSearch;
  });

  // Pagination logic
  const paginatedItems = filteredItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (columnId: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnId]: value,
    }));
    setPage(0); // Reset to first page when filter changes
  };

  // Reset to page 0 when search term changes
  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  const hasFilterableColumns = columns.some(column => column.filterable && column.filterOptions);

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      {subtitle && (
        <Typography 
          variant="subtitle1" 
          color="text.secondary" 
          gutterBottom
          sx={{ mb: 2 }}
        >
          {subtitle}
        </Typography>
      )}

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            placeholder="Search..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          
          {hasFilterableColumns && (
            <Button
              size="small"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              variant={showFilters ? "contained" : "outlined"}
              color="primary"
              sx={{ height: 40 }}
            >
              Filters
            </Button>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Refresh">
            <IconButton 
              onClick={onRefresh} 
              disabled={isLoading}
              size="small"
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onAdd}
            disabled={isLoading}
          >
            {addButtonLabel}
          </Button>
        </Box>
      </Box>

      {showFilters && hasFilterableColumns && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          {columns
            .filter(column => column.filterable && column.filterOptions)
            .map(column => (
              <FormControl key={column.id} size="small" sx={{ minWidth: 150 }}>
                <InputLabel id={`filter-${column.id}-label`}>{column.label}</InputLabel>
                <Select
                  labelId={`filter-${column.id}-label`}
                  id={`filter-${column.id}`}
                  value={filters[column.id] || 'all'}
                  label={column.label}
                  onChange={(e: SelectChangeEvent) => 
                    handleFilterChange(column.id, e.target.value)
                  }
                >
                  <MenuItem value="all">All {column.label === 'Status' ? 'Statuses' : `${column.label}s`}</MenuItem>
                  {column.filterOptions?.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))
          }
        </Box>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : filteredItems.length === 0 ? (
        <Alert 
          severity="info" 
          sx={{ my: 4, py: 2 }}
        >
          {searchTerm || Object.values(filters).some(f => f && f !== 'all') 
            ? searchEmptyMessage 
            : emptyMessage}
        </Alert>
      ) : (
        <>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
            <Table aria-label={`${title || 'Content'} table`} size="medium">
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  {columns.map((column) => (
                    <TableCell key={column.id} sx={{ fontWeight: 'bold' }}>
                      {column.label}
                    </TableCell>
                  ))}
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.map((item) => (
                  <TableRow 
                    key={getItemId(item)}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    {columns.map((column) => (
                      <TableCell key={`${getItemId(item)}-${column.id}`}>
                        {column.render(item)}
                      </TableCell>
                    ))}
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => onEdit(item)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => onDelete(getItemId(item))}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredItems.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{ 
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                margin: 0,
              }
            }}
          />
        </>
      )}
    </Paper>
  );
} 