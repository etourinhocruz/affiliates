/*
  # Update deals with real betting houses data

  1. Schema Changes
    - Add columns to `deals` table:
      - `logo_url` (text) - URL do logo em alta resolução
      - `banner_color` (text) - Classe de gradiente escuro para o banner
      - `cpa_value` (text) - Valor do CPA deal
      - `rev_value` (text) - Percentual de revshare
      - `deposito_min` (text) - Valor mínimo de depósito
      - `aposta_min` (text) - Valor mínimo de aposta
      - `additional_info` (jsonb) - Dados extras como CPA progressivo
  2. Seed Data
    - Remove casas antigas e insere SUPERBET, Betfair, novibet, ESPORTIVA BET e BET MGM
    - novibet inclui estrutura de CPA PROGRESSIVO em additional_info
  3. Notes
    - Nenhuma destruição de dados do usuário (tabela interna sem uso real ainda)
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='logo_url') THEN
    ALTER TABLE deals ADD COLUMN logo_url text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='banner_color') THEN
    ALTER TABLE deals ADD COLUMN banner_color text NOT NULL DEFAULT 'from-slate-900 via-slate-900 to-black';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='cpa_value') THEN
    ALTER TABLE deals ADD COLUMN cpa_value text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='rev_value') THEN
    ALTER TABLE deals ADD COLUMN rev_value text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='deposito_min') THEN
    ALTER TABLE deals ADD COLUMN deposito_min text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='aposta_min') THEN
    ALTER TABLE deals ADD COLUMN aposta_min text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='additional_info') THEN
    ALTER TABLE deals ADD COLUMN additional_info jsonb;
  END IF;
END $$;

DELETE FROM deals;

INSERT INTO deals (name, banner, logo, sort_order, logo_url, banner_color, cpa_value, rev_value, deposito_min, aposta_min, additional_info, baseline, cpa, revshare)
VALUES
  (
    'SUPERBET',
    'from-red-950 via-slate-900 to-black',
    'SB', 1,
    'https://upload.wikimedia.org/wikipedia/commons/1/1f/Superbet-logo.svg',
    'from-red-950 via-slate-900 to-black',
    '180,00', '35', '10,00', '5,00',
    NULL,
    '50,00', '180,00', '35%'
  ),
  (
    'Betfair',
    'from-yellow-900 via-slate-900 to-black',
    'BF', 2,
    'https://upload.wikimedia.org/wikipedia/commons/5/53/Betfair_Logo_2020.svg',
    'from-yellow-900 via-slate-900 to-black',
    '200,00', '40', '20,00', '10,00',
    NULL,
    '60,00', '200,00', '40%'
  ),
  (
    'novibet',
    'from-emerald-900 via-slate-900 to-black',
    'NB', 3,
    '',
    'from-emerald-900 via-slate-900 to-black',
    'Progressivo', '35', '20,00', '5,00',
    '{"title":"CPA PROGRESSIVO","tiers":[{"giros":"5 giros","comissao":"R$ 100,00"},{"giros":"10 giros","comissao":"R$ 150,00"},{"giros":"20 giros","comissao":"R$ 200,00"},{"giros":"30+ giros","comissao":"R$ 250,00"}]}'::jsonb,
    '40,00', 'Progressivo', '35%'
  ),
  (
    'ESPORTIVA BET',
    'from-blue-950 via-slate-900 to-black',
    'EB', 4,
    '',
    'from-blue-950 via-slate-900 to-black',
    '150,00', '30', '10,00', '5,00',
    NULL,
    '45,00', '150,00', '30%'
  ),
  (
    'BET MGM',
    'from-amber-900 via-slate-900 to-black',
    'MG', 5,
    'https://upload.wikimedia.org/wikipedia/commons/1/1c/BetMGM_Logo.svg',
    'from-amber-900 via-slate-900 to-black',
    '250,00', '45', '20,00', '10,00',
    NULL,
    '70,00', '250,00', '45%'
  );
