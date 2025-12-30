/**
 * 国民ID（パスポート番号等）を正規化する
 *
 * 入力値から英数字以外を除去し、6-12文字の形式に変換する。
 * ハイフン、スペース、その他の記号は自動的に除去される。
 *
 * @example
 * // ハイフン付きの入力
 * normalizeNationalId("AB-1234-CD") // => "AB1234CD"
 *
 * @example
 * // スペース付きの入力
 * normalizeNationalId("AB 1234 CD") // => "AB1234CD"
 *
 * @example
 * // 空文字列の場合
 * normalizeNationalId("") // => ""
 *
 * @example
 * // 短すぎる場合はエラー
 * normalizeNationalId("ABC") // throws Error
 *
 * @param {*} rawValue - 生の入力値（文字列、数値など）
 * @returns {string} 正規化されたID（6-12文字の英数字）、または空文字列（入力が空または空白のみの場合）
 * @throws {Error} 正規化後の値が空、または6-12文字の英数字形式に一致しない場合
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
