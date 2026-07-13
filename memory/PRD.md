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

## Backlog / Next
- **P1**: Native marker clustering at low zoom; date/time on native via spinner picker.
- **P1**: Crew push/deep-link invites; "My events" for organizers.
- **P2**: Search bar, video moments (object storage), unread chat badges.
- **P2**: Disable `ALLOW_DEV_LOGIN` before production.
