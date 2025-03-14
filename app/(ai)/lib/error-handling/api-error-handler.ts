// /apps/web/app/(ai)/lib/error-handling/api-error-handler.ts

import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';
import { v4 as uuidv4 } from 'uuid';

// Standard error codes
export type ErrorCode =
  | 'rate_limit_exceeded'
  | 'moderation_flagged'
  | 'validation_error'
  | 'unauthorized'
  | 'not_found'
  | 'bad_request'
  | 'internal_error'
  | string;

// Error severity levels
export type ErrorSeverity = 'error' | 'warning' | 'info';

// Interface for structured API errors
export interface ApiError {
  code: ErrorCode;
  message: string;
  severity: ErrorSeverity;
  details?: Record<string, any>;
  requestId: string;
}

/**
 * Creates a wrapped API handler with request ID tracking
 * Compatible with Next.js App Router
 */
export function createApiHandler(handler: (req: NextRequest) => Promise<Response>) {
  // Return a function that matches the Next.js App Router handler signature
  return async function (req: NextRequest) {
    // Generate a unique request ID
    const requestId = uuidv4();

    try {
      // Log the start of request processing
      logger.info('API request started', {
        path: req.nextUrl.pathname,
        method: req.method,
        requestId,
      });

      // Set requestId in request headers so handler functions can access it
      const reqWithId = new NextRequest(req.url, {
        headers: new Headers(req.headers),
        method: req.method,
        body: req.body,
        cache: req.cache,
        credentials: req.credentials,
        integrity: req.integrity,
        keepalive: req.keepalive,
        mode: req.mode,
        redirect: req.redirect,
        referrer: req.referrer,
        referrerPolicy: req.referrerPolicy,
        signal: req.signal,
      });
      reqWithId.headers.set('X-Request-ID', requestId);

      // Call the handler with the modified request
      const response = await handler(reqWithId);

      // Add request ID to response headers
      if (response instanceof NextResponse) {
        response.headers.set('X-Request-ID', requestId);
      }

      // Log successful completion
      logger.info('API request completed', {
        path: req.nextUrl.pathname,
        method: req.method,
        requestId,
        status: response.status,
      });

      return response;
    } catch (error) {
      // Handle the error with request ID
      return handleApiError(error, {
        path: req.nextUrl.pathname,
        method: req.method,
        requestId,
      });
    }
  };
}

/**
 * Handle API errors and return a structured response
 */
export function handleApiError(
  error: unknown,
  context: { path?: string; method?: string; requestId: string }
): NextResponse {
  // Default error
  let apiError: ApiError = {
    code: 'internal_error',
    message: 'An unexpected error occurred',
    severity: 'error',
    details: {},
    requestId: context.requestId,
  };

  // Extract error information
  if (error instanceof Error) {
    try {
      // Try to parse as a structured error
      const parsedError = JSON.parse(error.message) as Partial<ApiError>;
      if (parsedError.code && parsedError.message) {
        // Explicitly set all required properties to ensure type safety
        apiError = {
          code: parsedError.code,
          message: parsedError.message,
          requestId: context.requestId,
          severity: parsedError.severity || 'error',
          details: parsedError.details || {},
        };
      } else {
        // Not a structured error, use the message
        apiError.message = error.message;
      }
    } catch {
      // Not a JSON string, use the message directly
      apiError.message = error.message;
    }
  } else if (typeof error === 'string') {
    apiError.message = error;
  }

  // Log the error with context
  logger.error(`API error: ${apiError.code}`, {
    ...context,
    ...apiError,
  });

  // Return a structured error response
  return NextResponse.json({ error: apiError }, { status: getStatusCodeForError(apiError.code) });
}

/**
 * Create a typed API error
 */
export function createApiError(
  code: ErrorCode,
  message: string,
  severity: ErrorSeverity = 'error',
  details?: Record<string, any>
): Error {
  const error = new Error(
    JSON.stringify({
      code,
      message,
      severity,
      details,
    })
  );

  // Add a flag to identify this as an API error
  (error as any).isApiError = true;

  return error;
}

/**
 * Map error codes to HTTP status codes
 */
function getStatusCodeForError(code: ErrorCode): number {
  switch (code) {
    case 'rate_limit_exceeded':
      return 429;
    case 'moderation_flagged':
    case 'validation_error':
    case 'bad_request':
      return 400;
    case 'unauthorized':
      return 401;
    case 'not_found':
      return 404;
    default:
      return 500;
  }
}
