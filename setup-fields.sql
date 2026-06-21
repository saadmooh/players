-- Setup fields
DELETE FROM fields;

INSERT INTO fields (field_name, field_label, field_type, is_required, is_active, sort_order, dropdown_options) VALUES
  ('playerNumber', 'الرقم',          'text',  true,  true, 0, NULL),
  ('playerName',   'اسم اللاعب',     'text',  true,  true, 1, NULL),
  ('fatherName',   'اسم الأب',       'text',  true,  true, 2, NULL),
  ('birthDate',    'تاريخ الازدياد', 'text',  true,  true, 3, NULL),
  ('birthPlace',   'مكان الازدياد',  'text',  true,  true, 4, NULL);

SELECT field_name, field_label, field_type, is_required, dropdown_options
FROM fields
ORDER BY sort_order;
