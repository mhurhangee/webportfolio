// For generateExercise.ts
import { generateMultipleChoiceExercises } from './generateMultipleChoice';
import { generateTrueFalseExercises } from './generateTrueFalse';
import { generateFillInBlankExercises } from './generateFillBlank';
import { generateImproveExercises } from './generateImprove';
import { generateConstructExercises } from './generateConstruct';
import { createApiError } from '@/app/(ai)/lib/error-handling/api-error-handler';
import { logger } from '@/app/(ai)/lib/error-handling/logger';

// Define a type for all exercise types
type Exercise = {
  type: string;
  [key: string]: any;
};

// Define a type for the result of Promise.allSettled
type ExerciseResult = PromiseSettledResult<Exercise[]>;

// Function to generate exercises focusing on true/false and multiple-choice
export const generateExercise = async (
  exercisePrompt: string,
  requestId?: string
): Promise<{ exercises: Exercise[] }> => {
  const logContext = {
    function: 'generateExercise',
    promptLength: exercisePrompt?.length || 0,
    requestId,
  };

  logger.info('Starting exercise generation', logContext);

  if (!exercisePrompt?.trim()) {
    logger.warn('Empty exercise prompt provided', logContext);
    throw createApiError('validation_error', 'Exercise prompt is required', 'error');
  }

  try {
    logger.info('Generating different exercise types', logContext);

    const exerciseTypes = [
      { type: 'true/false', generator: generateTrueFalseExercises },
      { type: 'multiple-choice', generator: generateMultipleChoiceExercises },
      { type: 'fill-in-blank', generator: generateFillInBlankExercises },
      { type: 'improve', generator: generateImproveExercises },
      { type: 'construct', generator: generateConstructExercises },
    ];

    const exerciseResults: ExerciseResult[] = await Promise.allSettled(
      exerciseTypes.map(({ type, generator }) =>
        generator(exercisePrompt, requestId).catch((error) => {
          logger.warn(`Failed to generate ${type} exercises`, {
            ...logContext,
            exerciseType: type,
            error: error instanceof Error ? error.message : String(error),
          });
          return [] as Exercise[]; // Return empty array on failure for this type with explicit type
        })
      )
    );

    // Extract successful results with proper typing
    const allExercises = exerciseResults.flatMap((result) =>
      result.status === 'fulfilled' ? result.value : []
    );

    logger.info('Exercise generation completed', {
      ...logContext,
      exerciseCount: allExercises.length,
      typeResults: exerciseTypes.map((type, index) => {
        const result = exerciseResults[index];
        return {
          type: type.type,
          success: result?.status === 'fulfilled',
          count: result?.status === 'fulfilled' ? (result as any).value?.length || 0 : 0,
        };
      }),
    });

    if (allExercises.length === 0) {
      logger.error('No exercises were generated', logContext);
      throw createApiError(
        'exercise_generation_failed',
        'Failed to generate any exercises',
        'error'
      );
    }

    // Combine and return
    return {
      exercises: allExercises,
    };
  } catch (error: any) {
    if (error.code && error.message) {
      // This is already a structured error from createApiError
      logger.error('Exercise generation failed with structured error', {
        ...logContext,
        errorCode: error.code,
        errorMessage: error.message,
      });
      throw error;
    }

    logger.error('Exercise generation failed', {
      ...logContext,
      error: error instanceof Error ? error.message : String(error),
    });

    throw createApiError(
      'exercise_generation_failed',
      `Failed to generate exercises: ${error.message || 'Unknown error'}`,
      'error'
    );
  }
};
