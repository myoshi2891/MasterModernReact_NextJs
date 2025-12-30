import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL)
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
if (!process.env.NEXT_PUBLIC_SUPABASE_KEY)
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_KEY");

// Note: Database型を指定するとsupabase-jsの型推論が過度に厳格になるため、
// 型安全性はアプリケーション層（domain.ts）で担保する
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY,
  {
    auth: {
      persistSession: true,
    },
  }
);
