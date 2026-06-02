-- Delete the duplicate phone field and clean up duplicates
DO $$
BEGIN
  -- 1. Delete player phone number field
  DELETE FROM fields WHERE field_label = 'رقم هاتف الاعب';

  -- 2. Delete duplicate playerName entries (keep highest sort_order)
  DELETE FROM fields WHERE id IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY field_name ORDER BY sort_order DESC) rn
      FROM fields WHERE field_name = 'playerName'
    ) sub WHERE rn > 1
  );

  -- 3. Delete duplicate birthPlace entries (keep highest sort_order)
  DELETE FROM fields WHERE id IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY field_name ORDER BY sort_order DESC) rn
      FROM fields WHERE field_name = 'birthPlace'
    ) sub WHERE rn > 1
  );
END $$;
