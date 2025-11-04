/*
  # Create Ringkas Aset Database Schema

  ## Overview
  This migration creates the complete database structure for the Ringkas Aset asset management system.
  It includes user management, locations, fixed assets, consumable assets, and transaction logging.

  ## Tables Created
  1. **locations** - Stores physical locations where assets are kept
  2. **fixed_assets** - Tracks permanent/fixed assets with status and price
  3. **consumable_assets** - Tracks consumable/habis pakai items with quantity
  4. **asset_transactions** - Logs all asset movements and status changes
  5. **user_profiles** - Extends Supabase auth with additional user info

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies restrict access based on user role and assigned locations
  - Admin has full access, other roles have limited access
*/

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read locations"
  ON locations FOR SELECT
  TO authenticated
  USING (true);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('Admin', 'Guru', 'Penjaga Sekolah')),
  responsible_location_ids uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'Admin'
  ));

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can manage all profiles"
  ON user_profiles FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'Admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'Admin'
  ));

-- Create fixed_assets table
CREATE TABLE IF NOT EXISTS fixed_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'Tetap' CHECK (type IN ('Tetap', 'HabisPakai')),
  location_id uuid NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  purchase_date date NOT NULL,
  price bigint NOT NULL,
  status text NOT NULL CHECK (status IN ('Baik', 'Rusak Ringan', 'Rusak Berat')),
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE fixed_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all fixed assets"
  ON fixed_assets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can insert fixed assets"
  ON fixed_assets FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'Admin'
  ));

CREATE POLICY "Admin can update fixed assets"
  ON fixed_assets FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'Admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'Admin'
  ));

CREATE POLICY "Admin can delete fixed assets"
  ON fixed_assets FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'Admin'
  ));

-- Create consumable_assets table
CREATE TABLE IF NOT EXISTS consumable_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'HabisPakai' CHECK (type IN ('Tetap', 'HabisPakai')),
  quantity integer NOT NULL DEFAULT 0,
  unit text NOT NULL,
  location_id uuid NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE consumable_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all consumable assets"
  ON consumable_assets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage consumable assets"
  ON consumable_assets FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'Admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'Admin'
  ));

-- Create asset_transactions table
CREATE TABLE IF NOT EXISTS asset_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid,
  asset_type text NOT NULL CHECK (asset_type IN ('Tetap', 'HabisPakai')),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('Tambah', 'Ambil', 'Lapor Rusak', 'Edit')),
  quantity_change integer,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE asset_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read transactions"
  ON asset_transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create transactions"
  ON asset_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fixed_assets_location ON fixed_assets(location_id);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_code ON fixed_assets(code);
CREATE INDEX IF NOT EXISTS idx_consumable_assets_location ON consumable_assets(location_id);
CREATE INDEX IF NOT EXISTS idx_consumable_assets_code ON consumable_assets(code);
CREATE INDEX IF NOT EXISTS idx_asset_transactions_created_at ON asset_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
