# Timeless Vacancy — Static App + Supabase (Quick Deploy)

## 1) Create Supabase project
- Go to https://supabase.com → New project.
- Get **Project URL** and **anon key** (Project Settings → API).

## 2) Run the SQL
- In Supabase → SQL editor → paste **supabase_schema.sql** → Run.
- Add some **Businesses** and **Pool Tables** rows in the Table editor.
  - Make sure each business has a unique **slug** (e.g., `side-pocket`).

## 3) Create test users
- Auth → Users → "Add user" → email + temp password.
- In **profiles** table, set:
  - `role = owner/manager/staff`
  - `business_id` = the business they belong to.
  (Profiles row is auto-created by the trigger; edit it to link a business.)

## 4) Configure the frontend
- Open `assets/js/config.js` and paste your **SUPABASE_URL** and **SUPABASE_ANON_KEY**.

## 5) Run locally (optional)
- You can open `index.html` directly in a browser for read-only.
- For login to work (manage/change-password), serve files (e.g., `npx http-server .`).

## 6) Deploy
- Push the folder to **Netlify** or **Vercel** (Drag & drop or connect Git).
- Set your domain DNS (CNAME) to the hosting provider.
- Public Board: `/index.html`
- Manage: `/manage.html?business=THE-SLUG`
- Change Password: `/change-password.html`
- Forgot Password: `/forgot-password.html`

## 7) QR codes
- Generate QR codes pointing to your Manage URL for each business:
  `https://YOUR-DOMAIN/manage.html?business=side-pocket`

## Notes
- RLS allows anyone to **read** tables & businesses, but only authenticated users from the **same business** can **update** its tables.
- Status options: VACANT, PARTIAL, NO_VACANCY.
- Stale styling uses `idleThresholdMinutes` and row `updated_at` timestamps.

Generated on 2025-08-11.
