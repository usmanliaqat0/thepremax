/**
 * Centralized logging system with different levels and proper formatting
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
  error?: Error;
}

class Logger {
  private static instance: Logger;
  private currentLevel: LogLevel;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
    this.currentLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.currentLevel;
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp;
    const level = LogLevel[entry.level];
    const context = entry.context ? `[${entry.context}]` : "";
    const message = entry.message;

    return `${timestamp} ${level}${context}: ${message}`;
  }

  private log(
    level: LogLevel,
    message: string,
    context?: string,
    data?: unknown,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(context && { context }),
      ...(data !== undefined && { data }),
      ...(error && { error }),
    };

    const formattedMessage = this.formatMessage(entry);

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        if (error) console.error(error);
        if (data) console.error("Data:", data);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        if (data) console.warn("Data:", data);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        if (data) console.info("Data:", data);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        if (data) console.debug("Data:", data);
        break;
    }
  }

  public error(
    message: string,
    context?: string,
    data?: unknown,
    error?: Error
  ): void {
    this.log(LogLevel.ERROR, message, context, data, error);
  }

  public warn(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  public info(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  public debug(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  // Security-aware logging - never logs sensitive data
  public security(message: string, context?: string): void {
    this.log(LogLevel.INFO, `[SECURITY] ${message}`, context);
  }

  // Database operation logging
  public database(message: string, operation?: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, `DB:${operation}`, data);
  }

  // API request/response logging
  public api(
    message: string,
    method?: string,
    endpoint?: string,
    data?: unknown
  ): void {
    this.log(LogLevel.DEBUG, message, `API:${method}:${endpoint}`, data);
  }

  // Performance logging
  public performance(
    message: string,
    duration?: number,
    context?: string
  ): void {
    const perfMessage = duration ? `${message} (${duration}ms)` : message;
    this.log(LogLevel.DEBUG, perfMessage, `PERF:${context}`);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions for common use cases
export const logError = (message: string, context?: string, error?: Error) =>
  logger.error(message, context, undefined, error);

export const logWarning = (message: string, context?: string, data?: unknown) =>
  logger.warn(message, context, data);

export const logInfo = (message: string, context?: string, data?: unknown) =>
  logger.info(message, context, data);

export const logDebug = (message: string, context?: string, data?: unknown) =>
  logger.debug(message, context, data);

export const logSecurity = (message: string, context?: string) =>
  logger.security(message, context);

export const logDatabase = (
  message: string,
  operation?: string,
  data?: unknown
) => logger.database(message, operation, data);

export const logApi = (
  message: string,
  method?: string,
  endpoint?: string,
  data?: unknown
) => logger.api(message, method, endpoint, data);

export const logPerformance = (
  message: string,
  duration?: number,
  context?: string
) => logger.performance(message, duration, context);
