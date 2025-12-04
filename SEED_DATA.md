# Seed Test Data Instructions

## Quick Setup

### Step 1: Run the Initial Schema Migration
If you haven't already, run `001_initial_schema.sql` first.

### Step 2: Create Your Admin User

1. Go to **Supabase Dashboard** > **Authentication** > **Users**
2. Click **"Add user"** > **"Create new user"**
3. Enter:
   - Email: `admin@looque.com` (or your preferred email)
   - Password: (choose a secure password)
   - **Disable** "Auto Confirm User" (or enable it if you want immediate access)
4. Click **"Create user"**
5. Copy the **User UID** (UUID)

### Step 3: Update Admin User in Database

Go to **SQL Editor** and run:

```sql
-- Replace YOUR_ADMIN_UUID with the UUID you copied
INSERT INTO users (user_id, role, full_name, email, phone, salary, salary_per_day)
VALUES (
  'YOUR_ADMIN_UUID',
  'admin',
  'Admin User',
  'admin@looque.com',
  '+1234567890',
  5000.00,
  166.67
);
```

### Step 4: Run Seed Data Script

Run `002_seed_test_data.sql` in the SQL Editor. This will create:
- ✅ 8 employees (with random UUIDs - you'll need to create auth users for them if you want them to login)
- ✅ 6 product categories
- ✅ 10 products with variants
- ✅ 15 customers
- ✅ ~30 days of attendance records
- ✅ 50 orders with order items
- ✅ Inventory movements
- ✅ 5 marketing campaigns
- ✅ 20 support tickets
- ✅ Salary records for current month

### Step 5: Test Login

1. Start your dev server: `npm run dev`
2. Login with your admin credentials
3. You should see the dashboard with all the test data!

## Note About Employee Users

The seed script creates employee records with random UUIDs. If you want employees to be able to login:

1. Create auth users for them in Supabase Dashboard
2. Update the `user_id` in the `users` table to match the auth user UUIDs

Or you can just use the admin account to test all features!

## What Data is Created?

- **Users**: 8 employees (roles: cashier, sales_executive, fashion_designer, tailor, manager, event_manager)
- **Categories**: T-Shirts, Jeans, Dresses, Jackets, Shoes, Accessories
- **Products**: 10 products across different categories
- **Product Variants**: Multiple sizes and colors for each product
- **Customers**: 15 customers with different segments (VIP, frequent, regular, at_risk)
- **Orders**: 50 orders with various statuses
- **Order Items**: Multiple items per order
- **Attendance**: 30 days of attendance records for employees
- **Salary Records**: Current month salary calculations
- **Campaigns**: 5 marketing campaigns
- **Tickets**: 20 support tickets

## Troubleshooting

If you get errors:
1. Make sure you ran `001_initial_schema.sql` first
2. Check that all tables exist
3. Verify RLS policies are set up correctly
4. Check the console for specific error messages



