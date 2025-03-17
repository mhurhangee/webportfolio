'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Bot, User, Trash2, RefreshCw, Copy, Check, Edit } from 'lucide-react';
import type { Message } from 'ai';
import { TypingIndicator } from './typing-indicator';
import { MemoizedMarkdown } from './memoized-markdown';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface ChatMessageProps {
  message: Message;
  streaming?: boolean;
  onDelete?: () => void;
  onRegenerate?: () => void;
  onEdit?: () => void;
  canEdit?: boolean;
}

export function ChatMessage({
  message,
  streaming = false,
  onDelete,
  onRegenerate,
  onEdit,
  canEdit = false,
}: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [isCopied, setIsCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      toast.success('Message copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy message');
    }
  };

  return (
    <div
      className="flex flex-col gap-1 py-2 animate-in fade-in-0 slide-in-from-bottom-3 duration-300 group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-1">
          <Avatar className="h-7 w-7">
            <AvatarFallback
              className={
                isUser ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
              }
            >
              {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className={cn('text-sm max-w-[90%] pt-0.5 prose prose-sm dark:prose-invert')}>
          <MemoizedMarkdown content={message.content} id={message.id} />

          {streaming && !isUser && (
            <span className="inline-flex ml-1">
              <TypingIndicator className="text-muted-foreground" />
            </span>
          )}
        </div>
      </div>

      {/* Action buttons shown below message with fixed height to prevent layout shifts */}
      <div className="flex items-center gap-1 ml-10 mt-0.5 h-5">
        <TooltipProvider>
          <div
            className={cn(
              'flex items-center gap-1 transition-opacity duration-200',
              showActions ? 'opacity-100' : 'opacity-0'
            )}
          >
            {onDelete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full hover:bg-destructive/10 hover:text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                    <span className="sr-only">Delete message</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete message</p>
                </TooltipContent>
              </Tooltip>
            )}

            {!isUser && onRegenerate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full hover:bg-green-500/10 hover:text-green-500"
                    onClick={onRegenerate}
                  >
                    <RefreshCw className="h-2.5 w-2.5" />
                    <span className="sr-only">Regenerate response</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Regenerate response</p>
                </TooltipContent>
              </Tooltip>
            )}

            {canEdit && onEdit && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full hover:bg-amber-500/10 hover:text-amber-500"
                    onClick={onEdit}
                  >
                    <Edit className="h-2.5 w-2.5" />
                    <span className="sr-only">Edit message</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit message</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 rounded-full hover:bg-blue-500/10 hover:text-blue-500"
                  onClick={copyToClipboard}
                >
                  {isCopied ? (
                    <Check className="h-2.5 w-2.5 text-green-500" />
                  ) : (
                    <Copy className="h-2.5 w-2.5" />
                  )}
                  <span className="sr-only">Copy to clipboard</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isCopied ? 'Copied!' : 'Copy to clipboard'}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
