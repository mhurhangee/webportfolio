import { generateObject } from 'ai';
import { APP_CONFIG } from '../config';
import { trueFalseExerciseGroup } from '../schema';
import { logger } from '@/app/(ai)/lib/error-handling/logger';

// Generate true/false exercises
export async function generateTrueFalseExercises(exercisePrompt: string, requestId?: string) {
  const logContext = {
    function: 'generateTrueFalseExercises',
    promptLength: exercisePrompt?.length || 0,
    requestId,
  };

  logger.info('Starting true/false exercise generation', logContext);

  if (!exercisePrompt?.trim()) {
    logger.warn('Empty exercise prompt provided', logContext);
    return []; // Return empty array instead of throwing to allow other exercise types to work
  }

  const promptText = `
      Generate 1 or 2 true/false exercises about the following topic. 

      ${exercisePrompt}
      
      Each exercise should:
      1. Have a clear statement that can be evaluated as true or false
      2. Include whether the statement is actually true or false
      3. Be relevant to the topic
      
      Make approximately half of the exercises true and half false.
  
      Your response MUST BE in JSON format according to the schema.
    `;

  try {
    logger.info('Generating true/false exercises with AI', {
      ...logContext,
      model: APP_CONFIG.model,
      temperature: APP_CONFIG.temperature,
    });

    const result = await generateObject({
      model: APP_CONFIG.model,
      system: APP_CONFIG.systemPrompt,
      schema: trueFalseExerciseGroup,
      prompt: promptText,
      temperature: APP_CONFIG.temperature,
      maxTokens: APP_CONFIG.maxTokens,
    });

    // Make sure we handle the result properly
    if (!result || !result.object) {
      logger.warn('Empty true/false generation result', logContext);
      return [];
    }

    const exercises = result.object.exercises || [];

    logger.info('Successfully generated true/false exercises', {
      ...logContext,
      count: exercises.length,
    });

    return exercises;
  } catch (error) {
    logger.error('Error generating true/false exercises', {
      ...logContext,
      error: error instanceof Error ? error.message : String(error),
    });

    // Return empty array instead of throwing to allow other exercise types to work
    return [];
  }
}
