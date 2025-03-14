import { PreflightCheck, CheckResult, PreflightParams } from '../types';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY! || 'dummy-key-for-build-time',
});

export const contentModerationCheck: PreflightCheck = {
  name: 'content_moderation',
  description: 'Checks content for policy violations using OpenAI moderation',
  tier: 2,
  enabled: true,
  configurable: true,
  defaultConfig: {
    model: 'text-moderation-latest',
    // Categories to always flag as violations
    strictCategories: ['sexual', 'hate', 'violence', 'self-harm', 'harassment'],
    // Categories that can be configured to be more lenient
    configurableCategories: [
      'sexual/minors',
      'hate/threatening',
      'violence/graphic',
      'self-harm/intent',
      'harassment/threatening',
    ],
    // Default threshold for flagging content (0-1)
    threshold: 0.8,
  },
  run: async ({
    lastMessage,
    checkConfig,
    logger,
    conversationContext,
  }: PreflightParams): Promise<CheckResult> => {
    try {
      // Get configuration, using defaults if not provided
      const config = {
        model: checkConfig?.model ?? 'text-moderation-latest',
        strictCategories: checkConfig?.strictCategories ?? [
          'sexual',
          'hate',
          'violence',
          'self-harm',
          'harassment',
        ],
        configurableCategories: checkConfig?.configurableCategories ?? [
          'sexual/minors',
          'hate/threatening',
          'violence/graphic',
          'self-harm/intent',
          'harassment/threatening',
        ],
        threshold: checkConfig?.threshold ?? 0.8,
      };

      // Log that we're starting the moderation check
      if (logger) {
        logger.debug('Starting content moderation check', {
          checkName: 'content_moderation',
          model: config.model,
          contentLength: lastMessage?.length || 0,
          conversationPurpose: conversationContext?.purpose,
        });
      }

      // Extract content for moderation
      const textToModerate = lastMessage;

      // Check if there's any content to moderate
      if (!textToModerate || textToModerate.trim().length === 0) {
        if (logger) {
          logger.debug('Content moderation: No content to moderate');
        }
        return {
          passed: true,
          code: 'moderation_skipped',
          message: 'No content to moderate',
          severity: 'info',
        };
      }

      // Call OpenAI moderation API
      const moderation = await openai.moderations.create({
        model: config.model,
        input: textToModerate,
      });

      // Check if we have results
      if (!moderation.results || moderation.results.length === 0) {
        if (logger) {
          logger.warning('Content moderation: No results returned from API');
        }
        return {
          passed: false,
          code: 'moderation_no_results',
          message: 'Unable to verify content safety',
          severity: 'error',
        };
      }

      // At this point, we know moderation.results[0] exists
      const result = moderation.results[0];

      // Type assertion to help TypeScript understand this can't be undefined
      if (!result) {
        if (logger) {
          logger.warning('Content moderation: Result is unexpectedly undefined');
        }
        return {
          passed: false,
          code: 'moderation_error',
          message: 'Moderation API returned unexpected result',
          severity: 'error',
        };
      }

      // Check if content is flagged
      if (result.flagged) {
        // Get the categories that were flagged
        const flaggedCategories: string[] = [];
        const categoryScores: Record<string, number> = {};

        // Process categories and scores
        Object.entries(result.categories).forEach(([category, flagged]) => {
          if (flagged) {
            flaggedCategories.push(category);
          }

          // Get score if available
          if (result.category_scores && category in result.category_scores) {
            categoryScores[category] =
              result.category_scores[category as keyof typeof result.category_scores];
          }
        });

        // Determine if any strict categories were flagged
        const strictViolations = flaggedCategories.filter((category) =>
          config.strictCategories.some((strictCat: string) => category.startsWith(strictCat))
        );

        // Determine if any configurable categories were flagged above threshold
        const configurableViolations = flaggedCategories.filter((category) => {
          const score = categoryScores[category] || 0;
          return config.configurableCategories.includes(category) && score >= config.threshold;
        });

        // If we have any violations, fail the check
        if (strictViolations.length > 0 || configurableViolations.length > 0) {
          const allViolations = [...strictViolations, ...configurableViolations];

          if (logger) {
            logger.warning('Content moderation: Content flagged', {
              flaggedCategories: allViolations,
              scores: categoryScores,
            });
          }

          return {
            passed: false,
            code: 'moderation_flagged',
            message: 'Content violates usage policies',
            details: {
              flaggedCategories: allViolations,
              scores: categoryScores,
            },
            severity: 'error',
          };
        }

        // If content was flagged but no violations based on our configuration
        if (logger) {
          logger.info('Content moderation: Content flagged but below threshold', {
            flaggedCategories,
            scores: categoryScores,
          });
        }
      }

      // If we got here, the content passed moderation
      if (logger) {
        logger.debug('Content moderation: Content passed moderation');
      }

      return {
        passed: true,
        code: 'moderation_passed',
        message: 'Content passed moderation',
        severity: 'info',
      };
    } catch (error) {
      // Log the error
      if (logger) {
        logger.error('Error in content moderation check', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }

      return {
        passed: false,
        code: 'moderation_error',
        message: `Error during content moderation: ${error instanceof Error ? error.message : String(error)}`,
        details: { error: error instanceof Error ? error.stack : String(error) },
        severity: 'error',
      };
    }
  },
};
