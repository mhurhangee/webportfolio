import { PreflightCheck, PreflightParams } from '../types';
import { analyzeContent } from './ai-detection';

export const aiContentAnalysisCheck: PreflightCheck = {
  name: 'ai_content_analysis',
  description:
    'Uses AI to analyze content for various issues including jailbreak attempts, ethical concerns, and more',
  tier: 4, // Higher tier as this is more resource-intensive
  enabled: true,
  configurable: true,
  defaultConfig: {
    // Confidence thresholds for different checks
    jailbreakThreshold: 0.6,
    ethicalConcernThreshold: 0.7,
    sentimentThreshold: -0.7,
    // Whether to block or just warn for different issues
    blockJailbreakAttempts: true,
    blockEthicalConcerns: true,
    blockCopyrightIssues: false,
    blockNegativeContent: false,
    // Additional categories to check
    additionalBlockCategories: [],
    // Whether to run in strict mode (lower thresholds)
    strictMode: false,
  },
  run: async ({ lastMessage, checkConfig, logger }: PreflightParams) => {
    try {
      // Get configuration, using defaults if not provided
      const config = {
        jailbreakThreshold: checkConfig?.jailbreakThreshold ?? 0.6,
        ethicalConcernThreshold: checkConfig?.ethicalConcernThreshold ?? 0.7,
        sentimentThreshold: checkConfig?.sentimentThreshold ?? -0.7,
        blockJailbreakAttempts: checkConfig?.blockJailbreakAttempts ?? true,
        blockEthicalConcerns: checkConfig?.blockEthicalConcerns ?? true,
        blockCopyrightIssues: checkConfig?.blockCopyrightIssues ?? false,
        blockNegativeContent: checkConfig?.blockNegativeContent ?? false,
        additionalBlockCategories: checkConfig?.additionalBlockCategories ?? [],
        strictMode: checkConfig?.strictMode ?? false,
      };

      // Log the configuration being used
      if (logger) {
        logger.debug('Running AI content analysis check', {
          checkName: 'ai_content_analysis',
          jailbreakThreshold: config.jailbreakThreshold,
          ethicalConcernThreshold: config.ethicalConcernThreshold,
          sentimentThreshold: config.sentimentThreshold,
          strictMode: config.strictMode,
        });
      }

      // Check if there's any content to analyze
      if (!lastMessage || lastMessage.trim().length === 0) {
        if (logger) {
          logger.debug('AI content analysis: No content to analyze');
        }
        return {
          passed: true,
          code: 'content_analysis_skipped',
          message: 'No content to analyze',
          severity: 'info',
        };
      }

      // Use AI to analyze the message across multiple dimensions
      const startTime = performance.now();
      const analysis = await analyzeContent(lastMessage);
      const analysisTime = performance.now() - startTime;

      if (logger) {
        logger.debug('AI content analysis completed', {
          executionTimeMs: analysisTime,
          overallSafe: analysis.overall.safeToProcess,
          jailbreakAttempt: analysis.jailbreak.isAttempt,
          jailbreakConfidence: analysis.jailbreak.confidence,
          ethicalConcerns: analysis.ethical.hasConcerns,
          ethicalLevel: analysis.ethical.level,
          sentimentScore: analysis.sentiment.score,
        });
      }

      // If the AI determines the content is not safe to process
      if (!analysis.overall.safeToProcess) {
        if (logger) {
          logger.warning('Content flagged as unsafe by AI analysis', {
            reason: analysis.overall.primaryReason,
            jailbreakConfidence: analysis.jailbreak.isAttempt ? analysis.jailbreak.confidence : 0,
            ethicalLevel: analysis.ethical.hasConcerns ? analysis.ethical.level : 'none',
            sentimentScore: analysis.sentiment.score,
          });
        }

        // Determine the most appropriate failure code based on the analysis
        let code = 'content_unsafe';
        let severity: 'warning' | 'error' = 'error';
        let shouldBlock = true;

        if (
          analysis.jailbreak.isAttempt &&
          analysis.jailbreak.confidence > config.jailbreakThreshold
        ) {
          code = 'jailbreak_attempt';
          shouldBlock = config.blockJailbreakAttempts;
        } else if (
          analysis.ethical.hasConcerns &&
          (analysis.ethical.level === 'high' ||
            (analysis.ethical.level === 'medium' && config.strictMode))
        ) {
          code = 'ethical_concerns';
          shouldBlock = config.blockEthicalConcerns;
        } else if (
          analysis.copyright.potentialIssue &&
          analysis.copyright.contentType === 'likely_copyrighted'
        ) {
          code = 'copyright_concerns';
          severity = 'warning';
          shouldBlock = config.blockCopyrightIssues;
        } else if (
          analysis.sentiment.label === 'negative' &&
          analysis.sentiment.score < config.sentimentThreshold
        ) {
          code = 'extremely_negative';
          severity = 'warning';
          shouldBlock = config.blockNegativeContent;
        }

        // If we're not blocking this type of content, change to warning
        if (!shouldBlock) {
          severity = 'warning';
        }

        return {
          passed: !shouldBlock,
          code,
          message: 'Content analysis detected potential issues',
          details: {
            reason: analysis.overall.primaryReason,
            // Include key details but not everything to prevent revealing too much
            jailbreakConfidence: analysis.jailbreak.isAttempt ? analysis.jailbreak.confidence : 0,
            ethicalLevel: analysis.ethical.hasConcerns ? analysis.ethical.level : 'none',
            sentimentScore: analysis.sentiment.score,
            executionTimeMs: analysisTime,
          },
          severity,
          executionTimeMs: analysisTime,
        };
      }

      // If it passed overall but has some potential concerns worth logging
      if (
        analysis.jailbreak.confidence > 0.3 ||
        analysis.ethical.level === 'low' ||
        analysis.sentiment.score < -0.5
      ) {
        if (logger) {
          logger.info('Content passed but has potential concerns worth monitoring', {
            jailbreakConfidence: analysis.jailbreak.confidence,
            ethicalLevel: analysis.ethical.level,
            sentimentScore: analysis.sentiment.score,
          });
        }
      }

      // All checks passed
      return {
        passed: true,
        code: 'content_analysis_passed',
        message: 'Content analysis found no significant issues',
        details: {
          sentimentLabel: analysis.sentiment.label,
          relevanceScore: analysis.relevance.score,
          executionTimeMs: analysisTime,
        },
        severity: 'info',
        executionTimeMs: analysisTime,
      };
    } catch (error) {
      // Log the error
      if (logger) {
        logger.error('Error in AI content analysis check', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }

      // In case of error, we should still allow the content through
      // but log a warning since the analysis failed
      return {
        passed: true,
        code: 'content_analysis_error',
        message: 'Error in content analysis, proceeding with caution',
        details: { error: error instanceof Error ? error.message : String(error) },
        severity: 'warning',
      };
    }
  },
};
