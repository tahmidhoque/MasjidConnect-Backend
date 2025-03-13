import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  TablePagination,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';

// Import the EditableCell component
interface EditableCellProps {
  value: string;
  row: PrayerTime;
  field: keyof PrayerTime;
  onSave: (row: PrayerTime, field: keyof PrayerTime, value: string) => void;
}

// Define the EditableCell component here
const EditableCell: React.FC<EditableCellProps> = ({ value, row, field, onSave }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value || '');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onSave(row, field, editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (editValue !== value) {
        onSave(row, field, editValue);
      }
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(value || '');
    }
  };

  return (
    <TableCell onDoubleClick={handleDoubleClick}>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      ) : (
        <span style={{ cursor: 'pointer' }}>{value || '-'}</span>
      )}
    </TableCell>
  );
};

export interface PrayerTime {
  date: Date;
  fajr: string;
  sunrise: string;
  zuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  fajrJamaat: string;
  zuhrJamaat: string;
  asrJamaat: string;
  maghribJamaat: string;
  ishaJamaat: string;
  jummahKhutbah?: string;
  jummahJamaat?: string;
  isManuallySet?: boolean;
  source?: string;
}

interface PrayerTimesTableProps {
  prayerTimes: PrayerTime[];
  filteredPrayerTimes: PrayerTime[];
  selectedMonth: string;
  page: number;
  rowsPerPage: number;
  onMonthFilterChange: (event: SelectChangeEvent<string>) => void;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onInlineSave: (row: PrayerTime, field: keyof PrayerTime, value: string) => void;
  onDeleteTime: (time: PrayerTime) => void;
  highlightManuallySet?: boolean;
}

const PrayerTimesTable: React.FC<PrayerTimesTableProps> = ({
  prayerTimes,
  filteredPrayerTimes,
  selectedMonth,
  page,
  rowsPerPage,
  onMonthFilterChange,
  onPageChange,
  onRowsPerPageChange,
  onInlineSave,
  onDeleteTime,
  highlightManuallySet = false,
}) => {
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel id="month-filter-label">Filter by Month</InputLabel>
          <Select
            labelId="month-filter-label"
            value={selectedMonth}
            onChange={onMonthFilterChange}
            label="Filter by Month"
          >
            <MenuItem value="all">All Months</MenuItem>
            <MenuItem value="1">January</MenuItem>
            <MenuItem value="2">February</MenuItem>
            <MenuItem value="3">March</MenuItem>
            <MenuItem value="4">April</MenuItem>
            <MenuItem value="5">May</MenuItem>
            <MenuItem value="6">June</MenuItem>
            <MenuItem value="7">July</MenuItem>
            <MenuItem value="8">August</MenuItem>
            <MenuItem value="9">September</MenuItem>
            <MenuItem value="10">October</MenuItem>
            <MenuItem value="11">November</MenuItem>
            <MenuItem value="12">December</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <TableContainer component={Paper} sx={{ 
        borderRadius: 1,
        '& .MuiTable-root': {
          borderCollapse: 'separate',
          borderSpacing: 0,
        },
        '& .MuiTableCell-root': {
          borderBottom: '1px solid rgba(224, 224, 224, 1)',
          padding: '12px 16px',
        },
        '& .MuiTableHead-root .MuiTableCell-root': {
          background: (theme) => theme.palette.grey[50],
          fontWeight: 600
        }
      }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Fajr</TableCell>
              <TableCell>Fajr Jamaat</TableCell>
              <TableCell>Sunrise</TableCell>
              <TableCell>Zuhr</TableCell>
              <TableCell>Zuhr Jamaat</TableCell>
              <TableCell>Asr</TableCell>
              <TableCell>Asr Jamaat</TableCell>
              <TableCell>Maghrib</TableCell>
              <TableCell>Maghrib Jamaat</TableCell>
              <TableCell>Isha</TableCell>
              <TableCell>Isha Jamaat</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPrayerTimes
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((time) => (
              <TableRow 
                key={time.date.toString()}
                sx={{
                  backgroundColor: highlightManuallySet && time.isManuallySet 
                    ? 'rgba(255, 255, 0, 0.1)' 
                    : 'inherit',
                }}
              >
                <TableCell>{format(time.date, 'dd/MM/yyyy')}</TableCell>
                <EditableCell value={time.fajr} row={time} field="fajr" onSave={onInlineSave} />
                <EditableCell value={time.fajrJamaat} row={time} field="fajrJamaat" onSave={onInlineSave} />
                <EditableCell value={time.sunrise} row={time} field="sunrise" onSave={onInlineSave} />
                <EditableCell value={time.zuhr} row={time} field="zuhr" onSave={onInlineSave} />
                <EditableCell value={time.zuhrJamaat} row={time} field="zuhrJamaat" onSave={onInlineSave} />
                <EditableCell value={time.asr} row={time} field="asr" onSave={onInlineSave} />
                <EditableCell value={time.asrJamaat} row={time} field="asrJamaat" onSave={onInlineSave} />
                <EditableCell value={time.maghrib} row={time} field="maghrib" onSave={onInlineSave} />
                <EditableCell value={time.maghribJamaat} row={time} field="maghribJamaat" onSave={onInlineSave} />
                <EditableCell value={time.isha} row={time} field="isha" onSave={onInlineSave} />
                <EditableCell value={time.ishaJamaat} row={time} field="ishaJamaat" onSave={onInlineSave} />
                <TableCell>
                  <IconButton size="small" onClick={() => onDeleteTime(time)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredPrayerTimes.length === 0 && (
              <TableRow>
                <TableCell colSpan={13} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No prayer times found for the selected month.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <TablePagination
          component="div"
          count={filteredPrayerTimes.length}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
        />
      </Box>
    </>
  );
};

export default PrayerTimesTable; 