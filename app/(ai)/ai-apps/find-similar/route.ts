import { NextRequest } from 'next/server';
import { runPreflightChecks } from '@/app/(ai)/lib/preflight-checks/preflight-checks';
import { getUserInfo } from '../../lib/user-identification';
import { createApiHandler, createApiError } from '@/app/(ai)/lib/error-handling/api-error-handler';
import { logger } from '@/app/(ai)/lib/error-handling/logger';
import Exa from 'exa-js';

// Get the API key from environment variables
const EXA_API_KEY = process.env.EXA_API_KEY || '';

// Function to fetch metadata for a URL
async function fetchMetadata(url: string) {
  try {
    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // Extract Open Graph and basic metadata with improved regex patterns
    // Title: Try Open Graph title first, then Twitter title, then regular title tag
    let title = '';
    const ogTitleMatch = html.match(
      /<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i
    );
    const twitterTitleMatch = html.match(
      /<meta\s+name=["']twitter:title["']\s+content=["']([^"']*)["']/i
    );
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);

    if (ogTitleMatch && ogTitleMatch[1]) {
      title = ogTitleMatch[1];
    } else if (twitterTitleMatch && twitterTitleMatch[1]) {
      title = twitterTitleMatch[1];
    } else if (titleMatch && titleMatch[1]) {
      title = titleMatch[1];
    }

    // Description: Try Open Graph description first, then Twitter description, then meta description
    let description = '';
    const ogDescMatch = html.match(
      /<meta\s+property=["']og:description["']\s+content=["']([^"']*)["']/i
    );
    const twitterDescMatch = html.match(
      /<meta\s+name=["']twitter:description["']\s+content=["']([^"']*)["']/i
    );
    const metaDescMatch = html.match(
      /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i
    );

    if (ogDescMatch && ogDescMatch[1]) {
      description = ogDescMatch[1];
    } else if (twitterDescMatch && twitterDescMatch[1]) {
      description = twitterDescMatch[1];
    } else if (metaDescMatch && metaDescMatch[1]) {
      description = metaDescMatch[1];
    }

    // Image: Try Open Graph image first, then Twitter image
    let image = '';
    const ogImageMatch = html.match(
      /<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i
    );
    const twitterImageMatch = html.match(
      /<meta\s+name=["']twitter:image["']\s+content=["']([^"']*)["']/i
    );

    if (ogImageMatch && ogImageMatch[1]) {
      image = ogImageMatch[1];
    } else if (twitterImageMatch && twitterImageMatch[1]) {
      image = twitterImageMatch[1];
    }

    // Decode HTML entities
    const decodeHtmlEntities = (text: string) => {
      return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&ndash;/g, '–')
        .replace(/&mdash;/g, '—')
        .replace(/&hellip;/g, '…')
        .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
    };

    return {
      title: decodeHtmlEntities(title.trim()),
      description: decodeHtmlEntities(description.trim()),
      image: image.trim() ? image.trim() : undefined,
    };
  } catch (error) {
    logger.warn('Error fetching metadata', { url, error: (error as Error).message });
    return {
      title: 'No title available',
      description: 'No description available',
    };
  }
}

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
    logger.info('Starting find-similar request processing', requestContext);

    // Extract the request body
    const { url, excludeDomains, numResults } = await req.json();

    // Log the incoming request with URL details
    logger.info('Processing find-similar request', {
      ...requestContext,
      url,
      excludeDomains,
      numResults,
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

    // Basic URL validation
    try {
      new URL(url);
    } catch (error) {
      logger.warn('Invalid URL format', {
        ...requestContext,
        url,
        error: (error as Error).message,
      });

      throw createApiError(
        'validation_error',
        'Invalid URL format. Please provide a valid URL including http:// or https://',
        'error'
      );
    }

    // Run preflight checks
    logger.debug('Running preflight checks', requestContext);

    // Run preflight checks with full user context
    const preflightResult = await runPreflightChecks(userId, url, ip, userAgent);

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

    // Log that we're calling the Exa service
    logger.info('Calling Exa service for similar URLs', {
      ...requestContext,
      url,
      excludeDomains: excludeDomains || [],
      numResults: numResults || 10,
    });

    // Call Exa API to find similar websites
    const exaResponse = await exa.findSimilar(url, {
      excludeDomains: excludeDomains || [new URL(url).hostname],
      numResults: numResults || 10,
    });

    // Transform the response to match our schema
    const results = exaResponse.results.map((result) => ({
      title: result.title || 'Untitled',
      url: result.url,
      score: result.score,
      favicon: `https://www.google.com/s2/favicons?domain=${result.url}&sz=128`,
    }));

    // Always fetch metadata for source URL
    logger.info('Fetching metadata for source URL', { ...requestContext, url });
    const sourceMetadata = await fetchMetadata(url);

    // Fetch metadata for result URLs (in parallel)
    logger.info('Fetching metadata for result URLs', {
      ...requestContext,
      resultCount: results.length,
    });

    const metadataPromises = results.map(async (result) => {
      const metadata = await fetchMetadata(result.url);
      return {
        ...result,
        metadata,
      };
    });

    // Wait for all metadata fetches to complete
    const resultsWithMetadata = await Promise.all(metadataPromises);

    // Log successful completion
    logger.info('Successfully processed find-similar request', {
      ...requestContext,
      status: 'completed',
      resultCount: results.length,
      costDollars: exaResponse.costDollars?.total || 0,
      hasSourceMetadata: !!sourceMetadata,
      hasResultMetadata: true,
    });

    // Return the result as JSON
    return Response.json({
      results: resultsWithMetadata,
      sourceMetadata,
    });
  } catch (error) {
    // Error will be handled by the createApiHandler wrapper
    throw error;
  }
}

// Export the wrapped handler with automatic log flushing and error handling
export const POST = createApiHandler(handler);
