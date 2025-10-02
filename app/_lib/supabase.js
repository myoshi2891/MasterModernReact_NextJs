import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) throw new Error("Missing Supabase URL");

if (typeof window !== "undefined") {
  throw new Error("supabase client must only be imported on the server");
}

const key = serviceKey ?? anonKey;

if (!key) throw new Error("Missing Supabase credentials");

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});
