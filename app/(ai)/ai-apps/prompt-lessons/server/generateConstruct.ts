import { constructExerciseGroup } from '../schema';
import { generateObject } from 'ai';
import { APP_CONFIG } from '../config';
import { logger } from '@/app/(ai)/lib/error-handling/logger';

// Generate construct exercises
export async function generateConstructExercises(exercisePrompt: string, requestId?: string) {
  const logContext = {
    function: 'generateConstructExercises',
    promptLength: exercisePrompt?.length || 0,
    requestId,
  };

  logger.info('Starting construct exercise generation', logContext);

  if (!exercisePrompt?.trim()) {
    logger.warn('Empty exercise prompt provided', logContext);
    return []; // Return empty array instead of throwing to allow other exercise types to work
  }

  const promptText = `
    Generate 1 construct exercise about the following topic:
    
    ${exercisePrompt}
    
    The exercise should:
    1. Include a clear task for what kind of prompt the user needs to create
    2. Provide a scenario or context in which this prompt would be used
    3. Include evaluation criteria (3-5 points) that will be used to assess the constructed prompt
    4. Optionally include a sample well-constructed prompt for reference
    
    Make the exercise relevant to the topic and focused on important prompt engineering concepts.
  `;

  try {
    logger.info('Generating construct exercises with AI', {
      ...logContext,
      model: APP_CONFIG.model,
      temperature: APP_CONFIG.temperature,
    });

    const result = await generateObject({
      model: APP_CONFIG.model,
      system: APP_CONFIG.systemPrompt,
      schema: constructExerciseGroup,
      prompt: promptText,
      temperature: APP_CONFIG.temperature,
      maxTokens: APP_CONFIG.maxTokens,
    });

    // Make sure we handle the result properly
    if (!result || !result.object) {
      logger.warn('Empty construct generation result', logContext);
      return [];
    }

    const exercises = result.object.exercises || [];

    logger.info('Successfully generated construct exercises', {
      ...logContext,
      count: exercises.length,
    });

    return exercises;
  } catch (error) {
    logger.error('Error generating construct exercises', {
      ...logContext,
      error: error instanceof Error ? error.message : String(error),
    });

    // Return empty array instead of throwing to allow other exercise types to work
    return [];
  }
}
