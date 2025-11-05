/*
  # Fix Security Issues

  1. Add missing foreign key indexes
  2. Optimize RLS policies to use subquery pattern for auth functions
  3. Consolidate duplicate policies
*/

-- 1. Add missing indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_asset_transactions_user_id ON asset_transactions(user_id);

-- 2. Fix RLS policies to use optimized subquery pattern
-- Drop old policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admin can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admin can insert fixed assets" ON fixed_assets;
DROP POLICY IF EXISTS "Admin can update fixed assets" ON fixed_assets;
DROP POLICY IF EXISTS "Admin can delete fixed assets" ON fixed_assets;
DROP POLICY IF EXISTS "Admin can manage consumable assets" ON consumable_assets;
DROP POLICY IF EXISTS "Authenticated users can create transactions" ON asset_transactions;

-- Recreate user_profiles policies with optimized pattern
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Admin can manage all profiles"
  ON user_profiles FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = (select auth.uid()) AND role = 'Admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = (select auth.uid()) AND role = 'Admin'
  ));

-- Recreate fixed_assets policies with optimized pattern
CREATE POLICY "Admin can insert fixed assets"
  ON fixed_assets FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = (select auth.uid()) AND role = 'Admin'
  ));

CREATE POLICY "Admin can update fixed assets"
  ON fixed_assets FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = (select auth.uid()) AND role = 'Admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = (select auth.uid()) AND role = 'Admin'
  ));

CREATE POLICY "Admin can delete fixed assets"
  ON fixed_assets FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = (select auth.uid()) AND role = 'Admin'
  ));

-- Consolidate consumable_assets policies
DROP POLICY IF EXISTS "Authenticated users can read all consumable assets" ON consumable_assets;

CREATE POLICY "Read consumable assets"
  ON consumable_assets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage consumable assets"
  ON consumable_assets FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = (select auth.uid()) AND role = 'Admin'
  ));

CREATE POLICY "Admin can update consumable assets"
  ON consumable_assets FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = (select auth.uid()) AND role = 'Admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = (select auth.uid()) AND role = 'Admin'
  ));

CREATE POLICY "Admin can delete consumable assets"
  ON consumable_assets FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = (select auth.uid()) AND role = 'Admin'
  ));

-- Fix asset_transactions policies
CREATE POLICY "Authenticated users can create transactions"
  ON asset_transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- 3. Drop unused indexes to reduce storage
DROP INDEX IF EXISTS idx_fixed_assets_location;
DROP INDEX IF EXISTS idx_fixed_assets_code;
DROP INDEX IF EXISTS idx_consumable_assets_location;
DROP INDEX IF EXISTS idx_consumable_assets_code;
DROP INDEX IF EXISTS idx_asset_transactions_created_at;
DROP INDEX IF EXISTS idx_user_profiles_role;

-- Create only essential indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role) WHERE role = 'Admin';
CREATE INDEX IF NOT EXISTS idx_asset_transactions_user_id_created ON asset_transactions(user_id, created_at DESC);
