export interface PreflightCheck {
  name: string;
  description: string;
  run: (params: PreflightParams) => Promise<CheckResult>;
  enabled?: boolean;
  tier: 1 | 2 | 3 | 4;
  configurable?: boolean;
  defaultConfig?: Record<string, any>;
}

export interface PreflightParams {
  userId: string;
  messages: Message[];
  lastMessage: string;
  ip?: string;
  userAgent?: string;
  checkConfig?: Record<string, any>;
  conversationContext?: {
    systemPrompt?: string;
    purpose?: string;
    appName?: string;
  };
  logger?: any;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface CheckResult {
  passed: boolean;
  code: string;
  message: string;
  details?: any;
  severity: 'warning' | 'error' | 'info';
  executionTimeMs?: number;
}

export interface PreflightResult {
  passed: boolean;
  failedCheck?: string;
  result?: CheckResult;
  checkResults?: Array<{
    checkName: string;
    result: CheckResult;
    executionTimeMs: number;
  }>;
  executionTimeMs?: number;
}

export interface PreflightOptions {
  tiers?: number[];
  checks?: {
    [checkName: string]: boolean;
  };
  checkConfig?: {
    [checkName: string]: Record<string, any>;
  };
  runAllChecks?: boolean;
  includeAllResults?: boolean;
  conversationContext?: {
    systemPrompt?: string;
    purpose?: string;
    appName?: string;
  };
  logger?: any;
}

export type ErrorDisplayConfig = {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  severity: 'warning' | 'error' | 'info';
};

export type ErrorDisplayMap = {
  [checkCode: string]: (result: CheckResult) => ErrorDisplayConfig;
};
