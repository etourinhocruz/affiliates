/*
  # Admin Audit Users - Super Admin user audit table

  1. New Tables
    - `admin_audit_users`
      - `id` (uuid, primary key)
      - `name` (text) - Name or company name
      - `role` (text) - One of: AGENCY, MANAGER, AFFILIATE, SUB_AFFILIATE
      - `ftds_generated` (integer) - Total FTDs generated
      - `profit_generated` (numeric) - Profit generated for the platform
      - `status` (text) - 'active' or 'blocked'
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `admin_audit_users`
    - Add SELECT policy for authenticated users (super admin access is gated in the app layer by the current demo visão switcher)

  3. Notes
    - This table feeds the Super Admin audit table UI
    - Data is read-only for the dashboard; only the service role inserts/updates
*/

CREATE TABLE IF NOT EXISTS admin_audit_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'AFFILIATE',
  ftds_generated integer NOT NULL DEFAULT 0,
  profit_generated numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_audit_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read admin audit users"
  ON admin_audit_users FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO admin_audit_users (name, role, ftds_generated, profit_generated, status)
VALUES
  ('Agência Tubarões Media', 'AGENCY', 4820, 284000, 'active'),
  ('Agência HighRoller BR', 'AGENCY', 3610, 212400, 'active'),
  ('Pierre Aguiar', 'AFFILIATE', 1842, 98600, 'active'),
  ('Rodrigo Alves', 'AFFILIATE', 1210, 72100, 'active'),
  ('Marcus Trader', 'MANAGER', 980, 54820, 'active'),
  ('Juliana Costa', 'AFFILIATE', 760, 41200, 'blocked'),
  ('Equipe VIP BR', 'AGENCY', 620, 32800, 'active'),
  ('Sub-Afiliado Carlos', 'SUB_AFFILIATE', 412, 19400, 'active'),
  ('Agência Sports Hub', 'AGENCY', 340, 16100, 'active'),
  ('Ricardo Picks', 'AFFILIATE', 210, 9420, 'active')
ON CONFLICT DO NOTHING;
