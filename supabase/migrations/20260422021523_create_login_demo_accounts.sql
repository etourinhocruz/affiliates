/*
  # Demo accounts for login searchable selector

  1. New Tables
    - `login_demo_accounts` — Seed of demo users exposed in the login combobox
      - `email` (text, unique): primary option displayed in the E-mail combobox
      - `password` (text): canned password tied to the email
      - `display_name` (text): label rendered alongside the email
      - `role` (text): one of SUPER_ADMIN | AGENCY | MANAGER | AFFILIATE | SUB_AFFILIATE
      - `sort_order` (int): used to order entries in the dropdown
  2. Security
    - RLS enabled on `login_demo_accounts`
    - Anonymous SELECT allowed (the dropdown is rendered on the public login page)
    - No INSERT/UPDATE/DELETE policies exposed (controlled via service role)
*/

CREATE TABLE IF NOT EXISTS login_demo_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  display_name text NOT NULL,
  role text NOT NULL DEFAULT 'AFFILIATE',
  sort_order int DEFAULT 0
);

ALTER TABLE login_demo_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read login demo accounts"
  ON login_demo_accounts FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO login_demo_accounts (email, password, display_name, role, sort_order) VALUES
  ('pierre@affiliates.com', 'Pierre@2026', 'Pierre Castro', 'AFFILIATE', 1),
  ('rodrigo.alves@gmail.com', 'Rodrigo@2026', 'Rodrigo Alves', 'AFFILIATE', 2),
  ('marina.q@tuboreomedia.com', 'Marina@2026', 'Marina Queiroz', 'AFFILIATE', 3),
  ('fernanda@tuboreomedia.com', 'Agency@2026', 'Fernanda Arruda', 'AGENCY', 4),
  ('marcus.manager@mansaogreen.com', 'Manager@2026', 'Marcus Trader', 'MANAGER', 5),
  ('carlos.s@gmail.com', 'Sub@2026', 'Carlos Simões', 'SUB_AFFILIATE', 6),
  ('admin@mansaogreen.com', 'Admin@2026', 'Diretor Geral', 'SUPER_ADMIN', 7)
ON CONFLICT (email) DO NOTHING;
