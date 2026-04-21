/*
  # Create campaigns table

  1. New Tables
    - `campaigns`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - affiliate owner of the campaign request
      - `name` (text) - traffic origin / campaign name
      - `house` (text) - betting house
      - `status` (text) - 'Pendente' | 'Ativa' | 'Desativada'
      - `tracking_link` (text) - assigned tracking URL (empty until approved)
      - `pixel_url` (text) - optional postback/pixel URL
      - `clicks` (integer) - quick perf counter
      - `ftds` (integer) - quick perf counter
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS
    - Authenticated users can read/insert/update/delete their own campaigns
*/

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL DEFAULT '',
  house text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Pendente',
  tracking_link text NOT NULL DEFAULT '',
  pixel_url text NOT NULL DEFAULT '',
  clicks integer NOT NULL DEFAULT 0,
  ftds integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own campaigns"
  ON campaigns FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
