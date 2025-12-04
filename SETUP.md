# Setup Guide for Looque CRM

## Prerequisites
- Node.js installed (v16 or higher)
- Supabase account and project

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Database Setup

### Run SQL Migration
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `idgmtcjjjxfrkkyeuqft`
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
6. Paste it into the SQL Editor
7. Click **Run** to execute the migration

This will create:
- All database tables (users, attendance, salary_records, customers, products, orders, etc.)
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for updated_at timestamps

## Step 3: Create First Admin User

### Option A: Using Supabase Dashboard
1. Go to **Authentication** > **Users** in Supabase Dashboard
2. Click **Add user** > **Create new user**
3. Enter email and password
4. **Disable** "Auto Confirm User" (or enable it if you want immediate access)
5. Click **Create user**
6. Copy the User UUID from the users table

### Option B: Using SQL
After creating the auth user, run this SQL in the SQL Editor:

```sql
-- Replace 'YOUR_USER_UUID' with the actual UUID from auth.users table
-- Replace 'admin@looque.com' with the actual email
INSERT INTO users (user_id, role, full_name, email, salary, salary_per_day)
VALUES (
  'YOUR_USER_UUID_HERE',
  'admin',
  'Admin User',
  'admin@looque.com',
  0,
  0
);
```

To find your user UUID:
1. Go to **Authentication** > **Users**
2. Click on the user you created
3. Copy the **User UID**

## Step 4: Configure Email (Optional)
If you want email confirmation disabled for new users:
1. Go to **Authentication** > **Settings** > **Email Templates**
2. Disable "Confirm email" or configure as needed

## Step 5: Run the Application
```bash
npm run dev
```

The application will start on `http://localhost:5173`

## Step 6: Login
1. Open the application in your browser
2. Use the admin email and password you created
3. You should be redirected to the dashboard

## Adding Employees
1. Login as admin
2. Go to **Employees** page
3. Click **Add Employee**
4. Fill in the details:
   - Full Name
   - Email (will be used for login)
   - Phone (optional)
   - Role (cashier, sales_executive, event_manager, fashion_designer, tailor, manager)
   - Password (for login)
   - Salary
   - Salary Per Day
5. Click **Add Employee**

The employee will receive an email to confirm their account (if email confirmation is enabled).

## Troubleshooting

### "User profile not found" error
- Make sure you've created the user record in the `users` table after creating the auth user
- Check that the `user_id` in the `users` table matches the UUID in `auth.users`

### RLS Policy Errors
- Make sure you've run the complete SQL migration
- Check that RLS policies are enabled on all tables
- Verify your user has the correct role in the `users` table

### Cannot create employees
- Ensure you're logged in as an admin
- Check that the email is not already in use
- Verify RLS policies allow admin to insert into users table

## Next Steps
- Add categories for products
- Create products and variants
- Add customers
- Start processing orders
- Employees can mark attendance daily



