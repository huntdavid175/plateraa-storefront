-- Quick fix: Apply RLS policy for branches table only
-- Run this in your Supabase SQL Editor if branches aren't showing up

-- Enable RLS on branches table (if not already enabled)
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow public read access to branches" ON branches;

-- Create the policy
CREATE POLICY "Allow public read access to branches"
ON branches
FOR SELECT
TO public
USING (true);

-- Test query to verify it works (replace with your institution_id)
-- SELECT * FROM branches WHERE institution_id = 'your-institution-id-here';
