-- Setup fields matching test-data.csv
-- Run this in Supabase SQL Editor

-- Delete existing fields and re-insert (for clean setup)
DELETE FROM fields;

INSERT INTO fields (field_name, field_label, field_type, is_required, is_active, sort_order, dropdown_options) VALUES
  ('playerName',   'اسم اللاعب',     'text',     true,  true, 0, NULL),
  ('phoneNumber',  'رقم الهاتف',     'tel',      true,  true, 1, NULL),
  ('age',          'العمر',           'number',   false, true, 2, NULL),
  ('position',     'المركز',         'select',   true,  true, 3, 'مهاجم,مدافع,وسط,حارس'),
  ('email',        'البريد الإلكتروني', 'email', false, true, 4, NULL),
  ('notes',        'ملاحظات',        'textarea', false, true, 5, NULL);

-- Verify
SELECT field_name, field_label, field_type, is_required, dropdown_options
FROM fields
ORDER BY sort_order;
