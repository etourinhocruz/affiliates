/*
  # Admin Users Management

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `role` (text) - SUPER_ADMIN, AGENCY, MANAGER, AFFILIATE, SUB_AFFILIATE
      - `parent_agency` (text, nullable)
      - `kyc_status` (text) - verified, pending, rejected
      - `total_ftds` (integer)
      - `status` (text) - active, blocked
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `admin_users`
    - SELECT policy for authenticated (super admin UI is gated in the app)

  3. Seed
    - Populate with realistic mixed-role sample data
*/

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'AFFILIATE',
  parent_agency text NOT NULL DEFAULT 'Nenhuma',
  kyc_status text NOT NULL DEFAULT 'pending',
  total_ftds integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update admin users"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert admin users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

INSERT INTO admin_users (name, email, role, parent_agency, kyc_status, total_ftds, status, created_at)
VALUES
  ('Pierre Aguiar', 'pierre@mansaogreen.com', 'SUPER_ADMIN', 'Nenhuma', 'verified', 0, 'active', '2025-11-02'),
  ('Agência Tubarões Media', 'contato@tuboreomedia.com', 'AGENCY', 'Nenhuma', 'verified', 4820, 'active', '2025-12-14'),
  ('Agência HighRoller BR', 'ops@highroller.br', 'AGENCY', 'Nenhuma', 'verified', 3610, 'active', '2026-01-08'),
  ('Agência Sports Hub', 'hub@sportshub.com', 'AGENCY', 'Nenhuma', 'pending', 340, 'active', '2026-03-22'),
  ('Marcus Trader', 'marcus@tuboreomedia.com', 'MANAGER', 'Agência Tubarões Media', 'verified', 980, 'active', '2026-01-16'),
  ('Camila Ventura', 'camila@highroller.br', 'MANAGER', 'Agência HighRoller BR', 'verified', 742, 'active', '2026-02-04'),
  ('Rodrigo Alves', 'rodrigo.alves@gmail.com', 'AFFILIATE', 'Agência Tubarões Media', 'verified', 1210, 'active', '2026-02-12'),
  ('Juliana Costa', 'juliana.costa@outlook.com', 'AFFILIATE', 'Agência HighRoller BR', 'pending', 760, 'blocked', '2026-02-19'),
  ('Ricardo Picks', 'ricardo@picks.tv', 'AFFILIATE', 'Nenhuma', 'rejected', 210, 'blocked', '2026-03-05'),
  ('Bruno Tipster', 'bruno@tipster.pro', 'AFFILIATE', 'Agência Sports Hub', 'verified', 540, 'active', '2026-03-11'),
  ('Carlos Simões', 'carlos.s@gmail.com', 'SUB_AFFILIATE', 'Rodrigo Alves', 'verified', 412, 'active', '2026-03-18'),
  ('Ana Lima', 'ana.lima@hotmail.com', 'SUB_AFFILIATE', 'Bruno Tipster', 'pending', 128, 'active', '2026-04-01'),
  ('Diego Matos', 'diego.matos@gmail.com', 'SUB_AFFILIATE', 'Juliana Costa', 'pending', 86, 'active', '2026-04-10')
ON CONFLICT (email) DO NOTHING;
