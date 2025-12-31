/**
 * Health check response structure.
 */
interface HealthResponse {
	status: "ok";
}

/**
 * Responds to GET requests with a simple JSON health status.
 *
 * @returns A response whose JSON body is { status: "ok" }.
 */
export function GET(): Response {
	return Response.json({ status: "ok" } as HealthResponse);
}