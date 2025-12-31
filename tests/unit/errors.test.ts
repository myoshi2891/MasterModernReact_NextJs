import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from "vitest";
import { BookingError, mapSupabaseError } from "../../app/_lib/errors";

describe("BookingError", () => {
  it("should create error with default values", () => {
    const error = new BookingError("Test error");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(BookingError);
    expect(error.name).toBe("BookingError");
    expect(error.message).toBe("Test error");
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe(null);
  });

  it("should create error with custom status code and code", () => {
    const error = new BookingError("Conflict", 409, "BOOKING_CONFLICT");
    expect(error.message).toBe("Conflict");
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe("BOOKING_CONFLICT");
  });
});

describe("mapSupabaseError", () => {
  let consoleErrorSpy: MockInstance<typeof console.error>;

  // Mock console.error before each test
  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("should map 23P01 (exclusion violation) to 409 Conflict", () => {
    const error = mapSupabaseError({
      code: "23P01",
      message: "conflicting key value violates exclusion constraint",
    });

    expect(error).toBeInstanceOf(BookingError);
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe("BOOKING_CONFLICT");
    expect(error.message).toContain("既に予約されています");
  });

  it("should map 23514 (check constraint - date order) to 400", () => {
    const error = mapSupabaseError({
      code: "23514",
      message: 'new row violates check constraint "bookings_date_order"',
    });

    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("INVALID_DATE_ORDER");
    expect(error.message).toContain("チェックアウト日");
  });

  it("should map 23514 (check constraint - guest count) to 400", () => {
    const error = mapSupabaseError({
      code: "23514",
      message: 'new row violates check constraint "bookings_num_guests"',
    });

    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("INVALID_GUEST_COUNT");
    expect(error.message).toContain("1名以上");
  });

  it("should map generic 23514 to validation error", () => {
    const error = mapSupabaseError({
      code: "23514",
      message: "check constraint violation",
    });

    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.message).toContain("入力内容に誤り");
  });

  it("should map 23505 (unique violation) to 409", () => {
    const error = mapSupabaseError({
      code: "23505",
      message: "duplicate key value violates unique constraint",
    });

    expect(error.statusCode).toBe(409);
    expect(error.code).toBe("DUPLICATE_REQUEST");
    expect(error.message).toContain("既に処理済み");
  });

  it("should map P0001 with CAPACITY_EXCEEDED to 400", () => {
    const error = mapSupabaseError({
      code: "P0001",
      message: "CAPACITY_EXCEEDED",
    });

    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("CAPACITY_EXCEEDED");
    expect(error.message).toContain("定員を超えています");
  });

  it("should map P0001 with CABIN_NOT_FOUND to 404", () => {
    const error = mapSupabaseError({
      code: "P0001",
      message: "CABIN_NOT_FOUND",
    });

    expect(error.statusCode).toBe(404);
    expect(error.code).toBe("CABIN_NOT_FOUND");
    expect(error.message).toContain("見つかりません");
  });

  it("should handle unknown errors gracefully", () => {
    const error = mapSupabaseError({
      code: "UNKNOWN",
      message: "Some unexpected error",
    });

    expect(error.statusCode).toBe(500);
    expect(error.code).toBe("INTERNAL_ERROR");
    expect(error.message).toContain("予約処理中にエラーが発生");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[DB Error]",
      expect.objectContaining({
        code: "UNKNOWN",
        message: "Some unexpected error",
      })
    );
  });

  it("should handle errors with missing code gracefully", () => {
    const error = mapSupabaseError({
      message: "Error without code",
    });

    expect(error.statusCode).toBe(500);
    expect(error.code).toBe("INTERNAL_ERROR");
  });

  it("should handle null/empty error gracefully", () => {
    const error1 = mapSupabaseError(null);
    expect(error1.statusCode).toBe(500);
    expect(error1.code).toBe("INTERNAL_ERROR");

    const error2 = mapSupabaseError({});

    expect(error2.statusCode).toBe(500);
    expect(error2.code).toBe("INTERNAL_ERROR");
  });

  it("should truncate long error messages in logs", () => {
    consoleErrorSpy.mockClear();
    const longMessage = "x".repeat(300);

    mapSupabaseError({
      code: "UNKNOWN",
      message: longMessage,
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[DB Error]",
      expect.objectContaining({
        message: expect.stringMatching(/^x{200}$/),
      })
    );
  });
});
