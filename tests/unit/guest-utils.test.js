import { describe, it, expect } from "vitest";
import { normalizeNationalId } from "../../app/_lib/guest";

describe("normalizeNationalId", () => {
  it("returns empty for missing values", () => {
    expect(normalizeNationalId("")).toBe("");
    expect(normalizeNationalId(null)).toBe("");
  });

  it("trims whitespace around the value", () => {
    expect(normalizeNationalId("  ABC123  ")).toBe("ABC123");
  });

  it("rejects values shorter than 6 characters", () => {
    expect(() => normalizeNationalId("ABCDE")).toThrow(
      "Please provide a valid national ID"
    );
  });

  it("rejects values longer than 12 characters", () => {
    expect(() => normalizeNationalId("ABCDEFGHIJKLM")).toThrow(
      "Please provide a valid national ID"
    );
  });

  it("accepts 6 character IDs", () => {
    expect(normalizeNationalId("ABC123")).toBe("ABC123");
  });

  it("accepts 12 character IDs", () => {
    expect(normalizeNationalId("ABCDEF123456")).toBe("ABCDEF123456");
  });

  it("accepts alphanumeric combinations", () => {
    expect(normalizeNationalId("A1B2C3")).toBe("A1B2C3");
  });
});
