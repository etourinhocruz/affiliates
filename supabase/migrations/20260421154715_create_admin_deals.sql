/*
  # Admin Deals Management (Super Admin)

  1. New Tables
    - `admin_deals`
      - `id` (uuid, primary key)
      - `name` (text) - clean name, no values
      - `house` (text) - betting house key (superbet, betmgm, etc.)
      - `target` (text) - target agency/affiliate name
      - `parent_deal_id` (uuid, nullable) - parent (root) deal reference
      - `history` (jsonb) - array of { start_date, cpa, rev } versions
      - `status` (text) - active, scheduled
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Allow authenticated SELECT/INSERT/UPDATE (admin UI gated in app)

  3. Seed
    - Root deals (agency level) and sub-deals (affiliate level) with spread
    - Multiple history entries to demonstrate versioning timeline
*/

CREATE TABLE IF NOT EXISTS admin_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  house text NOT NULL DEFAULT '',
  target text NOT NULL DEFAULT '',
  parent_deal_id uuid REFERENCES admin_deals(id) ON DELETE SET NULL,
  history jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read deals"
  ON admin_deals FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert deals"
  ON admin_deals FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update deals"
  ON admin_deals FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DO $$
DECLARE
  root_tubaroes uuid;
  root_highroller uuid;
  root_sports uuid;
  root_vip uuid;
BEGIN
  INSERT INTO admin_deals (name, house, target, parent_deal_id, history, status)
  VALUES ('Master Tubarões - SuperBet', 'superbet', 'Agência Tubarões Media', NULL,
    '[{"start_date":"2026-01-01","cpa":350,"rev":35},{"start_date":"2026-02-01","cpa":380,"rev":35}]'::jsonb,
    'active')
  RETURNING id INTO root_tubaroes;

  INSERT INTO admin_deals (name, house, target, parent_deal_id, history, status)
  VALUES ('Master HighRoller - BetMGM', 'betmgm', 'Agência HighRoller BR', NULL,
    '[{"start_date":"2025-12-01","cpa":400,"rev":40}]'::jsonb,
    'active')
  RETURNING id INTO root_highroller;

  INSERT INTO admin_deals (name, house, target, parent_deal_id, history, status)
  VALUES ('Master Sports Hub - BetFair', 'betfair', 'Agência Sports Hub', NULL,
    '[{"start_date":"2026-03-01","cpa":280,"rev":30}]'::jsonb,
    'active')
  RETURNING id INTO root_sports;

  INSERT INTO admin_deals (name, house, target, parent_deal_id, history, status)
  VALUES ('Master VIP BR - EsportivaBet', 'esportivabet', 'Equipe VIP BR', NULL,
    '[{"start_date":"2026-02-10","cpa":320,"rev":30}]'::jsonb,
    'active')
  RETURNING id INTO root_vip;

  INSERT INTO admin_deals (name, house, target, parent_deal_id, history, status) VALUES
    ('VIP Tubarões - Rodrigo Alves', 'superbet', 'Rodrigo Alves', root_tubaroes,
      '[{"start_date":"2026-01-01","cpa":300,"rev":30},{"start_date":"2026-02-01","cpa":320,"rev":30}]'::jsonb,
      'active'),
    ('VIP Tubarões - Juliana Costa', 'superbet', 'Juliana Costa', root_tubaroes,
      '[{"start_date":"2026-01-15","cpa":280,"rev":28}]'::jsonb,
      'active'),
    ('HighRoller Sub - Camila Ventura', 'betmgm', 'Camila Ventura', root_highroller,
      '[{"start_date":"2026-02-01","cpa":340,"rev":32}]'::jsonb,
      'active'),
    ('Sports Hub Sub - Bruno Tipster', 'betfair', 'Bruno Tipster', root_sports,
      '[{"start_date":"2026-03-15","cpa":220,"rev":25}]'::jsonb,
      'active'),
    ('VIP BR Sub - Ricardo Picks', 'esportivabet', 'Ricardo Picks', root_vip,
      '[{"start_date":"2026-02-10","cpa":260,"rev":25},{"start_date":"2026-05-01","cpa":280,"rev":25}]'::jsonb,
      'scheduled');
END $$;
