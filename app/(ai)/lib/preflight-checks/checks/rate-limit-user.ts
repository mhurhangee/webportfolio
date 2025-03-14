import { PreflightCheck, PreflightParams } from '../types';
import { Ratelimit, Duration } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { formatTimeRemaining } from '../utils';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Default user rate limit configuration
const DEFAULT_USER_LIMIT = 20;
const DEFAULT_USER_DURATION = '1 h';

// Create rate limiter with configurable values
function createUserRateLimiter(limit: number, duration: Duration) {
  return new Ratelimit({
    redis: redis,
    limiter: Ratelimit.fixedWindow(limit, duration),
    analytics: true,
    prefix: 'ratelimit:user',
  });
}

export const rateLimitUserCheck: PreflightCheck = {
  name: 'rate_limit_user',
  description: 'Checks if the user rate limit has been exceeded',
  tier: 3,
  enabled: true,
  configurable: true,
  defaultConfig: {
    // User rate limit configuration
    userLimit: DEFAULT_USER_LIMIT,
    userDuration: DEFAULT_USER_DURATION,
    // Whether to skip for anonymous users
    skipAnonymousUsers: false,
    // Default anonymous user ID
    anonymousUserIds: ['anonymous', 'unknown'],
  },
  run: async ({ userId, checkConfig, logger }: PreflightParams) => {
    try {
      // Get configuration, using defaults if not provided
      const config = {
        userLimit: checkConfig?.userLimit ?? DEFAULT_USER_LIMIT,
        userDuration: checkConfig?.userDuration ?? DEFAULT_USER_DURATION,
        skipAnonymousUsers: checkConfig?.skipAnonymousUsers ?? false,
        anonymousUserIds: checkConfig?.anonymousUserIds ?? ['anonymous', 'unknown'],
      };

      // Log the configuration being used
      if (logger) {
        logger.debug('Running user rate limit check', {
          checkName: 'rate_limit_user',
          userId,
          userLimit: config.userLimit,
          userDuration: config.userDuration,
          skipAnonymousUsers: config.skipAnonymousUsers,
        });
      }

      // Skip for anonymous users if configured
      if (config.skipAnonymousUsers && (config.anonymousUserIds.includes(userId) || !userId)) {
        if (logger) {
          logger.debug('User rate limit check skipped for anonymous user', {
            userId,
          });
        }

        return {
          passed: true,
          code: 'rate_limit_user_skipped',
          message: 'Rate limit check skipped for anonymous user',
          severity: 'info',
        };
      }

      // Create rate limiter with the configured values
      const ratelimit = createUserRateLimiter(config.userLimit, config.userDuration);

      // Check the user-specific rate limit
      const result = await ratelimit.limit(userId);

      if (!result.success) {
        // Calculate time remaining for user-friendly message
        // For fixed window, we need to approximate the reset time
        const durationMs = config.userDuration.includes('h')
          ? parseInt(config.userDuration) * 3600 * 1000
          : 3600 * 1000; // Default to 1 hour

        const timeRemaining = formatTimeRemaining(durationMs);

        if (logger) {
          logger.warning('User rate limit exceeded', {
            userId,
            limit: result.limit,
            remaining: result.remaining,
            timeRemaining,
          });
        }

        return {
          passed: false,
          code: 'rate_limit_user',
          message: 'User rate limit exceeded',
          details: {
            limit: result.limit,
            remaining: result.remaining,
            timeRemaining,
          },
          severity: 'warning',
        };
      }

      if (logger) {
        logger.debug('User rate limit check passed', {
          userId,
          limit: result.limit,
          remaining: result.remaining,
        });
      }

      return {
        passed: true,
        code: 'rate_limit_user_ok',
        message: 'User rate limit check passed',
        details: {
          limit: result.limit,
          remaining: result.remaining,
        },
        severity: 'info',
      };
    } catch (error) {
      // Log the error
      if (logger) {
        logger.error('Error in user rate limit check', {
          userId,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }

      // If there's an error with rate limiting, we'll allow the request to proceed
      return {
        passed: true,
        code: 'rate_limit_user_error',
        message: 'Error checking user rate limits, allowing request',
        details: { error: error instanceof Error ? error.message : String(error) },
        severity: 'warning',
      };
    }
  },
};
