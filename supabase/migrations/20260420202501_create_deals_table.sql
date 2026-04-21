/*
  # Create deals table

  1. New Tables
    - `deals`
      - `id` (uuid, primary key)
      - `name` (text) - Nome da casa de apostas
      - `banner` (text) - URL do banner ou gradiente
      - `logo` (text) - Iniciais ou URL do logo
      - `baseline` (text) - Valor baseline
      - `cpa` (text) - Valor CPA
      - `revshare` (text) - Percentual revshare
      - `sort_order` (int) - Ordem de exibição
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `deals` table
    - Policy allowing authenticated users to read active deals
  3. Seed Data
    - Insert 4 sample betting house deals
*/

CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  banner text NOT NULL DEFAULT '',
  logo text NOT NULL DEFAULT '',
  baseline text NOT NULL DEFAULT '',
  cpa text NOT NULL DEFAULT '',
  revshare text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'deals' AND policyname = 'Authenticated users can view deals'
  ) THEN
    CREATE POLICY "Authenticated users can view deals"
      ON deals FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

INSERT INTO deals (name, banner, logo, baseline, cpa, revshare, sort_order)
SELECT * FROM (VALUES
  ('BetMansion', 'from-emerald-900 via-slate-900 to-black', 'BM', 'R$ 50,00', 'R$ 150,00', '40%', 1),
  ('GreenBet', 'from-lime-900 via-slate-900 to-black', 'GB', 'R$ 40,00', 'R$ 180,00', '45%', 2),
  ('LuckyWin', 'from-amber-900 via-slate-900 to-black', 'LW', 'R$ 60,00', 'R$ 140,00', '35%', 3),
  ('EliteCasino', 'from-sky-900 via-slate-900 to-black', 'EC', 'R$ 75,00', 'R$ 200,00', '50%', 4)
) AS v(name, banner, logo, baseline, cpa, revshare, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM deals);
