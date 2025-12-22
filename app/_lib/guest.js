export function normalizeNationalId(rawValue) {
  const normalized = rawValue?.toString().trim() ?? "";

  if (!normalized) return "";

  if (!/^[a-zA-Z0-9]{6,12}$/.test(normalized)) {
    throw new Error("Please provide a valid national ID");
  }

  return normalized;
}
