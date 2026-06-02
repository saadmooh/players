-- Mockup test data for players table
-- Run in Supabase SQL Editor

INSERT INTO players (submission_id, data, created_at) VALUES
  ('TEST-001', '{"playerName": "أحمد علي", "phoneNumber": "0555123456", "age": "25", "position": "مهاجم", "email": "ahmed@example.com", "notes": "لاعب ممتاز"}'::jsonb, NOW() - INTERVAL '10 days'),
  ('TEST-002', '{"playerName": "محمد حسن", "phoneNumber": "0555987654", "age": "22", "position": "مدافع", "email": "mohamed@example.com", "notes": ""}'::jsonb, NOW() - INTERVAL '8 days'),
  ('TEST-003', '{"playerName": "سعيد عمر", "phoneNumber": "0555112233", "age": "28", "position": "وسط", "email": "saeed@example.com", "notes": "يجيد التمرير"}'::jsonb, NOW() - INTERVAL '6 days'),
  ('TEST-004', '{"playerName": "خالد عبدالله", "phoneNumber": "0555443322", "age": "30", "position": "حارس", "email": "khaled@example.com", "notes": ""}'::jsonb, NOW() - INTERVAL '5 days'),
  ('TEST-005', '{"playerName": "عبدالرحمن محمد", "phoneNumber": "0555667788", "age": "19", "position": "مهاجم", "email": "abdulrahman@example.com", "notes": "موهوب"}'::jsonb, NOW() - INTERVAL '4 days'),
  ('TEST-006', '{"playerName": "ناصر القحطاني", "phoneNumber": "0555889900", "age": "24", "position": "مدافع", "email": "nasser@example.com", "notes": "قوي بدنياً"}'::jsonb, NOW() - INTERVAL '3 days'),
  ('TEST-007', '{"playerName": "فهد الشمري", "phoneNumber": "0555778899", "age": "27", "position": "وسط", "email": "fahad@example.com", "notes": ""}'::jsonb, NOW() - INTERVAL '2 days'),
  ('TEST-008', '{"playerName": "ماجد الحربي", "phoneNumber": "0555665544", "age": "32", "position": "حارس", "email": "majed@example.com", "notes": "خبرة كبيرة"}'::jsonb, NOW() - INTERVAL '1 day'),
  ('TEST-009', '{"playerName": "يوسف الزهراني", "phoneNumber": "0555223344", "age": "21", "position": "مهاجم", "email": "yousef@example.com", "notes": ""}'::jsonb, NOW() - INTERVAL '12 hours'),
  ('TEST-010', '{"playerName": "سلطان العتيبي", "phoneNumber": "0555334455", "age": "26", "position": "مدافع", "email": "sultan@example.com", "notes": ""}'::jsonb, NOW() - INTERVAL '1 hour');

-- Verify
SELECT submission_id, data->>'playerName' AS name, data->>'position' AS position, created_at
FROM players
WHERE submission_id LIKE 'TEST-%'
ORDER BY created_at DESC;
