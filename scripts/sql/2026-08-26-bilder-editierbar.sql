-- Schema fuer "Bilder editierbar" (Startseite + Weitere Bilder).
--
-- Warum von Hand und nicht ueber den Drizzle-Push: der Push kann ein neu
-- angelegtes von einem umbenannten Objekt nicht unterscheiden und fragt
-- interaktiv nach. Auf der Produktionsdatenbank will diese Frage niemand
-- beantworten, und eine falsche Antwort benennt eine bestehende Tabelle um.
-- Dieses Skript ist rein additiv: es legt an, es aendert und loescht nichts.
-- Es ist wiederholbar (IF NOT EXISTS) und laeuft in einer Transaktion.
--
--   psql "$DATABASE_URI" -v ON_ERROR_STOP=1 -f scripts/sql/2026-08-26-bilder-editierbar.sql
--
-- Zur Kontrolle danach:
--
--   psql "$DATABASE_URI" -c "\\d home_page_bilder_hero_images" \\
--                       -c "\\d home_page_bilder_galerie" \\
--                       -c "\\d site_images"
--
-- Erwartet werden die Spalten unten, image_id und caption als NOT NULL und die
-- Indexnamen genau so, wie sie hier stehen: Payload leitet sie aus der
-- Konfiguration ab, und bei einer Gruppe steht das Praefix doppelt
-- (site_images_u8_u8_trainerteam_idx). Der Schemaabgleich aus
-- `bun run db:push-schema` taugt hier nicht zur Kontrolle, der weigert sich bei
-- einer Datenbank, die bereits Tabellen hat.

BEGIN;

-- Startseite: Bilderlauf im Kopfbereich
CREATE TABLE IF NOT EXISTS home_page_bilder_hero_images (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying NOT NULL,
  image_id integer NOT NULL,
  CONSTRAINT home_page_bilder_hero_images_pkey PRIMARY KEY (id),
  CONSTRAINT home_page_bilder_hero_images_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES home_page(id) ON DELETE CASCADE,
  CONSTRAINT home_page_bilder_hero_images_image_id_media_id_fk
    FOREIGN KEY (image_id) REFERENCES media(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS home_page_bilder_hero_images_order_idx
  ON home_page_bilder_hero_images (_order);
CREATE INDEX IF NOT EXISTS home_page_bilder_hero_images_parent_id_idx
  ON home_page_bilder_hero_images (_parent_id);
CREATE INDEX IF NOT EXISTS home_page_bilder_hero_images_image_idx
  ON home_page_bilder_hero_images (image_id);

-- Startseite: Galerie im Instagram-Bereich
CREATE TABLE IF NOT EXISTS home_page_bilder_galerie (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying NOT NULL,
  image_id integer NOT NULL,
  caption character varying NOT NULL,
  sub character varying,
  CONSTRAINT home_page_bilder_galerie_pkey PRIMARY KEY (id),
  CONSTRAINT home_page_bilder_galerie_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES home_page(id) ON DELETE CASCADE,
  CONSTRAINT home_page_bilder_galerie_image_id_media_id_fk
    FOREIGN KEY (image_id) REFERENCES media(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS home_page_bilder_galerie_order_idx
  ON home_page_bilder_galerie (_order);
CREATE INDEX IF NOT EXISTS home_page_bilder_galerie_parent_id_idx
  ON home_page_bilder_galerie (_parent_id);
CREATE INDEX IF NOT EXISTS home_page_bilder_galerie_image_idx
  ON home_page_bilder_galerie (image_id);

-- Neues Global "Weitere Bilder"
CREATE TABLE IF NOT EXISTS site_images (
  id serial PRIMARY KEY,
  u8_trainerteam_id integer,
  u8_loewen_id integer,
  u8_tiger_id integer,
  updated_at timestamp(3) with time zone,
  created_at timestamp(3) with time zone,
  CONSTRAINT site_images_u8_trainerteam_id_media_id_fk
    FOREIGN KEY (u8_trainerteam_id) REFERENCES media(id) ON DELETE SET NULL,
  CONSTRAINT site_images_u8_loewen_id_media_id_fk
    FOREIGN KEY (u8_loewen_id) REFERENCES media(id) ON DELETE SET NULL,
  CONSTRAINT site_images_u8_tiger_id_media_id_fk
    FOREIGN KEY (u8_tiger_id) REFERENCES media(id) ON DELETE SET NULL
);
-- Doppeltes Praefix ist kein Tippfehler: bei einem Gruppenfeld haengt Payload
-- den Gruppennamen sowohl an den Tabellen-Alias als auch an die Spalte.
CREATE INDEX IF NOT EXISTS site_images_u8_u8_trainerteam_idx
  ON site_images (u8_trainerteam_id);
CREATE INDEX IF NOT EXISTS site_images_u8_u8_loewen_idx
  ON site_images (u8_loewen_id);
CREATE INDEX IF NOT EXISTS site_images_u8_u8_tiger_idx
  ON site_images (u8_tiger_id);

-- Nachziehen fuer Datenbanken, auf denen eine fruehere Fassung dieses Skripts
-- die Spalten bereits nullable oder die Indexe unter falschem Namen angelegt
-- hat. Auf einer Datenbank, die dieses Skript zum ersten Mal sieht, sind das
-- allesamt Nulloperationen.
ALTER TABLE home_page_bilder_hero_images ALTER COLUMN image_id SET NOT NULL;
ALTER TABLE home_page_bilder_galerie ALTER COLUMN image_id SET NOT NULL;
ALTER TABLE home_page_bilder_galerie ALTER COLUMN caption SET NOT NULL;
DROP INDEX IF EXISTS site_images_u8_trainerteam_idx;
DROP INDEX IF EXISTS site_images_u8_loewen_idx;
DROP INDEX IF EXISTS site_images_u8_tiger_idx;

COMMIT;
