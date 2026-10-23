# VisitCebu

VisitCebu is a responsive tourism and travel web app for exploring destinations, food spots, events, favorites, and personalized trip planning in Cebu, Philippines.

## Features

- Destination discovery and search
- Local food and event browsing
- Favorites with guest local storage and signed-in Supabase sync
- Itinerary planner and day-by-day trip organization
- Supabase login/signup, email confirmation, password reset, and profile management
- Responsive layout for desktop and mobile
- Interactive map views and destination detail pages

## Tech stack

- React + TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React
- Leaflet + React Leaflet
- Supabase Auth and account-scoped data

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the local app in your browser at:
   ```text
   http://localhost:5173/
   ```

## Production build

```bash
npm run build
```

## Authentication setup

Create a Supabase project, then copy the example environment file and add its project URL and publishable key:

```powershell
Copy-Item .env.example .env.local
```

Then update the values in `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

For the complete dashboard instructions, apply steps in [SUPABASE_SETUP.md](SUPABASE_SETUP.md). Do not put a service-role key in this frontend app.

The normalized migration is `supabase/migrations/20261002010000_visitcebu_schema.sql`; run `supabase/seed.sql` after it to load the existing Cebu destinations and restaurants.

Without real credentials, public browsing, maps, and guest favorites still work locally, but sign-in, registration, profile editing, and password recovery report that authentication is unavailable. The sample `.env.example` values are blank and are not treated as a configured backend.

## Project structure

```text
src/
  components/
  context/
  data/
  layouts/
  lib/
  pages/
  types/
  utils/
```

## Notes

Signed-in favorites, itineraries, and reviews use Supabase. Signed-out favorites remain in browser local storage. Itinerary planning and profile pages require a signed-in account. Recently viewed places remain local to the browser.

The project can be deployed to a static host or Vercel/Netlify-style frontend deployment environment after configuring Supabase environment variables and redirect URLs.
