'use client';

import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ErrorDisplayConfig } from '@/app/(ai)/lib/preflight-checks/types';

interface PreflightErrorProps {
  config: ErrorDisplayConfig;
  onClose?: () => void;
}

export function PreflightError({ config, onClose }: PreflightErrorProps) {
  const { title, description, action, severity } = config;

  const icons = {
    error: <AlertCircle className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
  };

  // Map our severity levels to valid Alert variants
  const getVariant = (severity: 'warning' | 'error' | 'info') => {
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Alert variant={getVariant(severity)}>
      {icons[severity]}
      <div className="flex items-start justify-between w-full">
        <div>
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </div>
        <div className="flex space-x-2 ml-4">
          {action && (
            <Button variant="ghost" size="sm" onClick={action.onClick} className="h-8">
              {action.label}
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}
