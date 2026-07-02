-- Kjør i Supabase SQL Editor

-- Sjekk om det finnes duplikater FØR du legger til constraint:
-- SELECT dato, beskrivelse, belop, konto_id, COUNT(*)
-- FROM transaksjoner
-- GROUP BY dato, beskrivelse, belop, konto_id
-- HAVING COUNT(*) > 1;

-- Unik constraint for å forhindre dobbeltimport
ALTER TABLE transaksjoner
  ADD CONSTRAINT transaksjoner_uniq
  UNIQUE (dato, beskrivelse, belop, konto_id);
