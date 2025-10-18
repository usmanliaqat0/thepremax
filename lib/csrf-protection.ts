/**
 * CSRF (Cross-Site Request Forgery) protection utilities
 * Implements token-based CSRF protection for state-changing operations
 */

import crypto from "crypto";
import { NextRequest } from "next/server";

interface CSRFConfig {
  secret: string;
  tokenLength: number;
  maxAge: number; // Token validity in milliseconds
  cookieName: string;
  headerName: string;
}

const DEFAULT_CONFIG: CSRFConfig = {
  secret: process.env.CSRF_SECRET || crypto.randomBytes(32).toString("hex"),
  tokenLength: 32,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  cookieName: "csrf-token",
  headerName: "x-csrf-token",
};

class CSRFProtection {
  private config: CSRFConfig;
  private tokenStore: Map<string, { token: string; expires: number }> =
    new Map();

  constructor(config: Partial<CSRFConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate a CSRF token for a session
   * @param sessionId - Unique session identifier
   * @returns CSRF token
   */
  public generateToken(sessionId: string): string {
    const token = crypto.randomBytes(this.config.tokenLength).toString("hex");
    const expires = Date.now() + this.config.maxAge;

    this.tokenStore.set(sessionId, { token, expires });

    // Clean up expired tokens
    this.cleanup();

    return token;
  }

  /**
   * Verify a CSRF token
   * @param sessionId - Session identifier
   * @param token - Token to verify
   * @returns True if token is valid
   */
  public verifyToken(sessionId: string, token: string): boolean {
    const stored = this.tokenStore.get(sessionId);

    if (!stored) {
      return false;
    }

    if (Date.now() > stored.expires) {
      this.tokenStore.delete(sessionId);
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(stored.token, "hex"),
      Buffer.from(token, "hex")
    );
  }

  /**
   * Extract CSRF token from request
   * @param request - Next.js request object
   * @returns CSRF token or null
   */
  public async extractToken(request: NextRequest): Promise<string | null> {
    // Try header first
    const headerToken = request.headers.get(this.config.headerName);
    if (headerToken) {
      return headerToken;
    }

    // Try form data
    const formData = await request.formData();
    if (formData) {
      const formToken = formData.get("csrf_token");
      if (formToken) {
        return formToken as string;
      }
    }

    // Try JSON body
    try {
      const body = await request.json();
      if (body && body.csrf_token) {
        return body.csrf_token;
      }
    } catch {
      // Ignore JSON parsing errors
    }

    return null;
  }

  /**
   * Get session ID from request
   * @param request - Next.js request object
   * @returns Session ID or null
   */
  public getSessionId(request: NextRequest): string | null {
    // Try to get from cookie
    const cookie = request.cookies.get("session-id");
    if (cookie) {
      return cookie.value;
    }

    // Try to get from authorization header
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Extract user ID from JWT token (simplified)
      try {
        const token = authHeader.substring(7);
        const tokenParts = token.split(".");
        if (tokenParts.length < 2 || !tokenParts[1]) return null;
        const payload = JSON.parse(
          Buffer.from(tokenParts[1], "base64").toString()
        );
        return payload.id || payload.sub;
      } catch {
        // Ignore JWT parsing errors
      }
    }

    return null;
  }

  /**
   * Validate CSRF token from request
   * @param request - Next.js request object
   * @returns True if CSRF token is valid
   */
  public async validateRequest(request: NextRequest): Promise<boolean> {
    const sessionId = this.getSessionId(request);
    const token = await this.extractToken(request);

    if (!sessionId || !token) {
      return false;
    }

    return this.verifyToken(sessionId, token);
  }

  /**
   * Create CSRF protection middleware
   * @param options - Middleware options
   * @returns Middleware function
   */
  public createMiddleware(
    options: {
      skipMethods?: string[];
      skipPaths?: string[];
      errorMessage?: string;
    } = {}
  ) {
    const {
      skipMethods = ["GET", "HEAD", "OPTIONS"],
      skipPaths = [],
      errorMessage = "CSRF token validation failed",
    } = options;

    return (request: NextRequest) => {
      const method = request.method;
      const pathname = request.nextUrl.pathname;

      // Skip certain methods
      if (skipMethods.includes(method)) {
        return { valid: true };
      }

      // Skip certain paths
      if (skipPaths.some((path) => pathname.startsWith(path))) {
        return { valid: true };
      }

      const isValid = this.validateRequest(request);

      if (!isValid) {
        return {
          valid: false,
          error: errorMessage,
          statusCode: 403,
        };
      }

      return { valid: true };
    };
  }

  /**
   * Clean up expired tokens
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [sessionId, data] of this.tokenStore.entries()) {
      if (now > data.expires) {
        this.tokenStore.delete(sessionId);
      }
    }
  }

  /**
   * Revoke token for a session
   * @param sessionId - Session identifier
   */
  public revokeToken(sessionId: string): void {
    this.tokenStore.delete(sessionId);
  }

  /**
   * Get token info for a session
   * @param sessionId - Session identifier
   * @returns Token info or null
   */
  public getTokenInfo(
    sessionId: string
  ): { token: string; expires: number } | null {
    const stored = this.tokenStore.get(sessionId);
    if (!stored || Date.now() > stored.expires) {
      return null;
    }
    return stored;
  }
}

// Export singleton instance
export const csrfProtection = new CSRFProtection();

/**
 * CSRF protection middleware for API routes
 * @param options - Middleware options
 * @returns Middleware function
 */
export function createCSRFMiddleware(options?: {
  skipMethods?: string[];
  skipPaths?: string[];
  errorMessage?: string;
}) {
  return csrfProtection.createMiddleware(options);
}

/**
 * Generate CSRF token for a session
 * @param sessionId - Session identifier
 * @returns CSRF token
 */
export function generateCSRFToken(sessionId: string): string {
  return csrfProtection.generateToken(sessionId);
}

/**
 * Validate CSRF token from request
 * @param request - Next.js request object
 * @returns True if valid
 */
export async function validateCSRFToken(
  request: NextRequest
): Promise<boolean> {
  return await csrfProtection.validateRequest(request);
}
