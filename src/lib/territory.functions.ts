import { createServerFn } from "@tanstack/react-start";
import { validateTerritoryQuery } from "./territory.contracts";
import { readTerritoryResource } from "./territory.server";

// These RPCs return only disabled state; never real/demo rows or secrets.
// Enforce auth at the server boundary before enabling private reads.
export const queryTerritorialUnits = createServerFn({ method: "GET" })
  .inputValidator(validateTerritoryQuery)
  .handler(({ data }) => readTerritoryResource("unidades-territoriais", data));

export const queryEnvironmentalObservations = createServerFn({ method: "GET" })
  .inputValidator(validateTerritoryQuery)
  .handler(({ data }) => readTerritoryResource("observacoes-ambientais", data));

export const queryEnvironmentalProjects = createServerFn({ method: "GET" })
  .inputValidator(validateTerritoryQuery)
  .handler(({ data }) => readTerritoryResource("projectos-ambientais", data));

export const queryAiAnalyses = createServerFn({ method: "GET" })
  .inputValidator(validateTerritoryQuery)
  .handler(({ data }) => readTerritoryResource("analises-ia", data));