
# Dental Clinic Patient Management System

A production-ready internal web application for managing dental clinic patients, shifts, and prescriptions. Built with Next.js, Supabase, and Tailwind CSS.

## Features

-   **Role-Based Access Control (RBAC)**: Super Admin vs. Doctors.
-   **Shift Management**: Define shifts and assign doctors dynamically.
-   **Patient Registration**: Only the currently assigned "In-Charge" doctor can add patients.
-   **Prescription Printing**: Browser-based print preview tailored for pre-printed letterheads.
-   **Security**: RLS (Row Level Security) ensures data privacy.

## Tech Stack

-   **Framework**: Next.js 14+ (App Router)
-   **Language**: JavaScript
-   **Styling**: Tailwind CSS
-   **Backend/Auth**: Supabase (PostgreSQL)

## Setup Instructions

### 1. Prerequisites

-   Node.js 18+
-   Supabase Account

### 2. Supabase Setup

1.  Create a new Supabase Project.
2.  Go to the **SQL Editor** in your Supabase Dashboard.
3.  Copy the content of `schema.sql` from this project and run it. This creates the tables, functions, and RLS policies.
4.  Get your API Keys from **Project Settings > API**.

### 3. Environment Variables

Copy `.env.local` example and fill in your keys:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # Required for Admin Invites
```

### 4. Installation & Run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

### 5. Initial Admin User

Since signup is disabled (Invite Only), you must manually set the first user as `super_admin`.

1.  Go to Supabase Authentication and create a user (or invite one).
2.  Go to the `profiles` table in Supabase.
3.  Change the `role` of that user from `sub_doctor` (default) to `super_admin`.
4.  Now login with that user to access the Admin Dashboard.

## Deployment (Vercel)

1.  Push code to GitHub.
2.  Import project in Vercel.
3.  Add the Environment Variables (including Service Role key).
4.  Deploy.

## Project Structure

-   `app/`: Pages and Routes.
-   `components/`: Reusable UI.
-   `lib/supabase/`: Database clients.
-   `app/actions/`: Server actions for admin tasks.
-   `utils/shifts.js`: Logic for determining in-charge doctor.

