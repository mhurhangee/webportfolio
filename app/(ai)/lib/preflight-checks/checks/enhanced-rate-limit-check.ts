import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { PreflightCheck, PreflightParams } from '../types';

// Initialize Redis and Ratelimit
const redis = Redis.fromEnv();

// Create a separate instance for tracking warnings
// Using fixed window for warnings to ensure they expire after the window
const warningTracker = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, '1 h'), // 5 warnings per hour
  analytics: true,
  prefix: 'ratelimit:warning:',
});

// Timeout tracker - longer window for persistent offenders
const timeoutTracker = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(3, '24 h'), // 3 timeouts per day
  analytics: true,
  prefix: 'ratelimit:timeout:',
});

// Enhanced rate limiter with IP protection
const ipRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, '1 h'), // 50 requests per hour per IP
  analytics: true,
  prefix: 'ratelimit:ip:',
});

// Warning codes that should increment the warning counter
const WARNING_CODES = [
  'non_english_input',
  'blacklisted_keyword',
  'input_length_exceeded',
  'content_moderation_violation',
  'jailbreak_attempt',
  'ethical_concerns',
  'xss_injection_detected',
  'sql_injection_detected',
];

export const enhancedRateLimitCheck: PreflightCheck = {
  name: 'enhanced_rate_limit',
  description: 'Enhanced rate limiting with IP protection and warning tracking',
  tier: 2,
  enabled: true,
  configurable: true,
  defaultConfig: {
    // Warning limit before timeout
    warningLimit: 5,
    // Warning window in hours
    warningWindow: 1,
    // Timeout duration in minutes (increases with repeated timeouts)
    baseTimeoutMinutes: 30,
    // Maximum timeout duration in minutes
    maxTimeoutMinutes: 1440, // 24 hours
    // Whether to enable the deny list for persistent offenders
    enableDenyList: false,
    // Codes that should trigger warnings
    warningCodes: WARNING_CODES,
  },
  run: async ({ ip = 'unknown', userAgent = 'unknown', checkConfig, logger }: PreflightParams) => {
    try {
      // Get configuration, using defaults if not provided
      const config = {
        warningLimit: checkConfig?.warningLimit ?? 5,
        warningWindow: checkConfig?.warningWindow ?? 1,
        baseTimeoutMinutes: checkConfig?.baseTimeoutMinutes ?? 30,
        maxTimeoutMinutes: checkConfig?.maxTimeoutMinutes ?? 1440,
        enableDenyList: checkConfig?.enableDenyList ?? false,
        warningCodes: checkConfig?.warningCodes ?? WARNING_CODES,
      };

      // Skip check if IP is unknown
      if (!ip || ip === 'unknown') {
        if (logger) {
          logger.debug('Enhanced rate limit check skipped: Unknown IP');
        }
        return {
          passed: true,
          code: 'enhanced_rate_limit_skipped',
          message: 'Rate limit check skipped for unknown IP',
          severity: 'info',
        };
      }

      // Log the check execution
      if (logger) {
        logger.debug('Running enhanced rate limit check', {
          checkName: 'enhanced_rate_limit',
          ip,
        });
      }

      // First check if this IP is in timeout from previous warnings
      const timeoutKey = `timeout:${ip}`;
      const timeoutData = await redis.get(timeoutKey);

      if (timeoutData) {
        const { until, reason, timeoutCount } = JSON.parse(
          typeof timeoutData === 'string' ? timeoutData : JSON.stringify(timeoutData)
        );
        const untilDate = new Date(until);

        // Check if the timeout is still active
        if (untilDate > new Date()) {
          const timeRemaining = Math.ceil((untilDate.getTime() - Date.now()) / 1000 / 60);

          if (logger) {
            logger.warn('IP in timeout period', {
              ip,
              timeRemaining,
              reason,
              timeoutCount,
            });
          }

          return {
            passed: false,
            code: 'ip_in_timeout',
            message: 'Too many warnings, please try again later',
            details: {
              timeRemaining,
              reason,
              timeoutCount,
            },
            severity: 'error',
          };
        } else {
          // Timeout has expired, remove it
          await redis.del(timeoutKey);

          if (logger) {
            logger.debug('IP timeout expired', { ip });
          }
        }
      }

      // Check if this IP has exceeded the standard rate limit
      const ipLimitResult = await ipRateLimiter.limit(ip);

      if (!ipLimitResult.success) {
        const resetDate = new Date(ipLimitResult.reset);
        const timeRemaining = Math.ceil((resetDate.getTime() - Date.now()) / 1000 / 60);

        if (logger) {
          logger.warn('IP rate limit exceeded', {
            ip,
            limit: ipLimitResult.limit,
            remaining: ipLimitResult.remaining,
            timeRemaining,
          });
        }

        // Check if this is a repeated rate limit violation
        // If so, increment the warning count
        await incrementWarningCount(ip, 'rate_limit_exceeded', logger);

        return {
          passed: false,
          code: 'ip_rate_limit_exceeded',
          message: 'Rate limit exceeded, please try again later',
          details: {
            limit: ipLimitResult.limit,
            remaining: ipLimitResult.remaining,
            timeRemaining,
          },
          severity: 'error',
        };
      }

      // Check warning count for this IP
      const warningStatus = await warningTracker.limit(ip);

      // Calculate remaining warnings
      const warningsUsed = config.warningLimit - warningStatus.remaining;

      if (logger) {
        logger.debug('IP warning status', {
          ip,
          warningsUsed,
          warningLimit: config.warningLimit,
        });
      }

      // Pass the check - actual warnings are handled by the incrementWarningCount function
      return {
        passed: true,
        code: 'enhanced_rate_limit_passed',
        message: 'Enhanced rate limit check passed',
        details: {
          ip,
          warningsUsed,
          warningLimit: config.warningLimit,
        },
        severity: 'info',
      };
    } catch (error) {
      if (logger) {
        logger.error('Error in enhanced rate limit check', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }

      // If there's an error, we'll allow the request to proceed
      return {
        passed: true,
        code: 'enhanced_rate_limit_error',
        message: 'Error in rate limit check, allowing request',
        details: { error: error instanceof Error ? error.message : String(error) },
        severity: 'warning',
      };
    }
  },
};

/**
 * Increments the warning count for an IP address
 * If the warning count exceeds the limit, puts the IP in timeout
 */
export async function incrementWarningCount(
  ip: string,
  reason: string = 'violation',
  logger?: any
): Promise<void> {
  try {
    // Only increment if IP is provided
    if (!ip || ip === 'unknown') return;

    // Consume a token from the warning tracker
    // This is important - it actually increments the count
    const warningStatus = await warningTracker.limit(ip);

    // Wait for any pending tasks to complete
    await warningStatus.pending;

    // Get the current warning count
    const warningCount = 5 - warningStatus.remaining;

    if (logger) {
      logger.debug('Incremented warning count', {
        ip,
        warningCount,
        reason,
      });
    } else {
      console.log(`Warning count for ${ip}: ${warningCount}/5 (Reason: ${reason})`);
    }

    // If warnings have reached the limit, put the IP in timeout
    if (warningCount >= 5) {
      await putIPInTimeout(ip, reason, logger);
    }
  } catch (error) {
    if (logger) {
      logger.error('Error incrementing warning count', {
        error: error instanceof Error ? error.message : String(error),
        ip,
      });
    } else {
      console.error('Error incrementing warning count:', error);
    }
  }
}

/**
 * Puts an IP address in timeout for a period of time
 * The timeout duration increases with repeated timeouts
 */
async function putIPInTimeout(
  ip: string,
  reason: string = 'excessive_warnings',
  logger?: any
): Promise<void> {
  try {
    // Check if this IP has been in timeout before
    // Consume a token from the timeout tracker to count this timeout
    const timeoutStatus = await timeoutTracker.limit(ip);
    await timeoutStatus.pending;

    // Calculate the timeout count (how many times this IP has been timed out)
    const timeoutCount = 3 - timeoutStatus.remaining;

    // Calculate timeout duration - increases with repeated timeouts
    // Base: 30 min, doubles each time up to max (24 hours)
    const baseTimeoutMinutes = 30;
    const maxTimeoutMinutes = 1440; // 24 hours

    let timeoutMinutes = baseTimeoutMinutes * Math.pow(2, timeoutCount - 1);
    timeoutMinutes = Math.min(timeoutMinutes, maxTimeoutMinutes);

    // Set timeout expiration
    const until = new Date(Date.now() + timeoutMinutes * 60 * 1000);

    // Store timeout data
    const timeoutKey = `timeout:${ip}`;
    const timeoutData = {
      until: until.toISOString(),
      reason,
      timeoutCount,
    };

    // Set timeout with expiration
    await redis.set(timeoutKey, JSON.stringify(timeoutData), {
      ex: timeoutMinutes * 60, // Expiration in seconds
    });

    if (logger) {
      logger.warn('IP put in timeout', {
        ip,
        timeoutMinutes,
        until: until.toISOString(),
        reason,
        timeoutCount,
      });
    } else {
      console.warn(`IP ${ip} put in timeout for ${timeoutMinutes} minutes. Reason: ${reason}`);
    }

    // Reset warning count since we've now applied a timeout
    await redis.del(`ratelimit:warning:${ip}`);
  } catch (error) {
    if (logger) {
      logger.error('Error putting IP in timeout', {
        error: error instanceof Error ? error.message : String(error),
        ip,
      });
    } else {
      console.error('Error putting IP in timeout:', error);
    }
  }
}

/**
 * Adds an IP to the deny list (use sparingly)
 * This is a more permanent block for persistent offenders
 */
export async function addToDenyList(ip: string, logger?: any): Promise<void> {
  try {
    // Store in a deny list set
    await redis.sadd('ip:denylist', ip);

    if (logger) {
      logger.warning('IP added to deny list', { ip });
    } else {
      console.warn(`IP ${ip} added to deny list`);
    }
  } catch (error) {
    if (logger) {
      logger.error('Error adding to deny list', {
        error: error instanceof Error ? error.message : String(error),
        ip,
      });
    } else {
      console.error('Error adding to deny list:', error);
    }
  }
}

/**
 * Checks if an IP is on the deny list
 */
export async function isIPDenied(ip: string): Promise<boolean> {
  try {
    return (await redis.sismember('ip:denylist', ip)) === 1;
  } catch (error) {
    console.error('Error checking deny list:', error);
    return false;
  }
}
