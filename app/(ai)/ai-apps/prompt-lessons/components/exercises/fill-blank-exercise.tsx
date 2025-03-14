'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FillInBlankSingle, ExerciseFeedback } from '../../schema';
import { CheckCircle, XCircle, Type } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface FillInBlankExerciseProps {
  exercise: FillInBlankSingle;
  onSubmit: (answer: string) => void;
  feedback: ExerciseFeedback | null;
  onReset: () => void;
  questionNumber: number;
}

export default function FillInBlankExerciseComponent({
  exercise,
  onSubmit,
  feedback,
  onReset,
  questionNumber,
}: FillInBlankExerciseProps) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer.trim());
    }
  };

  // Format the sentence with blanks properly highlighted
  const formatSentence = () => {
    return exercise.sentence.replace(
      /\[BLANK\]/g,
      feedback
        ? `<span class="font-medium underline ${feedback.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}">${answer}</span>`
        : `<span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">_______</span>`
    );
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Question section */}
      <div className="border bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Type className="h-5 w-5 text-emerald-500" />
          <span className="font-medium text-sm">Question {questionNumber}: Fill in the Blank</span>
        </div>

        <div className="text-sm mb-4" dangerouslySetInnerHTML={{ __html: formatSentence() }} />

        {exercise.context && (
          <div className="text-xs text-muted-foreground mt-2 border-t pt-2">
            <p className="italic">{exercise.context}</p>
          </div>
        )}
      </div>

      {/* Answer section */}
      <div className="min-h-[120px]">
        <AnimatePresence mode="wait">
          {!feedback ? (
            <motion.form
              key="answer-form"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-3"
            >
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your answer..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={!answer.trim()}>
                  Submit
                </Button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="feedback-panel"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className={`border rounded-md overflow-hidden ${
                feedback.isCorrect
                  ? 'bg-green-50 border-green-100 dark:bg-green-950/30 dark:border-green-900'
                  : 'bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900'
              }`}
            >
              <div className="p-3">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex-shrink-0">
                    {feedback.isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">
                        {feedback.isCorrect ? 'Correct!' : 'Incorrect'}
                      </span>
                      <span className="text-muted-foreground font-normal">
                        {' '}
                        - {exercise.explanation}
                      </span>
                    </p>
                    {!feedback.isCorrect && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        <p>
                          Correct answer:{' '}
                          <span className="font-medium text-foreground">
                            {exercise.correctAnswer}
                          </span>
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-7 px-2 text-xs"
                          onClick={onReset}
                        >
                          Try again
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
