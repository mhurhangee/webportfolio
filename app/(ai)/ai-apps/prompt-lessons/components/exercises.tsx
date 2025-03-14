'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ExerciseWrapper from './exercises/exercise-wrapper';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useErrorHandler } from '@/app/(ai)/lib/error-handling/client-error-handler';
import { toastSuccess } from '@/app/(ai)/lib/error-handling/toast-manager';

interface ExercisesProps {
  exercisePrompt: string;
  topic: string;
}

export default function Exercises({ exercisePrompt, topic }: ExercisesProps) {
  const [exercises, setExercises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { error, handleError, clearError } = useErrorHandler('ExercisesComponent');

  // Generate exercises
  const handleGenerateExercises = async () => {
    setIsLoading(true);
    clearError();

    try {
      const response = await fetch('/api/ai/prompt-lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generateExercises',
          exercisePrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          JSON.stringify(errorData.error || { message: 'Failed to generate exercises' })
        );
      }

      const data = await response.json();

      // Ensure we have exercises
      if (!data || !Array.isArray(data.exercises) || data.exercises.length === 0) {
        throw new Error(
          JSON.stringify({
            code: 'no_exercises_generated',
            message: 'No exercises were generated',
            severity: 'error',
          })
        );
      }

      setExercises(data.exercises);
      toastSuccess(`Generated ${data.exercises.length} exercises for ${topic}`);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Practice Exercises</h3>

        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateExercises}
          disabled={isLoading}
          className="relative group transition-all border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : exercises.length === 0 ? (
            <>Generate Exercises</>
          ) : (
            <>Try Different Exercises</>
          )}
          <span className="absolute -inset-0.5 -z-10 rounded-lg bg-gradient-to-b from-[#e9ecef] via-[#dee2e6] to-[#e9ecef] opacity-0 dark:from-[#0d1117] dark:via-[#161b22] dark:to-[#0d1117] group-hover:opacity-100 transition-opacity"></span>
        </Button>
      </div>

      {error && (
        <div className="p-3 text-sm border border-red-200 bg-red-50 text-red-700 rounded-md dark:bg-red-950/30 dark:border-red-900 dark:text-red-400">
          {error.message}
        </div>
      )}

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <ExerciseSkeleton />
            <ExerciseSkeleton />
          </motion.div>
        ) : exercises.length > 0 ? (
          <motion.div
            key="exercises"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {exercises.map((exercise, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: index * 0.1 },
                }}
              >
                <ExerciseWrapper exercise={exercise} questionNumber={index + 1} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-8 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Generate exercises to test your understanding of{' '}
              <span className="font-medium text-foreground">{topic}</span>.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExerciseSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-32 w-full rounded-md" />
      <div className="flex justify-center space-x-2">
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>
  );
}
