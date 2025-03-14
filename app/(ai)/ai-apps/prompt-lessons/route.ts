import { NextRequest } from 'next/server';

import { generateLessonWithRetries } from './server/generateLesson';
import { generateExercise } from './server/generateExercise';
import { generateEvaluation, generateConstructionEvaluation } from './server/generateEvaluation';
import { createApiHandler, createApiError } from '@/app/(ai)/lib/error-handling/api-error-handler';
import { logger } from '@/app/(ai)/lib/error-handling/logger';
import { getUserInfo } from '@/app/(ai)/lib/user-identification';

export const runtime = 'edge';

async function handler(req: NextRequest) {
  try {
    // Get user information from request
    const { userId, ip, userAgent } = await getUserInfo(req);
    const requestId = req.headers.get('X-Request-ID') || 'unknown';

    // Create request context for logging
    const requestContext = {
      path: req.nextUrl.pathname,
      method: req.method,
      userId,
      ip,
      userAgent,
      requestId,
    };

    // Log the start of request processing
    logger.info('Starting prompt lessons request processing', requestContext);

    // Parse the request body
    const requestData = await req.json();
    const {
      action,
      lessonId,
      exercisePrompt,
      original,
      improvement,
      criteria,
      sampleImprovement,
      task,
      scenario,
      construction,
      sampleSolution,
    } = requestData;

    // Log the incoming request with details
    logger.info('Processing prompt lessons request', {
      ...requestContext,
      action,
      lessonId,
      hasExercisePrompt: !!exercisePrompt,
    });

    // Validate the action
    if (!action) {
      logger.warn('Missing action parameter', requestContext);
      throw createApiError('validation_error', 'Action is required', 'error');
    }

    if (action === 'getLesson') {
      // Validate lessonId
      if (!lessonId) {
        logger.warn('Missing lessonId parameter for getLesson action', requestContext);
        throw createApiError('validation_error', 'Lesson ID is required', 'error');
      }

      logger.info('Generating lesson content', {
        ...requestContext,
        lessonId,
      });

      try {
        const lessonData = await generateLessonWithRetries(lessonId);

        logger.info('Successfully generated lesson content', {
          ...requestContext,
          lessonId,
          status: 'completed',
        });

        return Response.json(lessonData);
      } catch (error: any) {
        logger.error('Error generating lesson content', {
          ...requestContext,
          lessonId,
          error: error.message,
        });

        throw createApiError(
          'lesson_generation_failed',
          error.message || 'Failed to generate lesson content',
          'error',
          { lessonId }
        );
      }
    } else if (action === 'generateExercises') {
      // Input validation for exercise generation
      if (!exercisePrompt) {
        logger.warn(
          'Missing exercisePrompt parameter for generateExercises action',
          requestContext
        );
        throw createApiError('validation_error', 'Exercise prompt is required', 'error');
      }

      logger.info('Generating exercises', {
        ...requestContext,
        promptLength: exercisePrompt.length,
      });

      try {
        const exerciseData = await generateExercise(exercisePrompt);

        logger.info('Successfully generated exercises', {
          ...requestContext,
          exerciseCount: exerciseData.exercises?.length || 0,
          status: 'completed',
        });

        return Response.json(exerciseData);
      } catch (error: any) {
        logger.error('Error generating exercises', {
          ...requestContext,
          error: error.message,
        });

        throw createApiError(
          'exercise_generation_failed',
          error.message || 'Failed to generate exercises',
          'error'
        );
      }
    } else if (action === 'evaluateImprovement') {
      // Input validation for improvement evaluation
      if (!original || !improvement || !criteria) {
        logger.warn('Missing parameters for evaluateImprovement action', {
          ...requestContext,
          hasOriginal: !!original,
          hasImprovement: !!improvement,
          hasCriteria: !!criteria,
        });

        throw createApiError(
          'validation_error',
          'Original prompt, improvement, and criteria are required',
          'error'
        );
      }

      logger.info('Evaluating improvement', {
        ...requestContext,
        originalLength: original.length,
        improvementLength: improvement.length,
      });

      try {
        const evaluationData = await generateEvaluation(
          original,
          improvement,
          sampleImprovement,
          criteria
        );

        logger.info('Successfully evaluated improvement', {
          ...requestContext,
          isGoodImprovement: evaluationData.isGoodImprovement,
          status: 'completed',
        });

        return Response.json(evaluationData);
      } catch (error: any) {
        logger.error('Error evaluating improvement', {
          ...requestContext,
          error: error.message,
        });

        throw createApiError(
          'evaluation_failed',
          error.message || 'Failed to evaluate improvement',
          'error'
        );
      }
    } else if (action === 'evaluateConstruction') {
      // Input validation for construction evaluation
      if (!task || !scenario || !construction || !criteria) {
        logger.warn('Missing parameters for evaluateConstruction action', {
          ...requestContext,
          hasTask: !!task,
          hasScenario: !!scenario,
          hasConstruction: !!construction,
          hasCriteria: !!criteria,
        });

        throw createApiError(
          'validation_error',
          'Task, scenario, constructed prompt, and criteria are required',
          'error'
        );
      }

      logger.info('Evaluating construction', {
        ...requestContext,
        taskLength: task.length,
        scenarioLength: scenario.length,
        constructionLength: construction.length,
      });

      try {
        // Ensure criteria is an array
        const criteriaArray = Array.isArray(criteria) ? criteria : [criteria];

        const evaluationData = await generateConstructionEvaluation(
          task,
          scenario,
          construction,
          criteriaArray,
          sampleSolution
        );

        logger.info('Successfully evaluated construction', {
          ...requestContext,
          isGoodConstruction: evaluationData.isGoodImprovement,
          status: 'completed',
        });

        return Response.json(evaluationData);
      } catch (error: any) {
        logger.error('Error evaluating construction', {
          ...requestContext,
          error: error.message,
        });

        throw createApiError(
          'evaluation_failed',
          error.message || 'Failed to evaluate constructed prompt',
          'error'
        );
      }
    } else {
      logger.warn('Unknown action requested', {
        ...requestContext,
        action,
      });

      throw createApiError('invalid_request', `Unknown action: ${action}`, 'error');
    }
  } catch (error) {
    // Error will be handled by the createApiHandler wrapper
    throw error;
  }
}

// Export the wrapped handler with automatic log flushing and error handling
export const POST = createApiHandler(handler);
