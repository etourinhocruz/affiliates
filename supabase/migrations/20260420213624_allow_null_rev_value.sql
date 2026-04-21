/*
  # Allow NULL rev_value on deals

  1. Changes
    - Drop NOT NULL constraint on `deals.rev_value` so deals without a
      RevShare component (e.g., Betfair) can store NULL and trigger the
      three-metric layout in the UI.
  2. Security
    - No RLS or policy changes.
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals'
      AND column_name = 'rev_value'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE deals ALTER COLUMN rev_value DROP NOT NULL;
  END IF;
END $$;

UPDATE deals SET rev_value = NULL WHERE UPPER(name) = 'BETFAIR';
