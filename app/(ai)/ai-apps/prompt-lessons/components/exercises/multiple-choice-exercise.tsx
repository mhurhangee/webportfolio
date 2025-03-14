'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MultipleChoiceSingle, ExerciseFeedback } from '../../schema';
import { CheckCircle, XCircle, ListChecks } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface MultipleChoiceExerciseProps {
  exercise: MultipleChoiceSingle;
  onSubmit: (selectedIndex: number) => void;
  feedback: ExerciseFeedback | null;
  onReset: () => void;
  questionNumber: number;
}

export default function MultipleChoiceExerciseComponent({
  exercise,
  onSubmit,
  feedback,
  onReset,
  questionNumber,
}: MultipleChoiceExerciseProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Auto-submit when an option is selected
  const handleOptionSelect = (value: string) => {
    const optionIndex = parseInt(value);
    setSelectedOption(optionIndex);
    onSubmit(optionIndex);
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Question section */}
      <div className="border bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <ListChecks className="h-5 w-5 text-indigo-500" />
          <span className="font-medium text-sm">Question {questionNumber}: Multiple Choice</span>
        </div>
        <p className="text-sm">{exercise.question}</p>
      </div>

      {/* Fixed height container to prevent layout shift */}
      <div className="min-h-[180px]">
        <AnimatePresence mode="wait">
          {!feedback ? (
            <motion.div
              key="options"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <RadioGroup
                value={selectedOption !== null ? selectedOption.toString() : undefined}
                onValueChange={handleOptionSelect}
                className="space-y-2"
              >
                {exercise.options.map((option, index) => (
                  <motion.div
                    key={`option-${questionNumber}-${index}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: index * 0.05 },
                    }}
                    className="border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden"
                  >
                    <div className="flex items-center p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <RadioGroupItem
                        value={index.toString()}
                        id={`option-${questionNumber}-${index}`}
                        className="ml-1 mr-3"
                      />
                      <Label
                        htmlFor={`option-${questionNumber}-${index}`}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        {option}
                      </Label>
                    </div>
                  </motion.div>
                ))}
              </RadioGroup>
            </motion.div>
          ) : (
            <motion.div
              key="feedback"
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
