-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/ssqzqmsdmifearmfwjrr/sql/new)

-- 1. Fields table (dynamic form configuration)
CREATE TABLE IF NOT EXISTS fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text',
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  dropdown_options TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Players table (registration data stored as JSONB)
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Sessions table (custom auth tokens)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_players_created_at ON players(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_players_submission_id ON players(submission_id);
CREATE INDEX IF NOT EXISTS idx_fields_sort_order ON fields(sort_order);
CREATE INDEX IF NOT EXISTS idx_fields_active ON fields(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- Seed default fields
INSERT INTO fields (field_name, field_label, field_type, is_required, is_active, sort_order) VALUES
  ('playerNumber', 'الرقم', 'text', true, true, 0),
  ('playerName', 'اسم اللاعب', 'text', true, true, 1),
  ('fatherName', 'اسم الأب', 'text', false, true, 2),
  ('birthDate', 'تاريخ الازدياد', 'text', false, true, 3),
  ('birthPlace', 'مكان الازدياد', 'text', false, true, 4)
ON CONFLICT DO NOTHING;

-- Seed default admin (password: 040878001)
INSERT INTO admins (username, password_hash)
SELECT 'saadmohammed', 'a4f340fe739b3c2cc8756df7f68e3a39070d9327c8629f437f1d84724fb789aa'
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE username = 'saadmohammed');
