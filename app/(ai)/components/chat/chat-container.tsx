'use client';

import type React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { ChatHeader } from './chat-header';
import { EmptyState } from './empty-state';
import { MessageList } from './message-list';
import { LimitWarning } from './limit-warning';
import { MessageInput } from './message-input';
import { useRef, useEffect, useState } from 'react';
import type { Message } from 'ai';
import { ConfirmationDialog } from './confirmation-dialog';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

// Define message limit constant
const MESSAGE_LIMIT = 20;
const MAX_INPUT_LENGTH = 1000;

interface ChatContainerProps {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  status: 'submitted' | 'streaming' | 'ready' | 'error';
  setMessages: (messages: Message[]) => void;
  reload: () => Promise<string | undefined | null>;
  lastErrorMessage?: Message | null;
  handleNewChat: () => void;
  onDismissError?: () => void;
  hasError?: boolean;
}

export function ChatContainer({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  status,
  setMessages,
  reload,
  lastErrorMessage,
  handleNewChat,
  onDismissError,
  hasError = false,
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  const [editingMessageContent, setEditingMessageContent] = useState('');
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [confirmationState, setConfirmationState] = useState<{
    open: boolean;
    action: 'delete' | 'regenerate' | 'edit' | null;
    index: number | null;
  }>({
    open: false,
    action: null,
    index: null,
  });

  // Calculate if limit is reached or approaching
  const messageCount = messages.length;
  const isLimitReached = messageCount >= MESSAGE_LIMIT;
  const isApproachingLimit = messageCount >= MESSAGE_LIMIT * 0.7 && !isLimitReached;
  const remainingMessages = MESSAGE_LIMIT - messageCount;

  // Handle message deletion with confirmation
  const confirmDeleteMessage = (index: number) => {
    setConfirmationState({
      open: true,
      action: 'delete',
      index,
    });
  };

  const handleDeleteMessage = (index: number) => {
    // Delete the message and all subsequent messages
    const newMessages = messages.slice(0, index);
    setMessages(newMessages);
  };

  // Handle regenerate response with confirmation
  const confirmRegenerateResponse = (index: number) => {
    setConfirmationState({
      open: true,
      action: 'regenerate',
      index,
    });
  };

  const handleRegenerateResponse = (index: number) => {
    if (index % 2 === 1) {
      // If it's an AI message (odd index)
      // Get the user message before this AI message
      const userMessageIndex = index - 1;
      if (userMessageIndex >= 0) {
        // Keep messages up to and including the user message
        const newMessages = messages.slice(0, userMessageIndex + 1);
        setMessages(newMessages);
        // Then reload to generate a new AI response
        reload();
      }
    }
  };

  // Handle edit message with confirmation
  const confirmEditMessage = (index: number) => {
    if (index % 2 === 0) {
      // Only user messages can be edited
      setConfirmationState({
        open: true,
        action: 'edit',
        index,
      });
    }
  };

  const startEditingMessage = (index: number) => {
    setEditingMessageIndex(index);
    setEditingMessageContent(messages?.[index]?.content || '');
  };

  const cancelEditingMessage = () => {
    setEditingMessageIndex(null);
    setEditingMessageContent('');
  };

  const saveEditedMessage = () => {
    if (editingMessageIndex === null || !editingMessageContent.trim()) {
      return;
    }

    // Ensure the index is valid
    if (editingMessageIndex < 0 || editingMessageIndex >= messages.length) {
      console.error('Invalid message index for editing');
      return;
    }

    // Create a completely new message array
    const newMessages = [...messages.slice(0, editingMessageIndex)];

    // Create a new message with proper typing
    const newMessage: Message = {
      id: nanoid(), // Always generate a new ID to avoid type issues
      role: 'user', // User messages are the only ones that can be edited
      content: editingMessageContent,
    };

    // Add the new message
    newMessages.push(newMessage);

    // Update messages
    setMessages(newMessages);

    // Reset editing state
    setEditingMessageIndex(null);
    setEditingMessageContent('');

    // Reload to generate a new AI response
    reload();
  };

  const handleConfirmationAction = () => {
    const { action, index } = confirmationState;
    if (index === null) return;

    switch (action) {
      case 'delete':
        handleDeleteMessage(index);
        break;
      case 'regenerate':
        handleRegenerateResponse(index);
        break;
      case 'edit':
        startEditingMessage(index);
        break;
    }
  };

  // Get the last assistant message to determine if it's streaming
  const lastAssistantMessageIndex =
    messages.length > 0 ? [...messages].reverse().findIndex((m) => m.role === 'assistant') : -1;

  const isLastAssistantMessageStreaming =
    status === 'streaming' && lastAssistantMessageIndex !== -1;

  // Check if scroll is at bottom
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
      setIsAtBottom(isBottom);
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      setIsAtBottom(true);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom]);

  return (
    <Card
      className={cn(
        'w-full max-w-2xl h-[80vh] flex flex-col relative overflow-hidden transition-all duration-200',
        isFocused && 'ring-2 ring-primary/50'
      )}
      ref={chatContainerRef}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      tabIndex={0}
    >
      <div className="sticky top-0 z-10">
        <ChatHeader
          remainingMessages={remainingMessages}
          messageLimit={MESSAGE_LIMIT}
          isLimitReached={isLimitReached}
          isApproachingLimit={isApproachingLimit}
          onNewChat={handleNewChat}
          fullscreenTargetRef={chatContainerRef}
        />
      </div>

      <CardContent
        className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(80vh-8rem)] relative"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <MessageList
            messages={messages}
            isLastMessageStreaming={isLastAssistantMessageStreaming}
            lastAssistantMessageIndex={lastAssistantMessageIndex}
            status={status}
            onDeleteMessage={confirmDeleteMessage}
            onRegenerateMessage={confirmRegenerateResponse}
            onEditMessage={confirmEditMessage}
            editingMessageIndex={editingMessageIndex}
            editingMessageContent={editingMessageContent}
            setEditingMessageContent={setEditingMessageContent}
            onSaveEdit={saveEditedMessage}
            onCancelEdit={cancelEditingMessage}
            lastErrorMessage={lastErrorMessage}
          />
        )}

        <LimitWarning
          isLimitReached={isLimitReached}
          isApproachingLimit={isApproachingLimit}
          onNewChat={handleNewChat}
        />

        <div ref={messagesEndRef} />
        {!isAtBottom && messages.length > 0 && (
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-4 right-4 items-center rounded-full shadow-md z-10 bg-background/80 backdrop-blur-sm"
            onClick={scrollToBottom}
          >
            <ChevronDown className="h-4 w-4" />
            <span className="sr-only">Scroll to bottom</span>
          </Button>
        )}
      </CardContent>

      <MessageInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        status={status}
        isLimitReached={isLimitReached}
        maxLength={MAX_INPUT_LENGTH}
        isEditing={editingMessageIndex !== null}
        hasError={hasError}
        onRetry={onDismissError}
      />

      <ConfirmationDialog
        open={confirmationState.open}
        onOpenChange={(open) => setConfirmationState((prev) => ({ ...prev, open }))}
        title={
          confirmationState.action === 'delete'
            ? 'Delete message'
            : confirmationState.action === 'regenerate'
              ? 'Regenerate response'
              : 'Edit message'
        }
        description={
          'This action will remove all subsequent messages and cannot be undone. Are you sure you want to continue?'
        }
        confirmLabel={
          confirmationState.action === 'delete'
            ? 'Delete'
            : confirmationState.action === 'regenerate'
              ? 'Regenerate'
              : 'Edit'
        }
        variant={confirmationState.action === 'delete' ? 'destructive' : 'default'}
        onConfirm={handleConfirmationAction}
      />
    </Card>
  );
}
