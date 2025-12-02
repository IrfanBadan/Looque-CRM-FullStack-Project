# Looque CRM Panel

A full-featured CRM system for Looque clothing brand built with React.js and Supabase.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup

1. Go to your Supabase project dashboard: https://idgmtcjjjxfrkkyeuqft.supabase.co
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the SQL script to create all tables, RLS policies, and indexes

### 3. Create First Admin User

After running the migration, you need to create your first admin user:

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user" and create a user with email and password
3. Note the user's UUID from the users table
4. Go to SQL Editor and run:

```sql
INSERT INTO users (user_id, role, full_name, email, salary, salary_per_day)
VALUES ('YOUR_USER_UUID_HERE', 'admin', 'Admin User', 'admin@looque.com', 0, 0);
```

Replace `YOUR_USER_UUID_HERE` with the actual UUID from auth.users table.

### 4. Run Development Server
```bash
npm run dev
```

## Features

- **Authentication**: Login with role-based access (Admin/Employee)
- **Employee Management**: Add employees, manage roles, track attendance
- **Attendance System**: Employees can mark present, admin can view reports
- **Salary Management**: Calculate and manage employee salaries based on attendance
- **Customer Management**: Full CRM for customer profiles
- **Product Management**: Catalog with variants
- **Order Management**: Complete order processing workflow
- **Inventory**: Stock management and alerts
- **Analytics**: Sales and performance reports
- **Marketing**: Campaign management
- **Support**: Ticket system

## Tech Stack

- React.js with Vite
- Supabase (PostgreSQL, Auth, Real-time)
- Tailwind CSS
- React Router
- React Hook Form
- Recharts
- Lucide React Icons
