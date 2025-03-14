import { generateObject } from 'ai';
import { APP_CONFIG } from '../config';
import { evaluationResultSchema } from '../schema';
import { createApiError } from '@/app/(ai)/lib/error-handling/api-error-handler';
import { logger } from '@/app/(ai)/lib/error-handling/logger';

// Generate evaluation for improvement exercises
export async function generateEvaluation(
  original: string,
  improvement: string,
  sampleImprovement: string,
  criteria: string,
  requestId?: string
) {
  const logContext = {
    function: 'generateEvaluation',
    originalLength: original?.length || 0,
    improvementLength: improvement?.length || 0,
    hasSampleImprovement: !!sampleImprovement,
    requestId,
  };

  logger.info('Starting improvement evaluation', logContext);

  try {
    // Input validation
    if (!original?.trim()) {
      logger.warn('Missing original prompt', logContext);
      throw createApiError('validation_error', 'Original prompt is required', 'error');
    }

    if (!improvement?.trim()) {
      logger.warn('Missing improvement', logContext);
      throw createApiError('validation_error', 'Improvement is required', 'error');
    }

    if (!criteria) {
      logger.warn('Missing criteria', logContext);
      throw createApiError('validation_error', 'Evaluation criteria are required', 'error');
    }

    // Build the prompt for evaluation
    const criteriaText = Array.isArray(criteria)
      ? criteria.map((c) => `- ${c}`).join('\n')
      : `- ${criteria}`;

    const promptText = `
          I need you to evaluate a prompt improvement exercise.
          
          Original Prompt:
          "${original}"
          
          User's Improved Prompt:
          "${improvement}"
          
          ${
            sampleImprovement
              ? `Sample Improved Prompt (for reference):
          "${sampleImprovement}"`
              : ''
          }
          
          Evaluation Criteria:
          ${criteriaText}
          
          Please evaluate the user's improvement based on the criteria above.
          Determine:
          1. Whether the improvement is good enough (true/false)
          2. Provide specific feedback about the improvement, including strengths and weaknesses
          3. Suggest a better improvement if the user's version isn't good enough
        `;

    logger.info('Generating evaluation with AI', {
      ...logContext,
      model: APP_CONFIG.model,
      temperature: APP_CONFIG.temperature,
    });

    // Generate evaluation using generateObject
    const result = await generateObject({
      model: APP_CONFIG.model,
      system: APP_CONFIG.systemPrompt,
      schema: evaluationResultSchema,
      prompt: promptText,
      temperature: APP_CONFIG.temperature,
      maxTokens: APP_CONFIG.maxTokens,
    });

    // Make sure we handle the result properly
    if (!result || !result.object) {
      logger.error('Empty evaluation generation result', logContext);
      throw createApiError('evaluation_failed', 'Failed to generate evaluation result', 'error');
    }

    logger.info('Successfully generated evaluation', {
      ...logContext,
      isGoodImprovement: result.object.isGoodImprovement,
      feedbackLength: result.object.feedback?.length || 0,
    });

    return result.object;
  } catch (error: any) {
    if (error.code && error.message) {
      // This is already a structured error from createApiError
      logger.error('Evaluation failed with structured error', {
        ...logContext,
        errorCode: error.code,
        errorMessage: error.message,
      });
      throw error;
    }

    logger.error('Error generating evaluation', {
      ...logContext,
      error: error instanceof Error ? error.message : String(error),
    });

    throw createApiError(
      'evaluation_failed',
      error instanceof Error ? error.message : 'Failed to generate evaluation',
      'error'
    );
  }
}

// Generate evaluation for construction exercises
export async function generateConstructionEvaluation(
  task: string,
  scenario: string,
  construction: string,
  criteria: string[],
  sampleSolution?: string,
  requestId?: string
) {
  const logContext = {
    function: 'generateConstructionEvaluation',
    taskLength: task?.length || 0,
    scenarioLength: scenario?.length || 0,
    constructionLength: construction?.length || 0,
    criteriaCount: criteria?.length || 0,
    hasSampleSolution: !!sampleSolution,
    requestId,
  };

  logger.info('Starting construction evaluation', logContext);

  try {
    // Input validation
    if (!task?.trim()) {
      logger.warn('Missing task', logContext);
      throw createApiError('validation_error', 'Task is required', 'error');
    }

    if (!scenario?.trim()) {
      logger.warn('Missing scenario', logContext);
      throw createApiError('validation_error', 'Scenario is required', 'error');
    }

    if (!construction?.trim()) {
      logger.warn('Missing construction', logContext);
      throw createApiError('validation_error', 'Constructed prompt is required', 'error');
    }

    if (!criteria || !Array.isArray(criteria) || criteria.length === 0) {
      logger.warn('Missing criteria', logContext);
      throw createApiError('validation_error', 'Evaluation criteria are required', 'error');
    }

    // Build the prompt for evaluation
    const criteriaText = criteria.map((c) => `- ${c}`).join('\n');

    const promptText = `
          I need you to evaluate a prompt construction exercise.
          
          Task:
          "${task}"
          
          Scenario:
          "${scenario}"
          
          User's Constructed Prompt:
          "${construction}"
          
          ${
            sampleSolution
              ? `Sample Solution (for reference):
          "${sampleSolution}"`
              : ''
          }
          
          Evaluation Criteria:
          ${criteriaText}
          
          Please evaluate the user's constructed prompt based on the task, scenario, and criteria above.
          Determine:
          1. Whether the constructed prompt is good enough (true/false) - set this as isGoodImprovement
          2. Provide specific feedback about the construction, including strengths and weaknesses - set this as feedback
          3. Suggest a better prompt if the user's version isn't good enough - set this as suggestedImprovement
        `;

    logger.info('Generating construction evaluation with AI', {
      ...logContext,
      model: APP_CONFIG.model,
      temperature: APP_CONFIG.temperature,
    });

    // Generate evaluation using generateObject
    const result = await generateObject({
      model: APP_CONFIG.model,
      system: APP_CONFIG.systemPrompt,
      schema: evaluationResultSchema, // Reuse the same schema but interpret isGoodImprovement as isGoodConstruction
      prompt: promptText,
      temperature: APP_CONFIG.temperature,
      maxTokens: APP_CONFIG.maxTokens,
    });

    // Make sure we handle the result properly
    if (!result || !result.object) {
      logger.error('Empty construction evaluation result', logContext);
      throw createApiError(
        'evaluation_failed',
        'Failed to generate construction evaluation result',
        'error'
      );
    }

    logger.info('Successfully generated construction evaluation', {
      ...logContext,
      isGoodConstruction: result.object.isGoodImprovement,
      feedbackLength: result.object.feedback?.length || 0,
    });

    return result.object;
  } catch (error: any) {
    if (error.code && error.message) {
      // This is already a structured error from createApiError
      logger.error('Construction evaluation failed with structured error', {
        ...logContext,
        errorCode: error.code,
        errorMessage: error.message,
      });
      throw error;
    }

    logger.error('Error generating construction evaluation', {
      ...logContext,
      error: error instanceof Error ? error.message : String(error),
    });

    throw createApiError(
      'evaluation_failed',
      error instanceof Error ? error.message : 'Failed to generate construction evaluation',
      'error'
    );
  }
}
