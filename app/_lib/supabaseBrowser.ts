import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
if (!supabaseKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_KEY");

// Note: Database型を指定するとsupabase-jsの型推論が過度に厳格になるため、
// 型安全性はアプリケーション層（domain.ts）で担保する
export const supabaseBrowser = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
  },
});
