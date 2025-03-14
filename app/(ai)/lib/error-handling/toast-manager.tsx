'use client';

import { toast } from 'sonner';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { ReactNode } from 'react';

// Define severity types
export type ToastSeverity = 'error' | 'warning' | 'info' | 'success';

// Interface for toast options
export interface ToastOptions {
  description?: ReactNode;
  duration?: number;
  id?: string;
  // Add any other options you might need
}

// Icons for different severities
const severityIcons = {
  error: <AlertCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
  success: <CheckCircle className="h-5 w-5" />,
};

// CSS classes for different severities
const severityClasses = {
  error: 'bg-destructive text-destructive-foreground',
  warning: 'bg-amber-500 text-white',
  info: 'bg-blue-500 text-white',
  success: 'bg-green-500 text-white',
};

// Function to show a toast with severity styling
export function showToast(
  title: string,
  severity: ToastSeverity = 'info',
  options: ToastOptions = {}
): string | number {
  const { description, duration = 5000, id, ...restOptions } = options;

  return toast(title, {
    icon: severityIcons[severity],
    className: severityClasses[severity],
    duration,
    id,
    description,
    ...restOptions,
  });
}

// Convenience functions for different severities
export const toastError = (title: string, options?: ToastOptions) =>
  showToast(title, 'error', options);

export const toastWarning = (title: string, options?: ToastOptions) =>
  showToast(title, 'warning', options);

export const toastInfo = (title: string, options?: ToastOptions) =>
  showToast(title, 'info', options);

export const toastSuccess = (title: string, options?: ToastOptions) =>
  showToast(title, 'success', options);
