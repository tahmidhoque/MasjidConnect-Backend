# Snackbar Notification System

This document provides guidelines for using the consistent Snackbar notification system implemented across the application.

## Overview

The Snackbar notification system provides a unified way to display feedback to users after actions like creating, updating, or deleting data. This ensures a consistent user experience and helps maintain design standards across the application.

## Using the Snackbar Context

### Basic Usage

The Snackbar context is available globally in the application. You can access it using the `useSnackbar` hook:

```tsx
import { useSnackbar } from '@/contexts/SnackbarContext';

function MyComponent() {
  const { showSuccess, showError, showInfo, showWarning } = useSnackbar();
  
  const handleAction = () => {
    // Perform an action
    
    // Show a success message
    showSuccess('Action completed successfully');
  };
  
  return (
    // Your component JSX
  );
}
```

### Available Methods

The Snackbar context provides the following methods:

1. `showSnackbar(message, severity, duration)` - Show a snackbar with a custom severity
2. `showSuccess(message, duration)` - Show a success snackbar
3. `showError(message, duration)` - Show an error snackbar
4. `showInfo(message, duration)` - Show an info snackbar
5. `showWarning(message, duration)` - Show a warning snackbar
6. `hideSnackbar()` - Manually hide the current snackbar

## Data Operation Hook

For standardized handling of data operations with built-in Snackbar notifications, use the `useDataOperation` hook:

```tsx
import { useDataOperation } from '@/components/common/DataOperationHandler';

function MyComponent() {
  // Define a function to fetch data after operations
  const fetchItems = async () => {
    // Fetch data logic
  };

  // Initialize the hook
  const { 
    loading, 
    error, 
    setError, 
    createItem, 
    updateItem, 
    deleteItem 
  } = useDataOperation({
    resourceName: 'item', // Used in logs and default messages
    fetchItems,           // Function to refresh data after operations
  });
  
  // Use these functions to perform operations with automatic handling
  const handleCreate = async () => {
    await createItem(async () => {
      // Your API call logic
      const response = await fetch('/api/items', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      return await response.json();
    }, 'Custom success message'); // Optional custom message
  };
  
  return (
    // Your component JSX
  );
}
```

## Form Fields

Use the standardized form fields for consistent styling and behavior:

```tsx
import { 
  FormTextField, 
  FormTextArea, 
  FormDateTimePicker, 
  FormSwitch,
  FormSelect
} from '@/components/common/FormFields';

function MyForm() {
  return (
    <FormTextField
      label="Text Field"
      value={value}
      onChange={handleChange}
      required
      helperText="Helper text for users"
      tooltip="More detailed explanation in a tooltip"
    />
    
    <FormTextArea
      label="Text Area"
      value={textValue}
      onChange={handleTextChange}
      rows={4}
      helperText="Enter multi-line text"
    />
    
    <FormDateTimePicker
      label="Date and Time"
      value={dateValue}
      onChange={handleDateChange}
      helperText="Select a date and time"
    />
    
    <FormSwitch
      label="Toggle Option"
      checked={switchValue}
      onChange={handleSwitchChange}
      helperText="Enable this feature"
    />
    
    <FormSelect
      label="Select an option"
      value={selectValue}
      onChange={handleSelectChange}
      options={[
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ]}
      helperText="Choose from the list"
    />
  );
}
```

## Design Guidelines

- **Duration**: Default snackbar display time is 6 seconds (6000ms)
- **Position**: Snackbars appear in the bottom-right corner of the screen
- **Color Coding**:
  - Success: Green - Used for successful operations
  - Error: Red - Used for errors and failures
  - Info: Blue - Used for informational messages
  - Warning: Orange - Used for warnings that don't prevent operations

## When to Use Snackbars

Snackbars should be used for:

1. Confirmation of successful actions (create, update, delete operations)
2. Error notifications for failed operations
3. Important information that doesn't require immediate action
4. Temporary feedback that shouldn't interrupt user flow

Snackbars should NOT be used for:

1. Critical errors that prevent the application from functioning
2. Messages that require user action
3. Confirmations that need user input (use dialogs/modals instead)

## Accessibility Considerations

- Snackbars automatically dismiss, so don't use them for critical information
- Keep messages concise and clear
- Ensure color is not the only way to convey the message type

## Examples

### Success Notification After CRUD Operation

```tsx
const handleSubmit = async () => {
  const result = await createItem(async () => {
    // API call implementation
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create item');
    }
    
    return await response.json();
  });
  
  if (result.success) {
    // Close modal or navigate away
    handleCloseModal();
  }
};
```

### Error Handling

```tsx
try {
  // Some operation that might fail
} catch (err) {
  showError('Failed to complete operation. Please try again.');
}
```

### Manual Usage vs. Data Operation Hook

**Manual usage** is better for simple cases or when you need customized logic:

```tsx
const { showSuccess, showError } = useSnackbar();

try {
  // Custom operation logic
  showSuccess('Custom success message');
} catch (error) {
  showError('Custom error message');
}
```

**Data operation hook** is better for standardized CRUD operations:

```tsx
const { createItem, updateItem, deleteItem } = useDataOperation({
  resourceName: 'item',
  fetchItems,
});

await createItem(async () => {
  // API call implementation
});
``` 