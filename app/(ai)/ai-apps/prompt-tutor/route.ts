// File: /home/mjh/front/apps/web/app/(ai)/ai-apps/prompt-tutor/route.ts

import { NextRequest } from 'next/server';
import { generateObject } from 'ai';
import { APP_CONFIG } from './config';
import { tutorResponseSchema } from './schema';
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
    logger.info('Starting prompt tutor request processing', requestContext);

    // Extract the prompt string directly from the request body
    const prompt = await req.json();

    // Log the incoming request with prompt details
    logger.info('Processing prompt tutor request', {
      ...requestContext,
      promptLength: prompt?.length,
      promptPreview: prompt ? prompt.substring(0, 50) + (prompt.length > 50 ? '...' : '') : 'empty',
    });

    // Input validation
    if (!prompt || typeof prompt !== 'string') {
      logger.warn('Invalid prompt format', {
        ...requestContext,
        promptType: typeof prompt,
      });

      throw createApiError('validation_error', 'Missing or invalid prompt parameter', 'error', {
        promptType: typeof prompt,
      });
    }

    if (prompt.trim() === '') {
      logger.warn('Empty prompt string', requestContext);

      throw createApiError('validation_error', 'Prompt cannot be empty', 'error');
    }

    // Run preflight checks
    logger.debug('Running preflight checks', requestContext);

    // Run preflight checks with full user context
    const preflightResult = await runPreflightChecks(userId, prompt, ip, userAgent);

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
    logger.info('Calling AI service for prompt analysis', {
      ...requestContext,
      model: APP_CONFIG.model,
      temperature: APP_CONFIG.temperature,
      maxTokens: APP_CONFIG.maxTokens,
    });

    // If all checks pass, generate the object (non-streaming)
    const result = await generateObject({
      model: APP_CONFIG.model,
      system: APP_CONFIG.systemPrompt,
      schema: tutorResponseSchema,
      prompt: `Analyze this prompt and provide structured feedback to help the user improve their prompt writing skills: "${prompt}"`,
      temperature: APP_CONFIG.temperature,
      maxTokens: APP_CONFIG.maxTokens,
    });

    // Log successful completion
    logger.info('Successfully processed prompt tutor request', {
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
