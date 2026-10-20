-- Schema for the Payload 3.89 -> 3.91 upgrade.
--
-- Payload 3.90 added rate limiting for password reset mails, which stores the
-- time of the last request on the auth collection. Found by creating the
-- schema with both versions in empty databases and diffing `pg_dump -s`; this
-- column is the only difference.
--
-- Additive and idempotent, safe for the running 3.89 code (it never selects
-- the column). Preview deployments share the production database, so apply
-- this BEFORE pushing the upgrade branch:
--
--   psql "$DATABASE_URI" -v ON_ERROR_STOP=1 -f scripts/sql/2026-10-20-payload-3.91.sql
--
-- Check: psql "$DATABASE_URI" -c "\d users"

BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS reset_password_requested_at timestamp(3) with time zone;

COMMIT;
