import type { TerritoryQuery, TerritoryResource, TerritoryUnavailable } from "./territory.contracts";

/** No transport, SQL, env reads or driver. Connector keys cannot activate access.
 * Replace only after approved schema discovery and server-side read authorization.
 */
export async function readTerritoryResource(
  resource: TerritoryResource,
  _query: TerritoryQuery,
): Promise<TerritoryUnavailable> {
  return { ok: false, resource, code: "INTEGRATION_DISABLED", data: [], nextCursor: null };
}

/** No mutation RPC is exported. Future mutations must also pass this guard. */
export function assertTerritoryWriteAllowed(): never {
  // No client boolean, role or alleged session can unlock this guard.
  throw new Error("Operações de escrita bloqueadas.");
}