import { APP_CONFIG } from '../config';
import { lessons } from '../lessons/lesson-data';
import { validateSchema } from '../utils';
import { lessonContentSchema } from '../schema';
import { generateObject } from 'ai';
import { createApiError } from '@/app/(ai)/lib/error-handling/api-error-handler';
import { logger } from '@/app/(ai)/lib/error-handling/logger';

export const generateLessonWithRetries = async (
  lessonId: string,
  requestId?: string
): Promise<any> => {
  const logContext = {
    function: 'generateLessonWithRetries',
    lessonId,
    requestId,
  };

  // Log the start of lesson generation
  logger.info('Starting lesson generation', logContext);

  // Find the lesson in our data
  const lesson = lessons.find((l) => l.id === lessonId);
  if (!lesson) {
    logger.warn('Lesson not found', {
      ...logContext,
      availableLessons: lessons.map((l) => l.id).join(', '),
    });

    throw createApiError('lesson_not_found', `Lesson with ID "${lessonId}" not found`, 'error', {
      lessonId,
    });
  }

  logger.info('Found lesson, preparing prompt', {
    ...logContext,
    lessonTitle: lesson.title,
    lessonTopic: lesson.topic,
    difficulty: lesson.difficulty,
  });

  const promptText =
    APP_CONFIG.systemPrompt +
    `
      # Task
      To help teach users about AI topics, by generating lesson content about the topic: "${lesson.topic}", for a lesson titled: "${lesson.title}", with the teaching goal being: "${lesson.description}". The lesson content should match the lesson difficulty: "${lesson.difficulty}".
      
      This lesson will be part of a series of lessons, so the lesson content should really focus on and be very detailed about ${lesson.topic}.

      The length of your lesson content and examples you give should be suitable for the lesson difficulty: "${lesson.difficulty}".  I.e. for advanced content provide longer explanations and give longer and more complex examples.
      `;

  const maxRetries = APP_CONFIG.validationRetries || 1;
  let attempt = 0;
  let lastError = null;

  logger.info('Starting generation attempts', {
    ...logContext,
    maxRetries,
    model: APP_CONFIG.model,
    temperature: APP_CONFIG.temperature,
  });

  while (attempt < maxRetries) {
    attempt++;

    logger.info('Attempt to generate lesson content', {
      ...logContext,
      attempt,
      maxRetries,
    });

    try {
      const result = await generateObject({
        model: APP_CONFIG.model,
        system: APP_CONFIG.systemPrompt,
        schema: lessonContentSchema,
        prompt: promptText,
        temperature: APP_CONFIG.temperature,
        maxTokens: APP_CONFIG.maxTokens,
      });

      if (!result || !result.object) {
        lastError = new Error('Empty generation result');
        logger.warn('Empty generation result', {
          ...logContext,
          attempt,
        });
        continue;
      }

      const validation = validateSchema(lessonContentSchema, result.object);
      if (!validation.isValid) {
        lastError = new Error(`Validation failed: ${validation.errors.join(', ')}`);
        logger.warn('Validation failed for generated content', {
          ...logContext,
          attempt,
          errors: validation.errors,
        });
        continue;
      }

      logger.info('Successfully generated lesson content', {
        ...logContext,
        attempt,
        status: 'success',
      });

      return {
        lesson: lesson,
        content: result.object,
      };
    } catch (error: unknown) {
      lastError = error;
      logger.error('Error during lesson generation', {
        ...logContext,
        attempt,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  logger.error('Failed to generate lesson content after multiple attempts', {
    ...logContext,
    attempts: attempt,
    lastError: lastError instanceof Error ? lastError.message : String(lastError),
  });

  throw createApiError(
    'lesson_generation_failed',
    lastError instanceof Error
      ? lastError.message
      : 'Failed to generate lesson content after multiple attempts',
    'error',
    { lessonId, attempts: attempt }
  );
};
