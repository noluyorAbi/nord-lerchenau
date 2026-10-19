-- Schema for the Payload 3.83 -> 3.91 upgrade.
--
-- Payload 3.91 adds one column to the auth collection: the time a password
-- reset was requested (rate limiting of reset mails). Found by creating the
-- schema with both versions in empty databases and diffing `pg_dump -s`; this
-- is the only difference.
--
-- Additive and idempotent, safe for the running 3.83 code (it never selects the
-- column). Apply BEFORE deploying the upgrade:
--
--   psql "$DATABASE_URI" -v ON_ERROR_STOP=1 -f scripts/sql/2026-10-19-payload-3.91.sql
--
-- Check: psql "$DATABASE_URI" -c "\d users"

BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS reset_password_requested_at timestamp(3) with time zone;

COMMIT;
