-- Fix admin RLS: allow insert and delete (app handles auth)
DROP POLICY IF EXISTS admins_insert_auth ON admins;
DROP POLICY IF EXISTS admins_delete_auth ON admins;
CREATE POLICY admins_insert_auth ON admins FOR INSERT WITH CHECK (true);
CREATE POLICY admins_delete_auth ON admins FOR DELETE USING (true);
