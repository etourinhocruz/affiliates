/*
  # Agencies Management (Super Admin)

  1. New Tables
    - `agencies`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `domain` (text) - white label domain
      - `logo_url` (text, nullable)
      - `owner_email` (text) - responsible contact
      - `affiliates_count` (integer)
      - `total_ftd_generated` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Allow authenticated SELECT/INSERT/UPDATE (admin UI gated in app)

  3. Seed
    - Populate with realistic agencies matching existing admin_users data
*/

CREATE TABLE IF NOT EXISTS agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  domain text NOT NULL DEFAULT '',
  logo_url text,
  owner_email text NOT NULL DEFAULT '',
  affiliates_count integer NOT NULL DEFAULT 0,
  total_ftd_generated integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read agencies"
  ON agencies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert agencies"
  ON agencies FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update agencies"
  ON agencies FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO agencies (name, domain, logo_url, owner_email, affiliates_count, total_ftd_generated, created_at)
VALUES
  ('Agência Tubarões Media', 'painel.tubaroesmedia.com', NULL, 'contato@tuboreomedia.com', 42, 4820, '2025-12-14'),
  ('Agência HighRoller BR', 'afiliados.highroller.br', NULL, 'ops@highroller.br', 28, 3610, '2026-01-08'),
  ('Agência Sports Hub', 'rede.sportshub.com', NULL, 'hub@sportshub.com', 16, 340, '2026-03-22'),
  ('Equipe VIP BR', 'painel.vipbr.com', NULL, 'vip@vipbr.com', 9, 620, '2026-02-02')
ON CONFLICT (name) DO NOTHING;
