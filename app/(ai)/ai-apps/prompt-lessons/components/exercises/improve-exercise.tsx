'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ImproveExerciseSingle, ExerciseFeedback } from '../../schema';
import { CheckCircle, XCircle, Pencil, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface ImproveExerciseProps {
  exercise: ImproveExerciseSingle;
  onSubmit: (improvement: string) => Promise<void>;
  feedback: ExerciseFeedback | null;
  onReset: () => void;
  questionNumber: number;
}

export default function ImproveExerciseComponent({
  exercise,
  onSubmit,
  feedback,
  onReset,
  questionNumber,
}: ImproveExerciseProps) {
  const [improvement, setImprovement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (improvement.trim()) {
      setIsSubmitting(true);
      try {
        await onSubmit(improvement.trim());
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Question section */}
      <div className="border bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Pencil className="h-5 w-5 text-violet-500" />
          <span className="font-medium text-sm">Question {questionNumber}: Improve the Prompt</span>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Original Prompt:</p>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-md border text-sm">
              {exercise.promptToImprove}
            </div>
          </div>

          <div className="text-sm">
            <p>{exercise.context}</p>
          </div>

          {exercise.criteria.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Evaluation Criteria:</p>
              <ul className="list-disc pl-5 text-xs space-y-1">
                {exercise.criteria.map((criterion, i) => (
                  <li key={i}>{criterion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Answer section */}
      <div className="min-h-[200px]">
        <AnimatePresence mode="wait">
          {!feedback ? (
            <motion.form
              key="improvement-form"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-3"
            >
              <Textarea
                placeholder="Write your improved prompt here..."
                value={improvement}
                onChange={(e) => setImprovement(e.target.value)}
                className="min-h-[120px] resize-none"
              />

              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={!improvement.trim() || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    'Submit Improvement'
                  )}
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
              className="border rounded-md overflow-hidden bg-white dark:bg-slate-900"
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {feedback.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="font-medium text-sm">
                        {feedback.isCorrect ? 'Great improvement!' : 'Needs more work'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{feedback.feedback}</p>
                    </div>

                    {feedback.suggestedImprovement && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Suggestion:
                        </p>
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-md border text-sm">
                          {feedback.suggestedImprovement}
                        </div>
                      </div>
                    )}

                    <Button variant="outline" size="sm" onClick={onReset} className="mt-2">
                      Try Again
                    </Button>
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
