"use client"

import type { Question } from "../schema"
import { QuestionItem } from "../components/question-item"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Copy } from "lucide-react"

interface QuestionListProps {
    questions: Question[]
    onDelete: (id: string) => void
    onToggleFavorite: (id: string) => void
    onMove: (id: string, direction: "up" | "down") => void
}


// Animation variants for staggered animations
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.2 },
    },
}

export function QuestionList({ questions, onDelete, onToggleFavorite, onMove }: QuestionListProps) {
    const [filter, setFilter] = useState<"all" | "favorites">("all")

    const filteredQuestions = filter === "all" ? questions : questions.filter((q) => q.isFavorite)

    const copyAllToClipboard = () => {
        const questionsText = filteredQuestions.map((q, index) => `${index + 1}. ${q.text}`).join("\n\n")

        navigator.clipboard.writeText(questionsText)
        toast.success(`${filteredQuestions.length} questions copied to clipboard`)
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <div className="space-x-2">
                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2">
                            <Button 
                                variant={filter === "all" ? "default" : "outline"} 
                                onClick={() => setFilter("all")} 
                                size="sm"
                            >
                                All ({questions.length})
                            </Button>
                            <Button
                                variant={filter === "favorites" ? "default" : "outline"}
                                onClick={() => setFilter("favorites")}
                                size="sm"
                            >
                                Favorites ({questions.filter((q) => q.isFavorite).length})
                            </Button>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={copyAllToClipboard}
                            disabled={filteredQuestions.length === 0}
                        >
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy All</span>
                        </Button>
                    </div>
                </div>
            </div>

            <motion.div className="space-y-2" layout variants={containerVariants} initial="hidden" animate="show">
                <AnimatePresence mode="popLayout">
                    {filteredQuestions.map((question, index) => (
                        <motion.div key={question.id} variants={itemVariants} initial="hidden" animate="show" exit="exit" layout>
                            <QuestionItem
                                question={question}
                                onDelete={onDelete}
                                onToggleFavorite={onToggleFavorite}
                                onMoveUp={() => onMove(question.id, "up")}
                                onMoveDown={() => onMove(question.id, "down")}
                                isFirst={index === 0}
                                isLast={index === filteredQuestions.length - 1}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}