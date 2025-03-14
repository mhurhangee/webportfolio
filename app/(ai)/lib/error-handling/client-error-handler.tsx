// /apps/web/app/(ai)/lib/error-handling/client-error-handler.tsx

'use client';

import { useState, useCallback } from 'react';
import { toastError, toastWarning, toastInfo } from './toast-manager';
import { logger } from './logger';

interface ErrorState {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  details?: Record<string, any>;
  requestId?: string;
}

/**
 * Hook for handling errors in client components
 */
export function useErrorHandler(componentName: string) {
  const [error, setError] = useState<ErrorState | null>(null);

  const handleError = useCallback(
    (error: unknown) => {
      let errorState: ErrorState = {
        code: 'unknown_error',
        message: 'An unexpected error occurred',
        severity: 'error',
        details: {},
      };

      // Extract error information
      if (error instanceof Error) {
        try {
          // Try to parse as a structured error
          const parsedError = JSON.parse(error.message);
          errorState = {
            code: parsedError.code || 'unknown_error',
            message: parsedError.message || error.message,
            severity: parsedError.severity || 'error',
            details: parsedError.details || {},
            requestId: parsedError.requestId,
          };
        } catch {
          errorState.message = error.message;
          errorState.details = { stack: error.stack };
        }
      } else if (typeof error === 'string') {
        errorState.message = error;
      } else if (error && typeof error === 'object') {
        const errorObj = error as Record<string, any>;
        errorState = {
          code: errorObj.code || 'unknown_error',
          message: errorObj.message || 'An unexpected error occurred',
          severity: errorObj.severity || 'error',
          details: errorObj,
          requestId: errorObj.requestId,
        };
      }

      // Set the error state
      setError(errorState);

      // Log the error
      logger.error(`Component Error: ${errorState.code}`, {
        component: componentName,
        errorMessage: errorState.message,
        errorDetails: errorState.details,
        requestId: errorState.requestId,
      });

      // Show toast notification based on severity
      const toastOptions = {
        description: errorState.details?.description,
        id: errorState.requestId, // Use requestId as toast ID for deduplication
      };

      switch (errorState.severity) {
        case 'error':
          toastError(errorState.message, toastOptions);
          break;
        case 'warning':
          toastWarning(errorState.message, toastOptions);
          break;
        case 'info':
          toastInfo(errorState.message, toastOptions);
          break;
      }

      return errorState;
    },
    [componentName]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
}
