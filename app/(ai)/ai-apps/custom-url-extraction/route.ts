import { generateObject } from 'ai';
import { NextRequest } from 'next/server';
import { APP_CONFIG } from './config';
import { getUserInfo } from '../../lib/user-identification';
import { runPreflightChecks } from '@/app/(ai)/lib/preflight-checks/preflight-checks';
import { createApiHandler, createApiError } from '@/app/(ai)/lib/error-handling/api-error-handler';
import { logger } from '@/app/(ai)/lib/error-handling/logger';

// Diffbot API endpoint
const DIFFBOT_API_URL = 'https://api.diffbot.com/v3/analyze';

export const runtime = 'edge';

export const maxDuration = 60;

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
    logger.info('Starting URL extraction request processing', requestContext);

    // Extract the request body
    const { url, prompt } = await req.json();

    // Log the incoming request with prompt details
    logger.info('Processing URL extraction request', {
      ...requestContext,
      url,
      promptLength: prompt?.length,
      promptPreview: prompt
        ? url + ': ' + prompt.substring(0, 50) + (prompt.length > 50 ? '...' : '')
        : 'empty',
    });

    // Input validation
    if (!url || typeof url !== 'string') {
      logger.warn('Invalid URL format', {
        ...requestContext,
        urlType: typeof url,
      });

      throw createApiError('validation_error', 'Missing or invalid URL parameter', 'error', {
        urlType: typeof url,
      });
    }

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

    // Fetch content from Diffbot API
    logger.info('Fetching content from URL', {
      ...requestContext,
      url,
    });

    const diffbotUrl = new URL(DIFFBOT_API_URL);
    diffbotUrl.searchParams.append('url', url);
    diffbotUrl.searchParams.append('token', process.env.DIFFBOT_API_KEY || '');

    const diffbotResponse = await fetch(diffbotUrl.toString(), {
      method: 'GET',
      headers: { accept: 'application/json' },
    });

    if (!diffbotResponse.ok) {
      const status = diffbotResponse.status;
      const statusText = diffbotResponse.statusText;

      logger.error('Failed to fetch content from URL', {
        ...requestContext,
        url,
        status,
        statusText,
      });

      throw createApiError(
        'bad_request',
        `Failed to fetch content from URL: ${statusText || status}`,
        'error',
        {
          url,
          status,
        }
      );
    }

    const diffbotData = await diffbotResponse.json();

    // Extract the main content from Diffbot response
    let content = '';
    let title = '';

    if (diffbotData.objects && diffbotData.objects.length > 0) {
      const mainObject = diffbotData.objects[0];
      title = mainObject.title || '';
      content = mainObject.text || '';
    }

    if (!content) {
      logger.warn('No content extracted from URL', {
        ...requestContext,
        url,
      });

      throw createApiError(
        'bad_request',
        'Could not extract content from the provided URL',
        'error',
        {
          url,
        }
      );
    }

    // Log that we're calling the AI service
    logger.info('Calling AI service for URL extraction', {
      ...requestContext,
      model: APP_CONFIG.model,
      temperature: APP_CONFIG.temperature,
      maxTokens: APP_CONFIG.maxTokens,
      contentLength: content.length,
      titleLength: title.length,
    });

    // trim the content to 2000 characters
    content = content.substring(0, 2000);

    console.log('Content:', content);

    // Use AI SDK to process the content with no-schema approach
    const result = await generateObject({
      model: APP_CONFIG.model,
      system: `${APP_CONFIG.systemPrompt}
        
        Web page title: ${title}
        Web page content:
        ${content}
      `,
      prompt,
      output: 'no-schema', // Use no-schema to allow dynamic object structure based on prompt
      temperature: APP_CONFIG.temperature,
      maxTokens: APP_CONFIG.maxTokens,
    });

    // Log successful completion
    logger.info('URL extraction completed successfully', {
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
