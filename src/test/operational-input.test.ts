import { describe, expect, it } from "vitest";
import {
  occurrenceStates, validateOccurrenceCreateInput, validateProjectCreateInput,
} from "@/lib/operational-input.contracts";

const territory = {
  provinciaId: "00000000-0000-4000-8000-000000000001",
  municipioId: "00000000-0000-4000-8000-000000000002",
};
const occurrence = {
  ...territory, categoria: "desflorestacao", descricao: "Relato para validação",
  dataOcorrencia: "2026-11-17",
};
const project = {
  ...territory, nome: "Projecto de teste", descricao: "Descrição",
  objectivos: "Recuperação ambiental", areaIntervencao: "Área em avaliação",
  dataInicio: "2026-11-17", prazoPrevisto: "2026-12-17",
};

describe("Operational input preparation, without persistence", () => {
  it("requires occurrence description", () => {
    expect(() => validateOccurrenceCreateInput({ ...occurrence, descricao: " " })).toThrow();
    expect(validateOccurrenceCreateInput(occurrence).descricao).toBe("Relato para validação");
  });
  it.each(["desflorestacao", "queimadas", "poluicao", "degradacao_solos", "erosao", "contaminacao_agua", "perda_biodiversidade", "outras"])("accepts category %s", (categoria) => {
    expect(validateOccurrenceCreateInput({ ...occurrence, categoria }).categoria).toBe(categoria);
  });
  it("rejects a category outside the requested catalogue", () => {
    expect(() => validateOccurrenceCreateInput({ ...occurrence, categoria: "inventada" })).toThrow();
  });
  it("defines exactly the requested five follow-up states", () => {
    expect(occurrenceStates).toEqual(["registada", "em_analise", "em_acompanhamento", "resolvida", "arquivada"]);
  });
  it.each(["provinciaId", "municipioId"])("requires territorial reference %s", (field) => {
    expect(() => validateOccurrenceCreateInput({ ...occurrence, [field]: undefined })).toThrow();
  });
  it("allows an optional identified comuna without inventing one", () => {
    expect(validateOccurrenceCreateInput(occurrence).comunaId).toBeUndefined();
    expect(validateOccurrenceCreateInput({ ...occurrence, comunaId: territory.municipioId }).comunaId).toBe(territory.municipioId);
    expect(() => validateOccurrenceCreateInput({ ...occurrence, comunaId: "inventada" })).toThrow();
  });
  it.each(["responsavelId", "estado", "role", "authenticated", "criadoEm"])("rejects caller authority or server field %s", (field) => {
    expect(() => validateOccurrenceCreateInput({ ...occurrence, [field]: "untrusted" })).toThrow();
    expect(() => validateProjectCreateInput({ ...project, [field]: "untrusted" })).toThrow();
  });
  it("requires a real calendar occurrence date", () => {
    expect(() => validateOccurrenceCreateInput({ ...occurrence, dataOcorrencia: "2026-02-30" })).toThrow();
  });
  it("rejects impossible coordinates", () => {
    expect(() => validateOccurrenceCreateInput({ ...occurrence, localizacao: { latitude: 91, longitude: 0 } })).toThrow();
    expect(() => validateOccurrenceCreateInput({ ...occurrence, localizacao: { latitude: 0, longitude: 181 } })).toThrow();
  });
  it.each(["nome", "descricao", "objectivos", "areaIntervencao"])("requires project field %s", (field) => {
    expect(() => validateProjectCreateInput({ ...project, [field]: " " })).toThrow();
  });
  it("requires a project deadline not before its start", () => {
    expect(() => validateProjectCreateInput({ ...project, prazoPrevisto: "2026-11-16" })).toThrow();
    expect(validateProjectCreateInput(project).prazoPrevisto).toBe("2026-12-17");
  });
});