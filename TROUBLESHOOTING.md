# Troubleshooting Login Issues

## Problem: Login does nothing / No redirect after entering email and password

### Common Causes:

1. **User profile not found in database**
   - The user exists in Supabase Auth but not in the `users` table
   - This is the most common issue

### Solution:

#### Step 1: Check Browser Console
Open browser DevTools (F12) and check the Console tab for errors. Look for:
- "Error fetching user profile"
- "User profile not found"

#### Step 2: Verify User Exists in Auth
1. Go to Supabase Dashboard > Authentication > Users
2. Find your user by email
3. Copy the User UUID

#### Step 3: Create User Profile Record
Go to Supabase Dashboard > SQL Editor and run:

```sql
-- Replace these values:
-- YOUR_USER_UUID: The UUID from auth.users
-- your-email@example.com: Your email
-- Your Name: Your full name
-- admin: Your role (admin, cashier, sales_executive, etc.)

INSERT INTO users (user_id, role, full_name, email, salary, salary_per_day)
VALUES (
  'YOUR_USER_UUID',
  'admin',
  'Your Name',
  'your-email@example.com',
  0,
  0
);
```

#### Step 4: Verify the Record
Run this query to check:

```sql
SELECT * FROM users WHERE email = 'your-email@example.com';
```

### Quick Fix Script

If you have multiple users to fix, run this in SQL Editor:

```sql
-- This will create user profiles for all auth users that don't have one
-- WARNING: This sets default role as 'cashier', adjust as needed

INSERT INTO users (user_id, role, full_name, email, salary, salary_per_day)
SELECT 
  id as user_id,
  'cashier' as role,
  COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
  email,
  0 as salary,
  0 as salary_per_day
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM users);
```

### Still Not Working?

1. **Check RLS Policies**: Make sure Row Level Security allows reading the users table
2. **Check Network Tab**: In DevTools, see if the API call to fetch user profile is failing
3. **Verify Supabase Connection**: Check that your Supabase URL and anon key are correct in `src/services/supabase.js`

### Testing Steps:

1. Clear browser cache and cookies
2. Try logging in again
3. Check console for any errors
4. If you see "User profile not found" error, follow Step 3 above


