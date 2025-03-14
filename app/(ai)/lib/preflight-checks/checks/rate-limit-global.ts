import { PreflightCheck, PreflightParams } from '../types';
import { Duration, Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { formatTimeRemaining } from '../utils';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Default rate limit configurations
const DEFAULT_HOURLY_LIMIT = 100;
const DEFAULT_DAILY_LIMIT = 500;

// Create rate limiters with default configurations
function createRateLimiter(limit: number, duration: Duration, prefix: string) {
  return new Ratelimit({
    redis: redis,
    limiter: Ratelimit.fixedWindow(limit, duration),
    analytics: true,
    prefix: `ratelimit:global:${prefix}`,
  });
}

export const rateLimitGlobalCheck: PreflightCheck = {
  name: 'rate_limit_global',
  description: 'Checks if the global rate limit has been exceeded',
  tier: 3,
  enabled: true,
  configurable: true,
  defaultConfig: {
    // Hourly rate limit configuration
    hourlyLimit: DEFAULT_HOURLY_LIMIT,
    hourlyDuration: '1 h',
    // Daily rate limit configuration
    dailyLimit: DEFAULT_DAILY_LIMIT,
    dailyDuration: '24 h',
    // Whether to check hourly, daily, or both
    checkHourly: true,
    checkDaily: true,
  },
  run: async ({ checkConfig, logger }: PreflightParams) => {
    try {
      // Get configuration, using defaults if not provided
      const config = {
        hourlyLimit: checkConfig?.hourlyLimit ?? DEFAULT_HOURLY_LIMIT,
        hourlyDuration: checkConfig?.hourlyDuration ?? '1 h',
        dailyLimit: checkConfig?.dailyLimit ?? DEFAULT_DAILY_LIMIT,
        dailyDuration: checkConfig?.dailyDuration ?? '24 h',
        checkHourly: checkConfig?.checkHourly ?? true,
        checkDaily: checkConfig?.checkDaily ?? true,
      };

      // Log the configuration being used
      if (logger) {
        logger.debug('Running global rate limit check', {
          checkName: 'rate_limit_global',
          hourlyLimit: config.hourlyLimit,
          dailyLimit: config.dailyLimit,
          checkHourly: config.checkHourly,
          checkDaily: config.checkDaily,
        });
      }

      // Create rate limiters with the configured values
      const hourlyRatelimit = createRateLimiter(
        config.hourlyLimit,
        config.hourlyDuration,
        'hourly'
      );

      const dailyRatelimit = createRateLimiter(config.dailyLimit, config.dailyDuration, 'daily');

      // Check the hourly rate limit if enabled
      if (config.checkHourly) {
        const hourlyResult = await hourlyRatelimit.limit('global');

        // If hourly limit exceeded
        if (!hourlyResult.success) {
          // Calculate time remaining until reset (approximately)
          const timeRemaining = formatTimeRemaining(3600 * 1000); // 1 hour in ms

          if (logger) {
            logger.warning('Global hourly rate limit exceeded', {
              limit: hourlyResult.limit,
              remaining: hourlyResult.remaining,
              timeRemaining,
            });
          }

          return {
            passed: false,
            code: 'rate_limit_global_hourly',
            message: 'Global hourly rate limit exceeded',
            details: {
              limit: hourlyResult.limit,
              remaining: hourlyResult.remaining,
              timeRemaining,
            },
            severity: 'warning',
          };
        }

        if (logger) {
          logger.debug('Global hourly rate limit check passed', {
            limit: hourlyResult.limit,
            remaining: hourlyResult.remaining,
          });
        }
      }

      // Check the daily rate limit if enabled
      if (config.checkDaily) {
        const dailyResult = await dailyRatelimit.limit('global');

        // If daily limit exceeded
        if (!dailyResult.success) {
          // Calculate time remaining until reset (approximately)
          const timeRemaining = formatTimeRemaining(24 * 3600 * 1000); // 24 hours in ms

          if (logger) {
            logger.warning('Global daily rate limit exceeded', {
              limit: dailyResult.limit,
              remaining: dailyResult.remaining,
              timeRemaining,
            });
          }

          return {
            passed: false,
            code: 'rate_limit_global_daily',
            message: 'Global daily rate limit exceeded',
            details: {
              limit: dailyResult.limit,
              remaining: dailyResult.remaining,
              timeRemaining,
            },
            severity: 'warning',
          };
        }

        if (logger) {
          logger.debug('Global daily rate limit check passed', {
            limit: dailyResult.limit,
            remaining: dailyResult.remaining,
          });
        }
      }

      // If we get here, all rate limit checks passed
      return {
        passed: true,
        code: 'rate_limit_global_ok',
        message: 'Global rate limits not exceeded',
        severity: 'info',
      };
    } catch (error) {
      // Log the error
      if (logger) {
        logger.error('Error in global rate limit check', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }

      // If there's an error with rate limiting, we'll allow the request to proceed
      return {
        passed: true,
        code: 'rate_limit_error',
        message: 'Error checking rate limits, allowing request',
        details: { error: error instanceof Error ? error.message : String(error) },
        severity: 'warning',
      };
    }
  },
};
