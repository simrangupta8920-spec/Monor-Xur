# Monor Xur — Product Requirements & System Architecture Document

## 1. Problem Statement & Clinical Objective
Monor Xur (*"Tune of the Mind"*) is a mobile-first cognitive engagement, dementia care-support, and community telemetry ecosystem designed for:
1. **Older Adults (Primary Persona: Anita Sharma, 68):** Experiencing mild cognitive impairment (MCI) or early dementia. Needs a soothing, non-stigmatizing, high-contrast, tactile interface with zero cognitive friction.
2. **Family Caregivers:** Need remote visibility into daily cognitive state, longitudinal DDA trends, medication compliance, memories/voice diaries, and physician-ready PDF reports.
3. **Frontline Community Health Workers (ASHA):** Need streamlined home visit protocols, vitals/BP tracking, MMSE-aligned cognitive observation logs, and referral summaries for primary healthcare centers (PHCs).

---

## 2. System Architecture & Topology

### 2.1 Technology Stack
- **Frontend Presentation:** React 18.3, TypeScript 5.7, Tailwind CSS v4, Lucide React, Canvas Confetti.
- **Data Visualization:** Recharts 3.10 (AreaChart, LineChart, BarChart for cognitive telemetry).
- **Report Generation:** jsPDF 4.2 (Vector clinical PDF progress reports).
- **Audio & Speech:** Native Web Audio API (sine/triangle harmonic frequency synthesizers at 432Hz/528Hz, raga pentatonics), Web Speech API (`SpeechRecognition`), and HTML5 `MediaRecorder`.
- **Application Server:** Express 5.2 on Node.js (Port 3000), Vite development middleware (`middlewareMode: true`), bundled production via `esbuild` (`dist/server.cjs`).
- **Cognitive Adaptive Intelligence:** Google Gemini 3.8 Flash (`@google/genai`) with fallback to local ML heuristic evaluators.
- **Persistence & Cloud Sync:** Firebase Cloud Firestore (real-time snapshot subscriptions) with dual-layer offline persistence (`localStorage` snapshot cache and mutation queue).
- **PWA & Offline Resilience:** Vite PWA (`vite-plugin-pwa`), Workbox service worker caching for static assets, manifest, and Google Fonts.

### 2.2 System Topology
```
[ Client PWA: React 18 + Tailwind 4 + Web Audio + Web Speech ]
        │
        ├── Local Storage Cache (Offline Snapshot & FIFO Mutation Queue)
        ├── Service Worker (Workbox static caching & offline runtime)
        │
        ▼ (HTTP REST & Real-time Subscriptions)
[ Full-Stack Server: Express 5 + Node.js 20+ (Port 3000) ]
        │
        ├── GET  /api/health
        ├── POST /api/ai/analyze-difficulty
        └── POST /api/ai/analyze-puzzle-difficulty
        │
        ├─────────────────────────────┬─────────────────────────────┐
        ▼                             ▼                             ▼
[ Google Gemini 3.8 Flash ]   [ Local ML Heuristic ]   [ Google Cloud Firestore ]
  (GenAI Structured JSON)      (Deterministic Fallback)   (Real-Time Subcollections)
```

---

## 3. Core Modules & Stakeholder Workflows

### 3.1 Patient Module
- **Daily Orientation:** Date, time of day greeting, daily affirmations.
- **Cognitive Stimulation:**
  - *Memory Match Game:* Paired-card recall with nature & comfort iconography.
  - *Photo Jigsaw Puzzle:* 2×2, 3×3, 4×4 grid puzzles with designated baseline pacing.
- **Reminiscence Therapy:**
  - *Voice Journal:* Web Speech-to-text recording with tactile waveform and playback.
  - *Photo & Story Gallery:* Family moments and categorized memories.
- **Relaxation & Sensory Calming:**
  - *Diaphragmatic Breathing:* 4-4-4-4 rhythm visual pacing.
  - *Solfeggio Soundscapes:* Synthesized 432 Hz / 528 Hz tones.
- **Daily Life Support:**
  - Medication schedule with visual status chips.
  - 1-tap SOS emergency calling simulation.

### 3.2 Family Caregiver Module (PIN: 1234)
- 9 specialized care tabs:
  1. Patient Profile
  2. Medical Baseline & Prescriptions
  3. Cognitive Progress (Recharts Area/Line/Bar charts)
  4. Vector PDF Export (jsPDF)
  5. Medication & Daily Routines
  6. Calendar Events & Appointments
  7. Reminiscence Media & Voice Diary Manager
  8. Safety & Missed Medication Alerts
  9. Emergency Contact Network

### 3.3 ASHA Health Worker Module (ASHA001 / asha123)
- Household visit inspection checklist (hydration, medication, nutrition, blood pressure).
- MMSE-aligned cognitive observation logs.
- Clinical summaries for primary care physicians.
- Care task dispatch.

---

## 4. Clinical Dynamic Difficulty Adjustment (DDA) Rules

### 4.1 Memory Match DDA
- **Strict 1-Step Downshift:**
  - Level 3 (Hard, 6 Pairs) $\rightarrow$ Eases strictly to Level 2 (Medium, 4 Pairs) upon $\ge 10$ mistakes or $\ge 4$ consecutive mismatches.
  - Level 2 (Medium, 4 Pairs) $\rightarrow$ Eases to Level 1 (Easy, 3 Pairs) upon $\ge 5$ mistakes or $\ge 3$ consecutive mismatches.
- **5-Win Streak Level Advancement:**
  - 5 consecutive wins on Easy $\rightarrow$ advances to Medium.
  - 5 consecutive wins on Medium $\rightarrow$ advances to Hard.
- **Tone:** Non-stigmatizing, reassuring ("Let's take our time on a gentle board").

### 4.2 Photo Puzzle DDA
- **Baselines:** Easy (25s), Medium (45s), Tough (120s).
- **Downshift:** Time taken $> \text{baseline} + 25\text{s}$ downshifts grid by 1 size.
- **Promotion:** 3 consecutive solves under baseline unlocks next grid tier.

---

## 5. Offline-First Resilience Strategy
- **Client Cache:** `monor_xur_offline_cache_v1` preserves core patient demographics, active reminders, calendar events, and contacts.
- **Mutation Queue:** `monor_xur_offline_mutation_queue_v1` queues offline interactions (e.g. marked medication, completed care tasks).
- **Auto-Flush:** Resumes queue processing immediately when `window.addEventListener('online')` triggers.
