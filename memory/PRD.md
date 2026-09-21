# LocalLoop — Expo SDK Upgrade (2026-06)
- Upgraded Expo SDK 54 → 57 (`yarn expo install expo@latest` + `--fix`); RN 0.81 → 0.86; expo-doctor 20/20 pass.
- app.json: removed `newArchEnabled` + android `edgeToEdgeEnabled` (54→55 change).
- Vector icons migrated: `@expo/vector-icons` → `@react-native-vector-icons/ionicons` across all 20 files (Ionicons default import). `use-icon-fonts.ts` now loads the bundled `Ionicons.ttf` (family "Ionicons") via expo-font.
- Fixed `StyleSheet.absoluteFillObject` typing (new RN types) in verify.tsx / SplashIntro.tsx / MapHome.tsx.
- PENDING (next): time filter [JETZT]/[HEUTE]/[DIESE WOCHE] on Map — not yet implemented.


# LocalLoop — Feature Round 5 (2026-06) — 5 new features
- Palette refined to matte charcoal/obsidian + ice-blue (#159AB8) primary + emerald mint accent (NO purple/violet/orange); categories recolored; theme defaults to dark.
- Welcome slogan set to German "Dein Stadtpuls. Live auf der Karte."; Email button labeled "Email OTP".
- Birthdate uses a scrollable WHEEL picker (Day/Month/Year) in onboarding; onboarding adds profile picture, bio, instagram fields.
- #1 Radius slider (1–30 km) + presets (1/5/15/All) floating glass panel on Map + Explore; geodesic filtering; translucent radius Circle on map. Uses `useUserLocation` hook.
- #2 Account-type chooser modal on Welcome (Personal vs Business) → stores `pending_account_role` → onboarding pre-selects role.
- #3 Self-serve selfie verification: `app/verify.tsx` (expo-camera front selfie) → PATCH profile `{identity_verified, selfie}` → "Verified Identity" badge on Profile + attendee list; entry in Settings. (Camera = build-only.)
- #4 Swipe-to-delete chat rows (Swipeable): event chat → leave (un-checkin), crew → `POST /api/crews/{id}/leave`.
- #5 Anonymous attendees: participants returns `{anonymous:true}` placeholders; EventSheet shows silhouette + "Anonymer Teilnehmer"; count still increments.
- Backend: checkin `{visibility, at_venue}` + capacity 409; participants privacy-aware + `live`/`identity_verified` flags; reviews; `identity_verified`/`selfie` profile fields; crew leave.


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

## Implemented — Feature Round 4: UX Refresh + Design Overhaul (2026-06)
- ✅ Full-screen Map (removed in-app brand/header bar; only floating search + category chips overlay the map)
- ✅ Centralized Settings screen (`app/settings.tsx`) via gear icon in Profile: Language, Notifications, Location, Theme, Legal, Logout
- ✅ Complete DE/EN i18n across ALL screens via `src/i18n` (brand "LocalLoop" + slogan intentionally never translated)
- ✅ Premium Welcome screen redesign: Unsplash community photo bg + glassmorphic (expo-blur) card with logo/slogan/Google/Facebook/Email
- ✅ **Design overhaul**: removed all orange; new premium dark palette — primary electric violet (#7C5CFF) + emerald mint accent (#2EE6A6), glassmorphism. Added `accent`/`onAccent` theme keys.
- ✅ **Expanded to 10 categories** (Sports&Fitness 🏋️, Nightlife&Clubs 🪩, Rooftop&Bar 🍹, Food&Culinary 🍕, Arts&Culture 🎨, Networking 💼, Gaming&E-Sports 🎮, Outdoor&Nature 🪵, Workshops 📚, Music&Concerts 🎵) with embedded neon colors + age-restricted flag on nightlife/rooftop
- ✅ Interactive horizontal **carousel category picker** (`CategoryWheel.tsx`) in Create form
- ✅ Backend: 13 Karlsruhe venues re-seeded across all categories; added `capacity`, `rating`, `rating_count`, `reservation_url` to Event; `spots_taken` in live payload; seed-versioning (`db.meta.seed_version`) to force clean re-seed

## In Progress — Big Feature Program (user request, 4 phases; all defaults confirmed)
- Phase 1 (DONE): design overhaul + 10 categories + wheel picker
- Phase 2 (TODO): mandatory birthdate onboarding + dynamic age display + U18 nightlife restriction; Business role selection + forced business profile setup + verified blue badge + star rating on profile/sheet/cards + user review system (attendees only)
- Phase 3 (TODO): event capacity + live "X/Y spots" counter, RSVP privacy (Public/Friends/Anonymous), reservation link field, native share button, distance radius filter (1/5/15 km), calendar date-range picker (Explore + Map), live GPS "At Venue" check-in + green Live badge
- Phase 4 (TODO): chat delete/leave, "My Contacts" friends (search/request/1-on-1 DM), event-header → event details navigation

## Design decisions (confirmed by user)
- Business login = role choice on login (Visitor / Organizer-Business) → forced business profile; verified badge auto/admin-granted for demo
- Palette = electric violet primary + emerald mint accent (dark, glassmorphism, NO orange)
- Reviews allowed for checked-in attendees only
- Re-seed demo data allowed

## Backlog / Next (deferred)
- **P0**: Facebook OAuth login (needs Facebook integration); Email OTP login (needs email provider e.g. Resend/SendGrid)
- **P1**: Push delivery verification (requires google-services.json + native build)

