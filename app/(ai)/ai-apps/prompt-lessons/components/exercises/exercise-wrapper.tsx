// For exercise-wrapper.tsx
'use client';

import { useState } from 'react';
import {
  ExerciseFeedback,
  MultipleChoiceSingle,
  MultipleChoiceExerciseGroup,
  TrueFalseExerciseSingle,
  TrueFalseExerciseGroup,
  FillInBlankSingle,
  FillInBlankExerciseGroup,
  ImproveExerciseSingle,
  ImproveExerciseGroup,
  ConstructExerciseSingle,
  ConstructExerciseGroup,
} from '../../schema';
import TrueFalseExerciseComponent from './true-false-exercise';
import MultipleChoiceExerciseComponent from './multiple-choice-exercise';
import FillInBlankExerciseComponent from './fill-blank-exercise';
import ImproveExerciseComponent from './improve-exercise';
import ConstructExerciseComponent from './construct-exercise';
import { useErrorHandler } from '@/app/(ai)/lib/error-handling/client-error-handler';
import { toastSuccess } from '@/app/(ai)/lib/error-handling/toast-manager';

export interface ExerciseWrapperProps {
  exercise:
    | TrueFalseExerciseSingle
    | MultipleChoiceSingle
    | FillInBlankSingle
    | TrueFalseExerciseGroup
    | MultipleChoiceExerciseGroup
    | FillInBlankExerciseGroup
    | ImproveExerciseSingle
    | ImproveExerciseGroup
    | ConstructExerciseSingle
    | ConstructExerciseGroup;
  questionNumber: number;
}

export default function ExerciseWrapper({ exercise, questionNumber }: ExerciseWrapperProps) {
  const [feedback, setFeedback] = useState<ExerciseFeedback | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const { error, handleError, clearError } = useErrorHandler('ExerciseWrapper');

  // Extract the first exercise from the array if it exists
  const exerciseItem = 'exercises' in exercise ? exercise.exercises[0] : exercise;

  // Handle answer submission for true/false exercises
  const handleTrueFalseSubmit = (answer: boolean) => {
    const typedExercise = exerciseItem as TrueFalseExerciseSingle;
    const isCorrect = answer === typedExercise.isTrue;

    setFeedback({
      isCorrect,
      feedback: isCorrect
        ? 'Correct! You understand this concept well.'
        : 'Incorrect. Review the explanation to better understand this concept.',
    });

    if (isCorrect) {
      toastSuccess('Correct answer!');
    }
  };

  // Handle answer submission for multiple-choice exercises
  const handleMultipleChoiceSubmit = (selectedIndex: number) => {
    const typedExercise = exerciseItem as MultipleChoiceSingle;
    const isCorrect = selectedIndex === typedExercise.correctOptionIndex;

    setFeedback({
      isCorrect,
      feedback: isCorrect
        ? 'Correct! You selected the right answer.'
        : `Incorrect. The correct answer was: ${typedExercise.options[typedExercise.correctOptionIndex]}`,
    });

    if (isCorrect) {
      toastSuccess('Correct answer!');
    }
  };

  // Add this function to handle fill-in-blank submissions
  const handleFillInBlankSubmit = (answer: string) => {
    const typedExercise = exerciseItem as FillInBlankSingle;

    // Simple exact match check
    const isCorrect = answer.toLowerCase() === typedExercise.correctAnswer.toLowerCase();

    setFeedback({
      isCorrect,
      feedback: isCorrect
        ? 'Correct! You filled in the blank correctly.'
        : 'Incorrect. Try looking at the explanation to understand the right answer.',
    });

    if (isCorrect) {
      toastSuccess('Correct answer!');
    }
  };

  // Handle submission for improve exercises - requires AI evaluation
  const handleImproveSubmit = async (improvement: string) => {
    setIsEvaluating(true);
    clearError();

    try {
      const typedExercise = exerciseItem as ImproveExerciseSingle;

      // Call the API to evaluate the improvement
      const response = await fetch('/api/ai/prompt-lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'evaluateImprovement',
          original: typedExercise.promptToImprove,
          improvement: improvement,
          criteria: typedExercise.criteria,
          sampleImprovement: typedExercise.sampleImprovement,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          JSON.stringify(errorData.error || { message: 'Failed to evaluate improvement' })
        );
      }

      const evalResult = await response.json();

      setFeedback({
        isCorrect: evalResult.isGoodImprovement,
        feedback: evalResult.feedback,
        suggestedImprovement: evalResult.isGoodImprovement ? null : evalResult.suggestedImprovement,
      });

      if (evalResult.isGoodImprovement) {
        toastSuccess('Great job! Your improvement meets the criteria.');
      }
    } catch (err) {
      handleError(err);

      setFeedback({
        isCorrect: false,
        feedback:
          error?.message ||
          'We encountered an error evaluating your improvement. Please try again.',
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // Handle submission for construct exercises - uses the same evaluation backend
  const handleConstructSubmit = async (construction: string) => {
    setIsEvaluating(true);
    clearError();

    try {
      const typedExercise = exerciseItem as ConstructExerciseSingle;

      // Call the API to evaluate the constructed prompt
      const response = await fetch('/api/ai/prompt-lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'evaluateConstruction',
          task: typedExercise.task,
          scenario: typedExercise.scenario,
          construction: construction,
          criteria: typedExercise.criteria,
          sampleSolution: typedExercise.sampleSolution,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          JSON.stringify(errorData.error || { message: 'Failed to evaluate constructed prompt' })
        );
      }

      const evalResult = await response.json();

      setFeedback({
        isCorrect: evalResult.isGoodImprovement,
        feedback: evalResult.feedback,
        suggestedImprovement: evalResult.isGoodImprovement ? null : evalResult.suggestedImprovement,
      });

      if (evalResult.isGoodImprovement) {
        toastSuccess('Great job! Your prompt meets the criteria.');
      }
    } catch (err) {
      handleError(err);

      setFeedback({
        isCorrect: false,
        feedback:
          error?.message || 'We encountered an error evaluating your prompt. Please try again.',
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // Reset feedback to allow retrying
  const resetFeedback = () => {
    setFeedback(null);
    clearError();
  };

  return (
    <div>
      {error && (
        <div className="p-3 mb-4 text-sm border border-red-200 bg-red-50 text-red-700 rounded-md dark:bg-red-950/30 dark:border-red-900 dark:text-red-400">
          {error.message}
        </div>
      )}

      {exerciseItem?.type === 'true-false' && (
        <TrueFalseExerciseComponent
          exercise={exerciseItem as TrueFalseExerciseSingle}
          onSubmit={handleTrueFalseSubmit}
          feedback={feedback}
          onReset={resetFeedback}
          questionNumber={questionNumber}
        />
      )}

      {exerciseItem?.type === 'multiple-choice' && (
        <MultipleChoiceExerciseComponent
          exercise={exerciseItem as MultipleChoiceSingle}
          onSubmit={handleMultipleChoiceSubmit}
          feedback={feedback}
          onReset={resetFeedback}
          questionNumber={questionNumber}
        />
      )}

      {exerciseItem?.type === 'fill-in-blank' && (
        <FillInBlankExerciseComponent
          exercise={exerciseItem as FillInBlankSingle}
          onSubmit={handleFillInBlankSubmit}
          feedback={feedback}
          onReset={resetFeedback}
          questionNumber={questionNumber}
        />
      )}

      {exerciseItem?.type === 'improve' && (
        <ImproveExerciseComponent
          exercise={exerciseItem as ImproveExerciseSingle}
          onSubmit={handleImproveSubmit}
          feedback={feedback}
          onReset={resetFeedback}
          questionNumber={questionNumber}
        />
      )}

      {exerciseItem?.type === 'construct' && (
        <ConstructExerciseComponent
          exercise={exerciseItem as ConstructExerciseSingle}
          onSubmit={handleConstructSubmit}
          feedback={feedback}
          onReset={resetFeedback}
          questionNumber={questionNumber}
        />
      )}
    </div>
  );
}
