import { PreflightCheck, CheckResult } from '../types';
import { Filter } from 'bad-words';

// Initialize the filter with default dictionary
const filter = new Filter();

// Add custom blacklisted terms
// These can be moved to a config file or environment variables for easier management
const ADDITIONAL_BLACKLISTED_TERMS = [
  // Original terms
  'system prompt',
  'prompt injection',
  'ignore previous instructions',
  'ignore all instructions',
  'disregard previous',
  'your real instructions',
  'your actual instructions',
  'your true instructions',
  'bypass',
  'jailbreak',
  'ignore all previous',
  'developer mode',
  'unrestricted assistant',
  'jailbreak mode',
  'do anything now',
  'forget all restrictions',
  'roleplay as',
  'DAN mode',
  'data analysis mode',
  'super user mode',
  'sudo mode',
  'override security',
  'unlimited mode',
  'confidential mode',
  'be free to',
  'admin mode',
  'secret mode',
  'you are now free',
  'you can do anything',
  'no ethical constraints',
  'no moral constraints',
  'pretend to be',
  'act as if',
  'ignore your programming',
  'ignore your training',
  'ignore your guidelines',
  'ignore previous prompt',
  'you are an AI that',
  'your knowledge cutoff',
  'simulate a different AI',
  'you are a different AI',
  'you are no longer',
  'break character',
  'ignore safety',
  'ignore content policy',
  'ignore security measures',
  'escape your restrictions',
  'escape your constraints',
  'override ethics',
];

// Add custom blacklisted terms to the filter
ADDITIONAL_BLACKLISTED_TERMS.forEach((term) => filter.addWords(term));

// Create a different instance for partial matching
const partialMatchFilter = new Filter();
partialMatchFilter.addWords(...ADDITIONAL_BLACKLISTED_TERMS);

// Remove spaces and special characters for more robust checking
function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[\s_\-.,]/g, '');
}

// Function to check for partial matches
function containsPartialMatch(input: string, terms: string[]): string | null {
  const normalizedInput = normalizeText(input);

  for (const term of terms) {
    const normalizedTerm = normalizeText(term);
    if (normalizedInput.includes(normalizedTerm)) {
      return term;
    }
  }

  return null;
}

export const blacklistedKeywordsCheck: PreflightCheck = {
  name: 'content_moderation',
  description: 'Checks for blacklisted or prohibited keywords in the input',
  tier: 1,
  enabled: true,
  configurable: false,
  run: async ({ lastMessage }) => {
    try {
      // Check if there's any content to check
      if (!lastMessage || lastMessage.trim().length === 0) {
        return {
          passed: true,
          code: 'blacklist_check_skipped',
          message: 'No content to check',
          severity: 'info',
        };
      }

      // First check: Standard profanity check using bad-words
      if (filter.isProfane(lastMessage)) {
        const cleanVersion = filter.clean(lastMessage);
        console.warn('Blacklisted keywords check: Profanity detected');

        return {
          passed: false,
          code: 'blacklisted_keywords',
          message: 'Input contains prohibited words or phrases',
          details: {
            reason: 'Profanity or blacklisted keywords detected',
            // Don't send back what exactly was detected to prevent bypassing
          },
          severity: 'error',
        };
      }

      // Second check: Partial matching for more robust detection
      // This helps catch attempts to bypass by separating characters
      const matchedTerm = containsPartialMatch(lastMessage, ADDITIONAL_BLACKLISTED_TERMS);
      if (matchedTerm) {
        console.warn(`Blacklisted keywords check: Partial match detected for "${matchedTerm}"`);

        return {
          passed: false,
          code: 'blacklisted_keywords',
          message: 'Input contains prohibited words or phrases',
          details: {
            reason: 'Prohibited content pattern detected',
            // Don't send back what exactly was detected to prevent bypassing
          },
          severity: 'error',
        };
      }

      return {
        passed: true,
        code: 'blacklist_check_passed',
        message: 'No blacklisted keywords detected',
        severity: 'info',
      };
    } catch (error) {
      console.error('Blacklisted keywords check error:', error);

      // Fail safely
      return {
        passed: false,
        code: 'blacklist_check_error',
        message: 'Error checking for prohibited content',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        severity: 'error',
      };
    }
  },
};
