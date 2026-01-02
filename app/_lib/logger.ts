import { createHash, randomUUID } from "crypto";

// Cache validated salt to avoid repeated validation
let validatedSalt: string | null = null;

/**
 * Get the validated HASH_SALT, validating on first access.
 * This lazy approach avoids build-time errors in Next.js.
 */
function getEffectiveSalt(): string {
  if (validatedSalt !== null) {
    return validatedSalt;
  }

  const salt = process.env.HASH_SALT;
  if (process.env.NODE_ENV === "production") {
    if (!salt) {
      throw new Error("HASH_SALT environment variable must be set in production");
    }
    if (salt.length < 32) {
      throw new Error(
        "HASH_SALT must be at least 32 characters for cryptographic security"
      );
    }
  }

  validatedSalt = salt || "default-salt-for-development-only";
  return validatedSalt;
}

/**
 * Log levels for structured logging.
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Base structure for all log entries.
 */
interface BaseLogEntry {
  timestamp: string;
  level: LogLevel;
  event: string;
  requestId?: string;
}

/**
 * Booking conflict log entry structure.
 * Follows the format defined in specs/002-booking-concurrency-control/operations.md
 */
export interface BookingConflictLogEntry extends BaseLogEntry {
  event: "BOOKING_CONFLICT";
  hashedUserId: string;
  cabinId: number;
  startDate: string;
  endDate: string;
  responseTimeMs?: number;
  cabinAvailability?: "appeared_available" | "appeared_unavailable" | "unknown";
  errorDetail: string;
}

/**
 * Generic log entry for other events.
 */
export interface GenericLogEntry extends BaseLogEntry {
  message?: string;
  [key: string]: unknown;
}

export type LogEntry = BookingConflictLogEntry | GenericLogEntry;

/**
 * Generate a hashed user ID for logging purposes.
 * Uses SHA-256 with a salt to ensure one-way hashing.
 * The hash is truncated to 16 characters for readability.
 *
 * @param guestId - The guest ID to hash
 * @returns Hashed user ID in format "sha256:xxxxxxxx..."
 */
export function hashUserId(guestId: number): string {
  // Use first 16 chars of SHA-256 (64 bits) for log correlation, not for authentication
  return `sha256:${createHash("sha256")
    .update(`${guestId}:${getEffectiveSalt()}`)
    .digest("hex")
    .substring(0, 16)}`;
}

/**
 * Generate a unique request ID for log correlation.
 *
 * @returns Request ID in format "req_xxxxxxxx"
 */
export function generateRequestId(): string {
  return `req_${randomUUID().substring(0, 8)}`;
}

/**
 * Structured logger for application events.
 * Outputs JSON-formatted logs to console for production environments.
 */
class StructuredLogger {
  private formatEntry(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  private log(level: LogLevel, entry: Omit<LogEntry, "timestamp" | "level">) {
    const fullEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      ...entry,
    } as LogEntry;

    const formatted = this.formatEntry(fullEntry);

    switch (level) {
      case "debug":
        console.debug(formatted);
        break;
      case "info":
        console.info(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "error":
        console.error(formatted);
        break;
    }
  }

  debug(entry: Omit<GenericLogEntry, "timestamp" | "level">) {
    this.log("debug", entry);
  }

  info(entry: Omit<GenericLogEntry, "timestamp" | "level">) {
    this.log("info", entry);
  }

  warn(entry: Omit<GenericLogEntry, "timestamp" | "level">) {
    this.log("warn", entry);
  }

  error(entry: Omit<GenericLogEntry, "timestamp" | "level">) {
    this.log("error", entry);
  }

  /**
   * Log a booking conflict event with all required fields.
   * This is a specialized method for 409 Conflict logging.
   *
   * @param params - Booking conflict parameters
   */
  bookingConflict(params: {
    guestId: number;
    cabinId: number;
    startDate: Date | string;
    endDate: Date | string;
    errorDetail: string;
    requestId?: string;
    responseTimeMs?: number;
    cabinAvailability?: "appeared_available" | "appeared_unavailable" | "unknown";
  }) {
    const entry: Omit<BookingConflictLogEntry, "timestamp" | "level"> = {
      event: "BOOKING_CONFLICT",
      hashedUserId: hashUserId(params.guestId),
      cabinId: params.cabinId,
      startDate:
        params.startDate instanceof Date
          ? params.startDate.toISOString().split("T")[0]
          : params.startDate,
      endDate:
        params.endDate instanceof Date
          ? params.endDate.toISOString().split("T")[0]
          : params.endDate,
      errorDetail: params.errorDetail,
      ...(params.requestId && { requestId: params.requestId }),
      ...(params.responseTimeMs !== undefined && {
        responseTimeMs: params.responseTimeMs,
      }),
      ...(params.cabinAvailability && {
        cabinAvailability: params.cabinAvailability,
      }),
    };

    // Call log directly to avoid type mismatch with GenericLogEntry
    this.log("warn", entry);
  }
}

/**
 * Singleton logger instance for application-wide use.
 */
export const logger = new StructuredLogger();