// app/_lib/supabase-admin.js
import { createClient } from "@supabase/supabase-js";
import "server-only";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error("Missing Supabase admin env vars");
}

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

if (typeof window !== "undefined") {
  throw new Error("supabase-admin must not be imported in the browser.");
}
