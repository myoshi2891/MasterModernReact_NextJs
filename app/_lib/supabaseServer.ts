import { createClient } from "@supabase/supabase-js";
import "server-only";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 必要な env が揃っていることを明確にチェック
if (!url) throw new Error("Missing SUPABASE_URL in environment");
if (!serviceKey)
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in environment");

// サーバー専用モジュールなのでクライアントからの import を防ぐ
if (typeof window !== "undefined") {
  throw new Error("This Supabase client must only be imported on the server");
}

// サービスキーでクライアントを作成（RLS をバイパスする強力なキーなので厳重管理）
// Note: Database型を指定するとsupabase-jsの型推論が過度に厳格になるため、
// 型安全性はアプリケーション層（domain.ts）で担保する
export const supabaseServer = createClient(url, serviceKey, {
  auth: {
    persistSession: false,
  },
});
