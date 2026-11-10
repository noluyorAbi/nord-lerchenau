-- Schema fuer die Zusatzangaben im Probetraining-Formular.
--
-- Found by diffing `pg_dump -s` of the schema main creates against the one
-- this branch creates, both in an empty throwaway database. Five new nullable
-- columns on `submissions` and the three enum types behind the select fields,
-- nothing else:
--
--   birth_year    Geburtsjahr des Spielers (nur das Jahr, nie das volle Datum)
--   played_before "ja" | "nein"
--   experience    "unter-1-jahr" | "1-2-jahre" | "3-5-jahre" | "ueber-5-jahre"
--   club_change   "ja" | "nein" | "ohne-verein"
--   current_club  Name des aktuellen Vereins (nur bei Vereinswechsel)
--
-- Additive only, idempotent, safe for the running code on main: every column
-- is nullable, and rows written before this change simply have no value.
-- Preview deployments share the production database, so apply this BEFORE
-- pushing the branch:
--
--   psql "$DATABASE_URI" -v ON_ERROR_STOP=1 -f scripts/sql/2026-11-10-probetraining-angaben.sql
--
-- Check: psql "$DATABASE_URI" -c "\d submissions"

BEGIN;

DO $$
BEGIN
  CREATE TYPE public.enum_submissions_played_before AS ENUM ('ja', 'nein');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.enum_submissions_experience AS ENUM (
    'unter-1-jahr',
    '1-2-jahre',
    '3-5-jahre',
    'ueber-5-jahre'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.enum_submissions_club_change AS ENUM (
    'ja',
    'nein',
    'ohne-verein'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS birth_year numeric,
  ADD COLUMN IF NOT EXISTS played_before public.enum_submissions_played_before,
  ADD COLUMN IF NOT EXISTS experience public.enum_submissions_experience,
  ADD COLUMN IF NOT EXISTS club_change public.enum_submissions_club_change,
  ADD COLUMN IF NOT EXISTS current_club character varying;

COMMIT;
