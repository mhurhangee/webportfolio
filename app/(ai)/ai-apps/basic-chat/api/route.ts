import { streamText, smoothStream } from 'ai';
import { NextRequest } from 'next/server';
import { APP_CONFIG } from '../config';
import { getUserInfo } from '@/app/(ai)/lib/user-identification';
import { runPreflightChecks } from '@/app/(ai)/lib/preflight-checks/preflight-checks';
import { createApiHandler, createApiError } from '@/app/(ai)/lib/error-handling/api-error-handler';
import { logger } from '@/app/(ai)/lib/error-handling/logger';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Set runtime to edge for better performance with streaming
export const runtime = 'edge';

// Maximum number of messages to include in the context
const MAX_MESSAGES = 10;

// Maximum length of each message to prevent token overuse
const MAX_MESSAGE_LENGTH = 1000;

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
    logger.info('Starting chat request processing', requestContext);

    // Extract the request body
    const { messages } = await req.json();

    // Input validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      logger.warn('Invalid messages format', {
        ...requestContext,
        messagesType: typeof messages,
        isArray: Array.isArray(messages),
      });

      throw createApiError('validation_error', 'Missing or invalid messages parameter', 'error', {
        messagesType: typeof messages,
        isArray: Array.isArray(messages),
      });
    }

    // Log the incoming request with message details
    logger.info('Processing chat request', {
      ...requestContext,
      messageCount: messages.length,
      lastMessageRole: messages[messages.length - 1]?.role,
      lastMessagePreview: messages[messages.length - 1]?.content
        ? messages[messages.length - 1].content.substring(0, 50) +
          (messages[messages.length - 1].content.length > 50 ? '...' : '')
        : 'empty',
    });

    // Get the last user message for preflight checks
    const lastUserMessage =
      messages.filter((m: { role: string; content?: string }) => m.role === 'user').pop()
        ?.content || '';

    // Run preflight checks with full user context
    logger.debug('Running preflight checks', requestContext);
    const preflightResult = await runPreflightChecks(userId, lastUserMessage, ip, userAgent);

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

    // Limit the number of messages to prevent token overuse
    const limitedMessages = messages
      .slice(-MAX_MESSAGES) // Take only the most recent messages
      .map((message) => ({
        role: message.role,
        content:
          typeof message.content === 'string'
            ? message.content.substring(0, MAX_MESSAGE_LENGTH)
            : '',
      }));

    // Log that we're calling the AI service
    logger.info('Calling AI service for chat', {
      ...requestContext,
      model: APP_CONFIG.model,
      temperature: APP_CONFIG.temperature,
      maxTokens: APP_CONFIG.maxTokens,
      messageCount: limitedMessages.length,
    });

    // Create the streaming response
    const result = streamText({
      model: APP_CONFIG.model,
      system: APP_CONFIG.systemPrompt,
      messages: limitedMessages,
      temperature: APP_CONFIG.temperature,
      maxTokens: APP_CONFIG.maxTokens,
    });

    // Log successful initiation of streaming
    logger.info('Chat streaming initiated successfully', {
      ...requestContext,
      status: 'streaming',
    });

    return result.toDataStreamResponse();
  } catch (error) {
    // For streaming responses, we need to handle errors differently
    // We can't use the standard error handler because it would break the stream
    logger.error('Error in chat request', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Extract error details for a better client experience
    let errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    let errorCode = 'internal_error';
    let errorSeverity = 'error';
    let errorDetails = {};

    // Try to extract structured error information if available
    if (error instanceof Error && (error as any).isApiError) {
      try {
        const parsedError = JSON.parse(error.message);
        errorCode = parsedError.code || errorCode;
        errorMessage = parsedError.message || errorMessage;
        errorSeverity = parsedError.severity || errorSeverity;
        errorDetails = parsedError.details || {};
      } catch (e) {
        // Parsing failed, use the original error message
        logger.error('Failed to parse API error', {
          error: e instanceof Error ? e.message : String(e),
          originalError: errorMessage,
        });
      }
    }

    // For preflight check failures, provide more user-friendly error messages
    if (errorCode.includes('rate_limit')) {
      errorDetails = "You've reached the rate limit. Please wait a moment before trying again.";
    } else if (errorCode === 'moderation_flagged') {
      errorDetails = "Your message contains content that doesn't comply with our usage policies.";
    } else if (errorCode === 'blacklisted_keywords') {
      errorDetails = 'Your message contains prohibited keywords or phrases.';
    } else if (errorCode === 'validation_error') {
      errorDetails = 'There was a problem with your request format.';
    }

    // Return a structured error response that the client can handle
    return new Response(
      JSON.stringify({
        error: {
          message: errorMessage,
          code: errorCode,
          severity: errorSeverity,
          details: errorDetails,
          requestId: (error as any).requestId || 'unknown',
        },
      }),
      {
        // Set appropriate status code based on error type
        status:
          errorCode === 'rate_limit_exceeded'
            ? 429
            : errorCode === 'unauthorized'
              ? 401
              : errorCode === 'not_found'
                ? 404
                : errorCode.includes('validation') || errorCode === 'moderation_flagged'
                  ? 400
                  : 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// Export the wrapped handler with automatic log flushing and error handling
export const POST = createApiHandler(handler);
