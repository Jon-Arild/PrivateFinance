-- Kjør denne i Supabase SQL Editor

-- Opprett omrader-tabell
CREATE TABLE omrader (
  id         SERIAL  PRIMARY KEY,
  navn       TEXT    NOT NULL UNIQUE,
  farge      TEXT    NOT NULL DEFAULT '#888780',
  ikon       TEXT    NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  aktiv      BOOLEAN NOT NULL DEFAULT true
);

-- Opprett underkategorier-tabell
-- ON UPDATE CASCADE: omdøping av et område oppdaterer alle underkategorier automatisk
CREATE TABLE underkategorier (
  id         SERIAL  PRIMARY KEY,
  area       TEXT    NOT NULL REFERENCES omrader(navn) ON UPDATE CASCADE,
  navn       TEXT    NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  aktiv      BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(area, navn)
);

-- Row Level Security
ALTER TABLE omrader        ENABLE ROW LEVEL SECURITY;
ALTER TABLE underkategorier ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth" ON omrader
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "auth" ON underkategorier
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Seed: Områder
INSERT INTO omrader (navn, farge, ikon, sort_order) VALUES
  ('Enebolig',  '#185FA5', '🏠',       1),
  ('Hytta',     '#5DCAA5', '🏔️',      2),
  ('Båt',       '#EF9F27', '⛵',       3),
  ('Bil',       '#BA7517', '🚗',       4),
  ('Dagligliv', '#3B6D11', '🛒',       5),
  ('Personlig', '#97C459', '🧍',       6),
  ('Fritid',    '#5DCAA5', '⛳',       7),
  ('Ferie',     '#A32D2D', '✈️',       8),
  ('Barna',     '#EF9F27', '👶',       9),
  ('Familie',   '#97C459', '👨‍👩‍👧', 10),
  ('Økonomi',   '#534AB7', '💰',       11),
  ('Inntekt',   '#3B6D11', '',          12),
  ('Annet',     '#888780', '•',         13);

-- Seed: Underkategorier
INSERT INTO underkategorier (area, navn, sort_order) VALUES
  ('Annet',     'Ukategorisert',         1),
  ('Barna',     'Barnebarn',             1),
  ('Barna',     'Emilie',                2),
  ('Barna',     'Jonathan',              3),
  ('Barna',     'Sarah',                 4),
  ('Bil',       'Billån Nissan Ariya',   1),
  ('Bil',       'Drivstoff & parkering', 2),
  ('Båt',       'Båtplass',              1),
  ('Båt',       'Forsikring',            2),
  ('Båt',       'Opplag & havn',         3),
  ('Båt',       'Renter',                4),
  ('Båt',       'Service & vedlikehold', 5),
  ('Båt',       'Strøm',                 6),
  ('Dagligliv', 'Abonnement & medier',   1),
  ('Dagligliv', 'Kontantuttak',          2),
  ('Dagligliv', 'Mat & dagligvarer',     3),
  ('Dagligliv', 'Restaurant & café',     4),
  ('Enebolig',  'Bygg & utstyr',         1),
  ('Enebolig',  'Forsikring',            2),
  ('Enebolig',  'Hage & gartner',        3),
  ('Enebolig',  'Interiør & kunst',      4),
  ('Enebolig',  'Kommunale avgifter',    5),
  ('Enebolig',  'Oppussing',             6),
  ('Enebolig',  'Renter',                7),
  ('Enebolig',  'Strøm',                 8),
  ('Enebolig',  'TV & internett',        9),
  ('Familie',   'Kone brukskonto',       1),
  ('Ferie',     'Barcelona',             1),
  ('Ferie',     'Ferietur',              2),
  ('Ferie',     'Fly & reise',           3),
  ('Ferie',     'Overnatting & reise',   4),
  ('Ferie',     'Påsketur',              5),
  ('Fritid',    'Sport & aktiviteter',   1),
  ('Hytta',     'Oppussing',             1),
  ('Hytta',     'Renter',                2),
  ('Hytta',     'Strøm',                 3),
  ('Hytta',     'TV & internett',        4),
  ('Hytta',     'Vedlikehold',           5),
  ('Hytta',     'Velforening',           6),
  ('Inntekt',   'Jalco',                 1),
  ('Inntekt',   'Lønn IMI',              2),
  ('Inntekt',   'Lønn Noen AS',          3),
  ('Inntekt',   'NAV Pensjon',           4),
  ('Personlig', 'Helse & trening',       1),
  ('Personlig', 'Klær & mote',           2),
  ('Personlig', 'Velvære & pleie',       3),
  ('Økonomi',   'Bankgebyrer',           1),
  ('Økonomi',   'Gjeld',                 2),
  ('Økonomi',   'Restskatt',             3),
  ('Økonomi',   'Sparing & investering', 4),
  ('Økonomi',   'Ukjent lån',            5);
