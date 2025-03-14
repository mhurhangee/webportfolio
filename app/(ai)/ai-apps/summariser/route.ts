import { NextRequest } from 'next/server';
import { generateObject } from 'ai';
import { APP_CONFIG } from './config';
import { summaryResponseSchema } from './schema';
import { runPreflightChecks } from '@/app/(ai)/lib/preflight-checks/preflight-checks';
import { getUserInfo } from '../../lib/user-identification';
import { createApiHandler, createApiError } from '@/app/(ai)/lib/error-handling/api-error-handler';
import { logger } from '@/app/(ai)/lib/error-handling/logger';

export const runtime = 'edge';

async function handler(req: NextRequest) {
  try {
    // Get request information for context
    const { userId, ip, userAgent } = await getUserInfo(req);
    const requestId = req.headers.get('X-Request-ID') || 'unknown';
    const requestContext = {
      path: req.nextUrl.pathname,
      method: req.method,
      userId,
      ip,
      userAgent,
      requestId,
    };

    // Log the start of request processing
    logger.info('Starting summariser request processing', requestContext);

    // Extract the request body
    const { summaryType, userPrompt } = await req.json();

    // Log the incoming request with prompt details
    logger.info('Processing summariser request', {
      ...requestContext,
      summaryType,
      promptLength: userPrompt?.length,
      promptPreview: userPrompt
        ? userPrompt.substring(0, 50) + (userPrompt.length > 50 ? '...' : '')
        : 'empty',
    });

    // Input validation
    if (!userPrompt || typeof userPrompt !== 'string') {
      logger.warn('Invalid prompt format', {
        ...requestContext,
        promptType: typeof userPrompt,
      });

      throw createApiError('validation_error', 'Missing or invalid prompt parameter', 'error', {
        promptType: typeof userPrompt,
      });
    }

    if (userPrompt.trim() === '') {
      logger.warn('Empty prompt string', requestContext);

      throw createApiError('validation_error', 'Prompt cannot be empty', 'error');
    }

    // Run preflight checks
    logger.debug('Running preflight checks', requestContext);

    // Run preflight checks with full user context
    const preflightResult = await runPreflightChecks(userId, userPrompt, ip, userAgent);

    // Log the results of preflight checks
    logger.info('Preflight check results', {
      ...requestContext,
      passed: preflightResult.passed,
      failedCheck: preflightResult.failedCheck,
      executionTimeMs: preflightResult.executionTimeMs,
    });

    // If preflight checks fail, throw a structured error
    if (!preflightResult.passed && preflightResult.result) {
      const { code, message, severity, details } = preflightResult.result;

      logger.warn(`Preflight check failed: ${code}`, {
        ...requestContext,
        message,
        severity,
        details,
      });

      throw createApiError(code, message, severity, details);
    }

    // Prepare the prompt based on summary type
    let summaryPrompt = '';

    if (summaryType === 'outline') {
      summaryPrompt +=
        'Generate a summary of the following text in an outline format. Use markdown headings to and bullet points to represent the main points.';
    } else if (summaryType === 'executive-summary') {
      summaryPrompt += 'Generate a summary of the following text in an executive summary format.';
    } else if (summaryType === 'single-sentence') {
      summaryPrompt += 'Generate a summary of the following text in a single sentence.';
    } else {
      summaryPrompt += 'Generate a summary of the following text.';
    }

    summaryPrompt += `\n\nText: ${userPrompt}`;

    // Log that we're calling the AI service
    logger.info('Calling AI service for summary generation', {
      ...requestContext,
      model: APP_CONFIG.model,
      summaryType,
      temperature: APP_CONFIG.temperature,
      maxTokens: APP_CONFIG.maxTokens,
    });

    // Generate the object (non-streaming)
    const result = await generateObject({
      model: APP_CONFIG.model,
      system: APP_CONFIG.systemPrompt,
      schema: summaryResponseSchema,
      prompt: summaryPrompt,
      temperature: APP_CONFIG.temperature,
      maxTokens: APP_CONFIG.maxTokens,
    });

    // Log successful completion
    logger.info('Successfully processed summary request', {
      ...requestContext,
      status: 'completed',
    });

    // Return the result as JSON
    return Response.json(result.object);
  } catch (error) {
    // Error will be handled by the createApiHandler wrapper
    throw error;
  }
}

// Export the wrapped handler with automatic log flushing and error handling
export const POST = createApiHandler(handler);
