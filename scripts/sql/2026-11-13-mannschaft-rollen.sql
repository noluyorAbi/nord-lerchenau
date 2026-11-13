-- Rolle pro Mannschaft: neues Feld "Trainer:innen & Betreuer" (teams.staff)
--
-- Warum: Die Rolle einer Person haengt an der Mannschaft, nicht an der Person.
-- Felix Kirmeyer ist Sportlicher Leiter der 1. Herren und Ansprechpartner der
-- Ü40, Ergin Piker Jugendleiter und Trainerin der C-Juniorinnen. Mit einem
-- einzigen Rollenfeld am Personeneintrag geht das nicht.
--
-- Was das Skript tut (alles additiv und idempotent, es loescht nichts):
--   1. legt die Tabelle teams_staff an (Person + Rolle je Mannschaft),
--   2. uebernimmt die bisherigen Zuordnungen aus teams_rels (Feld "trainers")
--      mit der Rolle des Personeneintrags, aber nur fuer Mannschaften, die
--      noch keine staff-Eintraege haben.
-- Das alte Feld "trainers" und seine Daten bleiben unveraendert und dienen als
-- Rueckfall.
--
-- Ausfuehren VOR dem Merge, sonst fehlt der Website die Tabelle:
--   psql "$DATABASE_URI" -v ON_ERROR_STOP=1 -f scripts/sql/2026-11-13-mannschaft-rollen.sql

BEGIN;

CREATE TABLE IF NOT EXISTS teams_staff (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying NOT NULL,
  person_id integer NOT NULL,
  role character varying NOT NULL,
  CONSTRAINT teams_staff_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS teams_staff_order_idx ON teams_staff (_order);
CREATE INDEX IF NOT EXISTS teams_staff_parent_id_idx ON teams_staff (_parent_id);
CREATE INDEX IF NOT EXISTS teams_staff_person_idx ON teams_staff (person_id);

DO $$
BEGIN
  ALTER TABLE teams_staff
    ADD CONSTRAINT teams_staff_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES teams (id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE teams_staff
    ADD CONSTRAINT teams_staff_person_id_people_id_fk
    FOREIGN KEY (person_id) REFERENCES people (id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO teams_staff (_order, _parent_id, id, person_id, role)
SELECT
  row_number() OVER (PARTITION BY r.parent_id ORDER BY r."order", r.id) AS _order,
  r.parent_id,
  substr(md5(random()::text || clock_timestamp()::text || r.id::text), 1, 24),
  r.people_id,
  p.role
FROM teams_rels r
JOIN people p ON p.id = r.people_id
WHERE r.path = 'trainers'
  AND r.people_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM teams_staff s WHERE s._parent_id = r.parent_id);

COMMIT;
