// app/api/cabins/[cabinId]/route.ts
export const runtime = "nodejs"; // supabase-js を使うため

import { NextResponse } from "next/server";
import { getBookedDatesByCabinId, getCabin } from "@/app/_lib/data-service.server";

export async function GET(request: Request, { params }: { params: { cabinId: string } }) {
  const { cabinId } = params;
  try {
    const [cabin, bookedDates] = await Promise.all([
      getCabin(cabinId),
      getBookedDatesByCabinId(cabinId),
    ]);
    return NextResponse.json({ cabin, bookedDates });
  } catch {
    return NextResponse.json({ message: "Cabin not found..." }, { status: 404 });
  }
}
