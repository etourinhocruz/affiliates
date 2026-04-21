/*
  # iHub Affiliates Dashboard Schema

  1. New Tables
    - `daily_metrics`
      - `id` (uuid, primary key)
      - `date` (date) - the day the metrics refer to
      - `revenue` (numeric) - total revenue of that day
      - `clicks` (integer) - number of clicks
      - `conversions` (integer) - number of conversions
      - `created_at` (timestamptz)
    - `conversions`
      - `id` (uuid, primary key)
      - `user_ref` (text) - affiliate/user identifier
      - `campaign` (text) - campaign name
      - `status` (text) - approved | pending | rejected
      - `commission` (numeric) - commission value in BRL
      - `converted_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Public read policies (anonymous dashboard access for demo)
    - No insert/update/delete policies (read-only for clients)

  3. Seed Data
    - 7 days of metrics
    - 8 recent conversions for the table
*/

CREATE TABLE IF NOT EXISTS daily_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  revenue numeric(12,2) NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  conversions integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_ref text NOT NULL DEFAULT '',
  campaign text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  commission numeric(10,2) NOT NULL DEFAULT 0,
  converted_at timestamptz DEFAULT now()
);

ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read daily metrics"
  ON daily_metrics FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can read conversions"
  ON conversions FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO daily_metrics (date, revenue, clicks, conversions) VALUES
  (CURRENT_DATE - INTERVAL '6 days', 4820.50, 1240, 58),
  (CURRENT_DATE - INTERVAL '5 days', 5310.00, 1380, 64),
  (CURRENT_DATE - INTERVAL '4 days', 4980.75, 1195, 55),
  (CURRENT_DATE - INTERVAL '3 days', 6120.30, 1530, 72),
  (CURRENT_DATE - INTERVAL '2 days', 7050.90, 1720, 83),
  (CURRENT_DATE - INTERVAL '1 days', 6840.20, 1645, 79),
  (CURRENT_DATE, 7890.60, 1880, 91)
ON CONFLICT (date) DO NOTHING;

INSERT INTO conversions (user_ref, campaign, status, commission, converted_at) VALUES
  ('USR-48291', 'BetKing - Signup FTD', 'approved', 245.00, now() - INTERVAL '12 minutes'),
  ('USR-39104', 'LuckySpin - CPA R$ 180', 'approved', 180.00, now() - INTERVAL '47 minutes'),
  ('USR-77812', 'RoyalBet - RevShare', 'pending', 92.50, now() - INTERVAL '1 hours 20 minutes'),
  ('USR-12094', 'BetKing - Signup FTD', 'approved', 245.00, now() - INTERVAL '2 hours 10 minutes'),
  ('USR-55019', 'GoldCasino - Hybrid', 'rejected', 0.00, now() - INTERVAL '3 hours 5 minutes'),
  ('USR-88423', 'LuckySpin - CPA R$ 180', 'approved', 180.00, now() - INTERVAL '4 hours'),
  ('USR-20384', 'PokerStars - Referral', 'pending', 135.75, now() - INTERVAL '6 hours 12 minutes'),
  ('USR-66721', 'RoyalBet - RevShare', 'approved', 310.20, now() - INTERVAL '8 hours 30 minutes')
ON CONFLICT DO NOTHING;
