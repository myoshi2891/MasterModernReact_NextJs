// app/_lib/data-service.client.ts
"use client";

import { eachDayOfInterval } from "date-fns";
import { getSupabaseBrowser } from "./supabaseBrowser";

// クライアント用 anon クライアント
const supabase = () => getSupabaseBrowser();

export async function getCabinsClient() {
  const { data, error } = await supabase()
    .from("cabins")
    .select("id, name, maxCapacity, regularPrice, discount, image")
    .order("name");

  if (error) throw new Error(error.message);
  return data;
}

// 必要に応じて、クライアントで実行したい軽い読み取りAPIを定義
