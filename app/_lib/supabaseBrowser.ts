// app/_lib/supabaseBrowser.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase"; // ← 生成済みの型（例）

type Schema = "public";

let _client: SupabaseClient<Database, Schema> | null = null;

export function getSupabaseBrowser(): SupabaseClient<Database, Schema> {
  if (typeof window === "undefined") {
    throw new Error("getSupabaseBrowser() はブラウザでのみ使用してください。");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_KEY");
  }

  if (!_client) {
    _client = createClient<Database>(url, anonKey, {
      auth: { persistSession: true },
      db: { schema: "public" }, // 実行時にも "public" を明示
    });
  }

  return _client;
}
