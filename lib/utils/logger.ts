/**
 * Development Logger Utility
 * Gates console logs behind development flag to prevent production log spam
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const devLog = {
  /**
   * Log informational messages (only in development)
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log warnings (only in development)
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log errors (always logged, even in production)
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Log with prefix (only in development)
   */
  prefixed: (prefix: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[${prefix}]`, ...args);
    }
  },
};

/**
 * Production-safe logger that always logs errors but gates info/warn
 */
export const prodLog = {
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  error: (...args: any[]) => {
    console.error(...args);
  },
};
