# LocalLoop — Product Requirements Document

## Original Problem Statement
An interactive, map-first regional event & community app (Google Maps × Nomadlist). Full-screen map with color-coded event pins (Purple=nightlife, Orange=food, Green=sports, Blue=culture), tap-to-preview bottom sheet, event detail with CTAs, organizer add-event form, and a live pulse / check-in social layer. Modern high-contrast minimalist UI, dark & light support.

## User Choices
- Demo events **+** user-added events
- Google social login (Emergent-managed)
- Live pulse: simulated counts **+** real check-ins
- Support both dark & light themes (toggle)
- Default map location: user GPS with San Francisco fallback

## Architecture
- **Backend**: FastAPI + MongoDB (motor). Routes under `/api`. Emergent Google OAuth session flow (`/api/auth/session`), events CRUD, check-in toggle, 8 seeded SF demo events, simulated `live_count` jitter + `is_hot`. Preview-only `dev-session` (env-guarded `ALLOW_DEV_LOGIN`).
- **Frontend**: Expo SDK 54, expo-router (stack). `react-native-maps` on native + web fallback canvas (`MapCanvas.web.tsx`) so full flow is testable on web. `@gorhom/bottom-sheet` (progressive disclosure), expo-blur glass header, expo-location, reanimated pulse pins, theme context (persisted), AuthContext.

## Personas
- **Explorer**: browses the map, filters by category, checks into events.
- **Organizer** (venue/club/sports club): publishes events via the Add Event form.

## Core Requirements (static)
1. Interactive map with clustered/color-coded pins + live pulse on hot pins.
2. Event preview → detail bottom sheet with Instagram/Website/Buy Tickets CTAs.
3. Organizer add-event form (title, category, date/time, location picker, description, links).
4. Live check-in count (real toggle + simulated base).
5. Google login, dark/light theme toggle.

## Implemented (2026-07-13)
- ✅ Google login screen + Emergent OAuth flow + preview demo login
- ✅ Map screen: color-coded pins, category filter chips, glass header, theme toggle, recenter, add FAB
- ✅ Event bottom sheet: hero image + scrim, meta, live count, check-in, CTAs
- ✅ Add Event form with category chips, date presets, map location picker, sticky publish
- ✅ Backend: events CRUD, check-in toggle + status, 8 seeded events, live jitter
- ✅ Tested: backend 14/14 pytest passed; frontend critical flows passed via Playwright

## Implemented — Feature Round 2 (2026-07-13)
- ✅ Scrollable time-wheel (hour/minute/AM-PM) in Add Event form
- ✅ Emoji map markers per category (🍹 🍕 🏋️ 🎭)
- ✅ Event Group Chat (polling, unlocked on check-in) — `/chat/[eventId]`
- ✅ User Profiles: photo upload, bio, Instagram — `/profile`
- ✅ "Surprise Me" gamified button (popular event within ~2h, zooms + opens)
- ✅ Map Stories/"Moments": photo upload, 24h TTL expiry, story viewer
- ✅ "Create a Crew": private groups, invite codes, suggest map events + custom ideas, vote — `/crews`, `/crew/[id]`
- ✅ Keyboard UX via react-native-keyboard-controller (chat + forms)
- ✅ Tested: backend 28/28 pytest passed; frontend 12/12 feature areas passed via Playwright

## Implemented — Feature Round 3: Final Build (2026-07-15)
- ✅ 5-tab bottom navigation: Map · Explore · Create · Chats · Profile
- ✅ Redesigned Welcome screen: blurred city bg + pulsating neon indigo/cyan gradient, white logo + DE/EN slogan, Google/Facebook/Email CTA stack, DE/EN toggle + "Business Login" bottom bar
- ✅ Karlsruhe default map center + GPS centering; location picker defaults to Karlsruhe
- ✅ Seeded 7 REAL Karlsruhe venues as verified business events (DECKZEHN, VENUS BAR, Mama's Café, drei&zwanzig, Wilma Wunder, Bistro Le Renard, Café Wohnzimmer), each with 3–6 mock attendees + seed chat messages
- ✅ Recurring events: toggle + freq + weekday selector; next-occurrence computed; recurring badge on sheet/cards (DECKZEHN Thu&Sat 18:00, VENUS BAR Fri 20:00)
- ✅ Explore tab: vertical rich cards + search + quick filters (Today/Free/Outdoor/Near Me)
- ✅ Event Save/Bookmark (+ /my/saved, /my/attending); Attendee avatars + first names on sheet
- ✅ Event banner image upload; interactive calendar date picker + scrollable time wheel
- ✅ Marker clustering + emoji markers with neon glow; chat keyboard back-button fix
- ✅ Push-notification relay wired (Emergent) — saved-event + new-message triggers
- ✅ Tested: backend 16/16 pytest; frontend ~all flows passed (save button + recurring badge fixed & verified)

## Backlog / Next (deferred — need integrations / larger scope)
- **P0**: Facebook OAuth login (needs Facebook integration); Email OTP login (needs email provider e.g. Resend/SendGrid)
- **P0**: Business vs Regular account-type split + "Create Your Profile" forced onboarding + business-only Create access (backend `account_type` field already seeded)
- **P1**: Full DE/EN i18n across all screens (currently on Welcome only)
- **P1**: Push delivery verification (requires google-services.json + native build); scheduled "starts in 2h" reminder via a server scheduler
- **P2**: Viewport-only pin rendering; short video Moments (object storage)
