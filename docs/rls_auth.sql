-- Kjør i Supabase SQL Editor etter at Auth er satt opp
-- Erstatter åpen lese-policy med auth-krav

DROP POLICY IF EXISTS "Les alt" ON transaksjoner;

CREATE POLICY "Kun innloggede" ON transaksjoner
  FOR SELECT USING (auth.role() = 'authenticated');

-- Tillat innloggede brukere å oppdatere area og subcat per transaksjon
CREATE POLICY "Oppdater kategori" ON transaksjoner
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
