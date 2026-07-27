import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import type { Session } from "next-auth";
import { authConfig } from "@/app/_lib/auth.config";

const authorized = authConfig.callbacks.authorized;

function requestFor(pathname: string) {
	return new NextRequest(`https://example.com${pathname}`);
}

describe("authConfig authorized callback", () => {
	it("rejects an unauthenticated account request", async () => {
		const result = await authorized({
			auth: null,
			request: requestFor("/account"),
		});

		expect(result).toBe(false);
	});

	it("rejects an account request when auth contains an error but no user", async () => {
		const authWithError = {
			error: "Configuration",
			expires: new Date(Date.now() + 60_000).toISOString(),
		} as unknown as Session;

		const result = await authorized({
			auth: authWithError,
			request: requestFor("/account/reservations"),
		});

		expect(result).toBe(false);
	});

	it("allows an authenticated account request", async () => {
		const result = await authorized({
			auth: {
				expires: new Date(Date.now() + 60_000).toISOString(),
				user: { name: "Guest" },
			},
			request: requestFor("/account/profile"),
		});

		expect(result).toBe(true);
	});

	it("allows a public request without a session", async () => {
		const result = await authorized({
			auth: null,
			request: requestFor("/cabins"),
		});

		expect(result).toBe(true);
	});
});
