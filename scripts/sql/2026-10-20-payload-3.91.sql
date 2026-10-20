-- Schema for the Payload 3.89 -> 3.91 upgrade.
--
-- Found by diffing `pg_dump -s` of production against the schema 3.91 creates
-- in an empty database WITH the Vercel Blob plugin enabled (set a dummy
-- BLOB_READ_WRITE_TOKEN and BLOB_ENABLE_LOCAL=true; without them the plugin's
-- columns are missing from the comparison). Three changes, nothing else:
--
-- 1. users.reset_password_requested_at: Payload 3.90 rate-limits password
--    reset mails and stores the last request time.
-- 2. media._objectkey: @payloadcms/storage-vercel-blob 3.90+ stores the blob
--    object key per upload.
-- 3. legal_pages bodies: the config made both optional on 2026-08-27 ("leer
--    lassen heisst: die mitgelieferte Fassung bleibt"), but production still
--    had NOT NULL from the original schema, so saving an empty body failed.
--
-- Additive or relaxing only, idempotent, safe for the running 3.89 code.
-- Preview deployments share the production database, so apply this BEFORE
-- pushing the upgrade branch:
--
--   psql "$DATABASE_URI" -v ON_ERROR_STOP=1 -f scripts/sql/2026-10-20-payload-3.91.sql
--
-- Check: psql "$DATABASE_URI" -c "\d users" -c "\d media" -c "\d legal_pages"

BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS reset_password_requested_at timestamp(3) with time zone;

ALTER TABLE media
  ADD COLUMN IF NOT EXISTS _objectkey character varying;

ALTER TABLE legal_pages
  ALTER COLUMN impressum_body DROP NOT NULL,
  ALTER COLUMN datenschutz_body DROP NOT NULL;

COMMIT;
