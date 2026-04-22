/*
  # Panels for Agency, Manager and Sub-Affiliate

  1. New Tables
    - `agency_members` — Affiliate roster under an agency with performance snapshot
    - `manager_affiliates` — Affiliates under a given manager with targets
    - `sub_affiliate_stats` — Monthly performance snapshot for a sub-affiliate
    - `role_profiles` — Settings/profile for agency, manager and sub roles
  2. Security
    - RLS enabled on all tables
    - Authenticated SELECT access (internal dashboard data)
    - No INSERT/UPDATE/DELETE policies exposed (admin-only via service role)
  3. Seed Data
    - Representative rows for UI development
*/

CREATE TABLE IF NOT EXISTS agency_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_key text NOT NULL DEFAULT 'tubaroes',
  name text NOT NULL,
  email text NOT NULL,
  tier text NOT NULL DEFAULT 'Afiliado',
  ftds int NOT NULL DEFAULT 0,
  net_revenue numeric NOT NULL DEFAULT 0,
  commission numeric NOT NULL DEFAULT 0,
  conversion_rate numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  joined_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now(),
  sort_order int DEFAULT 0
);

ALTER TABLE agency_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read agency members"
  ON agency_members FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS manager_affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_key text NOT NULL DEFAULT 'default',
  name text NOT NULL,
  email text NOT NULL,
  ftds int NOT NULL DEFAULT 0,
  target_ftds int NOT NULL DEFAULT 0,
  net_revenue numeric NOT NULL DEFAULT 0,
  commission_split numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  last_active timestamptz DEFAULT now(),
  sort_order int DEFAULT 0
);

ALTER TABLE manager_affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read manager affiliates"
  ON manager_affiliates FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS sub_affiliate_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_key text NOT NULL DEFAULT 'default',
  month text NOT NULL,
  clicks int NOT NULL DEFAULT 0,
  signups int NOT NULL DEFAULT 0,
  ftds int NOT NULL DEFAULT 0,
  commission numeric NOT NULL DEFAULT 0,
  sort_order int DEFAULT 0
);

ALTER TABLE sub_affiliate_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read sub affiliate stats"
  ON sub_affiliate_stats FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO agency_members (agency_key, name, email, tier, ftds, net_revenue, commission, conversion_rate, status, sort_order) VALUES
  ('tubaroes', 'Rodrigo Alves', 'rodrigo.alves@gmail.com', 'Afiliado Gold', 1210, 42800, 12840, 18.4, 'active', 1),
  ('tubaroes', 'Marina Queiroz', 'marina.q@tuboreomedia.com', 'Afiliado Gold', 984, 33600, 9820, 16.7, 'active', 2),
  ('tubaroes', 'Diego Martins', 'diego.m@tuboreomedia.com', 'Afiliado', 612, 19700, 5810, 12.1, 'active', 3),
  ('tubaroes', 'Camila Rocha', 'camila.rocha@gmail.com', 'Afiliado', 498, 16420, 4720, 11.3, 'active', 4),
  ('tubaroes', 'Bruno Tavares', 'bruno@partners.br', 'Afiliado Júnior', 184, 6120, 1650, 7.8, 'paused', 5),
  ('tubaroes', 'Isabela Mota', 'isa.mota@tuboreomedia.com', 'Afiliado', 302, 10240, 2980, 9.4, 'active', 6)
ON CONFLICT DO NOTHING;

INSERT INTO manager_affiliates (manager_key, name, email, ftds, target_ftds, net_revenue, commission_split, status, sort_order) VALUES
  ('default', 'Rodrigo Alves', 'rodrigo.alves@gmail.com', 1210, 1500, 42800, 25, 'active', 1),
  ('default', 'Camila Rocha', 'camila.rocha@gmail.com', 498, 800, 16420, 22, 'active', 2),
  ('default', 'Diego Martins', 'diego.m@partners.br', 612, 900, 19700, 22, 'active', 3),
  ('default', 'Bruno Tavares', 'bruno@partners.br', 184, 500, 6120, 20, 'paused', 4),
  ('default', 'Vinícius Lopes', 'vini.lopes@partners.br', 356, 600, 11800, 22, 'active', 5)
ON CONFLICT DO NOTHING;

INSERT INTO sub_affiliate_stats (sub_key, month, clicks, signups, ftds, commission, sort_order) VALUES
  ('default', 'Novembro/2025', 4210, 612, 142, 3180, 1),
  ('default', 'Dezembro/2025', 5820, 870, 224, 4950, 2),
  ('default', 'Janeiro/2026', 6320, 1020, 268, 6210, 3),
  ('default', 'Fevereiro/2026', 7210, 1180, 312, 7320, 4),
  ('default', 'Março/2026', 8210, 1305, 368, 8860, 5),
  ('default', 'Abril/2026', 3120, 510, 138, 3240, 6)
ON CONFLICT DO NOTHING;
