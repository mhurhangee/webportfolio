import { NextRequest } from 'next/server';
import { generateObject } from 'ai';
import { APP_CONFIG } from './config';
import { keywordsExtractionSchema } from './schema';
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
    logger.info('Starting keyword extractor request processing', requestContext);

    // Extract the request body
    const { keywordType, userPrompt } = await req.json();

    // Log the incoming request with prompt details
    logger.info('Processing keyword extraction request', {
      ...requestContext,
      keywordType,
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

    // Log that we're calling the AI service
    logger.info('Calling AI service for keyword extraction', {
      ...requestContext,
      model: APP_CONFIG.model,
      keywordType,
      temperature: APP_CONFIG.temperature,
      maxTokens: APP_CONFIG.maxTokens,
    });

    // Generate the object (non-streaming)
    const result = await generateObject({
      model: APP_CONFIG.model,
      system: APP_CONFIG.systemPrompt,
      schema: keywordsExtractionSchema,
      prompt: `Focus on extracting ${keywordType} keywords from the following text: "${userPrompt}"`,
      temperature: APP_CONFIG.temperature,
      maxTokens: APP_CONFIG.maxTokens,
    });

    // Log successful completion
    logger.info('Successfully processed keyword extraction request', {
      ...requestContext,
      status: 'completed',
      keywordCount: result.object.keywords?.length || 0,
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
