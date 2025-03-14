'use client';

import React from 'react';
import { 
  TextField, 
  MenuItem, 
  InputAdornment,
  FormControlLabel,
  Switch,
  FormHelperText,
  Box,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { InfoOutlined } from '@mui/icons-material';
import type { SwitchProps, StandardTextFieldProps } from '@mui/material';
import type { DateTimePickerProps, DatePickerProps, TimePickerProps } from '@mui/x-date-pickers';

// Common props for all form fields
interface BaseFieldProps {
  label: string;
  tooltip?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
}

// Text Field Component
export interface FormTextFieldProps extends BaseFieldProps, Omit<StandardTextFieldProps, 'label'> {
  endAdornment?: React.ReactNode;
}

export const FormTextField: React.FC<FormTextFieldProps> = ({
  label,
  tooltip,
  endAdornment,
  fullWidth = true,
  helperText,
  ...props
}) => (
  <TextField
    label={label}
    fullWidth={fullWidth}
    helperText={
      <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
        {helperText}
        {tooltip && (
          <Tooltip title={tooltip} placement="top">
            <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
              <InfoOutlined fontSize="small" color="action" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    }
    InputProps={{
      ...(endAdornment && {
        endAdornment: <InputAdornment position="end">{endAdornment}</InputAdornment>
      }),
      ...props.InputProps
    }}
    {...props}
  />
);

// Text Area Component
export interface FormTextAreaProps extends FormTextFieldProps {
  rows?: number;
}

export const FormTextArea: React.FC<FormTextAreaProps> = ({
  rows = 4,
  ...props
}) => (
  <FormTextField
    multiline
    rows={rows}
    {...props}
  />
);

// Date Time Picker Component
export interface FormDateTimePickerProps extends BaseFieldProps {
  value: any;
  onChange: (value: any) => void;
  helperText?: string;
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
  slotProps?: DateTimePickerProps<any>['slotProps'];
}

export const FormDateTimePicker: React.FC<FormDateTimePickerProps> = ({
  label,
  required = false,
  helperText,
  tooltip,
  fullWidth = true,
  value,
  onChange,
  slotProps,
  ...props
}) => (
  <DateTimePicker
    label={label}
    value={value}
    onChange={onChange}
    slotProps={{
      textField: {
        fullWidth,
        required,
        helperText: (
          <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
            {helperText}
            {tooltip && (
              <Tooltip title={tooltip} placement="top">
                <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                  <InfoOutlined fontSize="small" color="action" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
        ...slotProps?.textField
      }
    }}
    {...props}
  />
);

// Date Picker Component
export interface FormDatePickerProps extends BaseFieldProps {
  value: any;
  onChange: (value: any) => void;
  helperText?: string;
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
  slotProps?: DatePickerProps<any>['slotProps'];
}

export const FormDatePicker: React.FC<FormDatePickerProps> = ({
  label,
  required = false,
  helperText,
  tooltip,
  fullWidth = true,
  value,
  onChange,
  slotProps,
  ...props
}) => (
  <DatePicker
    label={label}
    value={value}
    onChange={onChange}
    slotProps={{
      textField: {
        fullWidth,
        required,
        helperText: (
          <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
            {helperText}
            {tooltip && (
              <Tooltip title={tooltip} placement="top">
                <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                  <InfoOutlined fontSize="small" color="action" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
        ...slotProps?.textField
      }
    }}
    {...props}
  />
);

// Time Picker Component
export interface FormTimePickerProps extends BaseFieldProps {
  value: any;
  onChange: (value: any) => void;
  helperText?: string;
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
  slotProps?: TimePickerProps<any>['slotProps'];
}

export const FormTimePicker: React.FC<FormTimePickerProps> = ({
  label,
  required = false,
  helperText,
  tooltip,
  fullWidth = true,
  value,
  onChange,
  slotProps,
  ...props
}) => (
  <TimePicker
    label={label}
    value={value}
    onChange={onChange}
    slotProps={{
      textField: {
        fullWidth,
        required,
        helperText: (
          <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
            {helperText}
            {tooltip && (
              <Tooltip title={tooltip} placement="top">
                <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                  <InfoOutlined fontSize="small" color="action" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
        ...slotProps?.textField
      }
    }}
    {...props}
  />
);

// Switch Component
export interface FormSwitchProps extends Omit<SwitchProps, 'onChange'> {
  label: string;
  helperText?: string;
  tooltip?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const FormSwitch: React.FC<FormSwitchProps> = ({
  label,
  helperText,
  tooltip,
  checked,
  onChange,
  ...props
}) => (
  <Box>
    <FormControlLabel
      control={
        <Switch
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          {...props}
        />
      }
      label={(
        <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
          {label}
          {tooltip && (
            <Tooltip title={tooltip} placement="top">
              <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                <InfoOutlined fontSize="small" color="action" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    />
    {helperText && (
      <FormHelperText sx={{ ml: 0 }}>{helperText}</FormHelperText>
    )}
  </Box>
);

// Select Field Component
export interface FormSelectProps extends FormTextFieldProps {
  options: Array<{ value: string | number; label: string }>;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  options,
  ...props
}) => (
  <FormTextField
    select
    {...props}
  >
    {options.map((option) => (
      <MenuItem key={option.value} value={option.value}>
        {option.label}
      </MenuItem>
    ))}
  </FormTextField>
); 