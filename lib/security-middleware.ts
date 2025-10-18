/**
 * Comprehensive security middleware
 * Combines rate limiting, CSRF protection, and security headers
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimiter, RATE_LIMITS, getClientIP } from "./rate-limiter";
import { createCSRFMiddleware } from "./csrf-protection";
import { logWarning } from "./logger";

interface SecurityMiddlewareConfig {
  enableRateLimit?: boolean;
  enableCSRF?: boolean;
  enableSecurityHeaders?: boolean;
  rateLimitConfig?: keyof typeof RATE_LIMITS;
  skipPaths?: string[];
  skipMethods?: string[];
}

const DEFAULT_CONFIG: SecurityMiddlewareConfig = {
  enableRateLimit: true,
  enableCSRF: true,
  enableSecurityHeaders: true,
  rateLimitConfig: "API",
  skipPaths: ["/api/health", "/api/status"],
  skipMethods: ["GET", "HEAD", "OPTIONS"],
};

/**
 * Main security middleware function
 * @param request - Next.js request object
 * @param config - Security configuration
 * @returns NextResponse with security measures applied
 */
export function securityMiddleware(
  request: NextRequest,
  config: SecurityMiddlewareConfig = {}
): NextResponse | null {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Skip security checks for certain paths and methods
  if (
    mergedConfig.skipPaths?.some((path) => pathname.startsWith(path)) ||
    mergedConfig.skipMethods?.includes(method)
  ) {
    return null;
  }

  // Rate limiting
  if (mergedConfig.enableRateLimit) {
    const clientIP = getClientIP(request);
    const rateLimitConfig = RATE_LIMITS[mergedConfig.rateLimitConfig!];
    const rateLimitResult = rateLimiter.checkRateLimit(
      clientIP,
      rateLimitConfig
    );

    if (!rateLimitResult.allowed) {
      logWarning(`Rate limit exceeded for IP: ${clientIP}`, "Security", {
        pathname,
        method,
        retryAfter: rateLimitResult.retryAfter,
      });

      return NextResponse.json(
        {
          success: false,
          message: rateLimitConfig.message,
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimitResult.retryAfter?.toString() || "60",
            "X-RateLimit-Limit": rateLimitConfig.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(
              rateLimitResult.resetTime
            ).toISOString(),
          },
        }
      );
    }
  }

  // CSRF protection
  if (mergedConfig.enableCSRF) {
    const csrfMiddleware = createCSRFMiddleware({
      ...(mergedConfig.skipMethods && {
        skipMethods: mergedConfig.skipMethods,
      }),
      ...(mergedConfig.skipPaths && { skipPaths: mergedConfig.skipPaths }),
    });

    const csrfResult = csrfMiddleware(request);
    if (!csrfResult.valid) {
      logWarning(`CSRF validation failed for ${pathname}`, "Security", {
        method,
        clientIP: getClientIP(request),
      });

      return NextResponse.json(
        {
          success: false,
          message: "CSRF token validation failed",
          error: "Forbidden",
        },
        { status: 403 }
      );
    }
  }

  return null;
}

/**
 * Apply security headers to response
 * @param response - Next.js response object
 * @param isDevelopment - Whether running in development mode
 * @returns Response with security headers
 */
export function applySecurityHeadersToResponse(
  response: NextResponse,
  isDevelopment: boolean = false
): NextResponse {
  if (isDevelopment) {
    return response;
  }

  return applySecurityHeadersToResponse(
    response as unknown as NextResponse,
    isDevelopment
  );
}

/**
 * Security middleware for specific endpoint types
 */
export const securityConfigs = {
  // General API endpoints
  api: {
    enableRateLimit: true,
    enableCSRF: true,
    enableSecurityHeaders: true,
    rateLimitConfig: "API" as const,
  },

  // Authentication endpoints
  auth: {
    enableRateLimit: true,
    enableCSRF: false, // CSRF not needed for auth endpoints
    enableSecurityHeaders: true,
    rateLimitConfig: "AUTH" as const,
  },

  // Public endpoints (read-only)
  public: {
    enableRateLimit: true,
    enableCSRF: false,
    enableSecurityHeaders: true,
    rateLimitConfig: "API" as const,
  },

  // File upload endpoints
  upload: {
    enableRateLimit: true,
    enableCSRF: true,
    enableSecurityHeaders: true,
    rateLimitConfig: "UPLOAD" as const,
  },

  // Admin endpoints
  admin: {
    enableRateLimit: true,
    enableCSRF: true,
    enableSecurityHeaders: true,
    rateLimitConfig: "API" as const,
  },
} as const;

/**
 * Create security middleware for specific endpoint type
 * @param type - Endpoint type
 * @param customConfig - Custom configuration overrides
 * @returns Security middleware function
 */
export function createSecurityMiddleware(
  type: keyof typeof securityConfigs,
  customConfig?: Partial<SecurityMiddlewareConfig>
) {
  const baseConfig = securityConfigs[type];
  const config = { ...baseConfig, ...customConfig };

  return (request: NextRequest): NextResponse | null => {
    return securityMiddleware(request, config);
  };
}

/**
 * Security headers for different content types
 */
export function getContentTypeSecurityHeaders(
  contentType: string
): Record<string, string> {
  const baseHeaders = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  };

  switch (contentType) {
    case "application/json":
      return {
        ...baseHeaders,
        "Content-Type": "application/json; charset=utf-8",
      };
    case "text/html":
      return {
        ...baseHeaders,
        "Content-Type": "text/html; charset=utf-8",
      };
    case "text/plain":
      return {
        ...baseHeaders,
        "Content-Type": "text/plain; charset=utf-8",
      };
    default:
      return baseHeaders;
  }
}

/**
 * Log security events
 * @param event - Security event type
 * @param details - Event details
 */
export function logSecurityEvent(
  event: "rate_limit" | "csrf_failure" | "suspicious_activity" | "auth_failure",
  details: Record<string, unknown>
): void {
  const message = `Security event: ${event}`;
  logWarning(message, "Security", details);
}

/**
 * Validate request origin
 * @param request - Next.js request object
 * @param allowedOrigins - List of allowed origins
 * @returns True if origin is allowed
 */
export function validateOrigin(
  request: NextRequest,
  allowedOrigins: string[] = []
): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (!origin && !referer) {
    return true; // Allow requests without origin (e.g., direct API calls)
  }

  const requestOrigin = origin || new URL(referer!).origin;
  return allowedOrigins.includes(requestOrigin);
}
