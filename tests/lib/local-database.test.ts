import { describe, expect, it } from "vitest";

import { isLocalDatabaseUrl } from "@/lib/local-database";

describe("isLocalDatabaseUrl", () => {
  it("accepts the Docker database from .env.example", () => {
    expect(
      isLocalDatabaseUrl("postgres://svnord:svnord_dev@localhost:5432/svnord"),
    ).toBe(true);
    expect(isLocalDatabaseUrl("postgres://u:p@127.0.0.1:5432/db")).toBe(true);
    expect(isLocalDatabaseUrl("postgres://u:p@[::1]:5432/db")).toBe(true);
  });

  it("treats a missing connection string as local, like pg does", () => {
    expect(isLocalDatabaseUrl(undefined)).toBe(true);
    expect(isLocalDatabaseUrl("")).toBe(true);
  });

  it("rejects a Neon host", () => {
    expect(
      isLocalDatabaseUrl(
        "postgresql://u:p@ep-example-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require",
      ),
    ).toBe(false);
  });

  it("rejects what it cannot parse", () => {
    expect(isLocalDatabaseUrl("not a url")).toBe(false);
  });
});
