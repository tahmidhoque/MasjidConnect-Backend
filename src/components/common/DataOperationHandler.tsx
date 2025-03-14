'use client';

import { useState, useCallback } from 'react';
import { useSnackbar } from '@/contexts/SnackbarContext';

interface UseDataOperationProps {
  resourceName: string;
  fetchItems?: () => Promise<void>;
}

interface DataOperationConfig {
  showSuccessMessages?: boolean;
  hideErrorMessages?: boolean;
}

/**
 * A custom hook to handle common data operations (create, update, delete)
 * with standardized error handling and success messages via Snackbar
 */
export const useDataOperation = ({
  resourceName,
  fetchItems,
}: UseDataOperationProps, config: DataOperationConfig = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useSnackbar();
  
  const defaultConfig: DataOperationConfig = {
    showSuccessMessages: true,
    hideErrorMessages: false,
    ...config
  };

  const handleApiRequest = useCallback(async (
    operation: 'create' | 'update' | 'delete',
    apiCall: () => Promise<any>,
    customSuccessMessage?: string
  ) => {
    const operationMap = {
      create: { present: 'Creating', past: 'created' },
      update: { present: 'Updating', past: 'updated' },
      delete: { present: 'Deleting', past: 'deleted' }
    };
    
    const { present, past } = operationMap[operation];
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`${present} ${resourceName}...`);
      const result = await apiCall();
      
      // If there's a refresh function, call it to update the UI
      if (fetchItems) {
        await fetchItems();
      }
      
      // Show success message if configured to do so
      if (defaultConfig.showSuccessMessages) {
        const successMessage = customSuccessMessage || 
          (result?.message || `${resourceName} ${past} successfully`);
        showSuccess(successMessage);
      }
      
      setError(null);
      return { success: true, data: result };
    } catch (err) {
      console.error(`Error ${present.toLowerCase()} ${resourceName}:`, err);
      
      // Format error message
      const errorMessage = err instanceof Error 
        ? err.message 
        : `Failed to ${operation} ${resourceName}`;
      
      setError(errorMessage);
      
      // Show error message unless configured not to
      if (!defaultConfig.hideErrorMessages) {
        showError(errorMessage);
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [resourceName, fetchItems, showSuccess, showError, defaultConfig]);

  const createItem = useCallback(async (
    apiCall: () => Promise<any>,
    customSuccessMessage?: string
  ) => {
    return handleApiRequest('create', apiCall, customSuccessMessage);
  }, [handleApiRequest]);

  const updateItem = useCallback(async (
    apiCall: () => Promise<any>,
    customSuccessMessage?: string
  ) => {
    return handleApiRequest('update', apiCall, customSuccessMessage);
  }, [handleApiRequest]);

  const deleteItem = useCallback(async (
    apiCall: () => Promise<any>,
    customSuccessMessage?: string
  ) => {
    return handleApiRequest('delete', apiCall, customSuccessMessage);
  }, [handleApiRequest]);

  return {
    loading,
    error,
    setError,
    createItem,
    updateItem,
    deleteItem
  };
}; 