import { multipleChoiceExerciseGroup } from '../schema';
import { generateObject } from 'ai';
import { APP_CONFIG } from '../config';
import { createApiError } from '@/app/(ai)/lib/error-handling/api-error-handler';
import { logger } from '@/app/(ai)/lib/error-handling/logger';

// Generate multiple-choice exercises
export async function generateMultipleChoiceExercises(exercisePrompt: string, requestId?: string) {
  const logContext = {
    function: 'generateMultipleChoiceExercises',
    promptLength: exercisePrompt?.length || 0,
    requestId,
  };

  logger.info('Starting multiple-choice exercise generation', logContext);

  if (!exercisePrompt?.trim()) {
    logger.warn('Empty exercise prompt provided', logContext);
    return []; // Return empty array instead of throwing to allow other exercise types to work
  }

  const promptText = `
      Generate 1 or 2 multiple-choice exercises about ${exercisePrompt}.
      
      Each exercise should:
      1. Include 4 plausible options
      2. Specify which option is correct (using correctOptionIndex, starting from 0)
  
      Your response MUST BE in JSON format according to the schema.
    `;

  try {
    logger.info('Generating multiple-choice exercises with AI', {
      ...logContext,
      model: APP_CONFIG.model,
      temperature: APP_CONFIG.temperature,
    });

    const result = await generateObject({
      model: APP_CONFIG.model,
      system: APP_CONFIG.systemPrompt,
      schema: multipleChoiceExerciseGroup,
      prompt: promptText,
      temperature: APP_CONFIG.temperature,
      maxTokens: APP_CONFIG.maxTokens,
    });

    // Make sure we handle the result properly
    if (!result || !result.object) {
      logger.warn('Empty multiple-choice generation result', logContext);
      return [];
    }

    const exercises = result.object.exercises || [];

    logger.info('Successfully generated multiple-choice exercises', {
      ...logContext,
      count: exercises.length,
    });

    return exercises;
  } catch (error) {
    logger.error('Error generating multiple-choice exercises', {
      ...logContext,
      error: error instanceof Error ? error.message : String(error),
    });

    // Return empty array instead of throwing to allow other exercise types to work
    return [];
  }
}
