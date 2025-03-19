import { NextRequest } from 'next/server';
import { generateObject, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { APP_CONFIG } from './config';
import { claimsExtractionSchema, factCheckResponseSchema, Source } from './schema';
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
    logger.info('Starting fact-checker request processing', requestContext);

    // Extract the text to fact-check from the request body
    const { text } = await req.json();

    // Log the incoming request with text details
    logger.info('Processing fact-checker request', {
      ...requestContext,
      textLength: text?.length,
      textPreview: text ? text.substring(0, 50) + (text.length > 50 ? '...' : '') : 'empty',
    });

    // Input validation
    if (!text || typeof text !== 'string') {
      logger.warn('Invalid text format', {
        ...requestContext,
        textType: typeof text,
      });

      throw createApiError('validation_error', 'Missing or invalid text parameter', 'error', {
        textType: typeof text,
      });
    }

    if (text.trim() === '') {
      logger.warn('Empty text string', requestContext);

      throw createApiError('validation_error', 'Text cannot be empty', 'error');
    }

    // Run preflight checks
    logger.debug('Running preflight checks', requestContext);

    // Run preflight checks with full user context
    const preflightResult = await runPreflightChecks(userId, text, ip, userAgent);

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

    // Step 1: Extract claims from the text using structured data generation
    logger.info('Extracting claims from text', {
      ...requestContext,
      model: APP_CONFIG.model,
    });

    const claimsResult = await generateObject({
      model: APP_CONFIG.model,
      schema: claimsExtractionSchema,
      prompt: `Extract all factual claims from the following text. For each claim, include the original text segment from which it was derived: "${text}"`,
      temperature: 0.2, // Lower temperature for more precise claim extraction
    });

    const { claims } = claimsResult.object;

    // Log the extracted claims
    logger.info('Claims extracted successfully', {
      ...requestContext,
      claimCount: claims.length,
    });

    // Step 2: Fact-check each claim using OpenAI responses API with web search
    logger.info('Fact-checking claims using web search', {
      ...requestContext,
      model: 'gpt-4o-mini',
    });

    const factCheckedClaims = [];

    for (const { claim, originalText } of claims) {
      try {
        // Log the current claim being processed
        logger.info('Processing claim', {
          ...requestContext,
          claim,
        });

        // Use generateText with web search and parse JSON from the response
        const result = await generateText({
          model: openai.responses('gpt-4o-mini'),
          prompt: `Fact-check the following claim: "${claim}". The original text was: "${originalText}".
          
          Respond with a JSON object containing:
          1. assessment: "True", "False", or "Insufficient Information"
          2. summary: A brief explanation of your assessment in a single line
          3. fixedOriginalText: If the assessment is False, provide a corrected version of the original text, otherwise return the original text unchanged
          4. sources: An array of sources used to verify the claim, each with a title and url
          
          Base your assessment on reliable sources.
          
          Format your response as a valid JSON object like this:
          {
            "assessment": "True|False|Insufficient Information",
            "summary": "Brief explanation here",
            "fixedOriginalText": "Corrected or original text here",
            "sources": [
              {
                "title": "Source Title",
                "url": "https://example.com/source"
              }
            ]
          }
          
          ONLY RETURN THE JSON OBJECT, DO NOT ADD ANY ADDITIONAL TEXT OR COMMENTS.
          DO NOT ADD ANY MARKDOWN FORMATTING OR BACKTICKS.`,
          tools: {
            web_search_preview: openai.tools.webSearchPreview(),
          },
          temperature: 0.2,
        });

        try {
          // Parse JSON from the text response
          const cleanedText = result.text.replace(/```json|```/g, '').trim();
          const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);

          if (jsonMatch) {
            const parsedResult = JSON.parse(jsonMatch[0]);

            // Validate the parsed result has the expected fields
            if (
              parsedResult.assessment &&
              ['True', 'False', 'Insufficient Information'].includes(parsedResult.assessment) &&
              typeof parsedResult.summary === 'string' &&
              typeof parsedResult.fixedOriginalText === 'string' &&
              Array.isArray(parsedResult.sources) &&
              parsedResult.sources.every(
                (source: { title: string; url: string }) =>
                  typeof source.title === 'string' && typeof source.url === 'string'
              )
            ) {
              factCheckedClaims.push({
                claim,
                assessment: parsedResult.assessment,
                summary: parsedResult.summary,
                fixedOriginalText: parsedResult.fixedOriginalText,
                sources: parsedResult.sources.map(
                  (source: { title: string; url: string }): Source => ({
                    title: source.title,
                    url: source.url,
                  })
                ),
              });

              // Log successful fact-checking of the claim
              logger.info('Claim fact-checked successfully', {
                ...requestContext,
                claim,
                assessment: parsedResult.assessment,
              });
            } else {
              throw new Error('Invalid JSON structure in response');
            }
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (jsonError: any) {
          // If JSON parsing fails, use a more basic fallback
          logger.warn('Failed to parse JSON from response', {
            ...requestContext,
            claim,
            error: jsonError?.message || 'Failed to parse JSON',
            responseText: result.text.substring(0, 100),
          });

          // Fallback to a basic assessment
          let assessment = 'Insufficient Information';
          if (result.text.toLowerCase().includes('true')) {
            assessment = 'True';
          } else if (result.text.toLowerCase().includes('false')) {
            assessment = 'False';
          }

          // Extract a summary from the text
          const lines = result.text.split('\n').filter((line) => line.trim().length > 0);
          const summary = lines.length > 0 ? lines[0] : 'Unable to extract summary';

          // Determine if there's a corrected version
          let fixedOriginalText = originalText;
          if (assessment === 'False' && result.text.includes('correct')) {
            const textAfterCorrect = result.text.split(/correct(ed|ion)/i)[1];
            if (textAfterCorrect) {
              fixedOriginalText = textAfterCorrect.trim();
            }
          }

          factCheckedClaims.push({
            claim,
            assessment,
            summary,
            fixedOriginalText,
            sources: [],
          });

          logger.info('Claim fact-checked with basic text parsing fallback', {
            ...requestContext,
            claim,
            assessment,
          });
        }
      } catch (error: any) {
        // Log error but continue with other claims
        logger.error('Error fact-checking claim', {
          ...requestContext,
          claim,
          error: error.message,
        });

        // Add a placeholder for the failed claim
        factCheckedClaims.push({
          claim,
          assessment: 'Insufficient Information',
          summary: 'Error occurred while fact-checking this claim',
          fixedOriginalText: originalText,
          sources: [],
        });
      }
    }

    // Validate the response against our schema
    const response = { claims: factCheckedClaims };

    // Log successful completion
    logger.info('Successfully processed fact-checker request', {
      ...requestContext,
      status: 'completed',
      claimCount: claims.length,
      factCheckedCount: factCheckedClaims.length,
    });

    // Return the result as JSON
    return Response.json(response);
  } catch (error) {
    // Error will be handled by the createApiHandler wrapper
    throw error;
  }
}

// Export the wrapped handler with automatic log flushing and error handling
export const POST = createApiHandler(handler);