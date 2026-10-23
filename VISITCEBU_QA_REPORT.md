# VisitCebu QA report

**Run date:** 2026-10-23  
**Target:** Local Vite app at `127.0.0.1:5174`, connected to the configured Supabase project  
**Test types:** Automated unit/component tests with mocked Supabase and Leaflet; interactive browser checks; read-only live catalog inspection; source/migration review  
**Release decision:** **Not ready for production sign-off yet.** The production build and tested guest flows pass, but there are unresolved privacy/data discrepancies, dependency advisories, and authenticated behavior that could not be tested safely.

## Executive summary

The project now has a repeatable Vitest/Testing Library suite, route-level page splitting, accessible names/labels on several controls, and this report/checklist. Ten mocked UI tests pass. The production build and TypeScript build pass. Manual browser checks covered destination details, the map, filters, event details, guest favorites, auth-form validation, protected-route redirects, mobile navigation, and responsive widths.

This was not a complete authenticated end-to-end sign-off. No account was created, no live authentication request was submitted, and no private user data was written or changed. Account persistence, cross-user isolation, and RLS enforcement therefore remain unverified at runtime. No production database records or coordinates were modified.

## Automated checks

| Check | Result | Notes |
|---|---|---|
| `npm test` | **PASS** | 1 test file; 10/10 tests passed. Supabase and Leaflet are mocked. |
| `npm run build` | **PASS** | Includes `tsc -b`; Vite 8.3.5 produced a production build. |
| `npm run lint` | **PASS WITH WARNINGS** | Two Oxlint warnings remain: Fast Refresh export in `src/context/AppContext.tsx:1274`; synchronous state update in an effect in `src/components/MapView.tsx:305`. |
| `npm audit --omit=dev` | **PASS** | Zero production-dependency advisories. |
| `npm audit` | **FAIL / REVIEW REQUIRED** | Seven development dependency advisories (2 moderate, 5 high), through the Tailwind CSS 3 dependency chain (`braces`/`postcss-selector-parser`). npm's suggested automatic fix upgrades Tailwind to v4, a breaking migration; it was not applied. |
| Browser E2E suite | **NOT CONFIGURED** | Browser checks below were interactive checks with the integrated browser, not a committed Playwright E2E suite. |

The initial build check exposed a type error in the new hero-search test's Testing Library matcher. The matcher was corrected and the final build and all ten tests passed.

### Current build size

The route split reduced the initial JavaScript from about 800.63 kB to **544.98 kB minified / 155.87 kB gzip**. The separate map chunk is **161.55 kB / 47.73 kB gzip**. Vite still warns that the main chunk exceeds 500 kB. This is a warning, not a build failure.

## Pages and features exercised

### Route and navigation smoke coverage

The route inventory in `src/App.tsx` includes `/`, `/explore`, `/destination/:slug`, `/restaurants/:slug`, `/food`, `/events`, `/events/:slug`, `/map`, `/favorites`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/supabase-test`, `/itinerary`, `/profile`, `/privacy`, `/terms`, and the wildcard not-found route.

- Home, Explore, Food, Events, Map, Favorites, authentication forms, legal pages, and the signed-out protected routes were loaded in the browser.
- All **20 destination detail routes** were visited.
- A valid event detail was opened from the event list (`/events/sinulog-festival`); an event unknown-slug state and general invalid-URL fallback were checked.
- Signed-out visits to `/itinerary` and `/profile` redirected to login.
- The home hero search was followed into Explore and now uses the `search` query parameter consumed by Explore. A live-browser search for `Moalboal` returned one matching destination.
- The Food and Events listing/detail paths were exercised, but every restaurant detail link and every event detail link was **not** individually traversed.
- Browser Back/Forward, every footer link, and every route-specific secondary link were **not exhaustively verified**.

### Interactive browser checks

- **Map:** 20 markers appeared for the 20 catalog destinations. Marker popups opened/closed; selecting a destination focused the map; region/category filters, combined filters, search, no-result feedback, and reset were exercised. The 20 markers remained present at the five responsive viewport sizes.
- **Explore:** Search via `?search=Moalboal`, location/category/price/rating/sort selectors, empty results, and clearing filters were exercised. Combining Northern Cebu + Islands + Budget + 4.8+ produced an appropriate no-results state; clearing restored the 20-result list.
- **Food:** All eight category chips were exercised. Observed result counts: All 8, Cebu Lechon 1, Seafood 1, Filipino 2, Street Food 1, Cafés 1, Fine Dining 1, Desserts 1, Local Favorites 2.
- **Events:** Six events were displayed. January and Festival filters each returned the Sinulog event; a month with no matching event showed the empty state; clearing restored all six. The Sinulog card opened its matching detail page.
- **Guest favorites:** Destination and restaurant favorites could be added, survive a refresh, and be removed. Two additional guest-only test favorites were accidentally toggled by an overly broad locator during an earlier Food-filter attempt; both were removed afterward and the Favorites page was confirmed empty on reload. No account favorites or database writes were involved.
- **Authentication UI:** Required-field/label checks and password-reset mismatch feedback were exercised without submitting real auth requests or sending an email. The itinerary entry point correctly prompted signed-out users to log in.
- **Mobile menu:** At an effective 375 CSS-pixel width, the menu opened, navigated to Food, and closed after selection.
- **Responsive:** 35 page/viewport combinations were checked at 375×667, 390×844, 768×1024, 1366×768, and 1920×1080. No horizontal overflow was observed in those runs; the map retained all 20 markers. The integrated browser scales its requested viewport, so the requested size was adjusted to achieve the listed CSS viewport dimensions.

### Automated mocked flows

The 10 passing UI tests cover:

- Hero-search navigation/query construction.
- Map marker filtering, focusing, and reset; map no-results and recovery.
- Login error feedback and signup validation.
- Password-reset mismatch and mocked confirmation.
- Guest favorite actions.
- Adding a suggested destination to an itinerary.
- Editing itinerary name, notes, time, and item ordering.

These tests verify UI behavior against mocks, not live Supabase persistence.

## Supabase, data, and security observations

- A read-only catalog query returned **20 destinations** and **8 restaurants**. The map rendered all 20 destination markers; the catalog coordinates checked were valid.
- A comparison between the live catalog and bundled/seeded coordinates found differences for five slugs: `anjo-world`, `cebu-safari`, `osmena-peak`, `kawasan-falls`, and `sirao-garden`. The authoritative coordinate source is not established, so no coordinates were changed. Confirm these with the data owner before reconciling.
- RLS is enabled in the reviewed migration for the listed tables. Favorite and itinerary policies scope user-owned rows using `auth.uid()` and parent ownership checks. This source review does **not** prove the currently deployed Supabase policies match the migration or that cross-user isolation works at runtime.
- The migration grants anonymous and authenticated users `SELECT` on `profiles` and defines a public read policy (`using (true)`). Profile rows include `full_name` and `avatar_url`; consider minimizing public profile visibility and confirm the intended privacy model before release. No policy was changed.
- No service-role key reference was found in tracked client source or the example environment file. The local `.env.local` was not disclosed or modified. Do not expose secret/service-role credentials to the browser.
- Real registration/login, session persistence, logout against Supabase, password reset delivery, profile edits, user-to-user access denial, account favorites/itinerary persistence, and review writes were **not tested**. No approved test account was supplied, and no real account or write operation was attempted.

## Content, images, network, and accessibility

- Twenty destination detail pages and 151 rendered image elements were checked; the image checker reported no broken images in that pass. A browser network log also showed a remote image request blocked by ORB, so successful rendering in every browser/network condition is not proven.
- OpenStreetMap tile requests were sometimes aborted while the map moved; the map continued to render its markers. These cancellations should be distinguished from persistent tile failures.
- Potentially placeholder content remains for owner confirmation: generic social destinations (`facebook.com`, `instagram.com`, `t.me`), a sample-looking phone number, a generic contact email, and brief privacy/terms text. No factual content was changed.
- Accessible labels/names were added or improved for several search, menu, favorite, rating, review, itinerary, and form controls. The browser and tests cover selected controls only; a full keyboard-only, screen-reader, WCAG contrast, and assistive-technology audit was **not** performed.
- `index.html` now provides a VisitCebu title and description. Lighthouse/Core Web Vitals and production-network performance were not measured.

## Issues found and changes made

1. **Home hero search used the wrong query key.** The hero used a different parameter from the one Explore reads. It now routes with `?search=...`; verified by a mocked test and a live-browser Moalboal result.
2. **Initial JavaScript bundle was oversized.** Route pages are now lazy-loaded with a loading fallback. Initial bundle size dropped by about 256 kB minified, although the 500 kB warning remains.
3. **Itinerary time editing was missing.** A start-time editor was connected to the existing itinerary update path and is covered by a mocked UI test. Persistence to a real account was not tested.
4. **Selected controls lacked accessible names/labels.** Labels/names and signup required-field validation were improved across the affected components/forms; this is not a complete accessibility certification.
5. **Lint warnings were reduced.** The destination image-failure state warning and map search dependency warnings were addressed. Two warnings remain as listed above.
6. **Build dependencies and test setup.** Vitest/Testing Library were added; build-only Tailwind/PostCSS/Autoprefixer were moved to development dependencies; Vite was updated to 8.3.5. Production dependency audit is clean, but the full development dependency audit still reports seven advisories.

## Remaining work / blocked tests

- Review and, if appropriate, narrow the public `profiles` read policy. This requires an owner-approved privacy decision and a controlled migration/deployment.
- Confirm the five differing coordinates against the authoritative catalog before changing either source.
- Resolve the seven development-tool advisories without an unapproved breaking Tailwind migration.
- Decide whether to further split/defer common dependencies; verify a measured user-facing performance improvement before changing architecture.
- Run authenticated account flows and cross-user authorization tests in a designated non-production Supabase project with approved test accounts.
- Add a committed browser E2E suite if repeatable real-browser regression coverage is required; current browser checks are not persisted as automated tests.
- Individually verify all restaurant/event detail links, all secondary/footer links, full keyboard navigation, contrast, and behavior under blocked-image/tile conditions.
- Confirm placeholder contact/social/legal content with the site owner.
- No Vercel deployment, GitHub push, commit, Supabase setting change, RLS change, or production data write was performed.

## Final assessment

**Build and tested guest-facing flows: conditionally healthy. Production release: not approved by this QA pass.** The main blockers are the public profile visibility decision, coordinate-source discrepancies, unresolved full-audit development advisories, and lack of approved authenticated/cross-user runtime testing. Re-run the reusable checklist in [VISITCEBU_TEST_CHECKLIST.md](./VISITCEBU_TEST_CHECKLIST.md) after those decisions and before deployment.
