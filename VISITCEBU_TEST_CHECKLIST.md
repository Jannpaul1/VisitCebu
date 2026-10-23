# VisitCebu QA checklist

Use this checklist for a repeatable release pass. Record the date, browser/device, environment, and evidence beside each run. Do not mark an item complete unless it was actually exercised.

## Last recorded run

- **Date/environment:** 2026-10-23; local Vite app with the configured Supabase project; integrated browser.
- **Automated:** `npm test` passed (10/10); `npm run build` passed; `npm run lint` passed with two warnings; production dependency audit passed with zero advisories.
- **Browser:** Core routes, map filters/markers, Food and Events filters, destination/event detail navigation, guest favorites, auth form validation, mobile menu, and 35 route/viewport combinations were exercised. See [VISITCEBU_QA_REPORT.md](./VISITCEBU_QA_REPORT.md) for exact scope and evidence.
- **Not signed off:** Real authenticated account flows and cross-user authorization were not tested; the full dependency audit has seven development-tool advisories; a public-profile read policy and five catalog-coordinate differences need owner review.

The checkboxes below are a reusable release template and remain unchecked for the next run; the linked report records this run's actual outcomes.

## Test safety and setup

- [ ] Confirm the target is a local/staging environment; do not run writes against production data.
- [ ] Use a designated test account only when the owner has approved it.
- [ ] Do not create accounts, submit password-reset requests, edit profile data, reviews, favorites, or itineraries against a live backend without approval.
- [ ] Confirm no service-role/secret key is present in client code, committed environment files, or built assets.
- [ ] Record the browser version, viewport, commit/worktree state, and whether Supabase is configured.

## Build, lint, and automated checks

- [ ] Run the package-defined production build (`npm run build`).
- [ ] Run the configured linter (`npm run lint`).
- [ ] Run available unit/component tests; record when no runner or test files exist.
- [ ] Run browser/E2E tests for navigation, search, filters, map, auth forms, favorites, and itinerary flows.
- [ ] Check browser console errors, failed requests, and unexpected redirects.

## Route and navigation matrix

- [ ] `/` — Home: hero actions, featured destinations/events, links, page load.
- [ ] `/explore` — Destination list, search query, category/region filters, reset, cards/details links.
- [ ] `/destination/:slug` — Valid detail: content, gallery, favorite, itinerary action, reviews, related links.
- [ ] `/destination/:unknown` — Unknown slug: loading ends and the not-found experience appears.
- [ ] `/restaurants/:slug` — Valid restaurant detail, favorite, navigation; test an unknown slug.
- [ ] `/food` — Food listing, restaurant cards/details, filters/search where present.
- [ ] `/events` — Event list and event detail links.
- [ ] `/events/:slug` — Valid event detail; test an unknown slug.
- [ ] `/map` — Map and all map controls (see map checks below).
- [ ] `/favorites` — Empty and populated guest states; restaurant and destination links; remove actions.
- [ ] `/login` — Form validation, invalid credentials feedback (mock only), link to signup/reset.
- [ ] `/signup` — Required fields, email/password validation, duplicate/confirmation states (mock only).
- [ ] `/forgot-password` — Validation and success/error feedback; do not send a live reset email.
- [ ] `/reset-password` — Missing/invalid recovery session, validation, mocked successful update.
- [ ] `/itinerary` — Signed-out redirect; authenticated empty and populated planner states.
- [ ] `/profile` — Signed-out redirect; authenticated profile data/edit/logout (mock only).
- [ ] `/supabase-test` — Configured/unconfigured and successful/error read-only connection states.
- [ ] `/privacy` and `/terms` — Content renders and footer links navigate correctly.
- [ ] An unrecognized URL — Not-found page, recovery navigation, no blank screen.
- [ ] Header/footer navigation — Every link opens its intended route; active state is correct.
- [ ] Browser Back/Forward — Route and page state remain coherent.
- [ ] Scroll behavior — Route changes return to the top; long pages scroll without horizontal overflow.
- [ ] Mobile navigation — Open/close, navigate, and verify menu closes after selection.

## Search, cards, and destination content

- [ ] Header search submits a non-empty query to `/explore`; empty search does not break navigation.
- [ ] Explore search matches expected destination fields and gives useful zero-result feedback.
- [ ] Category/region filters combine correctly and reset to the unfiltered list.
- [ ] Destination and restaurant cards open matching detail pages.
- [ ] Detail pages show title, location, description, category, hours, price/fees, highlights, and tips.
- [ ] All primary and gallery images load; image failures degrade without broken layout.
- [ ] Gallery alt text is meaningful; card/detail images have appropriate alt text.
- [ ] Destination titles, descriptions, coordinates, and image links are verified against the approved catalog source.
- [ ] Reviews: list, empty/error state, form validation, submit/edit/delete only with a designated test account and approval.
- [ ] Recently viewed places remain local, deduplicated, and capped as intended.

## Map

- [ ] Confirm the read-only destination query returns the expected catalog count (currently 20); do not update coordinates.
- [ ] Confirm each destination with valid latitude/longitude has one visible marker at the correct attraction.
- [ ] Confirm invalid, null, out-of-range, and `(0, 0)` coordinates are excluded without crashing.
- [ ] Open/close marker popups; follow popup detail links.
- [ ] Search by name, location, category, and tag; confirm no-result feedback.
- [ ] Select each available region; confirm counts and marker/list results.
- [ ] Select each available category; combine it with region and search.
- [ ] Reset filters; confirm all valid markers return.
- [ ] Select a result; confirm the map focuses that destination; change filters and confirm selection clears appropriately.
- [ ] Confirm map bounds include all filtered destinations and remain usable at mobile widths.
- [ ] Verify map tile/marker network requests and attribution in the browser.

## Authentication and account privacy

- [ ] Test valid/invalid login, required fields, logout, persisted session, and protected redirects using a mock or approved test account.
- [ ] Test signup validation and both confirmation-required and immediate-session outcomes with mocks.
- [ ] Test password recovery/update using mocks; no real emails without approval.
- [ ] Test profile validation, save/error feedback, and session updates using mocks.
- [ ] Verify account-scoped reads/writes in a dedicated non-production project/test account.
- [ ] Review every Supabase table's RLS enablement, policy predicates, grants, ownership joins, and publicly readable fields.
- [ ] Confirm one user's favorites/itineraries cannot be read or changed by another user.
- [ ] Verify network/database errors are surfaced without leaking credentials or private data.

## Favorites and itinerary planner

- [ ] Guest favorites add/remove, avoid duplicates, survive refresh, and show the correct empty/populated states.
- [ ] Account favorites load/save/reload and merge guest favorites only with an approved test account.
- [ ] Favorite actions work from destination, restaurant, and favorite-card surfaces.
- [ ] Protected planner redirects signed-out users to login and returns them after authentication where supported.
- [ ] Create, rename, and delete itineraries; validate empty names and empty state.
- [ ] Add destinations, prevent or document duplicates, and persist/reload with an approved test account.
- [ ] Add a day; move items between days; reorder items within a day; remove an item.
- [ ] Edit notes and time fields; verify time editing exists and persists or record as missing.
- [ ] Exercise database load/save failures and confirm visible error feedback.

## Accessibility, responsive layout, SEO, and performance

- [ ] Keyboard-only navigation reaches every control in a logical order; visible focus is present.
- [ ] Inputs have programmatic labels; icon-only buttons have accessible names.
- [ ] Forms expose validation/errors to assistive technology.
- [ ] Check heading order, landmarks, link names, image alternatives, contrast, and map alternatives.
- [ ] Check `375x667`, `390x844`, `768x1024`, `1366x768`, and `1920x1080`.
- [ ] At every viewport, check horizontal scrolling, overlapping controls, card clipping, text overflow, and map usability.
- [ ] Inspect page title, description/SEO metadata, favicon, and language declaration.
- [ ] Measure load/build output and inspect large assets, failed requests, and costly rerenders.

## Final sign-off

- [ ] Separate automated results from manual/source-review findings.
- [ ] List every blocked or untested item and the reason; do not infer success from source code alone.
- [ ] Re-run checks affected by fixes and confirm unrelated existing worktree changes remain intact.
- [ ] Record remaining issues and a deployment readiness decision in `VISITCEBU_QA_REPORT.md`.
