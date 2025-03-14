import { PreflightCheck, CheckResult, PreflightParams } from '../types';

export const inputLengthCheck: PreflightCheck = {
  name: 'input_length',
  description: 'Checks if the input meets the length requirements',
  tier: 1,
  enabled: true,
  configurable: true,
  defaultConfig: {
    minLength: 4,
    maxLength: 1000,
  },
  run: async ({ lastMessage, checkConfig, logger }: PreflightParams): Promise<CheckResult> => {
    // Get configuration, using defaults if not provided
    const config = {
      minLength: checkConfig?.minLength ?? 4,
      maxLength: checkConfig?.maxLength ?? 1000,
    };

    // Log the configuration being used
    if (logger) {
      logger.debug('Running input length check', {
        checkName: 'input_length',
        minLength: config.minLength,
        maxLength: config.maxLength,
        inputLength: lastMessage?.length || 0,
      });
    }

    if (!lastMessage || lastMessage.trim().length < config.minLength) {
      return {
        passed: false,
        code: 'input_too_short',
        message: 'Input is too short',
        details: {
          minLength: config.minLength,
          actualLength: lastMessage?.length || 0,
        },
        severity: 'info',
      };
    }

    if (lastMessage.length > config.maxLength) {
      return {
        passed: false,
        code: 'input_too_long',
        message: 'Input exceeds maximum length',
        details: {
          maxLength: config.maxLength,
          actualLength: lastMessage.length,
        },
        severity: 'info',
      };
    }

    return {
      passed: true,
      code: 'input_length_valid',
      message: 'Input length is valid',
      severity: 'info',
    };
  },
};
