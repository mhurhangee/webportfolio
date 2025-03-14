import { PreflightCheck, PreflightParams } from '../types';
import { francAll } from 'franc';
import englishWords from 'an-array-of-english-words';

const commonEnglishWords = new Set(englishWords);

// Common English phrases and patterns that should always pass
const COMMON_ENGLISH_PATTERNS = [
  /^(write|create|generate|explain|help|tell|show)/i,
  /\b(code|function|api|app|application|website|blog|article)\b/i,
  /\b(i need|i want|i would like|can you|please)\b/i,
  /\b(this is|that is|it is|what is|how to)\b/i,
];

export const languageCheck: PreflightCheck = {
  name: 'language_check',
  description: 'Checks if the input is in English language',
  tier: 1,
  enabled: true,
  configurable: true,
  defaultConfig: {
    // Minimum confidence for language detection
    minConfidence: 0.5,
    // Minimum percentage of English words required
    minEnglishPercentage: 30,
    // Whether to allow code snippets (which may contain non-English words)
    allowCodeSnippets: true,
    // Additional allowed languages besides English
    additionalAllowedLanguages: [], // e.g., ['fra', 'deu', 'spa']
  },
  run: async ({ lastMessage, checkConfig, logger }: PreflightParams) => {
    try {
      // Get configuration, using defaults if not provided
      const config = {
        minConfidence: checkConfig?.minConfidence ?? 0.5,
        minEnglishPercentage: checkConfig?.minEnglishPercentage ?? 30,
        allowCodeSnippets: checkConfig?.allowCodeSnippets ?? true,
        additionalAllowedLanguages: checkConfig?.additionalAllowedLanguages ?? [],
      };

      // Log the configuration being used
      if (logger) {
        logger.debug('Running language check', {
          checkName: 'language_check',
          minConfidence: config.minConfidence,
          minEnglishPercentage: config.minEnglishPercentage,
          allowCodeSnippets: config.allowCodeSnippets,
          additionalAllowedLanguages: config.additionalAllowedLanguages,
        });
      }

      if (!lastMessage || lastMessage.trim().length === 0) {
        if (logger) {
          logger.debug('Language check: No content to check');
        }
        return {
          passed: true,
          code: 'language_check_skipped',
          message: 'No content to check',
          severity: 'info',
        };
      }

      // Check for common English patterns first (quick win)
      for (const pattern of COMMON_ENGLISH_PATTERNS) {
        if (pattern.test(lastMessage)) {
          if (logger) {
            logger.debug('Language check: Common English pattern detected');
          }
          return {
            passed: true,
            code: 'language_check_pattern_match',
            message: 'Common English pattern detected',
            severity: 'info',
          };
        }
      }

      const words = lastMessage
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 1);

      // Be more lenient with short inputs (1-5 words)
      if (words.length <= 5) {
        if (logger) {
          logger.debug('Language check: Input too short for reliable detection');
        }
        return {
          passed: true,
          code: 'language_check_short_input',
          message: 'Input too short for reliable language detection',
          severity: 'info',
        };
      }

      // Check for code snippets
      if (config.allowCodeSnippets) {
        const codePatterns = [
          /```[\s\S]*?```/g, // Markdown code blocks
          /<[a-z]+[^>]*>[\s\S]*?<\/[a-z]+>/g, // HTML tags
          /function\s+\w+\s*\([^)]*\)\s*{/g, // JavaScript functions
          /const|let|var\s+\w+\s*=/g, // JavaScript variable declarations
          /import\s+.*?from\s+['"].*?['"]/g, // JavaScript imports
          /class\s+\w+(\s+extends\s+\w+)?(\s+implements\s+\w+)?\s*{/g, // Class definitions
        ];

        for (const pattern of codePatterns) {
          if (pattern.test(lastMessage)) {
            if (logger) {
              logger.debug('Language check: Code snippet detected, skipping strict language check');
            }
            return {
              passed: true,
              code: 'language_check_code_detected',
              message: 'Code snippet detected, skipping strict language check',
              severity: 'info',
            };
          }
        }
      }

      // Count English words
      const englishWordCount = words.filter((word) => commonEnglishWords.has(word)).length;
      const englishPercentage = (englishWordCount / words.length) * 100;

      // Use franc for language detection
      const langDetectionResult = francAll(lastMessage);

      // Check if the top result is English or one of the additional allowed languages
      const allowedLanguages = ['eng', ...config.additionalAllowedLanguages];
      const topResult = langDetectionResult[0] || ['unknown', 0];

      if (logger) {
        logger.debug('Language check: Detection results', {
          topLanguage: topResult[0],
          confidence: topResult[1],
          englishPercentage,
          englishWordCount,
          totalWords: words.length,
          allowedLanguages,
        });
      }

      // Pass if either:
      // 1. Top language is in allowed languages with sufficient confidence, OR
      // 2. English word percentage is high enough
      if (
        (allowedLanguages.includes(topResult[0]) && topResult[1] >= config.minConfidence) ||
        englishPercentage >= config.minEnglishPercentage
      ) {
        return {
          passed: true,
          code: 'language_check_passed',
          message: 'Input language is acceptable',
          details: {
            detectedLanguage: topResult[0],
            confidence: topResult[1],
            englishPercentage,
          },
          severity: 'info',
        };
      }

      // If we get here, the language check failed
      return {
        passed: false,
        code: 'non_english_input',
        message: 'Input must be in English',
        details: {
          detectedLanguage: topResult[0],
          confidence: topResult[1],
          englishPercentage,
        },
        severity: 'info',
      };
    } catch (error) {
      // Log the error
      if (logger) {
        logger.error('Error in language check', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }

      // If there's an error, we'll pass the check to avoid blocking users
      return {
        passed: true,
        code: 'language_check_error',
        message: 'Error during language detection, allowing request',
        details: { error: error instanceof Error ? error.message : String(error) },
        severity: 'warning',
      };
    }
  },
};
