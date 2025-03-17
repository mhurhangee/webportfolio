'use client';

import { Bot, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  remainingMessages: number;
  messageLimit: number;
  isLimitReached: boolean;
  isApproachingLimit: boolean;
  onNewChat: () => void;
  fullscreenTargetRef: React.RefObject<HTMLDivElement>;
}

export function ChatHeader({
  remainingMessages,
  messageLimit,
  isLimitReached,
  isApproachingLimit,
  onNewChat,
  fullscreenTargetRef,
}: ChatHeaderProps) {
  const progressPercentage = ((messageLimit - remainingMessages) / messageLimit) * 100;

  return (
    <CardHeader className="flex flex-row items-center rounded-tl-xl rounded-tr-xl justify-between z-10 transition-all duration-200 p-3 sm:p-6">
      <CardTitle className="flex items-center gap-1 sm:gap-2 text-sm sm:text-xs">
        <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        Chat
      </CardTitle>

      <div className="flex items-center gap-1 sm:gap-2">
        <div className="flex flex-col gap-0.5 sm:gap-1 mr-1 sm:mr-2">
          <div className="text-[10px] sm:text-xs text-muted-foreground">
            {isLimitReached ? 'Limit reached' : `${remainingMessages} messages left`}
          </div>
          <Progress
            value={progressPercentage}
            max={100}
            className={cn(
              'h-1 sm:h-1.5 w-16 sm:w-24',
              isLimitReached
                ? 'bg-destructive/20'
                : isApproachingLimit
                  ? 'bg-amber-500/20'
                  : 'bg-primary/20'
            )}
            indicatorClassName={cn(
              isLimitReached ? 'bg-destructive' : isApproachingLimit ? 'bg-amber-500' : 'bg-primary'
            )}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 sm:h-8 px-1.5 sm:px-2 text-xs sm:text-sm bg-background/80 hover:bg-background"
          onClick={onNewChat}
        >
          <RefreshCw className="h-3 w-3" />
          <span className="ml-1hidden sm:inline"> New Chat</span>
        </Button>
      </div>
    </CardHeader>
  );
}
