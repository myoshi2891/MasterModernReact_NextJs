/**
 * Responds to GET requests with a simple JSON health status.
 *
 * @returns {Response} A response whose JSON body is { status: "ok" }.
 */
export function GET() {
  return Response.json({ status: "ok" });
}