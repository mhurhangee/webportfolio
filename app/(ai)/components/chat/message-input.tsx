'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CardFooter } from '@/components/ui/card';
import { Send, Loader2 } from 'lucide-react';
import type { FormEvent } from 'react';

interface MessageInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  status: 'submitted' | 'streaming' | 'ready' | 'error';
  isLimitReached: boolean;
  maxLength: number;
  isEditing?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
}

export function MessageInput({
  input,
  handleInputChange,
  handleSubmit,
  status,
  isLimitReached,
  maxLength,
  isEditing = false,
  hasError = false,
  onRetry,
}: MessageInputProps) {
  return (
    <CardFooter className="p-4 sticky bottom-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-bl-xl rounded-br-xl">
      <form onSubmit={handleSubmit} className="w-full relative">
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder={
            isLimitReached
              ? 'Message limit reached'
              : isEditing
                ? 'Editing in progress. Use the edit form above.'
                : hasError
                  ? 'An error occurred. Please try again or start a new chat.'
                  : 'Type your message...'
          }
          className="w-full min-h-[80px] max-h-[160px] resize-none pr-14 bg-background/50 focus:bg-background"
          disabled={(status !== 'ready' && status !== 'error') || isLimitReached || isEditing}
          autoComplete="off"
          withCounter
          maxLength={maxLength}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (
                input.trim() &&
                (status === 'ready' || status === 'error') &&
                !isLimitReached &&
                !isEditing
              ) {
                handleSubmit(e as any);
              }
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-3 top-3 h-10 w-10 rounded-full shadow-sm"
          disabled={
            (status !== 'ready' && status !== 'error') ||
            input.trim() === '' ||
            isLimitReached ||
            isEditing
          }
        >
          {status === 'submitted' || status === 'streaming' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </CardFooter>
  );
}
