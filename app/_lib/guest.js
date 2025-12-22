/**
 * Produce a sanitized national ID consisting of 6–12 alphanumeric characters.
 * @param {*} rawValue - Raw national ID value to normalize (string, number, etc.).
 * @returns {string} The sanitized national ID (6–12 letters or digits), or an empty string if input is empty or only whitespace.
 * @throws {Error} When the sanitized value is empty or does not match the 6–12 alphanumeric character requirement.  
 */
export function normalizeNationalId(rawValue) {
  const normalized = rawValue?.toString().trim() ?? "";

  if (!normalized) return "";

  const sanitized = normalized.replace(/[^a-zA-Z0-9]/g, "");

  if (!sanitized) {
    throw new Error("Please provide a valid national ID");
  }

  if (!/^[a-zA-Z0-9]{6,12}$/.test(sanitized)) {
    throw new Error("Please provide a valid national ID");
  }

  return sanitized;
}