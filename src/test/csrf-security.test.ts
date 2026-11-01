import { describe, expect, it } from "vitest";
import { startInstance } from "@/start";

// Actual configured middleware, no mocked registration or network calls.
// Isolated-chain verification is not hosted RPC/serialization verification.
type Result = Response | { response: Response };
type Context = {
  request: Request; pathname: string; context: Record<string, unknown>;
  handlerType: "serverFn" | "router"; next: () => Promise<Result>;
};
async function evaluate(method: string, headers: Record<string, string>) {
  const options = await startInstance.getOptions();
  const callbacks = (options.requestMiddleware ?? []).map((middleware) =>
    middleware.options.server as unknown as (ctx: Context) => Promise<Result>);
  let executions = 0;
  const request = new Request("https://protind.example/test", { method, headers });
  async function run(index: number): Promise<Result> {
    const callback = callbacks[index];
    if (!callback) {
      executions++;
      return { response: new Response("accepted", { status: 200 }) };
    }
    return callback({ request, pathname: "/test", context: {}, handlerType: "serverFn", next: () => run(index + 1) });
  }
  const result = await run(0);
  return { response: result instanceof Response ? result : result.response, executions };
}
describe.each(["GET", "POST"])("Configured CSRF policy for %s", (method) => {
  it.each([
    { "Sec-Fetch-Site": "cross-site", Origin: "https://other.example" },
    { "Sec-Fetch-Site": "same-site" },
    { Origin: "https://other.example" },
    { Origin: "null" },
    { Referer: "https://protind.example.attacker.example/" },
    { Referer: "invalid" },
    {},
  ] as Record<string, string>[])("denies unsafe or unverified origin %#", async (headers) => {
    const { response, executions } = await evaluate(method, headers);
    expect(response.status).toBe(403);
    expect(executions).toBe(0);
  });
  it.each([
    { "Sec-Fetch-Site": "same-origin" },
    { Origin: "https://protind.example" },
    { Referer: "https://protind.example/page" },
  ] as Record<string, string>[])("accepts matching origin %#", async (headers) => {
    const { response, executions } = await evaluate(method, headers);
    expect(response.status).toBe(200);
    expect(executions).toBe(1);
  });
});