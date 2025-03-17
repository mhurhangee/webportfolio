import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, AlertCircle } from "lucide-react"
import { ChatMessage } from "./chat-message"
import { TypingIndicator } from "./typing-indicator"
import type { Message } from "ai"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { ErrorMessage } from "./error-message"
import { useEffect, useState } from "react"

interface MessageListProps {
  messages: Message[]
  isLastMessageStreaming: boolean
  lastAssistantMessageIndex: number
  status: "submitted" | "streaming" | "ready" | "error"
  onDeleteMessage: (index: number) => void
  onRegenerateMessage: (index: number) => void
  onEditMessage: (index: number) => void
  editingMessageIndex: number | null
  editingMessageContent: string
  setEditingMessageContent: (content: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  lastErrorMessage?: Message | null
}

export function MessageList({
  messages,
  isLastMessageStreaming,
  lastAssistantMessageIndex,
  status,
  onDeleteMessage,
  onRegenerateMessage,
  onEditMessage,
  editingMessageIndex,
  editingMessageContent,
  setEditingMessageContent,
  onSaveEdit,
  onCancelEdit,
  lastErrorMessage,
}: MessageListProps) {
  const [errorCode, setErrorCode] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false)
  
  // Process error message from lastErrorMessage if available
  useEffect(() => {
    if (lastErrorMessage && lastErrorMessage.content) {
      // Extract error code and message from content
      const errorContent = lastErrorMessage.content;
      
      // Look for error message pattern - we've changed the format to be friendlier
      // We no longer extract the error code since it's not shown in the nicer format
      setErrorCode('error');
      setErrorMessage(errorContent);
      setShowErrorMessage(true);
    } else {
      setShowErrorMessage(false);
    }
  }, [lastErrorMessage])
  
  return (
    <div className="space-y-1">
      {/* We no longer display error messages in the message list - they're handled at the app level */}
      
      {messages.map((message, index) => (
        <div key={message.id}>
          {editingMessageIndex === index ? (
            <div className="flex flex-col gap-2 py-2">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-1">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-3.5 w-3.5" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <Textarea
                    value={editingMessageContent}
                    onChange={(e) => setEditingMessageContent(e.target.value)}
                    className="min-h-[100px] text-sm"
                    placeholder="Edit your message..."
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3"
                      onClick={onCancelEdit}
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 px-3"
                      onClick={onSaveEdit}
                      disabled={!editingMessageContent.trim()}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Save & Send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ChatMessage
              message={message}
              streaming={isLastMessageStreaming && index === messages.length - 1 - lastAssistantMessageIndex}
              onDelete={() => onDeleteMessage(index)}
              onRegenerate={() => onRegenerateMessage(index)}
              onEdit={() => onEditMessage(index)}
              canEdit={message.role === "user"}
            />
          )}
        </div>
      ))}
      
      {/* This renders the typing indicator when in "submitted" state */}

      {status === "submitted" && (
        <div className="flex items-start gap-3 py-2">
          <div className="flex-shrink-0 pt-1">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary/10 text-primary">
                <Bot className="h-3.5 w-3.5" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-sm font-mono pt-2">
            <TypingIndicator className="text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  )
}