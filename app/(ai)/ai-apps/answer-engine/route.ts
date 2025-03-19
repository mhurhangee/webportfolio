import { NextRequest } from 'next/server';
import { APP_CONFIG } from './config';
import { answerResponseSchema } from './schema';
import { runPreflightChecks } from '@/app/(ai)/lib/preflight-checks/preflight-checks';
import { getUserInfo } from '../../lib/user-identification';
import { createApiHandler, createApiError } from '@/app/(ai)/lib/error-handling/api-error-handler';
import { logger } from '@/app/(ai)/lib/error-handling/logger';
import Exa from 'exa-js';

export const runtime = 'edge';

// Get the API key from environment variables
const EXA_API_KEY = process.env.EXA_API_KEY || '';

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
    logger.info('Starting answer-engine request processing', requestContext);

    // Extract the request body
    const { question } = await req.json();

    // Log the incoming request with question details
    logger.info('Processing answer-engine request', {
      ...requestContext,
      questionLength: question?.length,
      questionPreview: question
        ? question.substring(0, 50) + (question.length > 50 ? '...' : '')
        : 'empty',
    });

    // Input validation
    if (!question || typeof question !== 'string') {
      logger.warn('Invalid question format', {
        ...requestContext,
        questionType: typeof question,
      });

      throw createApiError('validation_error', 'Missing or invalid question parameter', 'error', {
        questionType: typeof question,
      });
    }

    if (question.trim() === '') {
      logger.warn('Empty question string', requestContext);

      throw createApiError('validation_error', 'Question cannot be empty', 'error');
    }

    // Run preflight checks
    logger.debug('Running preflight checks', requestContext);

    // Run preflight checks with full user context
    const preflightResult = await runPreflightChecks(userId, question, ip, userAgent);

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

    // Check if API key is available
    if (!EXA_API_KEY) {
      logger.error('EXA API key is not configured', requestContext);
      throw createApiError('configuration_error', 'EXA API key is not configured', 'error');
    }

    // Initialize Exa client
    const exa = new Exa(EXA_API_KEY);

    // Get the system prompt from config
    const systemPrompt = APP_CONFIG.systemPrompt;

    // Log that we're calling the Exa service
    logger.info('Calling Exa service for answer generation', {
      ...requestContext,
      model: APP_CONFIG.model,
    });

    // Call Exa API to answer the question
    const exaResponse = await exa.answer(systemPrompt + question, {
      model: 'exa-pro',
    });

    // Extract the actual answer content
    let answer = '';

    if (typeof exaResponse.answer === 'string') {
      // If it's already a string, use it directly
      answer = exaResponse.answer;
    } else {
      // Fallback for any other format
      answer = JSON.stringify(exaResponse, null, 2);
    }

    // Transform the citations to match our schema
    const citations = exaResponse.citations?.map((citation) => ({
      title: citation.title || 'Untitled',
      url: citation.url,
      favicon:
        citation.favicon || `https://www.google.com/s2/favicons?domain=${citation.url}&sz=128`,
    }));

    // Log successful completion
    logger.info('Successfully processed answer-engine request', {
      ...requestContext,
      status: 'completed',
      citationCount: citations?.length || 0,
    });

    // Return the result as JSON
    return Response.json({ answer, citations });
  } catch (error) {
    // Error will be handled by the createApiHandler wrapper
    throw error;
  }
}

// Export the wrapped handler with automatic log flushing and error handling
export const POST = createApiHandler(handler);
