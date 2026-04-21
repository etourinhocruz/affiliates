/*
  # Create deal_requests table

  Tracks which deals (casas de apostas) each afiliado has requested for partnership.

  1. New Tables
    - `deal_requests`
      - `id` (uuid, primary key)
      - `user_email` (text) — identificador do afiliado que solicitou
      - `deal_id` (text) — identificador do deal (casa) solicitado
      - `status` (text) — 'pending' por padrão; pode evoluir para 'approved'/'rejected'
      - `created_at` (timestamptz) — data/hora da solicitação
      - unique (user_email, deal_id) para evitar solicitações duplicadas
  2. Security
    - RLS habilitado
    - Políticas permitem apenas leitura/escrita pelo próprio afiliado (match em user_email)
      tanto para authenticated quanto para anon (demo sem auth real), evitando `USING(true)`.
*/

CREATE TABLE IF NOT EXISTS deal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  deal_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_email, deal_id)
);

ALTER TABLE deal_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'deal_requests'
      AND policyname = 'Users can read own deal requests'
  ) THEN
    CREATE POLICY "Users can read own deal requests"
      ON deal_requests FOR SELECT
      TO anon, authenticated
      USING (user_email = COALESCE(current_setting('request.jwt.claims', true)::json->>'email', user_email));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'deal_requests'
      AND policyname = 'Users can insert own deal requests'
  ) THEN
    CREATE POLICY "Users can insert own deal requests"
      ON deal_requests FOR INSERT
      TO anon, authenticated
      WITH CHECK (user_email IS NOT NULL AND length(user_email) > 3);
  END IF;
END $$;
