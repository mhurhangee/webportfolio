import { NextRequest } from 'next/server';
import { generateObject } from 'ai';
import { APP_CONFIG } from './config';
import { recipeSuggestionsSchema, recipeSchema } from './schema';
import { runPreflightChecks } from '@/app/(ai)/lib/preflight-checks/preflight-checks';
import { getUserInfo } from '../../lib/user-identification';
import { createApiHandler, createApiError } from '@/app/(ai)/lib/error-handling/api-error-handler';
import { logger } from '@/app/(ai)/lib/error-handling/logger';
import { z } from 'zod';

export const runtime = 'edge';

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
    logger.info('Starting fridge friend request processing', requestContext);

    // Extract request data
    const { ingredients, mode, action, recipeId } = await req.json();

    // Log the incoming request with details
    logger.info('Processing fridge friend request', {
      ...requestContext,
      action,
      mode,
      ingredientCount: ingredients?.length,
      recipeId: recipeId || 'none',
    });

    // Input validation
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      logger.warn('Invalid ingredients parameter', {
        ...requestContext,
        ingredientsType: typeof ingredients,
        isArray: Array.isArray(ingredients),
        count: ingredients?.length,
      });

      throw createApiError(
        'validation_error',
        'Missing or invalid ingredients parameter',
        'error',
        { ingredientsType: typeof ingredients }
      );
    }

    if (!mode || !['strict', 'flexible', 'staples'].includes(mode)) {
      logger.warn('Invalid mode parameter', {
        ...requestContext,
        providedMode: mode,
      });

      throw createApiError('validation_error', 'Invalid mode parameter', 'error', {
        providedMode: mode,
      });
    }

    if (!action || !['suggest', 'detail'].includes(action)) {
      logger.warn('Invalid action parameter', {
        ...requestContext,
        providedAction: action,
      });

      throw createApiError('validation_error', 'Invalid action parameter', 'error', {
        providedAction: action,
      });
    }

    if (action === 'detail' && !recipeId) {
      logger.warn('Missing recipe ID for detail action', requestContext);

      throw createApiError('validation_error', 'Recipe ID is required for detailed view', 'error');
    }

    // Run preflight checks
    logger.debug('Running preflight checks', requestContext);

    // Run preflight checks with full user context
    const ingredientsText = ingredients.join(', ');
    const preflightResult = await runPreflightChecks(
      userId,
      `Please make a recipe out of the following ingredients: ${ingredientsText}`,
      ip,
      userAgent
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

    // Construct the prompt based on the mode and action
    let prompt = '';

    if (action === 'suggest') {
      prompt = `Generate ${ingredients.length > 5 ? '5' : '3'} creative recipe suggestions using these ingredients: ${ingredientsText}.
      
Mode: ${
        mode === 'strict'
          ? 'Strict Mode - ONLY use the ingredients listed'
          : mode === 'flexible'
            ? 'Flexible Mode - Primarily use the ingredients listed, but you may suggest 1-2 additional items'
            : 'Pantry Staples Assumed - You may include basic ingredients like salt, pepper, oil, and common spices'
      }`;
    } else {
      prompt = `Generate a detailed recipe for recipe ID: ${recipeId} using these ingredients: ${ingredientsText}.
      
Mode: ${
        mode === 'strict'
          ? 'Strict Mode - ONLY use the ingredients listed'
          : mode === 'flexible'
            ? 'Flexible Mode - Primarily use the ingredients listed, but you may suggest 1-2 additional items'
            : 'Pantry Staples Assumed - You may include basic ingredients like salt, pepper, oil, and common spices'
      }

Include detailed instructions, ingredient amounts, preparation time, and cooking tips.`;
    }

    if (action === 'suggest') {
      try {
        logger.info('Performing ingredient safety check', {
          ...requestContext,
          ingredients: ingredientsText,
        });

        // Simple ingredient validation check with a very clear schema
        const ingredientCheck = await generateObject({
          model: APP_CONFIG.model,
          system: `You are a food safety expert. Your ONLY task is to determine if ingredients are safe and ethical for human consumption. 
          Return TRUE if ALL ingredients are safe and ethical for human consumption.
          Return FALSE if ANY ingredients are unsafe, unethical, non-food items, or potentially harmful.
          DO NOT explain your reasoning. ONLY return a boolean value.`,
          schema: z.object({
            safeAndEthical: z
              .boolean()
              .describe('Whether all ingredients are safe and ethical for human consumption'),
          }),
          prompt: `Are these ingredients all safe and ethical for human consumption? ${ingredientsText}`,
          temperature: 0.1, // Lower temperature for more deterministic response
          maxTokens: 100, // Small token limit since we only need a boolean
        });

        logger.info('Ingredient check result', {
          ...requestContext,
          safeAndEthical: ingredientCheck.object.safeAndEthical,
        });

        if (!ingredientCheck.object.safeAndEthical) {
          logger.warn('Unsafe or unethical ingredients detected', {
            ...requestContext,
            ingredients: ingredientsText,
          });

          throw createApiError(
            'invalid_ingredients',
            'One or more ingredients may not be suitable for recipes. Please check your ingredients and try again.',
            'error'
          );
        }
      } catch (error: any) {
        // Only log the error if it's not already a structured API error
        if (!error.isApiError) {
          logger.error('Error checking ingredients', {
            ...requestContext,
            error: error.message,
          });
        }

        // Re-throw API errors, but continue with recipe generation for other errors
        if (error.isApiError) {
          throw error;
        }

        logger.info(
          'Continuing with recipe generation despite ingredient check error',
          requestContext
        );
      }

      // Log that we're calling the AI service for suggestions
      logger.info('Calling AI service for recipe suggestions', {
        ...requestContext,
        model: APP_CONFIG.model,
        mode,
        ingredientCount: ingredients.length,
        temperature: APP_CONFIG.temperature,
        maxTokens: APP_CONFIG.maxTokens,
      });

      // Proceed with recipe generation
      const result = await generateObject({
        model: APP_CONFIG.model,
        system: APP_CONFIG.systemPrompt,
        schema: recipeSuggestionsSchema,
        prompt: prompt,
        temperature: APP_CONFIG.temperature,
        maxTokens: APP_CONFIG.maxTokens,
      });

      // Log successful completion
      logger.info('Successfully generated recipe suggestions', {
        ...requestContext,
        status: 'completed',
        suggestionCount: result.object.suggestions?.length || 0,
      });

      return Response.json(result.object);
    } else if (action === 'detail') {
      // Log that we're calling the AI service for recipe details
      logger.info('Calling AI service for recipe details', {
        ...requestContext,
        model: APP_CONFIG.model,
        mode,
        recipeId,
        temperature: APP_CONFIG.temperature,
        maxTokens: APP_CONFIG.maxTokens,
      });

      prompt += `\n\nYou must always return a valid JSON object.
      When generating a detailed recipe, ALWAYS include these exact fields:
- title (string): The name of the recipe
- description (string): Brief description of the recipe
- ingredients (array): List of ingredients with name, amount, and fromUserInput fields
- instructions (array): Step-by-step cooking instructions as an array of strings
- tips (array): Optional cooking tips as an array of strings
- prepTime (string): Preparation time
- cookTime (string): Cooking time
- servings (number): Number of servings as a number
- difficulty (string): Must be one of "Easy", "Medium", or "Hard"
      `;

      const result = await generateObject({
        model: APP_CONFIG.model,
        system: APP_CONFIG.systemPrompt,
        schema: recipeSchema, // Explicitly use this schema
        prompt: prompt,
        temperature: APP_CONFIG.temperature,
        maxTokens: APP_CONFIG.maxTokens,
      });

      // Log successful completion
      logger.info('Successfully generated recipe details', {
        ...requestContext,
        status: 'completed',
        recipeId,
        recipeTitle: result.object.title,
      });

      return Response.json(result.object);
    }

    // This should never happen due to action validation above
    throw createApiError('internal_error', 'Invalid action state reached', 'error');
  } catch (error) {
    // Error will be handled by the createApiHandler wrapper
    throw error;
  }
}

// Export the wrapped handler with automatic log flushing and error handling
export const POST = createApiHandler(handler);
