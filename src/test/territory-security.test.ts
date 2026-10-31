import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TerritoryQuery } from "@/lib/territory.contracts";
import { territoryResources } from "@/lib/territory.contracts";
import { assertTerritoryWriteAllowed, readTerritoryResource } from "@/lib/territory.server";

// Unit adapter only: exercise the actual registered validators and handlers.
// This does not verify TanStack HTTP serialization, deployment or CSRF middleware.
vi.mock("@tanstack/react-start", () => ({
  createServerFn: ({ method }: { method: string }) => ({
    inputValidator: (validate: (input: unknown) => TerritoryQuery) => ({
      handler: (handler: (args: { data: TerritoryQuery }) => unknown) => Object.assign(
        async ({ data }: { data: unknown }) => handler({ data: validate(data) }),
        { method },
      ),
    }),
  }),
}));

import * as rpc from "@/lib/territory.functions";

const queries = [
  ["unidades-territoriais", rpc.queryTerritorialUnits],
  ["observacoes-ambientais", rpc.queryEnvironmentalObservations],
  ["projectos-ambientais", rpc.queryEnvironmentalProjects],
  ["analises-ia", rpc.queryAiAnalyses],
] as const;

describe("Territory queries and fail-closed security", () => {
  const fetchTrap = vi.fn(() => { throw new Error("Unexpected network request"); });
  const xhrTrap = vi.fn(() => { throw new Error("Unexpected browser request"); });

  beforeEach(() => {
    fetchTrap.mockClear();
    xhrTrap.mockClear();
    vi.stubGlobal("fetch", fetchTrap);
    vi.stubGlobal("XMLHttpRequest", xhrTrap);
    // Never inspect actual credentials. These values are deliberately fictitious.
    vi.stubEnv("LOVABLE_API_KEY", "");
    vi.stubEnv("NEON_API_KEY", "");
    vi.stubEnv("DATABASE_URL", "");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it.each(queries)("%s registers a read-only GET operation", (_resource, query) => {
    expect(query.method).toBe("GET");
  });

  it.each(queries)("%s returns only disabled state without network access", async (resource, query) => {
    expect(await query({ data: {} })).toEqual({
      ok: false, resource, code: "INTEGRATION_DISABLED", data: [], nextCursor: null,
    });
    expect(fetchTrap).not.toHaveBeenCalled();
    expect(xhrTrap).not.toHaveBeenCalled();
  });

  it.each(queries)("%s cannot be activated by environment keys", async (resource, query) => {
    vi.stubEnv("LOVABLE_API_KEY", "dummy-lovable-key-not-real");
    vi.stubEnv("NEON_API_KEY", "dummy-neon-key-not-real");
    vi.stubEnv("DATABASE_URL", "dummy-database-url-not-real");
    const result = await query({ data: { id: "demo-id", search: "Luanda", limit: 100 } });
    expect(result).toEqual({
      ok: false, resource, code: "INTEGRATION_DISABLED", data: [], nextCursor: null,
    });
    expect(fetchTrap).not.toHaveBeenCalled();
    expect(xhrTrap).not.toHaveBeenCalled();
  });

  it.each(queries)("%s rejects invalid input before executing the handler", async (_resource, query) => {
    await expect(query({ data: { limit: 101 } })).rejects.toThrow();
    expect(fetchTrap).not.toHaveBeenCalled();
  });

  it.each(queries)("%s rejects browser-supplied authority and SQL", async (_resource, query) => {
    const invoke = query as (args: { data: unknown }) => Promise<unknown>;
    await expect(invoke({ data: { role: "admin", authenticated: true, sql: "untrusted" } })).rejects.toThrow();
    expect(fetchTrap).not.toHaveBeenCalled();
  });

  it.each(territoryResources)("direct server read for %s is also disabled", async (resource) => {
    expect(await readTerritoryResource(resource, { limit: 25 })).toEqual({
      ok: false, resource, code: "INTEGRATION_DISABLED", data: [], nextCursor: null,
    });
    expect(fetchTrap).not.toHaveBeenCalled();
  });

  it("refuses writes without a session", () => {
    expect(() => assertTerritoryWriteAllowed()).toThrow("Operações de escrita bloqueadas.");
    expect(fetchTrap).not.toHaveBeenCalled();
  });

  it("refuses writes even with dummy keys and an alleged admin session", () => {
    vi.stubEnv("NEON_API_KEY", "dummy-neon-key-not-real");
    vi.stubEnv("LOVABLE_API_KEY", "dummy-lovable-key-not-real");
    const attempt = assertTerritoryWriteAllowed as (...args: unknown[]) => never;
    expect(() => attempt({ authenticated: true, role: "admin" })).toThrow("Operações de escrita bloqueadas.");
    expect(fetchTrap).not.toHaveBeenCalled();
  });

  it("exports no mutation RPC", () => {
    expect(Object.keys(rpc).sort()).toEqual([
      "queryAiAnalyses", "queryEnvironmentalObservations", "queryEnvironmentalProjects", "queryTerritorialUnits",
    ]);
  });
});