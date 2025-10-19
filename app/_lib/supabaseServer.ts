// app/_lib/getSupabaseServiceClient.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import "server-only";

/**
 * 重要ポイント
 * - トップレベルで env を読まない（ビルド時に評価されるのを回避）
 * - 呼び出し側の Route/Server Component で必ず `export const runtime = 'nodejs'`
 *   を宣言（supabase-js は Edge Runtime 非対応のため）
 * - このモジュールはサーバ専用（client からの import はビルドで弾かれる）
 */

function readServerEnv() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { url, serviceKey };
}

/** 実行時に環境変数を確認し、不足があればこの時点で例外化（= ビルドは通る） */
function ensureServerEnv() {
  const { url, serviceKey } = readServerEnv();
  if (!url) throw new Error("Missing SUPABASE_URL in environment");
  if (!serviceKey)
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in environment");
  return { url, serviceKey };
}

/** 1プロセス内での再利用（作り直しコスト削減） */
let _client: SupabaseClient | null = null;

/**
 * サービスロールでのサーバ専用クライアント
 * - RLS をバイパスできる強力なキーなので、ルート/サーバ内だけで使用すること
 * - 呼び出し側のファイルに `export const runtime = 'nodejs'` を必ず付与
 */
export function getSupabaseServiceClient(): SupabaseClient {
  if (_client) return _client;
  const { url, serviceKey } = ensureServerEnv();
  _client = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
  return _client;
}
