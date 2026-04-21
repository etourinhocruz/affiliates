/*
  # Create dashboard_segments table

  Persiste os dados segmentados da "Visão Geral" por casa de apostas para alimentar o
  filtro global do dashboard. Cada linha representa um segmento (casa) com seus KPIs
  agregados e um chart_data (comissão por período).

  1. New Tables
    - `dashboard_segments`
      - `house_key` (text, primary key) — identificador da casa (ex.: 'all','superbet','sportingbet')
      - `label` (text) — rótulo amigável
      - `cadastros` (int) — cadastros do período
      - `ftd` (int) — primeiros depósitos
      - `qftd` (int) — primeiros depósitos qualificados
      - `deposito_total` (numeric)
      - `net_revenue` (numeric)
      - `cpa_commission` (numeric)
      - `rev_commission` (numeric)
      - `cadastros_yesterday` (int) — base para delta
      - `chart_data` (jsonb) — série temporal diária para o gráfico
      - `sort_order` (int) — ordenação no dropdown
  2. Security
    - RLS habilitado
    - Leitura pública (anon, authenticated) pois são dados agregados para dashboard demo
    - Sem políticas de escrita pública — apenas migrações popular
*/

CREATE TABLE IF NOT EXISTS dashboard_segments (
  house_key text PRIMARY KEY,
  label text NOT NULL,
  cadastros int NOT NULL DEFAULT 0,
  ftd int NOT NULL DEFAULT 0,
  qftd int NOT NULL DEFAULT 0,
  deposito_total numeric NOT NULL DEFAULT 0,
  net_revenue numeric NOT NULL DEFAULT 0,
  cpa_commission numeric NOT NULL DEFAULT 0,
  rev_commission numeric NOT NULL DEFAULT 0,
  cadastros_yesterday int NOT NULL DEFAULT 0,
  chart_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE dashboard_segments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'dashboard_segments'
      AND policyname = 'Public can read dashboard segments'
  ) THEN
    CREATE POLICY "Public can read dashboard segments"
      ON dashboard_segments FOR SELECT
      TO anon, authenticated
      USING (sort_order >= 0);
  END IF;
END $$;

INSERT INTO dashboard_segments (house_key, label, cadastros, ftd, qftd, deposito_total, net_revenue, cpa_commission, rev_commission, cadastros_yesterday, chart_data, sort_order)
VALUES
  ('all', 'Geral', 1235, 428, 342, 146910, 48300, 18420, 6580, 1108,
    '[{"d":1,"c":115,"f":38,"q":28,"r":4200},{"d":2,"c":132,"f":44,"q":33,"r":5100},{"d":3,"c":148,"f":52,"q":40,"r":6300},{"d":4,"c":168,"f":58,"q":47,"r":7200},{"d":5,"c":182,"f":64,"q":52,"r":8100},{"d":6,"c":195,"f":72,"q":58,"r":8800},{"d":7,"c":210,"f":80,"q":65,"r":9600}]'::jsonb,
    1),
  ('superbet', 'Superbet', 850, 300, 240, 102000, 35000, 13200, 4900, 760,
    '[{"d":1,"c":80,"f":26,"q":20,"r":3000},{"d":2,"c":94,"f":32,"q":25,"r":3700},{"d":3,"c":105,"f":38,"q":30,"r":4600},{"d":4,"c":118,"f":42,"q":34,"r":5300},{"d":5,"c":128,"f":46,"q":38,"r":5900},{"d":6,"c":138,"f":52,"q":42,"r":6400},{"d":7,"c":148,"f":58,"q":47,"r":7000}]'::jsonb,
    2),
  ('sportingbet', 'Sportingbet', 385, 128, 102, 44910, 13300, 5220, 1680, 348,
    '[{"d":1,"c":35,"f":12,"q":8,"r":1200},{"d":2,"c":38,"f":12,"q":8,"r":1400},{"d":3,"c":43,"f":14,"q":10,"r":1700},{"d":4,"c":50,"f":16,"q":13,"r":1900},{"d":5,"c":54,"f":18,"q":14,"r":2200},{"d":6,"c":57,"f":20,"q":16,"r":2400},{"d":7,"c":62,"f":22,"q":18,"r":2600}]'::jsonb,
    3),
  ('betmgm', 'BetMGM', 276, 94, 76, 31480, 11200, 4100, 1380, 248,
    '[{"d":1,"c":24,"f":8,"q":6,"r":900},{"d":2,"c":28,"f":9,"q":7,"r":1100},{"d":3,"c":32,"f":10,"q":8,"r":1300},{"d":4,"c":36,"f":12,"q":9,"r":1500},{"d":5,"c":40,"f":14,"q":11,"r":1700},{"d":6,"c":44,"f":15,"q":12,"r":1900},{"d":7,"c":48,"f":16,"q":13,"r":2100}]'::jsonb,
    4),
  ('betfair', 'Betfair', 198, 68, 55, 22050, 8100, 2900, 980, 172,
    '[{"d":1,"c":18,"f":6,"q":4,"r":700},{"d":2,"c":21,"f":7,"q":5,"r":800},{"d":3,"c":24,"f":8,"q":6,"r":950},{"d":4,"c":26,"f":9,"q":7,"r":1100},{"d":5,"c":30,"f":10,"q":8,"r":1250},{"d":6,"c":32,"f":11,"q":9,"r":1400},{"d":7,"c":36,"f":12,"q":10,"r":1550}]'::jsonb,
    5)
ON CONFLICT (house_key) DO NOTHING;
