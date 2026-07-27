import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

const configUrl = pathToFileURL(join(process.cwd(), "next.config.mjs")).href;
const readConfigScript = `
	import config from ${JSON.stringify(configUrl)};
	process.stdout.write(String(config.images.dangerouslyAllowLocalIP));
`;

function readDangerouslyAllowLocalIp(
	nodeEnv: "development" | "production",
	ci: "true" | "false",
	optIn: "true" | "false"
) {
	return (
		execFileSync(process.execPath, ["--input-type=module", "--eval", readConfigScript], {
			encoding: "utf8",
			env: {
				...process.env,
				CI: ci,
				NODE_ENV: nodeEnv,
				NEXT_IMAGES_DANGEROUSLY_ALLOW_LOCAL_IP: optIn,
			},
		}) === "true"
	);
}

describe("Next.js image configuration", () => {
	it("allows local IPs only when explicitly enabled in local development", () => {
		expect(readDangerouslyAllowLocalIp("development", "false", "true")).toBe(
			true
		);
	});

	it("keeps local IPs blocked in production", () => {
		expect(readDangerouslyAllowLocalIp("production", "false", "true")).toBe(
			false
		);
	});

	it("keeps local IPs blocked in CI", () => {
		expect(readDangerouslyAllowLocalIp("development", "true", "true")).toBe(
			false
		);
	});

	it("keeps local IPs blocked without the explicit opt-in", () => {
		expect(readDangerouslyAllowLocalIp("development", "false", "false")).toBe(
			false
		);
	});
});
