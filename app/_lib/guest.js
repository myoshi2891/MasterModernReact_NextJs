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
