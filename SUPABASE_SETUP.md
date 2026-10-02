# Supabase setup for VisitCebu

These steps connect the existing VisitCebu app to your Supabase project. Keep the service-role key private; the frontend uses only the publishable key.

## 1. Confirm project credentials

1. Open the Supabase dashboard and select your VisitCebu project.
2. Open **Project Settings > API** (the project connect/API screen in the current dashboard).
3. Copy the Project URL and the publishable key. The publishable key is intended for browser applications; do not copy a service-role or secret key.
4. In the app's `.env.local`, set the existing variables without sharing or committing the file:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

The repository ignores `.env.local`. Do not replace it with `.env.example`, and do not paste credentials into chat, source files, or screenshots. Restart the Vite server after editing environment variables.

## 2. Enable email authentication

1. In the Supabase dashboard, open **Authentication > Providers**.
2. Ensure the **Email** provider is enabled.
3. If email confirmations are enabled, signup shows a confirmation notice; the user must confirm their email before logging in.
4. Open **Authentication > URL Configuration**.
5. Set the Site URL to your local origin while developing (usually `http://localhost:5173`).
6. Add redirect URLs for every local port you use, such as `http://localhost:5173/**`, `http://localhost:4173/**`, and `http://localhost:5175/**`. Add your deployed HTTPS domain with `/**` when you deploy. These are used for email confirmation and password-reset links.

## 3. Create the database tables and security policies

1. Open **SQL Editor** in the Supabase dashboard.
2. Choose **New query**.
3. Open `supabase/migrations/20261002010000_visitcebu_schema.sql` in this project and copy its SQL into the editor.
4. Click **Run**.
5. Confirm the `profiles`, `destinations`, `restaurants`, `events`, `favorites`, `itineraries`, `itinerary_days`, `itinerary_items`, and `reviews` tables appear under **Table Editor**.

The migration enables Row Level Security on every exposed table. Catalog and review rows can be read publicly. Private writes and reads are limited by the authenticated user's ID and itinerary ownership. A database trigger creates each profile from `auth.users` and copies `full_name` metadata. The earlier `20261002000000_user_travel_data.sql` file belongs to the previous prototype storage design; it is not used by the current app and is not required for this setup. Leave any table/data created by it untouched.

## 4. Load the existing VisitCebu catalog

1. In **SQL Editor**, choose **New query**.
2. Open `supabase/seed.sql` in this project and copy its SQL into the editor.
3. Click **Run**.
4. Verify that `destinations` contains 20 rows and `restaurants` contains 8 rows.

The seed is safe to run again: it updates records by slug instead of creating duplicates. The app fetches destination rows from Supabase. If the request fails or the table is empty, it temporarily uses the bundled catalog so public pages remain browsable.

## 5. Run and verify locally

1. Restart the app with `npm run dev`.
2. Open the local URL printed by Vite.
3. Create an account using a full name, email, and password of at least 8 characters.
4. Check **Authentication > Users** for the new user. The profile trigger creates a matching row in `profiles`; the full name is stored in Auth user metadata and in the profile row.
5. Confirm the navbar shows the account control. Use it to visit **Profile** or **Log out**.
6. Save a destination while logged in, then check **Table Editor > favorites**. The row should have your `user_id` and the destination's UUID.
7. Create an itinerary, add destinations, rename it, add a day, edit notes, and reorder stops. The parent itinerary, day, and item rows are stored separately.
8. Submit a destination review. It appears in **reviews** under your user ID and is displayed with the name from `profiles`.
9. Refresh and sign in again to confirm the session, favorites, itinerary, profile, and review data persist.
10. Log out and save a favorite. Guest favorites use local storage and merge into that account on the next login without duplicate slugs.

## 6. If something fails

- **Auth unavailable:** confirm the URL and publishable key variable names are exact and restart Vite. Never add a service-role key to fix this.
- **Catalog falls back to bundled data:** confirm the migration ran, then run the seed SQL and inspect `destinations` for rows.
- **Saved itinerary/favorite errors:** confirm the migration finished successfully and inspect the browser-visible error message. Do not disable RLS; fix the migration or policy instead.
- **Confirmation/reset email returns to an error page:** add the exact local/deployed origin under **Authentication > URL Configuration > Redirect URLs**.
- **Live provider testing:** use a test account in your own project. This repository/environment does not contain credentials, so live email delivery and per-user database operations must be verified in your Supabase project.
