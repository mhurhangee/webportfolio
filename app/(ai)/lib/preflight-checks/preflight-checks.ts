import {
  PreflightCheck,
  PreflightResult,
  Message,
  PreflightOptions,
  PreflightParams,
} from './types';
import { inputLengthCheck } from './checks/input-length';
import { rateLimitGlobalCheck } from './checks/rate-limit-global';
import { rateLimitUserCheck } from './checks/rate-limit-user';
import { contentModerationCheck } from './checks/content-moderation';
import { blacklistedKeywordsCheck } from './checks/blacklist-keywords';
import { aiContentAnalysisCheck } from './checks/ai-detection-check';
import { languageCheck } from './checks/language-check';
import { inputSanitizationCheck } from './checks/input-sanitization-check';
import { logger as defaultLogger } from '@/app/(ai)/lib/error-handling/logger';

// Define all available checks with their default configuration
export const ALL_CHECKS: PreflightCheck[] = [
  { ...inputLengthCheck, tier: 1, enabled: true, configurable: true },
  { ...inputSanitizationCheck, tier: 1, enabled: true, configurable: false },
  { ...blacklistedKeywordsCheck, tier: 1, enabled: true, configurable: true },
  { ...languageCheck, tier: 1, enabled: true, configurable: true },
  { ...contentModerationCheck, tier: 2, enabled: true, configurable: true },
  { ...rateLimitGlobalCheck, tier: 3, enabled: true, configurable: true },
  { ...rateLimitUserCheck, tier: 3, enabled: true, configurable: true },
  { ...aiContentAnalysisCheck, tier: 4, enabled: true, configurable: true },
];

// Helper to get checks by tier
export function getChecksByTier(tier: number): PreflightCheck[] {
  return ALL_CHECKS.filter((check) => check.tier === tier);
}

// Run a single check with timing and logging
async function runSingleCheck(
  check: PreflightCheck,
  params: PreflightParams,
  options?: PreflightOptions
): Promise<{ result: PreflightResult; executionTimeMs: number }> {
  const logger = options?.logger || params.logger || defaultLogger;
  const startTime = performance.now();

  try {
    // Apply check-specific configuration if provided
    const checkConfig = options?.checkConfig?.[check.name] || {};
    const updatedParams = { ...params, checkConfig };

    // Log that we're running this check
    logger.debug(`Running preflight check: ${check.name}`, {
      checkName: check.name,
      checkTier: check.tier,
      userId: params.userId,
      ip: params.ip,
    });

    // Run the check
    const result = await check.run(updatedParams);

    // Calculate execution time
    const endTime = performance.now();
    const executionTimeMs = Math.round(endTime - startTime);

    // Add execution time to result
    result.executionTimeMs = executionTimeMs;

    // Log the result
    if (result.passed) {
      logger.debug(`Preflight check passed: ${check.name}`, {
        checkName: check.name,
        executionTimeMs,
        code: result.code,
      });
    } else {
      logger.warn(`Preflight check failed: ${check.name}`, {
        checkName: check.name,
        executionTimeMs,
        code: result.code,
        message: result.message,
        severity: result.severity,
        details: result.details,
      });

      // For certain codes related to content issues, increment the warning counter
      if (
        [
          'blacklisted_keywords',
          'moderation_flagged',
          'ethical_concerns',
          'extremely_negative',
        ].includes(result.code) &&
        params.ip &&
        params.ip !== 'unknown'
      ) {
        try {
          // Import here to avoid circular dependencies
          const { incrementWarningCount } = await import('./checks/enhanced-rate-limit-check');
          await incrementWarningCount(params.ip);
          logger.debug(`Incremented warning count for IP: ${params.ip}`, {
            checkName: check.name,
            code: result.code,
          });
        } catch (error) {
          logger.error('Failed to increment warning count', {
            error: error instanceof Error ? error.message : String(error),
            checkName: check.name,
          });
        }
      }
    }

    return {
      result: {
        passed: result.passed,
        failedCheck: result.passed ? undefined : check.name,
        result: result.passed ? undefined : result,
        checkResults: [
          {
            checkName: check.name,
            result,
            executionTimeMs,
          },
        ],
      },
      executionTimeMs,
    };
  } catch (error) {
    // Calculate execution time even for errors
    const endTime = performance.now();
    const executionTimeMs = Math.round(endTime - startTime);

    // Log the error
    logger.error(`Error in preflight check: ${check.name}`, {
      checkName: check.name,
      executionTimeMs,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      result: {
        passed: false,
        failedCheck: check.name,
        result: {
          passed: false,
          code: 'check_error',
          message: `Error in ${check.name}: ${error instanceof Error ? error.message : String(error)}`,
          severity: 'error',
          details: { error: error instanceof Error ? error.stack : String(error) },
        },
        checkResults: [
          {
            checkName: check.name,
            result: {
              passed: false,
              code: 'check_error',
              message: `Error in ${check.name}: ${error instanceof Error ? error.message : String(error)}`,
              severity: 'error',
              details: { error: error instanceof Error ? error.stack : String(error) },
              executionTimeMs,
            },
            executionTimeMs,
          },
        ],
      },
      executionTimeMs,
    };
  }
}

// Run checks from a specific tier
async function runTierChecks(
  params: PreflightParams,
  tier: number,
  options?: PreflightOptions
): Promise<PreflightResult | null> {
  const logger = options?.logger || params.logger || defaultLogger;
  const startTime = performance.now();

  // Get checks for this tier
  let checks = getChecksByTier(tier);

  // Filter checks based on options
  if (options?.checks) {
    checks = checks.filter((check) =>
      options.checks![check.name] !== undefined ? options.checks![check.name] : check.enabled
    );
  } else {
    checks = checks.filter((check) => check.enabled);
  }

  if (checks.length === 0) {
    logger.debug(`No checks to run for tier ${tier}`);
    return null;
  }

  logger.debug(`Running tier ${tier} checks`, {
    tier,
    checkCount: checks.length,
    checkNames: checks.map((c) => c.name),
  });

  const allCheckResults: Array<{
    checkName: string;
    result: any;
    executionTimeMs: number;
  }> = [];

  // Run all checks in this tier
  for (const check of checks) {
    const { result, executionTimeMs } = await runSingleCheck(check, params, options);

    // Add to all results
    if (result.checkResults && result.checkResults.length > 0) {
      const checkResult = result.checkResults[0];
      if (checkResult) {
        allCheckResults.push(checkResult);
      }
    }

    // If check failed and we're not running all checks, return immediately
    if (!result.passed && !options?.runAllChecks) {
      const endTime = performance.now();
      const totalExecutionTimeMs = Math.round(endTime - startTime);

      logger.info(`Tier ${tier} checks failed`, {
        tier,
        failedCheck: result.failedCheck,
        executionTimeMs: totalExecutionTimeMs,
      });

      return {
        ...result,
        checkResults: options?.includeAllResults ? allCheckResults : undefined,
        executionTimeMs: totalExecutionTimeMs,
      };
    }
  }

  const endTime = performance.now();
  const totalExecutionTimeMs = Math.round(endTime - startTime);

  logger.debug(`Tier ${tier} checks completed successfully`, {
    tier,
    executionTimeMs: totalExecutionTimeMs,
  });

  // All checks passed
  return null;
}

export async function runPreflightChecks(
  userId: string,
  input: string | Message[],
  ip?: string,
  userAgent?: string,
  options?: PreflightOptions
): Promise<PreflightResult> {
  const logger = options?.logger || defaultLogger;
  const startTime = performance.now();

  try {
    logger.info('Starting preflight checks', {
      userId,
      ip,
      hasOptions: !!options,
      inputType: typeof input === 'string' ? 'string' : 'messages',
    });

    // Extract the last message or use the input directly if it's a string
    let messages: Message[] = [];
    let lastMessage = '';

    if (typeof input === 'string') {
      // If input is a string, create a single user message
      lastMessage = input;
      messages = [
        {
          role: 'user' as const,
          content: input,
        },
      ];
    } else {
      // If input is an array of messages, extract the last user message
      messages = input;
      const userMessages = messages.filter((m) => m.role === 'user');
      // Check if there are any user messages before accessing the last one
      const lastUserMessage =
        userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
      if (lastUserMessage) {
        lastMessage = lastUserMessage.content;
      }
    }

    // Safety check - if no lastMessage was extracted, provide a default value
    if (!lastMessage) {
      logger.warn('Empty input provided to preflight checks', { userId, ip });

      const endTime = performance.now();
      const executionTimeMs = Math.round(endTime - startTime);

      return {
        passed: false,
        failedCheck: 'empty_input',
        result: {
          passed: false,
          code: 'empty_input',
          message: 'No valid user message provided',
          severity: 'error',
          executionTimeMs,
        },
        executionTimeMs,
      };
    }

    // Create params object for checks
    const params: PreflightParams = {
      userId,
      messages,
      lastMessage,
      ip,
      userAgent,
      conversationContext: options?.conversationContext,
      logger,
    };

    // Determine which tiers to run
    const tiersToRun = options?.tiers || [1, 2, 3, 4];

    // Run checks for each tier
    for (const tier of tiersToRun) {
      const tierResult = await runTierChecks(params, tier, options);
      if (tierResult) {
        const endTime = performance.now();
        const totalExecutionTimeMs = Math.round(endTime - startTime);

        logger.info('Preflight checks failed', {
          userId,
          ip,
          tier,
          failedCheck: tierResult.failedCheck,
          code: tierResult.result?.code,
          executionTimeMs: totalExecutionTimeMs,
        });

        return {
          ...tierResult,
          executionTimeMs: totalExecutionTimeMs,
        };
      }
    }

    // All checks passed
    const endTime = performance.now();
    const totalExecutionTimeMs = Math.round(endTime - startTime);

    logger.info('All preflight checks passed', {
      userId,
      ip,
      executionTimeMs: totalExecutionTimeMs,
    });

    return {
      passed: true,
      executionTimeMs: totalExecutionTimeMs,
    };
  } catch (error) {
    const endTime = performance.now();
    const executionTimeMs = Math.round(endTime - startTime);

    logger.error('Unexpected error in preflight checks', {
      userId,
      ip,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      executionTimeMs,
    });

    // Handle any errors that occurred during checks
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error during preflight checks';

    return {
      passed: false,
      failedCheck: 'system_error',
      result: {
        passed: false,
        code: 'system_error',
        message: errorMessage,
        severity: 'error',
        executionTimeMs,
      },
      executionTimeMs,
    };
  }
}
