import { describe, expect, it } from "vitest";
import { accessProfiles, accessRoleSchema } from "@/lib/access.contracts";
import { assertTerritoryWriteAllowed } from "@/lib/territory.server";

describe("Access profile preparation", () => {
  it.each(["administrador", "tecnico", "consulta"] as const)(
    "%s is defined but inactive and cannot unlock writes", (role) => {
      expect(accessRoleSchema.parse(role)).toBe(role);
      expect(accessProfiles[role].enabled).toBe(false);
      const attempt = assertTerritoryWriteAllowed as (...args: unknown[]) => never;
      expect(() => attempt({ role, authenticated: true })).toThrow();
    },
  );
  it.each(["superadmin", "", null, { role: "administrador" }])("rejects invalid role %s", (role) => {
    expect(accessRoleSchema.safeParse(role).success).toBe(false);
  });
});