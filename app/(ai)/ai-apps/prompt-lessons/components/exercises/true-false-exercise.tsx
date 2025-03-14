'use client';

import { Button } from '@/components/ui/button';
import { TrueFalseExerciseSingle, ExerciseFeedback } from '../../schema';
import { CheckCircle, XCircle, ToggleLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface TrueFalseExerciseProps {
  exercise: TrueFalseExerciseSingle;
  onSubmit: (answer: boolean) => void;
  feedback: ExerciseFeedback | null;
  onReset: () => void;
  questionNumber: number;
}

export default function TrueFalseExerciseComponent({
  exercise,
  onSubmit,
  feedback,
  onReset,
  questionNumber,
}: TrueFalseExerciseProps) {
  // Auto-submit on button click
  const handleAnswer = (value: boolean) => {
    onSubmit(value);
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Statement section */}
      <div className="border bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <ToggleLeft className="h-5 w-5 text-blue-500" />
          <span className="font-medium text-sm">Question {questionNumber}: True or False</span>
        </div>
        <p className="text-sm">{exercise.statement}</p>
      </div>

      <div className="min-h-[100px]">
        {' '}
        {/* Fixed height container prevents layout shift */}
        <AnimatePresence mode="wait">
          {!feedback ? (
            <motion.div
              key="answer-buttons"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex justify-center gap-3"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-24 font-medium border-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                onClick={() => handleAnswer(true)}
              >
                True
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-24 font-medium border-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                onClick={() => handleAnswer(false)}
              >
                False
              </Button>
            </motion.div>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-7 px-2 text-xs"
                        onClick={onReset}
                      >
                        Try again
                      </Button>
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
