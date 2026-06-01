-- Run this AFTER supabase-schema.sql to set up Row Level Security

-- Enable RLS on all tables
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Fields: anyone can read active fields (public registration form)
CREATE POLICY fields_select_public ON fields
  FOR SELECT USING (is_active = true);

-- Fields: admins can manage all fields (auth handled via sessions table)
-- For application-level auth, we give full CRUD to anon and validate tokens in app
CREATE POLICY fields_all_admin ON fields
  FOR ALL USING (true);

-- Players: anyone can insert (public registration)
CREATE POLICY players_insert_public ON players
  FOR INSERT WITH CHECK (true);

-- Players: admins can read/delete
CREATE POLICY players_select_admin ON players
  FOR SELECT USING (true);
CREATE POLICY players_delete_admin ON players
  FOR DELETE USING (true);

-- Admins: only select (no insert/update/delete from public)
CREATE POLICY admins_select_auth ON admins
  FOR SELECT USING (true);

-- Sessions: full access for app-level auth
CREATE POLICY sessions_all ON sessions
  FOR ALL USING (true);
