"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface LimitWarningProps {
  isLimitReached: boolean
  isApproachingLimit: boolean
  onNewChat: () => void
}

export function LimitWarning({ isLimitReached, isApproachingLimit, onNewChat }: LimitWarningProps) {
  if (isLimitReached) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 mt-4 text-center">
        <div className="flex justify-center mb-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <h3 className="font-medium text-destructive">Message limit reached</h3>
        <p className="text-destructive/80 text-sm mt-1">You've reached the maximum number of messages for this demo.</p>
        <Button
          onClick={onNewChat}
          variant="outline"
          className="mt-3 border-destructive/50 text-destructive hover:bg-destructive/10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Start a new conversation
        </Button>
      </div>
    )
  }

  if (isApproachingLimit) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-md p-2 text-center text-sm text-amber-800">
        You're approaching the message limit. Consider starting a new chat soon.
      </div>
    )
  }

  return null
}