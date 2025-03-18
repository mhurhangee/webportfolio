"use client"

import type { Question, InterviewType } from "../schema"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Trash2, ChevronUp, ChevronDown, Copy } from "lucide-react"
import { toast } from "sonner"

interface QuestionItemProps {
  question: Question
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
}

// Category colors by interview type
const CATEGORY_COLORS: Record<InterviewType, Record<string, string>> = {
  job: {
    technical: "bg-blue-100 text-blue-800",
    behavioral: "bg-purple-100 text-purple-800",
    situational: "bg-orange-100 text-orange-800",
    experience: "bg-green-100 text-green-800",
    "cultural-fit": "bg-pink-100 text-pink-800",
  },
  media: {
    background: "bg-blue-100 text-blue-800",
    opinion: "bg-purple-100 text-purple-800",
    hypothetical: "bg-orange-100 text-orange-800",
    personal: "bg-green-100 text-green-800",
    topical: "bg-pink-100 text-pink-800",
  },
  pr: {
    crisis: "bg-red-100 text-red-800",
    messaging: "bg-blue-100 text-blue-800",
    reputation: "bg-purple-100 text-purple-800",
    strategy: "bg-green-100 text-green-800",
    clarification: "bg-yellow-100 text-yellow-800",
  },
  academic: {
    research: "bg-blue-100 text-blue-800",
    teaching: "bg-green-100 text-green-800",
    collaboration: "bg-purple-100 text-purple-800",
    methodology: "bg-orange-100 text-orange-800",
    philosophy: "bg-pink-100 text-pink-800",
  },
  customer: {
    satisfaction: "bg-green-100 text-green-800",
    usage: "bg-blue-100 text-blue-800",
    feedback: "bg-purple-100 text-purple-800",
    needs: "bg-orange-100 text-orange-800",
    improvement: "bg-red-100 text-red-800",
  },
  behavioral: {
    "past-experience": "bg-blue-100 text-blue-800",
    "decision-making": "bg-purple-100 text-purple-800",
    conflict: "bg-red-100 text-red-800",
    leadership: "bg-green-100 text-green-800",
    teamwork: "bg-yellow-100 text-yellow-800",
  },
}

// Fallback for any category not found
const DEFAULT_CATEGORY_COLOR = "bg-gray-100 text-gray-800"

export function QuestionItem({
  question,
  onDelete,
  onToggleFavorite,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: QuestionItemProps) {
  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  }

  // Get the color for this category based on interview type
  const getCategoryColor = (category: string, interviewType: InterviewType) => {
    const typeColors = CATEGORY_COLORS[interviewType] || {}
    return typeColors[category] || DEFAULT_CATEGORY_COLOR
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(question.text)
    toast.success("Question copied to clipboard")
  }

  return (
    <Card className="overflow-hidden border">
      <CardContent className="p-3">
        <div className="flex gap-3">
          {/* Reorder buttons on the left */}
          <div className="flex flex-col justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMoveUp}
              disabled={isFirst}
              className="h-6 w-6 p-0 text-gray-500"
              title="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onMoveDown}
              disabled={isLast}
              className="h-6 w-6 p-0 text-gray-500"
              title="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Question content */}
          <div className="flex-1">
            <p className="text-sm">{question.text}</p>

            <div className="flex justify-between items-center mt-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={getCategoryColor(question.category, question.interviewType)}>
                  {question.category}
                </Badge>
                <Badge variant="outline" className={difficultyColors[question.difficulty]}>
                  {question.difficulty}
                </Badge>
              </div>

              {/* Action buttons at bottom right */}
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleFavorite(question.id)}
                  className={`h-7 w-7 ${question.isFavorite ? "text-yellow-500" : "text-gray-400"}`}
                  title={question.isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star className="h-4 w-4" fill={question.isFavorite ? "currentColor" : "none"} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyToClipboard}
                  className="h-7 w-7 text-gray-500"
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(question.id)}
                  className="h-7 w-7 text-red-500"
                  title="Delete question"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}