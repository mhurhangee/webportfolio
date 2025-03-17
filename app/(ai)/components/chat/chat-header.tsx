"use client"

import { Bot, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { FullscreenToggle } from "./fullscreen-toggle"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ChatHeaderProps {
  remainingMessages: number
  messageLimit: number
  isLimitReached: boolean
  isApproachingLimit: boolean
  onNewChat: () => void
  fullscreenTargetRef: React.RefObject<HTMLDivElement>
}

export function ChatHeader({
  remainingMessages,
  messageLimit,
  isLimitReached,
  isApproachingLimit,
  onNewChat,
  fullscreenTargetRef,
}: ChatHeaderProps) {
  const progressPercentage = ((messageLimit - remainingMessages) / messageLimit) * 100

  return (
    <CardHeader className="flex flex-row items-center rounded-tl-xl rounded-tr-xl justify-between backdrop-blur-md supports-[backdrop-filter]:bg-background/60 border-b border-border/40 z-10 transition-all duration-200">
      <CardTitle className="flex items-center gap-2">
        <Bot className="h-5 w-5 text-primary" />
        AI Assistant
      </CardTitle>

      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-1 mr-2">
          <div className="text-xs text-muted-foreground">
            {isLimitReached
              ? "Message limit reached"
              : `${remainingMessages} messages remaining`}
          </div>
          <Progress 
            value={progressPercentage} 
            max={100} 
            className={cn(
              "h-1.5 w-24",
              isLimitReached ? "bg-destructive/20" : isApproachingLimit ? "bg-amber-500/20" : "bg-primary/20"
            )}
            indicatorClassName={cn(
              isLimitReached ? "bg-destructive" : isApproachingLimit ? "bg-amber-500" : "bg-primary"
            )}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 bg-background/80 hover:bg-background"
          onClick={onNewChat}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          New Chat
        </Button>
      </div>
    </CardHeader>
  )
}