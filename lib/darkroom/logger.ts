/**
 * Structured Logger for Darkroom Pipeline
 * Provides consistent logging with run_id, product context, and timing
 * Gates info/warning logs behind development flag
 */

import { devLog } from '@/lib/utils/logger';

export interface DarkroomLogContext {
  run_id: string;
  product_id?: string;
  handle?: string;
  step?: string;
  status?: 'start' | 'success' | 'error' | 'skip';
  duration_ms?: number;
  error?: string;
  [key: string]: any; // Allow additional context
}

/**
 * Log levels
 */
export type LogLevel = 'info' | 'warning' | 'error';

/**
 * Format log message with structured context
 */
function formatLog(level: LogLevel, message: string, context: DarkroomLogContext): string {
  const timestamp = new Date().toISOString();
  const contextStr = JSON.stringify(context);
  return `${timestamp} [${level}] ${message} ${contextStr}`;
}

/**
 * Darkroom Logger class
 */
export class DarkroomLogger {
  private run_id: string;

  constructor(run_id: string) {
    this.run_id = run_id;
  }

  /**
   * Log info message (development only)
   */
  info(message: string, context: Partial<DarkroomLogContext> = {}): void {
    const fullContext: DarkroomLogContext = {
      run_id: this.run_id,
      ...context,
    };
    devLog.log(formatLog('info', message, fullContext));
  }

  /**
   * Log warning message (development only)
   */
  warning(message: string, context: Partial<DarkroomLogContext> = {}): void {
    const fullContext: DarkroomLogContext = {
      run_id: this.run_id,
      ...context,
    };
    devLog.warn(formatLog('warning', message, fullContext));
  }

  /**
   * Log error message (always logged)
   */
  error(message: string, context: Partial<DarkroomLogContext> = {}): void {
    const fullContext: DarkroomLogContext = {
      run_id: this.run_id,
      ...context,
    };
    console.error(formatLog('error', message, fullContext));
  }

  /**
   * Log step start
   */
  stepStart(step: string, context: Partial<DarkroomLogContext> = {}): number {
    this.info(`Step started: ${step}`, {
      ...context,
      step,
      status: 'start',
    });
    return Date.now();
  }

  /**
   * Log step success
   */
  stepSuccess(step: string, startTime: number, context: Partial<DarkroomLogContext> = {}): void {
    const duration_ms = Date.now() - startTime;
    this.info(`Step completed: ${step}`, {
      ...context,
      step,
      status: 'success',
      duration_ms,
    });
  }

  /**
   * Log step error
   */
  stepError(step: string, startTime: number, error: Error | string, context: Partial<DarkroomLogContext> = {}): void {
    const duration_ms = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : error;
    this.error(`Step failed: ${step}`, {
      ...context,
      step,
      status: 'error',
      duration_ms,
      error: errorMessage,
    });
  }

  /**
   * Log step skip
   */
  stepSkip(step: string, reason: string, context: Partial<DarkroomLogContext> = {}): void {
    this.info(`Step skipped: ${step}`, {
      ...context,
      step,
      status: 'skip',
      reason,
    });
  }
}

/**
 * Generate a unique run ID
 */
export function generateRunId(): string {
  return `run_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
