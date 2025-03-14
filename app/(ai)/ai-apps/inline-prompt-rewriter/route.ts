import { generateText } from 'ai';
import { runPreflightChecks } from '@/app/(ai)/lib/preflight-checks/preflight-checks';
import { NextRequest } from 'next/server';
import { APP_CONFIG } from './config';
import { getUserInfo } from '../../lib/user-identification';
import { createApiHandler, createApiError } from '@/app/(ai)/lib/error-handling/api-error-handler';
import { logger } from '@/app/(ai)/lib/error-handling/logger';

export const runtime = 'edge';
export const maxDuration = 60;

async function handler(req: NextRequest) {
  try {
    // Get user information from request including ID, IP, and user agent
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
    logger.info('Starting inline prompt rewriter request processing', requestContext);

    // Extract the request body
    const { prompt, action } = await req.json();

    // Log the incoming request with prompt details
    logger.info('Processing inline prompt rewriter request', {
      ...requestContext,
      action,
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

    // Determine system prompt based on action
    let systemPrompt = '';
    if (action === 'improve') {
      systemPrompt += APP_CONFIG.systemPrompt;
    } else if (action === 'generate') {
      systemPrompt += 'You are a helpful assistant.';
    } else {
      logger.warn('Invalid action specified', {
        ...requestContext,
        action,
      });

      throw createApiError('validation_error', 'Invalid action specified', 'error', { action });
    }

    // Log that we're calling the AI service
    logger.info('Calling AI service for prompt rewriting', {
      ...requestContext,
      model: APP_CONFIG.model,
      action,
      temperature: APP_CONFIG.temperature,
      maxTokens: APP_CONFIG.maxTokens,
    });

    // If all checks pass, call the AI service
    const result = await generateText({
      model: APP_CONFIG.model,
      system: systemPrompt,
      prompt,
      temperature: APP_CONFIG.temperature,
      maxTokens: APP_CONFIG.maxTokens,
    });

    // Log successful completion
    logger.info('Successfully processed inline prompt rewriter request', {
      ...requestContext,
      status: 'completed',
      action,
      responseLength: result.text.length,
    });

    return Response.json({ text: result.text });
  } catch (error) {
    // Error will be handled by the createApiHandler wrapper
    throw error;
  }
}

// Export the wrapped handler with automatic log flushing and error handling
export const POST = createApiHandler(handler);
