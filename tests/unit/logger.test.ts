import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  hashUserId,
  generateRequestId,
  logger,
} from "../../app/_lib/logger";

describe("logger", () => {
  describe("hashUserId", () => {
    it("returns a sha256 prefixed hash", () => {
      const result = hashUserId(123);
      expect(result).toMatch(/^sha256:[a-f0-9]{16}$/);
    });

    it("returns consistent hash for same guestId", () => {
      const hash1 = hashUserId(456);
      const hash2 = hashUserId(456);
      expect(hash1).toBe(hash2);
    });

    it("returns different hashes for different guestIds", () => {
      const hash1 = hashUserId(100);
      const hash2 = hashUserId(200);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("generateRequestId", () => {
    it("returns a request ID with req_ prefix", () => {
      const result = generateRequestId();
      expect(result).toMatch(/^req_[a-f0-9]{8}$/);
    });

    it("generates unique IDs on each call", () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateRequestId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe("StructuredLogger", () => {
    let consoleSpy: {
      debug: ReturnType<typeof vi.spyOn>;
      info: ReturnType<typeof vi.spyOn>;
      warn: ReturnType<typeof vi.spyOn>;
      error: ReturnType<typeof vi.spyOn>;
    };

    beforeEach(() => {
      consoleSpy = {
        debug: vi.spyOn(console, "debug").mockImplementation(() => {}),
        info: vi.spyOn(console, "info").mockImplementation(() => {}),
        warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
        error: vi.spyOn(console, "error").mockImplementation(() => {}),
      };
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("logs debug entries with correct format", () => {
      logger.debug({ event: "TEST_DEBUG", message: "test message" });

      expect(consoleSpy.debug).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleSpy.debug.mock.calls[0][0] as string);
      expect(loggedData.level).toBe("debug");
      expect(loggedData.event).toBe("TEST_DEBUG");
      expect(loggedData.message).toBe("test message");
      expect(loggedData.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("logs info entries with correct format", () => {
      logger.info({ event: "TEST_INFO", message: "info message" });

      expect(consoleSpy.info).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleSpy.info.mock.calls[0][0] as string);
      expect(loggedData.level).toBe("info");
      expect(loggedData.event).toBe("TEST_INFO");
    });

    it("logs warn entries with correct format", () => {
      logger.warn({ event: "TEST_WARN" });

      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleSpy.warn.mock.calls[0][0] as string);
      expect(loggedData.level).toBe("warn");
    });

    it("logs error entries with correct format", () => {
      logger.error({ event: "TEST_ERROR" });

      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleSpy.error.mock.calls[0][0] as string);
      expect(loggedData.level).toBe("error");
    });

    describe("bookingConflict", () => {
      it("logs booking conflict with all required fields", () => {
        logger.bookingConflict({
          guestId: 123,
          cabinId: 1,
          startDate: new Date("2026-01-15"),
          endDate: new Date("2026-01-20"),
          errorDetail: "23P01:conflicting key value",
        });

        expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
        const loggedData = JSON.parse(consoleSpy.warn.mock.calls[0][0] as string);

        expect(loggedData.event).toBe("BOOKING_CONFLICT");
        expect(loggedData.level).toBe("warn");
        expect(loggedData.hashedUserId).toMatch(/^sha256:[a-f0-9]{16}$/);
        expect(loggedData.cabinId).toBe(1);
        expect(loggedData.startDate).toBe("2026-01-15");
        expect(loggedData.endDate).toBe("2026-01-20");
        expect(loggedData.errorDetail).toBe("23P01:conflicting key value");
      });

      it("logs booking conflict with optional fields", () => {
        logger.bookingConflict({
          guestId: 456,
          cabinId: 2,
          startDate: "2026-02-01",
          endDate: "2026-02-05",
          errorDetail: "23505:duplicate key",
          requestId: "req_abc12345",
          responseTimeMs: 150,
          cabinAvailability: "appeared_available",
        });

        const loggedData = JSON.parse(consoleSpy.warn.mock.calls[0][0] as string);

        expect(loggedData.requestId).toBe("req_abc12345");
        expect(loggedData.responseTimeMs).toBe(150);
        expect(loggedData.cabinAvailability).toBe("appeared_available");
      });

      it("formats Date objects to ISO date strings", () => {
        logger.bookingConflict({
          guestId: 789,
          cabinId: 3,
          startDate: new Date("2026-03-10T12:00:00Z"),
          endDate: new Date("2026-03-15T14:30:00Z"),
          errorDetail: "test",
        });

        const loggedData = JSON.parse(consoleSpy.warn.mock.calls[0][0] as string);
        expect(loggedData.startDate).toBe("2026-03-10");
        expect(loggedData.endDate).toBe("2026-03-15");
      });

      it("passes through string dates unchanged", () => {
        logger.bookingConflict({
          guestId: 111,
          cabinId: 4,
          startDate: "2026-04-01",
          endDate: "2026-04-10",
          errorDetail: "test",
        });

        const loggedData = JSON.parse(consoleSpy.warn.mock.calls[0][0] as string);
        expect(loggedData.startDate).toBe("2026-04-01");
        expect(loggedData.endDate).toBe("2026-04-10");
      });

      it("excludes undefined optional fields from output", () => {
        logger.bookingConflict({
          guestId: 222,
          cabinId: 5,
          startDate: "2026-05-01",
          endDate: "2026-05-05",
          errorDetail: "minimal",
        });

        const loggedData = JSON.parse(consoleSpy.warn.mock.calls[0][0] as string);
        expect(loggedData).not.toHaveProperty("requestId");
        expect(loggedData).not.toHaveProperty("responseTimeMs");
        expect(loggedData).not.toHaveProperty("cabinAvailability");
      });
    });
  });
});