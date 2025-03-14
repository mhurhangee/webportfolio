import { fillInBlankExerciseGroup } from '../schema';
import { generateObject } from 'ai';
import { APP_CONFIG } from '../config';
import { logger } from '@/app/(ai)/lib/error-handling/logger';

// Generate fill-in-blank exercises
export async function generateFillInBlankExercises(exercisePrompt: string, requestId?: string) {
  const logContext = {
    function: 'generateFillInBlankExercises',
    promptLength: exercisePrompt?.length || 0,
    requestId,
  };

  logger.info('Starting fill-in-blank exercise generation', logContext);

  if (!exercisePrompt?.trim()) {
    logger.warn('Empty exercise prompt provided', logContext);
    return []; // Return empty array instead of throwing to allow other exercise types to work
  }

  const promptText = `
      Generate 1 or 2 fill-in-blank exercises about ${exercisePrompt}.
      
      Each exercise should:
      1. Have a sentence with a [BLANK] placeholder where a key word or phrase should go
      2. Include the correct answer to fill in the blank
      3. Provide a clear explanation of why this is the correct answer
      4. Optionally include additional context to help understand the sentence
      
      Make the exercises relevant to the topic and focused on testing important concepts.
  
      Your response MUST BE in JSON format according to the schema.
    `;

  try {
    logger.info('Generating fill-in-blank exercises with AI', {
      ...logContext,
      model: APP_CONFIG.model,
      temperature: APP_CONFIG.temperature,
    });

    const result = await generateObject({
      model: APP_CONFIG.model,
      system: APP_CONFIG.systemPrompt,
      schema: fillInBlankExerciseGroup,
      prompt: promptText,
      temperature: APP_CONFIG.temperature,
      maxTokens: APP_CONFIG.maxTokens,
    });

    // Make sure we handle the result properly
    if (!result || !result.object) {
      logger.warn('Empty fill-in-blank generation result', logContext);
      return [];
    }

    const exercises = result.object.exercises || [];

    logger.info('Successfully generated fill-in-blank exercises', {
      ...logContext,
      count: exercises.length,
    });

    return exercises;
  } catch (error) {
    logger.error('Error generating fill-in-blank exercises', {
      ...logContext,
      error: error instanceof Error ? error.message : String(error),
    });

    // Return empty array instead of throwing to allow other exercise types to work
    return [];
  }
}
