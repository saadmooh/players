-- Mockup test data for players table
INSERT INTO players (submission_id, data, created_at) VALUES
  ('TEST-001', '{"playerNumber": "101", "playerName": "أحمد علي", "birthPlace": "15/03/2000 - الرياض", "_submitted_by": "سامي", "_team_name": "الهلال"}'::jsonb, NOW() - INTERVAL '10 days'),
  ('TEST-002', '{"playerNumber": "102", "playerName": "محمد حسن", "birthPlace": "22/07/2001 - جدة", "_submitted_by": "سامي", "_team_name": "الهلال"}'::jsonb, NOW() - INTERVAL '8 days'),
  ('TEST-003', '{"playerNumber": "103", "playerName": "سعيد عمر", "birthPlace": "10/11/1999 - مكة", "_submitted_by": "ناصر", "_team_name": "النصر"}'::jsonb, NOW() - INTERVAL '6 days'),
  ('TEST-004', '{"playerNumber": "104", "playerName": "خالد عبدالله", "birthPlace": "05/06/2002 - الدمام", "_submitted_by": "ناصر", "_team_name": "النصر"}'::jsonb, NOW() - INTERVAL '4 days'),
  ('TEST-005', '{"playerNumber": "105", "playerName": "عبدالرحمن محمد", "birthPlace": "18/09/2000 - الطائف", "_submitted_by": "فهد", "_team_name": "الاتحاد"}'::jsonb, NOW() - INTERVAL '2 days');

SELECT submission_id, data->>'playerName' AS name, data->>'playerNumber' AS number, data->>'birthPlace' AS birth, data->>'_team_name' AS team
FROM players
WHERE submission_id LIKE 'TEST-%'
ORDER BY created_at DESC;
