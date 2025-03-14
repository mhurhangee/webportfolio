import { improveExerciseGroup } from '../schema';
import { generateObject } from 'ai';
import { APP_CONFIG } from '../config';
import { logger } from '@/app/(ai)/lib/error-handling/logger';

// Generate improve exercises
export async function generateImproveExercises(exercisePrompt: string, requestId?: string) {
  const logContext = {
    function: 'generateImproveExercises',
    promptLength: exercisePrompt?.length || 0,
    requestId,
  };

  logger.info('Starting improve exercise generation', logContext);

  if (!exercisePrompt?.trim()) {
    logger.warn('Empty exercise prompt provided', logContext);
    return []; // Return empty array instead of throwing to allow other exercise types to work
  }

  const promptText = `
    Generate 1 improve exercise about the following topic:
    
    ${exercisePrompt}
    
    The exercise should:
    1. Include a prompt that needs improvement (this should be a mediocre or flawed prompt)
    2. Provide context explaining what aspects need improvement
    3. Include evaluation criteria (3-5 points) that will be used to assess the improvement
    4. Include a sample improved version for reference
    
    Make the exercise relevant to the topic and focused on important prompt engineering concepts.
  `;

  try {
    logger.info('Generating improve exercises with AI', {
      ...logContext,
      model: APP_CONFIG.model,
      temperature: APP_CONFIG.temperature,
    });

    const result = await generateObject({
      model: APP_CONFIG.model,
      system: APP_CONFIG.systemPrompt,
      schema: improveExerciseGroup,
      prompt: promptText,
      temperature: APP_CONFIG.temperature,
      maxTokens: APP_CONFIG.maxTokens,
    });

    // Make sure we handle the result properly
    if (!result || !result.object) {
      logger.warn('Empty improve generation result', logContext);
      return [];
    }

    const exercises = result.object.exercises || [];

    logger.info('Successfully generated improve exercises', {
      ...logContext,
      count: exercises.length,
    });

    return exercises;
  } catch (error) {
    logger.error('Error generating improve exercises', {
      ...logContext,
      error: error instanceof Error ? error.message : String(error),
    });

    // Return empty array instead of throwing to allow other exercise types to work
    return [];
  }
}
