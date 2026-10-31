import { describe, expect, it } from "vitest";
import { validateTerritoryQuery } from "@/lib/territory.contracts";

describe("Territory input validation", () => {
  it("defaults to 25 results", () => {
    expect(validateTerritoryQuery({})).toEqual({ limit: 25 });
  });

  it.each([1, 100])("accepts boundary limit %i", (limit) => {
    expect(validateTerritoryQuery({ limit }).limit).toBe(limit);
  });

  it.each([0, 101, -1, 1.5, "25", null, NaN, Infinity])(
    "rejects invalid limit %s", (limit) => {
      expect(() => validateTerritoryQuery({ limit })).toThrow();
    },
  );

  it.each([
    ["id", 128], ["search", 200], ["cursor", 256],
  ] as const)("accepts %s at its maximum length", (field, maximum) => {
    const value = "a".repeat(maximum);
    expect(validateTerritoryQuery({ [field]: value })).toEqual({ [field]: value, limit: 25 });
  });

  it.each([
    ["id", 128], ["search", 200], ["cursor", 256],
  ] as const)("rejects oversized %s", (field, maximum) => {
    expect(() => validateTerritoryQuery({ [field]: "a".repeat(maximum + 1) })).toThrow();
  });

  it.each(["id", "search", "cursor"])("rejects blank %s", (field) => {
    expect(() => validateTerritoryQuery({ [field]: "   " })).toThrow();
  });

  it("trims filters without changing their values", () => {
    expect(validateTerritoryQuery({ id: " 123 ", search: " Luanda ", cursor: " next " }))
      .toEqual({ id: "123", search: "Luanda", cursor: "next", limit: 25 });
  });

  it.each(["sql", "table", "role", "authenticated", "DATABASE_URL"])(
    "rejects unrecognised field %s", (field) => {
      expect(() => validateTerritoryQuery({ [field]: "untrusted" })).toThrow();
    },
  );

  it.each([null, undefined, [], "query", 25])("rejects non-object input %s", (input) => {
    expect(() => validateTerritoryQuery(input)).toThrow();
  });

  it("does not expose rejected input in the validation error", () => {
    const marker = "untrusted-sensitive-test-marker";
    let caught: unknown;
    try { validateTerritoryQuery({ sql: marker }); } catch (error) { caught = error; }
    expect(caught).toBeInstanceOf(Error);
    if (!(caught instanceof Error)) throw new Error("Expected validation rejection");
    expect(caught.message).not.toContain(marker);
  });
});