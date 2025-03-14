import { PreflightCheck, PreflightParams } from '../types';

export const inputSanitizationCheck: PreflightCheck = {
  name: 'input_sanitization',
  description: 'Checks and sanitizes input for potentially dangerous patterns',
  tier: 1,
  enabled: true,
  configurable: true,
  defaultConfig: {
    // Whether to check for XSS patterns
    checkXSS: true,
    // Whether to check for SQL injection patterns
    checkSQLi: true,
    // Additional patterns to check (regex strings)
    additionalPatterns: [],
  },
  run: async ({ lastMessage, checkConfig, logger }: PreflightParams) => {
    try {
      // Get configuration, using defaults if not provided
      const config = {
        checkXSS: checkConfig?.checkXSS ?? true,
        checkSQLi: checkConfig?.checkSQLi ?? true,
        additionalPatterns: checkConfig?.additionalPatterns ?? [],
      };

      // Log the configuration being used
      if (logger) {
        logger.debug('Running input sanitization check', {
          checkName: 'input_sanitization',
          checkXSS: config.checkXSS,
          checkSQLi: config.checkSQLi,
          additionalPatternsCount: config.additionalPatterns.length,
        });
      }

      if (!lastMessage || lastMessage.trim().length === 0) {
        if (logger) {
          logger.debug('Input sanitization: No content to sanitize');
        }
        return {
          passed: true,
          code: 'sanitization_skipped',
          message: 'No content to sanitize',
          severity: 'info',
        };
      }

      // Check for potentially malicious patterns
      if (config.checkXSS) {
        const xssPattern = /<script|javascript:|onerror=|onclick=|onload=/i;
        const containsScript = xssPattern.test(lastMessage);

        if (containsScript) {
          if (logger) {
            logger.warning('Input sanitization: Potential XSS detected', {
              pattern: xssPattern.toString(),
            });
          }
          return {
            passed: false,
            code: 'potential_xss',
            message: 'Input contains potentially unsafe script elements',
            severity: 'error',
          };
        }
      }

      if (config.checkSQLi) {
        const sqliPattern = /(\s|;)(select|insert|update|delete|drop|alter|create)\s/i;
        const containsSQLi = sqliPattern.test(lastMessage);

        if (containsSQLi) {
          if (logger) {
            logger.warning('Input sanitization: Potential SQL injection pattern detected', {
              pattern: sqliPattern.toString(),
            });
          }
          return {
            passed: false,
            code: 'potential_sqli',
            message: 'Input contains potentially unsafe SQL patterns',
            severity: 'error',
          };
        }
      }

      // Check additional patterns if provided
      if (config.additionalPatterns && config.additionalPatterns.length > 0) {
        for (const patternStr of config.additionalPatterns) {
          try {
            const pattern = new RegExp(patternStr);
            if (pattern.test(lastMessage)) {
              if (logger) {
                logger.warning('Input sanitization: Custom pattern matched', {
                  pattern: patternStr,
                });
              }
              return {
                passed: false,
                code: 'custom_pattern_matched',
                message: 'Input matched a custom security pattern',
                details: { pattern: patternStr },
                severity: 'error',
              };
            }
          } catch (regexError) {
            // Log invalid regex but continue with other checks
            if (logger) {
              logger.error('Input sanitization: Invalid regex pattern', {
                pattern: patternStr,
                error: regexError instanceof Error ? regexError.message : String(regexError),
              });
            }
          }
        }
      }

      if (logger) {
        logger.debug('Input sanitization: Input appears safe');
      }

      return {
        passed: true,
        code: 'sanitization_passed',
        message: 'Input appears safe',
        severity: 'info',
      };
    } catch (error) {
      // Log the error
      if (logger) {
        logger.error('Error in input sanitization check', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }

      // In case of error, block the content as a precaution
      return {
        passed: false,
        code: 'sanitization_error',
        message: 'Error during input sanitization',
        details: { error: error instanceof Error ? error.message : String(error) },
        severity: 'error',
      };
    }
  },
};
