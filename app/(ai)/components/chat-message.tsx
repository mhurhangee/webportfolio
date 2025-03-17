import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Bot, User } from "lucide-react"
import type { Message } from "ai"
import { TypingIndicator } from "./typing-indicator"
import { MemoizedMarkdown } from "./memoized-markdown"

interface ChatMessageProps {
  message: Message
  streaming?: boolean
}

export function ChatMessage({ message, streaming = false }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn(
        "flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-3 duration-300",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-primary">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%] text-sm prose prose-sm dark:prose-invert ",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
          <MemoizedMarkdown content={message.content} id={message.id} />

        {streaming && !isUser && (
          <span className="inline-flex ml-1">
            <TypingIndicator className="text-muted-foreground" />
          </span>
        )}
      </div>

      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}