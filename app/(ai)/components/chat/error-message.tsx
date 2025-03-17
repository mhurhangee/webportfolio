'use client';

import { AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  message: string;
  code?: string;
  onDismiss?: () => void;
  autoHide?: boolean;
  className?: string;
}

export function ErrorMessage({
  message,
  code,
  onDismiss,
  autoHide = true,
  className,
}: ErrorMessageProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onDismiss) onDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [autoHide, onDismiss]);

  if (!isVisible) return null;

  // Format the message if it contains markdown or JSON (like from AI response errors)
  const formatErrorMessage = (message: string) => {
    // First check if the message is JSON
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(message);
      if (parsed && typeof parsed === 'object') {
        // If we have a message property, use that
        if (parsed.message) {
          return parsed.message;
        }
        // Otherwise, stringify it in a readable way
        return Object.entries(parsed)
          .filter(([key, value]) => value && String(value).trim() !== '')
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
      }
    } catch (e) {
      // Not JSON, continue with markdown processing
    }

    // Strip any markdown format from the message
    let formattedMessage = message;

    // Remove markdown headers and formatting
    formattedMessage = formattedMessage.replace(/\*\*Error: [^\*]+\*\*/g, '');
    formattedMessage = formattedMessage.replace(/\*\*/g, '');
    formattedMessage = formattedMessage.replace(/\n\n/g, ' '); // Replace double newlines with space

    // If the message contains complex error details, simplify it
    if (formattedMessage.includes('{') && formattedMessage.includes('}')) {
      // Extract just the main error message before any JSON details
      const mainMessage = formattedMessage.split('{')[0].trim();
      if (mainMessage) {
        return mainMessage;
      }
    }

    // Extract actual error message
    const lines = formattedMessage.split('\n').filter((line) => line.trim() !== '');
    if (lines.length > 0) {
      return lines[0]; // Return first non-empty line
    }

    return message; // Return original if parsing fails
  };

  // Get appropriate title based on code
  const getErrorTitle = (code?: string) => {
    if (!code) return 'Something went wrong';

    // Map error codes to user-friendly titles
    switch (code) {
      case 'rate_limit_exceeded':
      case 'user_rate_limit_exceeded':
      case 'global_rate_limit_exceeded':
        return 'Rate Limit Reached';
      case 'moderation_flagged':
      case 'blacklisted_keywords':
        return 'Content Policy Alert';
      case 'validation_error':
      case 'input_too_long':
        return 'Input Error';
      case 'ai_detection':
        return 'AI Content Detected';
      case 'language_not_supported':
        return 'Language Not Supported';
      default:
        return 'Error';
    }
  };

  return (
    <Alert
      variant="destructive"
      className={cn('animate-in fade-in-0 slide-in-from-top-5 duration-300', className)}
    >
      <AlertCircle className="h-4 w-4" />
      <div className="flex-1">
        <AlertTitle>{getErrorTitle(code)}</AlertTitle>
        <AlertDescription>{formatErrorMessage(message)}</AlertDescription>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full"
          onClick={() => {
            setIsVisible(false);
            onDismiss();
          }}
        >
          <X className="h-3.5 w-3.5" />
          <span className="sr-only">Dismiss</span>
        </Button>
      )}
    </Alert>
  );
}
