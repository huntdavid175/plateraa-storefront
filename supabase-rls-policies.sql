-- RLS Policies for Plateraa Storefront
-- Run this SQL in your Supabase SQL Editor to enable public read access

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_tags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running this script)
DROP POLICY IF EXISTS "Allow public read access to institutions" ON institutions;
DROP POLICY IF EXISTS "Allow public read access to branches" ON branches;
DROP POLICY IF EXISTS "Allow public read access to menu_categories" ON menu_categories;
DROP POLICY IF EXISTS "Allow public read access to menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow public read access to menu_item_variants" ON menu_item_variants;
DROP POLICY IF EXISTS "Allow public read access to menu_item_addons" ON menu_item_addons;
DROP POLICY IF EXISTS "Allow public read access to menu_item_tags" ON menu_item_tags;
DROP POLICY IF EXISTS "Allow public read access to menu_tags" ON menu_tags;

-- 1. Institutions: Allow public SELECT access
CREATE POLICY "Allow public read access to institutions"
ON institutions
FOR SELECT
TO public
USING (true);

-- 2. Branches: Allow public SELECT access
CREATE POLICY "Allow public read access to branches"
ON branches
FOR SELECT
TO public
USING (true);

-- 3. Menu Categories: Allow public SELECT access
CREATE POLICY "Allow public read access to menu_categories"
ON menu_categories
FOR SELECT
TO public
USING (true);

-- 4. Menu Items: Allow public SELECT access
CREATE POLICY "Allow public read access to menu_items"
ON menu_items
FOR SELECT
TO public
USING (true);

-- 5. Menu Item Variants: Allow public SELECT access
CREATE POLICY "Allow public read access to menu_item_variants"
ON menu_item_variants
FOR SELECT
TO public
USING (true);

-- 6. Menu Item Addons: Allow public SELECT access
CREATE POLICY "Allow public read access to menu_item_addons"
ON menu_item_addons
FOR SELECT
TO public
USING (true);

-- 7. Menu Item Tags (Junction Table): Allow public SELECT access
CREATE POLICY "Allow public read access to menu_item_tags"
ON menu_item_tags
FOR SELECT
TO public
USING (true);

-- 8. Menu Tags: Allow public SELECT access
CREATE POLICY "Allow public read access to menu_tags"
ON menu_tags
FOR SELECT
TO public
USING (true);
