-- Schema for the parental photo consent (feat/foto-zustimmung).
--
-- Found by diffing `pg_dump -s` of the schema main creates in an empty
-- database against the one this branch creates, both WITH the Vercel Blob
-- plugin enabled (dummy BLOB_READ_WRITE_TOKEN, BLOB_ENABLE_LOCAL=true).
-- Three changes, nothing else:
--
-- 1. teams.hide_photo: hides the team photo from every source. DEFAULT false
--    backfills every existing team, so the live site looks exactly as before
--    until the club ticks the box.
-- 2. photo_consents: one row per consent, with its status enum, indexes and
--    the team foreign key.
-- 3. payload_locked_documents_rels.photo_consents_id: Payload's document lock
--    table gets a column per collection.
--
-- Additive only, idempotent, safe for the running code on main. Preview
-- deployments share the production database, so apply this BEFORE pushing
-- the branch:
--
--   psql "$DATABASE_URI" -v ON_ERROR_STOP=1 -f scripts/sql/2026-10-26-foto-zustimmung.sql
--
-- Check: psql "$DATABASE_URI" -c "\d teams" -c "\d photo_consents"

BEGIN;

ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS hide_photo boolean DEFAULT false;

DO $$
BEGIN
  CREATE TYPE public.enum_photo_consents_status AS ENUM (
    'offen',
    'bestaetigt',
    'widerrufen'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS photo_consents (
  id serial PRIMARY KEY,
  team_id integer NOT NULL,
  child_name character varying NOT NULL,
  parent_name character varying NOT NULL,
  email character varying NOT NULL,
  status public.enum_photo_consents_status
    DEFAULT 'offen'::public.enum_photo_consents_status NOT NULL,
  consent_text character varying NOT NULL,
  confirmed_at timestamp(3) with time zone,
  revoked_at timestamp(3) with time zone,
  token_hash character varying NOT NULL,
  notes character varying,
  updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
  created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS photo_consents_created_at_idx
  ON photo_consents (created_at);
CREATE INDEX IF NOT EXISTS photo_consents_team_idx
  ON photo_consents (team_id);
CREATE INDEX IF NOT EXISTS photo_consents_token_hash_idx
  ON photo_consents (token_hash);
CREATE INDEX IF NOT EXISTS photo_consents_updated_at_idx
  ON photo_consents (updated_at);

DO $$
BEGIN
  ALTER TABLE photo_consents
    ADD CONSTRAINT photo_consents_team_id_teams_id_fk
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE payload_locked_documents_rels
  ADD COLUMN IF NOT EXISTS photo_consents_id integer;
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_photo_consents_id_idx
  ON payload_locked_documents_rels (photo_consents_id);

DO $$
BEGIN
  ALTER TABLE payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_photo_consents_fk
    FOREIGN KEY (photo_consents_id) REFERENCES photo_consents(id)
    ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMIT;
