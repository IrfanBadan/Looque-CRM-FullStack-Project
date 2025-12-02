-- Script to create admin user after you've created the auth user
-- 
-- STEP 1: Create auth user in Supabase Dashboard > Authentication > Users
-- STEP 2: Copy the User UUID
-- STEP 3: Replace 'YOUR_ADMIN_UUID_HERE' below with the actual UUID
-- STEP 4: Run this script

-- Uncomment and update the UUID below:
/*
INSERT INTO users (user_id, role, full_name, email, phone, salary, salary_per_day)
VALUES (
  'YOUR_ADMIN_UUID_HERE',  -- Replace with actual UUID from auth.users
  'admin',
  'Admin User',
  'admin@looque.com',      -- Replace with your admin email
  '+1234567890',
  5000.00,
  166.67
)
ON CONFLICT (user_id) DO NOTHING;
*/

-- Or use this query to find your auth user UUID first:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';


