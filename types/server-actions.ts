/**
 * Type-safe Server Action result pattern
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Retrieve and return a trimmed, non-empty string value for the given FormData field.
 *
 * @param formData - The FormData to read the field from
 * @param key - The form field name to extract
 * @returns The trimmed string value for `key`
 * @throws If the field is missing, if the value is not a string (e.g., a File), or if the trimmed value is empty
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

/**
 * Parse and return a trimmed numeric value for the specified form field.
 *
 * @param formData - The FormData object to read the field from
 * @param key - The name of the form field to parse as a number
 * @returns The parsed numeric value for the specified field
 * @throws If the field is missing, the value is not a string, the trimmed value is empty, or the value cannot be parsed to a finite number
 */
export function getFormNumber(formData: FormData, key: string): number {
  const value = getFormString(formData, key);
  const num = Number(value);
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    throw new Error(`Expected number for form field: ${key}`);
  }
  return num;
}

/**
 * Retrieves a trimmed string value for a form field or `undefined` when the field is absent or empty after trimming.
 *
 * @param formData - The FormData object to read from
 * @param key - The name of the form field to retrieve
 * @returns The trimmed string value if present and not empty, `undefined` otherwise
 * @throws Error if the field is present but is not a string (e.g., a File)
 */
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