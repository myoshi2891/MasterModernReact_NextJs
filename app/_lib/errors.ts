/**
 * Application-specific error codes for booking operations.
 */
export type BookingErrorCode =
  | "BOOKING_CONFLICT"
  | "INVALID_DATE_ORDER"
  | "INVALID_GUEST_COUNT"
  | "VALIDATION_ERROR"
  | "DUPLICATE_REQUEST"
  | "CAPACITY_EXCEEDED"
  | "CABIN_NOT_FOUND"
  | "INTERNAL_ERROR";

/**
 * Custom error class for booking operations with HTTP status code support.
 */
export class BookingError extends Error {
  readonly statusCode: number;
  readonly code: BookingErrorCode | null;

  /**
   * @param message - User-friendly error message
   * @param statusCode - HTTP status code (default: 500)
   * @param code - Application-specific error code (optional)
   */
  constructor(
    message: string,
    statusCode: number = 500,
    code: BookingErrorCode | null = null
  ) {
    super(message);
    this.name = "BookingError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Supabase/PostgreSQL error object structure.
 */
export interface SupabaseError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

/**
 * Maps Supabase/PostgreSQL errors to user-friendly BookingError instances.
 *
 * Translates database SQLSTATE codes and error messages into appropriate
 * HTTP status codes and localized error messages without exposing PII.
 *
 * Supported SQLSTATE codes:
 * - 23P01: Exclusion violation (booking overlap) → 409 Conflict
 * - 23514: Check constraint violation → 400 Bad Request
 * - 23505: Unique violation (duplicate idempotency key) → 409 Conflict
 * - P0001: Raised exception (custom trigger errors) → Varies by message
 *
 * @param error - Supabase error object
 * @returns Mapped error with appropriate status code and message
 */
export function mapSupabaseError(error: SupabaseError | null): BookingError {
  const code = error?.code;
  const message = error?.message ?? "";

  switch (code) {
    case "23P01": // exclusion violation (bookings_no_overlap)
      return new BookingError(
        "選択された日程は既に予約されています。別の日程をお選びください。",
        409,
        "BOOKING_CONFLICT"
      );

    case "23514": // check constraint violation
      // Determine which constraint was violated based on message
      if (message.includes("bookings_date_order")) {
        return new BookingError(
          "チェックアウト日はチェックイン日より後である必要があります。",
          400,
          "INVALID_DATE_ORDER"
        );
      }
      if (message.includes("bookings_num_guests")) {
        return new BookingError(
          "宿泊人数は1名以上である必要があります。",
          400,
          "INVALID_GUEST_COUNT"
        );
      }
      return new BookingError(
        "入力内容に誤りがあります。もう一度ご確認ください。",
        400,
        "VALIDATION_ERROR"
      );

    case "23505": // unique violation (idempotency key, if implemented)
      return new BookingError(
        "この予約は既に処理済みです。",
        409,
        "DUPLICATE_REQUEST"
      );

    case "P0001": // raise exception from triggers
      if (message.includes("CAPACITY_EXCEEDED")) {
        return new BookingError(
          "宿泊人数がキャビンの定員を超えています。",
          400,
          "CAPACITY_EXCEEDED"
        );
      }
      if (message.includes("CABIN_NOT_FOUND")) {
        return new BookingError(
          "指定されたキャビンが見つかりません。",
          404,
          "CABIN_NOT_FOUND"
        );
      }
      break;
  }

  // Log unknown errors for debugging (without exposing to user)
  console.error("[DB Error]", {
    code,
    message: message.substring(0, 200), // Truncate to avoid logging sensitive data
  });

  return new BookingError(
    "予約処理中にエラーが発生しました。しばらく経ってから再度お試しください。",
    500,
    "INTERNAL_ERROR"
  );
}
