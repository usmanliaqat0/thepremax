/**
 * Security headers middleware for enhanced security
 * Implements comprehensive security headers following OWASP guidelines
 */

export interface SecurityHeaders {
  "Content-Security-Policy": string;
  "X-Frame-Options": string;
  "X-Content-Type-Options": string;
  "Referrer-Policy": string;
  "Permissions-Policy": string;
  "X-XSS-Protection": string;
  "Strict-Transport-Security": string;
  "Cross-Origin-Embedder-Policy": string;
  "Cross-Origin-Opener-Policy": string;
  "Cross-Origin-Resource-Policy": string;
}

/**
 * Default security headers configuration
 */
export const DEFAULT_SECURITY_HEADERS: SecurityHeaders = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    "block-all-mixed-content",
  ].join("; "),

  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "interest-cohort=()",
    "usb=()",
    "magnetometer=()",
    "gyroscope=()",
    "accelerometer=()",
    "ambient-light-sensor=()",
    "autoplay=()",
    "battery=()",
    "bluetooth=()",
    "display-capture=()",
    "fullscreen=(self)",
    "payment=()",
    "picture-in-picture=()",
    "publickey-credentials-get=()",
    "screen-wake-lock=()",
    "sync-xhr=()",
    "web-share=()",
    "xr-spatial-tracking=()",
  ].join(", "),

  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

/**
 * Development security headers (more permissive)
 */
export const DEVELOPMENT_SECURITY_HEADERS: SecurityHeaders = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),

  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000",
  "Cross-Origin-Embedder-Policy": "unsafe-none",
  "Cross-Origin-Opener-Policy": "unsafe-none",
  "Cross-Origin-Resource-Policy": "cross-origin",
};

/**
 * Get security headers based on environment
 * @param isDevelopment - Whether running in development mode
 * @returns Security headers configuration
 */
export function getSecurityHeaders(
  isDevelopment: boolean = false
): SecurityHeaders {
  return isDevelopment
    ? DEVELOPMENT_SECURITY_HEADERS
    : DEFAULT_SECURITY_HEADERS;
}

/**
 * Apply security headers to a Next.js response
 * @param response - Next.js response object
 * @param isDevelopment - Whether running in development mode
 * @returns Response with security headers applied
 */
export function applySecurityHeaders(
  response: Response,
  isDevelopment: boolean = false
): Response {
  const headers = getSecurityHeaders(isDevelopment);

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Security headers middleware for Next.js API routes
 * @param isDevelopment - Whether running in development mode
 * @returns Middleware function
 */
export function createSecurityHeadersMiddleware(
  isDevelopment: boolean = false
) {
  return (response: Response): Response => {
    return applySecurityHeaders(response, isDevelopment);
  };
}

/**
 * Validate and sanitize security headers
 * @param headers - Headers to validate
 * @returns Validated and sanitized headers
 */
export function validateSecurityHeaders(
  headers: Partial<SecurityHeaders>
): SecurityHeaders {
  const validated: SecurityHeaders = { ...DEFAULT_SECURITY_HEADERS };

  Object.entries(headers).forEach(([key, value]) => {
    if (key in validated && typeof value === "string") {
      // Basic validation - remove any potentially dangerous characters
      const sanitized = value
        .replace(/[<>]/g, "")
        .replace(/javascript:/gi, "")
        .replace(/data:/gi, "")
        .replace(/vbscript:/gi, "");

      (validated as unknown as Record<string, string>)[key] = sanitized;
    }
  });

  return validated;
}

/**
 * Security headers for specific content types
 */
export const CONTENT_TYPE_SECURITY_HEADERS = {
  "application/json": {
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  },
  "text/html": {
    "Content-Type": "text/html; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  },
  "text/plain": {
    "Content-Type": "text/plain; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  },
  "application/pdf": {
    "Content-Type": "application/pdf",
    "X-Content-Type-Options": "nosniff",
  },
} as const;
