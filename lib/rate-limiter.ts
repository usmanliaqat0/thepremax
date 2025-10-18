/**
 * Rate limiting utilities for API protection
 * Implements in-memory rate limiting with configurable windows
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private static instance: RateLimiter;
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  private constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  /**
   * Check if request is within rate limit
   * @param key - Unique identifier for the client (IP, user ID, etc.)
   * @param config - Rate limiting configuration
   * @returns Object with rate limit status
   */
  public checkRateLimit(
    key: string,
    config: RateLimitConfig
  ): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // No entry or window expired, create new entry
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + config.windowMs,
      };
      this.store.set(key, newEntry);

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: newEntry.resetTime,
      };
    }

    if (entry.count >= config.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      };
    }

    // Increment counter
    entry.count++;
    this.store.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reset rate limit for a specific key
   * @param key - Unique identifier for the client
   */
  public reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Get current rate limit status for a key
   * @param key - Unique identifier for the client
   * @param config - Rate limiting configuration
   * @returns Current rate limit status
   */
  public getStatus(
    key: string,
    config: RateLimitConfig
  ): {
    count: number;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      return {
        count: 0,
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
      };
    }

    return {
      count: entry.count,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime,
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Destroy the rate limiter instance
   */
  public destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Export singleton instance
export const rateLimiter = RateLimiter.getInstance();

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // General API rate limiting
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: "Too many requests, please try again later",
  },

  // Authentication endpoints
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: "Too many authentication attempts, please try again later",
  },

  // Password reset
  PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: "Too many password reset attempts, please try again later",
  },

  // Email verification
  EMAIL_VERIFICATION: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 3,
    message: "Too many verification attempts, please try again later",
  },

  // File uploads
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: "Too many upload attempts, please try again later",
  },
} as const;

/**
 * Rate limiting middleware factory
 * @param config - Rate limiting configuration
 * @param getKey - Function to extract client identifier from request
 * @returns Next.js middleware function
 */
export function createRateLimitMiddleware(
  config: RateLimitConfig,
  getKey: (request: Request) => string
) {
  return (request: Request) => {
    const key = getKey(request);
    const result = rateLimiter.checkRateLimit(key, config);

    if (!result.allowed) {
      return {
        success: false,
        message: config.message || "Rate limit exceeded",
        retryAfter: result.retryAfter,
        statusCode: 429,
      };
    }

    return {
      success: true,
      remaining: result.remaining,
      resetTime: result.resetTime,
    };
  };
}

/**
 * Get client IP address from request
 * @param request - Next.js request object
 * @returns Client IP address
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  if (realIP) {
    return realIP;
  }

  return "unknown";
}
