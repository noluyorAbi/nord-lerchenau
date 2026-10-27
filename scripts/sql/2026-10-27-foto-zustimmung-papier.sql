-- Schema for hand-entered (paper) photo consents.
--
-- Found by diffing `pg_dump -s` of the schema main creates in an empty
-- database against the one this branch creates, both WITH the Vercel Blob
-- plugin enabled (dummy BLOB_READ_WRITE_TOKEN, BLOB_ENABLE_LOCAL=true).
-- Three changes, nothing else:
--
-- 1. photo_consents.source: "online" or "papier". Nullable; rows written
--    before this change have no value and came from the online form.
-- 2. photo_consents.email: no longer NOT NULL, a paper consent may come
--    without an address. The online route still requires one.
-- 3. photo_consents.status: the column default goes away, because the
--    config now picks it per user (admin "bestaetigt", form "offen"). Every
--    writer sets the status explicitly.
--
-- Additive or relaxing only, idempotent, safe for the running code on main.
-- Preview deployments share the production database, so apply this BEFORE
-- pushing the branch:
--
--   psql "$DATABASE_URI" -v ON_ERROR_STOP=1 -f scripts/sql/2026-10-27-foto-zustimmung-papier.sql
--
-- Check: psql "$DATABASE_URI" -c "\d photo_consents"

BEGIN;

DO $$
BEGIN
  CREATE TYPE public.enum_photo_consents_source AS ENUM ('online', 'papier');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE photo_consents
  ADD COLUMN IF NOT EXISTS source public.enum_photo_consents_source;

ALTER TABLE photo_consents
  ALTER COLUMN email DROP NOT NULL,
  ALTER COLUMN status DROP DEFAULT;

COMMIT;
