/**
 * Type-safe Server Action result pattern
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Helper to extract typed form data with automatic whitespace trimming.
 * All string values are trimmed to prevent subtle bugs from whitespace-only input.
 */
export function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (value === null) {
    throw new Error(`Form field is missing: ${key}`);
  }
  if (typeof value !== "string") {
    throw new Error(`Expected string for form field: ${key}, got File`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Form field is empty: ${key}`);
  }
  return trimmed;
}

export function getFormNumber(formData: FormData, key: string): number {
  const value = getFormString(formData, key);
  const num = Number(value);
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    throw new Error(`Expected number for form field: ${key}`);
  }
  return num;
}

export function getFormOptionalString(
  formData: FormData,
  key: string
): string | undefined {
  const value = formData.get(key);
  if (value === null) return undefined;
  if (typeof value !== "string") {
    throw new Error(`Expected string for form field: ${key}, got File`);
  }
  const trimmed = value.trim();
  return trimmed || undefined;
}