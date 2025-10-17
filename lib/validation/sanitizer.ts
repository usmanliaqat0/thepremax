/**
 * Input sanitization utilities for security
 */

export class InputSanitizer {
  /**
   * Sanitizes a string input by trimming and removing potentially dangerous characters
   */
  static sanitizeString(input: string, maxLength: number = 1000): string {
    if (typeof input !== "string") {
      return "";
    }

    return input
      .trim()
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
      .substring(0, maxLength);
  }

  /**
   * Sanitizes a search query for use in MongoDB regex
   */
  static sanitizeSearchQuery(query: string): string {
    if (typeof query !== "string") {
      return "";
    }

    return query
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // Escape regex special characters
      .substring(0, 100);
  }

  /**
   * Validates and sanitizes a MongoDB ObjectId
   */
  static sanitizeObjectId(id: string): string | null {
    if (typeof id !== "string") {
      return null;
    }

    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id.trim()) ? id.trim() : null;
  }

  /**
   * Sanitizes an email address
   */
  static sanitizeEmail(email: string): string {
    if (typeof email !== "string") {
      return "";
    }

    return email
      .trim()
      .toLowerCase()
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .substring(0, 100);
  }

  /**
   * Sanitizes a URL
   */
  static sanitizeUrl(url: string): string | null {
    if (typeof url !== "string") {
      return null;
    }

    const trimmedUrl = url.trim();

    // Basic URL validation
    try {
      new URL(trimmedUrl);
      return trimmedUrl;
    } catch {
      return null;
    }
  }

  /**
   * Sanitizes a phone number
   */
  static sanitizePhone(phone: string): string {
    if (typeof phone !== "string") {
      return "";
    }

    return phone
      .trim()
      .replace(/[^\d+\-\(\)\s]/g, "") // Keep only digits, +, -, (, ), and spaces
      .substring(0, 20);
  }

  /**
   * Sanitizes a numeric input
   */
  static sanitizeNumber(
    input: string | number,
    min: number = 0,
    max: number = Number.MAX_SAFE_INTEGER
  ): number | null {
    if (typeof input === "number") {
      return Math.max(min, Math.min(max, input));
    }

    if (typeof input !== "string") {
      return null;
    }

    const num = parseFloat(input.trim());
    if (isNaN(num)) {
      return null;
    }

    return Math.max(min, Math.min(max, num));
  }

  /**
   * Sanitizes an integer input
   */
  static sanitizeInteger(
    input: string | number,
    min: number = 0,
    max: number = Number.MAX_SAFE_INTEGER
  ): number | null {
    const sanitized = this.sanitizeNumber(input, min, max);
    return sanitized !== null ? Math.floor(sanitized) : null;
  }

  /**
   * Sanitizes a boolean input
   */
  static sanitizeBoolean(input: string | boolean): boolean {
    if (typeof input === "boolean") {
      return input;
    }

    if (typeof input !== "string") {
      return false;
    }

    const lower = input.trim().toLowerCase();
    return (
      lower === "true" || lower === "1" || lower === "yes" || lower === "on"
    );
  }

  /**
   * Sanitizes an array of strings
   */
  static sanitizeStringArray(
    input: unknown[],
    maxItems: number = 100,
    maxItemLength: number = 100
  ): string[] {
    if (!Array.isArray(input)) {
      return [];
    }

    return input
      .slice(0, maxItems)
      .filter((item): item is string => typeof item === "string")
      .map((item) => this.sanitizeString(item, maxItemLength))
      .filter((item) => item.length > 0);
  }

  /**
   * Sanitizes pagination parameters
   */
  static sanitizePagination(
    page: unknown,
    limit: unknown
  ): { page: number; limit: number } {
    const sanitizedPage =
      this.sanitizeInteger(page as string | number, 1, 1000) || 1;
    const sanitizedLimit =
      this.sanitizeInteger(limit as string | number, 1, 100) || 12;

    return {
      page: sanitizedPage,
      limit: sanitizedLimit,
    };
  }

  /**
   * Sanitizes sort parameters
   */
  static sanitizeSort(
    sortBy: unknown,
    sortOrder: unknown
  ): { sortBy: string; sortOrder: "asc" | "desc" } {
    const sanitizedSortBy =
      typeof sortBy === "string"
        ? this.sanitizeString(sortBy, 50)
        : "createdAt";

    const sanitizedSortOrder =
      typeof sortOrder === "string" &&
      (sortOrder.toLowerCase() === "asc" || sortOrder.toLowerCase() === "desc")
        ? (sortOrder.toLowerCase() as "asc" | "desc")
        : "desc";

    return {
      sortBy: sanitizedSortBy,
      sortOrder: sanitizedSortOrder,
    };
  }

  /**
   * Sanitizes a date string
   */
  static sanitizeDate(dateString: string): Date | null {
    if (typeof dateString !== "string") {
      return null;
    }

    const date = new Date(dateString.trim());
    return isNaN(date.getTime()) ? null : date;
  }

  /**
   * Sanitizes a JSON string
   */
  static sanitizeJson(jsonString: string): unknown | null {
    if (typeof jsonString !== "string") {
      return null;
    }

    try {
      return JSON.parse(jsonString.trim());
    } catch {
      return null;
    }
  }
}
