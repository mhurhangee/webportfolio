import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiError, createApiHandler } from '@/app/(ai)/lib/error-handling/api-error-handler';
import { generateObject } from 'ai';
import { logger } from '@/app/(ai)/lib/error-handling/logger';
import { APP_CONFIG, SUMMARY_SYSTEM_PROMPT, FEEDBACK_SYSTEM_PROMPT } from './config';
import { summaryResponseSchema, feedbackResponseSchema } from './schema';

// Input schema for the API
const inputSchema = z.object({
  text: z.string().min(1).max(10000),
});

// Handler for the API route
async function handler(req: NextRequest) {
  try {
    // Get the request body
    const body = await req.json();

    // Create a request context for logging
    const requestContext = {
      route: APP_CONFIG.apiRoute,
      timestamp: new Date().toISOString(),
    };

    // Log the request
    logger.info('Received accessibility analysis request', {
      ...requestContext,
    });

    // Validate the input
    const validationResult = inputSchema.safeParse(body);
    if (!validationResult.success) {
      const message = 'Invalid input';
      const details = validationResult.error.errors;
      logger.warn('Invalid input for accessibility analysis', {
        ...requestContext,
        details,
      });
      throw createApiError('bad_request', message, 'error', details);
    }

    const { text } = validationResult.data;

    // Preflight checks
    if (text.length < 10) {
      const message = 'Text is too short for meaningful analysis';
      const code = 'text_too_short';
      const severity = 'warning';
      logger.warn(message, {
        ...requestContext,
        textLength: text.length,
      });
      throw createApiError(code, message, severity);
    }

    if (text.length > 10000) {
      const message = 'Text is too long for analysis';
      const code = 'text_too_long';
      const severity = 'warning';
      logger.warn(message, {
        ...requestContext,
        textLength: text.length,
      });
      throw createApiError(code, message, severity);
    }

    // Log that we're calling the AI service
    logger.info('Calling AI service for accessibility analysis', {
      ...requestContext,
      model: APP_CONFIG.model,
      temperature: APP_CONFIG.temperature,
      maxTokens: APP_CONFIG.maxTokens,
    });

    try {
      // Step 1: Generate the summary
      logger.info('Generating summary scores', { ...requestContext });
      const summaryResult = await generateObject({
        model: APP_CONFIG.model,
        system: SUMMARY_SYSTEM_PROMPT,
        schema: summaryResponseSchema,
        prompt: `Analyze this text for accessibility, bias, readability, and clarity. Generate summary scores, overall feedback, strengths, and critical issues: "${text}"`,
        temperature: APP_CONFIG.temperature,
        maxTokens: 1000, // Smaller token limit for summary
      });
    
      // Step 2: Generate the detailed feedback
      logger.info('Generating detailed feedback', { ...requestContext });
      const feedbackResult = await generateObject({
        model: APP_CONFIG.model,
        system: FEEDBACK_SYSTEM_PROMPT,
        schema: feedbackResponseSchema,
        prompt: `Analyze this text for accessibility, bias, readability, and clarity. Provide detailed feedback with specific suggestions for improvement. For each issue you identify, include the EXACT text segment from the original text verbatim in the 'exactText' field - this is critical for accurate highlighting: "${text}"`,
        temperature: APP_CONFIG.temperature,
        maxTokens: APP_CONFIG.maxTokens,
      });

      // Combine the results
      const combinedResult = {
        summary: summaryResult.object.summary,
        feedback: feedbackResult.object.feedback,
      };

      // Log successful completion
      logger.info('Successfully processed accessibility analysis request', {
        ...requestContext,
        status: 'completed',
        summaryItems: 1,
        feedbackItems: feedbackResult.object.feedback.length,
      });

      // Return the combined result as JSON
      return Response.json(combinedResult);
    } catch (error) {
      logger.error('Error during AI service call', {
        ...requestContext,
        error: (error as Error).message,
      });
      throw createApiError('ai_service_error', 'Error analyzing text', 'error', {
        message: (error as Error).message,
      });
    }
  } catch (error) {
    // Error will be handled by the createApiHandler wrapper
    throw error;
  }
}

// Export the wrapped handler with automatic log flushing and error handling
export const POST = createApiHandler(handler);
