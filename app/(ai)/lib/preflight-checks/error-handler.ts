import { CheckResult, ErrorDisplayConfig, ErrorDisplayMap } from './types';

// Default error display configurations
const defaultErrorDisplays: ErrorDisplayMap = {
  // Rate limiting errors
  rate_limit_global: (result) => ({
    title: 'Service is busy',
    description: 'Our AI service is experiencing high demand. Please try again in a few minutes.',
    severity: 'warning',
  }),
  rate_limit_user: (result) => ({
    title: 'Usage limit reached',
    description: `You've reached the maximum number of requests. Please try again in ${result.details?.timeRemaining || 'a few minutes'}.`,
    severity: 'warning',
  }),

  // Content errors
  moderation_flagged: (result) => ({
    title: 'Content policy violation',
    description: 'Your message contains content that violates our usage policies.',
    severity: 'error',
  }),
  blacklisted_keywords: (result) => ({
    title: 'Prohibited content',
    description: 'Your message contains terms that are not allowed on our platform.',
    severity: 'error',
  }),
  negative_sentiment: (result) => ({
    title: 'Negative content detected',
    description: 'Please rephrase your message with a more neutral or positive tone.',
    severity: 'warning',
  }),

  // Technical errors
  input_too_short: (result) => ({
    title: 'Message too short',
    description: 'Please provide a more detailed message for the AI to process.',
    severity: 'info',
  }),
  input_too_long: (result) => ({
    title: 'Message too long',
    description: `Your message exceeds the ${result.details?.maxLength || 'maximum'} character limit. Please shorten it.`,
    severity: 'info',
  }),
  non_english: (result) => ({
    title: 'Language not supported',
    description: 'Currently, only English language is supported.',
    severity: 'info',
  }),
  repetitive_input: (result) => ({
    title: 'Repetitive messages',
    description: 'Please avoid sending similar messages repeatedly.',
    severity: 'info',
  }),
  not_relevant: (result) => ({
    title: 'Context switch detected',
    description: 'Your message seems unrelated to the previous conversation.',
    severity: 'info',
  }),

  // Fallback error
  default: (result) => ({
    title: 'Request cannot be processed',
    description: result.message || 'Something went wrong. Please try again later.',
    severity: 'error',
  }),
};

/**
 * Gets the appropriate error display configuration based on the check result
 */
export function getErrorDisplay(
  result: CheckResult,
  customDisplays?: ErrorDisplayMap
): ErrorDisplayConfig {
  const displays = { ...defaultErrorDisplays, ...customDisplays };

  // Try to find specific error code handler
  const displayHandler = displays[result.code] || displays['default'];

  // Ensure we always have a valid handler function
  if (displayHandler) {
    return displayHandler(result);
  } else {
    // Fallback in case 'default' handler is also missing
    return {
      title: 'Request cannot be processed',
      description: result.message || 'Something went wrong. Please try again later.',
      severity: 'error',
    };
  }
}

/**
 * Handles preflight check errors in API routes
 */
export function handlePreflightError(result: CheckResult) {
  const errorDisplay = getErrorDisplay(result);

  return {
    error: errorDisplay.title,
    message: errorDisplay.description,
    code: result.code,
    details: result.details,
    severity: errorDisplay.severity,
  };
}
