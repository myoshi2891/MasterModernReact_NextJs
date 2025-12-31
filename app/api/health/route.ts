import { NextResponse } from "next/server";

/**
 * Responds to GET requests with a simple JSON health status.
 *
 * @returns A response whose JSON body is { status: "ok" }.
 */
export function GET() {
	return NextResponse.json({ status: "ok" });
}