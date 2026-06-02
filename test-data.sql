-- Mockup test data for players table
INSERT INTO players (submission_id, data, created_at) VALUES
  ('TEST-001', '{"playerNumber": "101", "playerName": "أحمد علي", "fatherName": "علي", "birthPlace": "15/03/2000 - الرياض", "_submitted_by": "سامي", "_team_name": "الهلال", "_coach_phone": "0551111111"}'::jsonb, NOW() - INTERVAL '10 days'),
  ('TEST-002', '{"playerNumber": "102", "playerName": "محمد حسن", "fatherName": "حسن", "birthPlace": "22/07/2001 - جدة", "_submitted_by": "سامي", "_team_name": "الهلال", "_coach_phone": "0551111111"}'::jsonb, NOW() - INTERVAL '8 days'),
  ('TEST-003', '{"playerNumber": "103", "playerName": "سعيد عمر", "fatherName": "عمر", "birthPlace": "10/11/1999 - مكة", "_submitted_by": "ناصر", "_team_name": "النصر", "_coach_phone": "0552222222"}'::jsonb, NOW() - INTERVAL '6 days'),
  ('TEST-004', '{"playerNumber": "104", "playerName": "خالد عبدالله", "fatherName": "عبدالله", "birthPlace": "05/06/2002 - الدمام", "_submitted_by": "ناصر", "_team_name": "النصر", "_coach_phone": "0552222222"}'::jsonb, NOW() - INTERVAL '4 days'),
  ('TEST-005', '{"playerNumber": "105", "playerName": "عبدالرحمن محمد", "fatherName": "محمد", "birthPlace": "18/09/2000 - الطائف", "_submitted_by": "فهد", "_team_name": "الاتحاد", "_coach_phone": "0553333333"}'::jsonb, NOW() - INTERVAL '2 days');

SELECT submission_id, data->>'playerName' AS name, data->>'fatherName' AS father, data->>'playerNumber' AS number, data->>'birthPlace' AS birth, data->>'_team_name' AS team, data->>'_coach_phone' AS phone
FROM players
WHERE submission_id LIKE 'TEST-%'
ORDER BY created_at DESC;
