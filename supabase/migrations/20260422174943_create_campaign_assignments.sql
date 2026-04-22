/*
  # Create campaign_assignments table

  1. New Tables
    - `campaign_assignments`
      - `id` (uuid, primary key)
      - `bet_house` (text): casa de aposta (superbet, betmgm, etc.)
      - `site_id` (text): identificador do site informado no CSV
      - `site_name` (text): nome do site
      - `acid` (text): identificador único do tracker (granularidade correta)
      - `affiliate_id` (text, nullable): ID do afiliado vinculado
      - `affiliate_name` (text, nullable): Nome do afiliado vinculado
      - `status` (text): unassigned | assigned | pending
      - `ftd` (int): FTDs acumulados lidos
      - `revenue` (numeric): receita acumulada lida
      - `last_seen_at` (timestamptz): última vez que apareceu em um upload
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - Unique constraint: (bet_house, acid) — granularidade ACID por casa

  2. Security
    - Enable RLS on `campaign_assignments`
    - Authenticated users can SELECT, INSERT, UPDATE (admin console)
*/

CREATE TABLE IF NOT EXISTS campaign_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_house text NOT NULL,
  site_id text NOT NULL DEFAULT '',
  site_name text NOT NULL DEFAULT '',
  acid text NOT NULL,
  affiliate_id text,
  affiliate_name text,
  status text NOT NULL DEFAULT 'unassigned',
  ftd integer NOT NULL DEFAULT 0,
  revenue numeric NOT NULL DEFAULT 0,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'campaign_assignments_bet_house_acid_key'
  ) THEN
    ALTER TABLE campaign_assignments
      ADD CONSTRAINT campaign_assignments_bet_house_acid_key UNIQUE (bet_house, acid);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS campaign_assignments_status_idx ON campaign_assignments (status);
CREATE INDEX IF NOT EXISTS campaign_assignments_bet_house_idx ON campaign_assignments (bet_house);
CREATE INDEX IF NOT EXISTS campaign_assignments_affiliate_idx ON campaign_assignments (affiliate_id);

ALTER TABLE campaign_assignments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'campaign_assignments' AND policyname = 'Authenticated can select campaign assignments'
  ) THEN
    CREATE POLICY "Authenticated can select campaign assignments"
      ON campaign_assignments FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'campaign_assignments' AND policyname = 'Authenticated can insert campaign assignments'
  ) THEN
    CREATE POLICY "Authenticated can insert campaign assignments"
      ON campaign_assignments FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'campaign_assignments' AND policyname = 'Authenticated can update campaign assignments'
  ) THEN
    CREATE POLICY "Authenticated can update campaign assignments"
      ON campaign_assignments FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
