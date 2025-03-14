// /apps/web/app/(ai)/lib/error-handling/logger.ts
import { log } from '@logtail/next';

// Re-export the log object for use throughout your application
export const logger = log;

// You can add additional utility functions if needed
export function logError(message: string, context?: Record<string, any>) {
  log.error(message, context);
}

export function logInfo(message: string, context?: Record<string, any>) {
  log.info(message, context);
}

export function logWarning(message: string, context?: Record<string, any>) {
  log.warn(message, context);
}

export function logDebug(message: string, context?: Record<string, any>) {
  log.debug(message, context);
}
