# Monor Xur — Product Requirements Document

## Original problem statement
Mobile-first cognitive engagement & care-support app for older adults with memory
difficulties. Three experiences: Patient (primary), Family Caregiver, ASHA/Health Worker.
Warm, calming, elderly-friendly (NOT clinical). Warm cream + sage botanical design,
large touch targets, rounded cards, Nunito typography. React Native + Expo + TypeScript.

## Architecture
- **Frontend:** Expo Router (file-based). Patient = hub + bottom tabs (Home, Play, Memories,
  Settings). Caregiver/ASHA = guarded stacks with bottom tabs under `/caregiver/family` and
  `/caregiver/asha`. Theme tokens in `src/theme.ts` (from design_guidelines.json), Nunito via expo-font.
- **Backend:** FastAPI + MongoDB (motor). JWT auth (bcrypt) with roles caregiver/health_worker;
  demo accounts seeded on startup. Routes under `/api`.
- **State:** @tanstack/react-query provider mounted; auth contexts (backend JWT + in-memory
  caregiver PIN/ID auth); telemetry + DDA modules persist to device storage.

## User personas
1. **Patient (Anita, 68):** memory difficulty; needs simple, warm, large-target UI.
2. **Family Caregiver:** broad access to profile, medical, memories, progress, reports, calendar, contacts, alerts.
3. **ASHA / Health Worker:** limited, action-oriented access (no private memories/photos/music/full medical).

## Core requirements (static)
- Role-based access control enforced in navigation + screens (RoleGuard, ProtectedRoute, hasPermission).
- Patient: Home, Memories (+viewer), Games (+Memory Match), Relaxation (Music + Breathing), Daily Life, Settings.
- Family Caregiver PIN auth → dashboard with all 9 care sections + Calendar (view/add).
- ASHA ID+password auth → limited dashboard, cognitive report, care tasks, alerts.
- Gameplay telemetry + local adaptive-difficulty (DDA) engine; caregivers review DDA shifts.

## Implemented (2026-06)
- App shell, navigation, role-based routing, warm botanical theme + Nunito fonts.
- Backend JWT auth (register/login/me) + seeded demo accounts; verified via curl.
- Role Selection → Patient / Caregiver Mode selection.
- Patient Home (logo, identity, date, Caregiver btn, hero Play card, 4 tiles, bottom nav).
- Memories gallery (category chips) + Memory Viewer (prev/next, read-aloud placeholder).
- Games list; **Memory Match** full game with adaptive difficulty (item count, card scale, hints, helper prompt).
- Relaxation hub → Music & Sounds + full **Breathing Exercise** (inhale/hold/exhale, start/pause/stop, completion).
- Daily Life routine; Patient Settings.
- Family Caregiver PIN login (1234) → dashboard, Patient Profile, Personal/Medical Details,
  Memories (manage), Game Progress + DDA insights, Reports (daily/weekly/monthly + trend), Calendar (add event),
  Emergency Contacts (call), Alerts.
- ASHA login (ASHA001/asha123) → limited dashboard (patient card, major care issue, game progress,
  appointments, emergency call), Cognitive Report + DDA insights + disclaimer, Care Tasks, Alerts.
- RBAC guards: locked caregiver routes redirect to their login.
- Telemetry tracker (`trackRoundMetric`, `startRound`), DDA engine (`evaluateDifficulty` — unit-verified 6/6),
  DDA shift + cognitive-stress-marker persistence, caregiver DDA review view.

## Backlog / remaining
- P1: Build remaining games (Picture Pairs, Word Recall, Number Fun, Spot the Difference).
- P1: Wire Reports to real telemetry/DDA data instead of demo constants.
- P1: Audio (read-aloud for memories, relaxation music playback) — planned later per user.
- P2: AI features (memory prompts, companion) — planned later.
- P2: Persist calendar events / care tasks to backend.

## Next tasks
- Add more games reusing the telemetry + DDA pipeline.
- Replace demo report data with aggregated telemetry.
