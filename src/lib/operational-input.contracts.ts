import { z } from "zod";

// Preparation only: no transport, persistence or authority is granted here.
const requiredText = z.string().trim().min(1);
const uuid = z.string().uuid();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
});

export const occurrenceCategories = [
  "desflorestacao", "queimadas", "poluicao", "degradacao_solos",
  "erosao", "contaminacao_agua", "perda_biodiversidade", "outras",
] as const;
export const occurrenceStates = [
  "registada", "em_analise", "em_acompanhamento", "resolvida", "arquivada",
] as const;

// References must be checked against real authorized rows in the future handler.
const territorySelection = {
  provinciaId: uuid,
  municipioId: uuid,
  comunaId: uuid.optional(),
};

export const occurrenceCreateInputSchema = z.object({
  categoria: z.enum(occurrenceCategories),
  descricao: requiredText,
  ...territorySelection,
  localizacao: z.object({
    latitude: z.number().finite().min(-90).max(90),
    longitude: z.number().finite().min(-180).max(180),
  }).strict().optional(),
  dataOcorrencia: date,
}).strict();

// The server, not the caller, will set identity, initial status and audit dates.
// State changes require a distinct authorized workflow, not this create input.
export const projectCreateInputSchema = z.object({
  nome: requiredText,
  descricao: requiredText,
  objectivos: requiredText,
  areaIntervencao: requiredText,
  ...territorySelection,
  dataInicio: date,
  prazoPrevisto: date,
}).strict().refine((input) => input.prazoPrevisto >= input.dataInicio);

export type OccurrenceCreateInput = z.infer<typeof occurrenceCreateInputSchema>;
export type ProjectCreateInput = z.infer<typeof projectCreateInputSchema>;

export function validateOccurrenceCreateInput(input: unknown): OccurrenceCreateInput {
  const result = occurrenceCreateInputSchema.safeParse(input);
  if (!result.success) throw new Error("Dados da ocorrência inválidos.");
  return result.data;
}

export function validateProjectCreateInput(input: unknown): ProjectCreateInput {
  const result = projectCreateInputSchema.safeParse(input);
  if (!result.success) throw new Error("Dados do projecto inválidos.");
  return result.data;
}