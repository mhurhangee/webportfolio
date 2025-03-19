import { streamText } from 'ai';
import { runPreflightChecks } from '@/app/(ai)/lib/preflight-checks/preflight-checks';
import { NextRequest } from 'next/server';
import { APP_CONFIG, PREFLIGHT_CONFIG } from './config';
import { getUserInfo } from '../../lib/user-identification';
import { createApiHandler, createApiError } from '@/app/(ai)/lib/error-handling/api-error-handler';
import { logger } from '@/app/(ai)/lib/error-handling/logger';

export const runtime = 'edge';
export const maxDuration = 60;

// Handler function with request ID tracking
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

    // Log the start of request processing with request ID
    logger.info('Starting prompt rewriter request processing', requestContext);

    const { prompt } = await req.json();

    // Log the incoming request with prompt details
    logger.info('Processing prompt rewriter request', {
      ...requestContext,
      promptLength: prompt?.length,
      promptPreview: prompt ? prompt.substring(0, 50) + (prompt.length > 50 ? '...' : '') : 'empty',
    });

    // Run preflight checks with full context
    logger.debug('Running preflight checks', requestContext);

    const preflightResult = await runPreflightChecks(
      userId,
      prompt,
      ip,
      userAgent,
      PREFLIGHT_CONFIG
    );

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
    logger.info('Calling AI service for prompt rewriting', {
      ...requestContext,
      model: APP_CONFIG.model,
      temperature: APP_CONFIG.temperature,
      maxTokens: APP_CONFIG.maxTokens,
    });

    // Call the AI service
    const result = await streamText({
      model: APP_CONFIG.model,
      system: APP_CONFIG.systemPrompt,
      prompt,
      temperature: APP_CONFIG.temperature,
      maxTokens: APP_CONFIG.maxTokens,
    });

    // Log successful completion
    logger.info('Successfully processed prompt rewrite request', {
      ...requestContext,
      status: 'completed',
    });

    return result.toDataStreamResponse();
  } catch (error) {
    // Error will be handled by the createApiHandler wrapper
    throw error;
  }
}

// Export the wrapped handler with automatic log flushing and error handling
export const POST = createApiHandler(handler);
