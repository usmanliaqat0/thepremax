/**
 * Standardized response utilities for consistent API responses
 */

import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export class ResponseUtils {
  /**
   * Success response with data
   */
  static success<T>(
    data: T,
    message?: string,
    statusCode: number = 200
  ): NextResponse {
    return NextResponse.json(
      {
        success: true,
        data,
        message,
      },
      { status: statusCode }
    );
  }

  /**
   * Error response
   */
  static error(message: string, statusCode: number = 500): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: statusCode }
    );
  }

  /**
   * Validation error response
   */
  static validationError(
    errors: string[] | unknown[],
    message: string = "Validation failed"
  ): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: message,
        details: errors,
      },
      { status: 400 }
    );
  }

  /**
   * Not found response
   */
  static notFound(resource: string = "Resource"): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: `${resource} not found`,
      },
      { status: 404 }
    );
  }

  /**
   * Unauthorized response
   */
  static unauthorized(message: string = "Unauthorized"): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 401 }
    );
  }

  /**
   * Forbidden response
   */
  static forbidden(message: string = "Access denied"): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 403 }
    );
  }

  /**
   * Created response
   */
  static created<T>(data: T, message?: string): NextResponse {
    return this.success(data, message, 201);
  }

  /**
   * No content response
   */
  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
  }

  /**
   * Paginated response
   */
  static paginated<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    },
    message?: string
  ): NextResponse {
    return NextResponse.json({
      success: true,
      data,
      pagination,
      message,
    });
  }
}
