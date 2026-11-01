import { z } from "zod";

// Descriptive preparation only. Never use this catalogue as authorization.
export const accessRoleSchema = z.enum(["administrador", "tecnico", "consulta"]);
export type AccessRole = z.infer<typeof accessRoleSchema>;
export const accessProfiles = {
  administrador: { label: "Administrador", enabled: false },
  tecnico: { label: "Técnico", enabled: false },
  consulta: { label: "Utilizador de consulta", enabled: false },
} as const satisfies Record<AccessRole, { label: string; enabled: false }>;
// Permissions are intentionally unspecified; names grant no access.
// Actual role assignments require verified auth and trusted server-side storage.