/**
 * Sets the final CMS admin credentials (username + password) on the target
 * database. Idempotent: creates the account if missing, otherwise updates
 * username and password in place.
 *
 * Usage:
 *   set -a && . ./.env.local.production && set +a && bun run scripts/set-cms-credentials.ts
 *
 * Reads: CMS_ADMIN_USERNAME / CMS_ADMIN_PASSWORD / CMS_VEREIN_USERNAME / CMS_VEREIN_PASSWORD
 */
import { getPayload } from "payload";

import config from "../payload.config";

type Account = {
  username: string;
  password: string;
  email: string;
  name: string;
};

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
}

async function upsert(
  payload: Awaited<ReturnType<typeof getPayload>>,
  account: Account,
) {
  const existing = await payload.find({
    collection: "users",
    where: {
      or: [
        { email: { equals: account.email } },
        { username: { equals: account.username } },
      ],
    },
    limit: 1,
  });

  const doc = existing.docs[0];
  if (doc) {
    await payload.update({
      collection: "users",
      id: doc.id,
      data: {
        username: account.username,
        password: account.password,
        name: account.name,
      } as never,
    });
    console.log(`✓ Updated ${account.username} (${account.email})`);
    return;
  }

  await payload.create({
    collection: "users",
    data: {
      email: account.email,
      username: account.username,
      password: account.password,
      name: account.name,
    } as never,
  });
  console.log(`✓ Created ${account.username} (${account.email})`);
}

async function verify(
  payload: Awaited<ReturnType<typeof getPayload>>,
  account: Account,
) {
  const result = await payload.login({
    collection: "users",
    data: { username: account.username, password: account.password } as never,
  });
  console.log(
    `✓ Login OK: ${account.username} -> token ${result.token ? "issued" : "MISSING"}`,
  );
}

async function main() {
  const payload = await getPayload({ config });

  const accounts: Account[] = [
    {
      username: required("CMS_ADMIN_USERNAME"),
      password: required("CMS_ADMIN_PASSWORD"),
      email: "admin@svnord.de",
      name: "SV Nord Admin",
    },
    {
      username: required("CMS_VEREIN_USERNAME"),
      password: required("CMS_VEREIN_PASSWORD"),
      email: "verein@svnord.de",
      name: "SV Nord Verein",
    },
  ];

  for (const account of accounts) {
    await upsert(payload, account);
  }
  for (const account of accounts) {
    await verify(payload, account);
  }

  process.exit(0);
}

void main();
