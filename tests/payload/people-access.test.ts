import type { Field, FieldAccess } from "payload";
import { describe, expect, it } from "vitest";

import { People } from "@/payload/collections/People";

function readAccess(name: string): FieldAccess {
  const field = People.fields.find(
    (f: Field) => "name" in f && f.name === name,
  );
  const read = field && "access" in field ? field.access?.read : undefined;
  if (!read) throw new Error(`people.${name} has no read access rule`);
  return read;
}

// Pages read people through the Local API, which bypasses these rules. The
// rules only guard the public REST and GraphQL endpoints, where private phone
// numbers must never appear.
describe("people contact fields", () => {
  for (const name of ["phone", "email"]) {
    it(`hides ${name} from anonymous API reads`, async () => {
      const read = readAccess(name);
      const anonymous = { req: { user: null } } as Parameters<FieldAccess>[0];
      const loggedIn = {
        req: { user: { id: 1 } },
      } as unknown as Parameters<FieldAccess>[0];
      expect(await read(anonymous)).toBe(false);
      expect(await read(loggedIn)).toBe(true);
    });
  }
});
