import { z } from "zod";

// Functional resources, not assumed names of existing Neon tables.
export const territoryResources = [
  "unidades-territoriais", "observacoes-ambientais", "projectos-ambientais", "analises-ia",
] as const;
export type TerritoryResource = (typeof territoryResources)[number];

export const territoryQuerySchema = z.object({
  id: z.string().trim().min(1).max(128).optional(),
  search: z.string().trim().min(1).max(200).optional(),
  cursor: z.string().trim().min(1).max(256).optional(),
  limit: z.number().int().min(1).max(100).default(25),
}).strict();
export type TerritoryQueryInput = z.input<typeof territoryQuerySchema>;
export type TerritoryQuery = z.output<typeof territoryQuerySchema>;

// Define real row DTOs only after approved schema discovery.
export type TerritoryUnavailable = {
  ok: false;
  resource: TerritoryResource;
  code: "INTEGRATION_DISABLED";
  data: never[];
  nextCursor: null;
};

export function validateTerritoryQuery(input: unknown): TerritoryQuery {
  const result = territoryQuerySchema.safeParse(input);
  if (!result.success) {
    // Never echo SQL, credentials, input values or validation internals.
    throw new Error("Parâmetros de consulta inválidos.");
  }
  return result.data;
}