-- Schema fuer "Zahlen und Schlagworte der Abteilungsseiten im CMS".
--
-- Warum von Hand und nicht ueber den Drizzle-Push: der Push kann ein neu
-- angelegtes von einem umbenannten Objekt nicht unterscheiden und fragt
-- interaktiv nach. Auf der Produktionsdatenbank will diese Frage niemand
-- beantworten, und eine falsche Antwort benennt eine bestehende Tabelle um.
-- Dieses Skript ist rein additiv: es legt an, es aendert und loescht nichts.
-- Es ist wiederholbar (IF NOT EXISTS) und laeuft in einer Transaktion.
--
--   psql "$DATABASE_URI" -v ON_ERROR_STOP=1 -f scripts/sql/2026-08-27-abteilungs-zahlen.sql
--
-- Zur Kontrolle danach:
--
--   psql "$DATABASE_URI" -c "\\d teams_pills" -c "\\d teams_stats"
--
-- Erwartet werden die Spalten unten, `text`, `label` und `value` als NOT NULL
-- und die Indexnamen genau so, wie sie hier stehen: Payload leitet sie aus der
-- Konfiguration ab. `bun run db:push-schema` taugt hier nicht zur Kontrolle,
-- der weigert sich bei einer Datenbank, die bereits Tabellen hat.
--
-- Reihenfolge beim Ausrollen: erst dieses Skript, dann der Code-Deploy. Ohne
-- die Tabellen laufen die Abteilungsseiten in einen Datenbankfehler, sobald
-- der neue Code die Felder abfragt.

BEGIN;

-- Schlagworte oben auf der Abteilungsseite
CREATE TABLE IF NOT EXISTS teams_pills (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying NOT NULL,
  text character varying NOT NULL,
  CONSTRAINT teams_pills_pkey PRIMARY KEY (id),
  CONSTRAINT teams_pills_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES teams(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS teams_pills_order_idx
  ON teams_pills (_order);
CREATE INDEX IF NOT EXISTS teams_pills_parent_id_idx
  ON teams_pills (_parent_id);

-- Zahlen im Kasten "Auf einen Blick"
CREATE TABLE IF NOT EXISTS teams_stats (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying NOT NULL,
  label character varying NOT NULL,
  value character varying NOT NULL,
  CONSTRAINT teams_stats_pkey PRIMARY KEY (id),
  CONSTRAINT teams_stats_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES teams(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS teams_stats_order_idx
  ON teams_stats (_order);
CREATE INDEX IF NOT EXISTS teams_stats_parent_id_idx
  ON teams_stats (_parent_id);

COMMIT;
