/**
 * Standardized API response utilities
 */

import { NextResponse } from "next/server";
import { logError, logInfo } from "./logger";

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationInfo;
  meta?: {
    timestamp: string;
    requestId?: string;
    version?: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: unknown;
}

export class ApiResponseBuilder {
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static getMeta(requestId?: string): ApiResponse["meta"] {
    return {
      timestamp: new Date().toISOString(),
      requestId: requestId || this.generateRequestId(),
      version: process.env.npm_package_version || "1.0.0",
    };
  }

  /**
   * Success response with data
   */
  static success<T>(
    data: T,
    message?: string,
    statusCode: number = 200,
    pagination?: PaginationInfo,
    requestId?: string
  ): NextResponse<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message: message || "",
      ...(pagination && { pagination }),
      meta: this.getMeta(requestId) || { timestamp: new Date().toISOString() },
    };

    logInfo(`API Success: ${message || "Request completed"}`, "API", {
      statusCode,
      requestId,
    });

    return NextResponse.json(response, { status: statusCode });
  }

  /**
   * Success response without data
   */
  static successMessage(
    message: string,
    statusCode: number = 200,
    requestId?: string
  ): NextResponse<ApiResponse> {
    const response: ApiResponse = {
      success: true,
      message,
      meta: this.getMeta(requestId) || { timestamp: new Date().toISOString() },
    };

    logInfo(`API Success: ${message}`, "API", { statusCode, requestId });

    return NextResponse.json(response, { status: statusCode });
  }

  /**
   * Error response
   */
  static error(
    message: string,
    statusCode: number = 500,
    error?: ApiError,
    requestId?: string
  ): NextResponse<ApiResponse> {
    const response: ApiResponse = {
      success: false,
      message,
      error: error?.message || message,
      meta: this.getMeta(requestId) || { timestamp: new Date().toISOString() },
    };

    logError(`API Error: ${message}`, "API", error as unknown as Error);

    return NextResponse.json(response, { status: statusCode });
  }

  /**
   * Validation error response
   */
  static validationError(
    message: string,
    errors: ApiError[],
    requestId?: string
  ): NextResponse<ApiResponse> {
    const response: ApiResponse = {
      success: false,
      message,
      error: "Validation failed",
      data: { errors },
      meta: this.getMeta(requestId) || { timestamp: new Date().toISOString() },
    };

    logError(
      `API Validation Error: ${message}`,
      "API",
      new Error(JSON.stringify({ errors }))
    );

    return NextResponse.json(response, { status: 400 });
  }

  /**
   * Not found response
   */
  static notFound(
    message: string = "Resource not found",
    requestId?: string
  ): NextResponse<ApiResponse> {
    return this.error(message, 404, undefined, requestId);
  }

  /**
   * Unauthorized response
   */
  static unauthorized(
    message: string = "Unauthorized access",
    requestId?: string
  ): NextResponse<ApiResponse> {
    return this.error(message, 401, undefined, requestId);
  }

  /**
   * Forbidden response
   */
  static forbidden(
    message: string = "Access forbidden",
    requestId?: string
  ): NextResponse<ApiResponse> {
    return this.error(message, 403, undefined, requestId);
  }

  /**
   * Conflict response
   */
  static conflict(
    message: string = "Resource conflict",
    requestId?: string
  ): NextResponse<ApiResponse> {
    return this.error(message, 409, undefined, requestId);
  }

  /**
   * Too many requests response
   */
  static tooManyRequests(
    message: string = "Too many requests",
    requestId?: string
  ): NextResponse<ApiResponse> {
    return this.error(message, 429, undefined, requestId);
  }

  /**
   * Internal server error response
   */
  static internalError(
    message: string = "Internal server error",
    error?: Error,
    requestId?: string
  ): NextResponse<ApiResponse> {
    return this.error(message, 500, error as unknown as ApiError, requestId);
  }

  /**
   * Service unavailable response
   */
  static serviceUnavailable(
    message: string = "Service temporarily unavailable",
    requestId?: string
  ): NextResponse<ApiResponse> {
    return this.error(message, 503, undefined, requestId);
  }

  /**
   * Created response (for POST requests)
   */
  static created<T>(
    data: T,
    message: string = "Resource created successfully",
    requestId?: string
  ): NextResponse<ApiResponse<T>> {
    return this.success(data, message, 201, undefined, requestId);
  }

  /**
   * No content response (for DELETE requests)
   */
  static noContent(
    message: string = "Resource deleted successfully",
    requestId?: string
  ): NextResponse<ApiResponse> {
    return this.successMessage(message, 204, requestId);
  }
}

// Convenience functions for common responses
export const apiSuccess = ApiResponseBuilder.success;
export const apiError = ApiResponseBuilder.error;
export const apiValidationError = ApiResponseBuilder.validationError;
export const apiNotFound = ApiResponseBuilder.notFound;
export const apiUnauthorized = ApiResponseBuilder.unauthorized;
export const apiForbidden = ApiResponseBuilder.forbidden;
export const apiConflict = ApiResponseBuilder.conflict;
export const apiTooManyRequests = ApiResponseBuilder.tooManyRequests;
export const apiInternalError = ApiResponseBuilder.internalError;
export const apiServiceUnavailable = ApiResponseBuilder.serviceUnavailable;
export const apiCreated = ApiResponseBuilder.created;
export const apiNoContent = ApiResponseBuilder.noContent;
