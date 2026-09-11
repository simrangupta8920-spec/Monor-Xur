# 🌿 Monor Xur (मनोर सुर)
### *Mobile-First Cognitive Engagement, Dementia Care-Support & Clinical Telemetry Ecosystem*

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38b2ac.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Vite PWA](https://img.shields.io/badge/PWA-Offline_Ready-purple.svg?logo=pwa)](https://vite-pwa-org.netlify.app/)
[![Recharts](https://img.shields.io/badge/Recharts-3.10-22c55e.svg)](https://recharts.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFA611.svg?logo=firebase)](https://firebase.google.com/)
[![Express](https://img.shields.io/badge/Express-5.2-lightgrey.svg?logo=express)](https://expressjs.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini_3.8_Flash-orange.svg?logo=google)](https://ai.google.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933.svg?logo=node.js)](https://nodejs.org/)

---

## 📖 Table of Contents
1. [Overview & Clinical Mission](#-overview--clinical-mission)
2. [Ecosystem Architecture & System Topology](#-ecosystem-architecture--system-topology)
3. [Core Pillars & User Personas](#-core-pillars--user-personas)
4. [Clinical Dynamic Difficulty Adjustment (DDA) Engine](#-clinical-dynamic-difficulty-adjustment-dda-engine)
5. [Data Persistence & Offline-First Synchronization](#-data-persistence--offline-first-synchronization)
6. [API Reference](#-api-reference)
7. [Vector Clinical PDF Report Generator](#-vector-clinical-pdf-report-generator)
8. [Auditory & Relaxation Engineering](#-auditory--relaxation-engineering)
9. [Project Directory Structure](#-project-directory-structure)
10. [Getting Started & Local Development](#-getting-started--local-development)
11. [Production Deployment & Containerization](#-production-deployment--containerization)
12. [Accessibility & Ethical AI Principles](#-accessibility--ethical-ai-principles)

---

## 📖 Overview & Clinical Mission

**Monor Xur** (*"Tune of the Mind"*) is an offline-capable, mobile-first healthcare web application designed specifically for older adults experiencing **Mild Cognitive Impairment (MCI)** or early-stage **dementia**, their **family caregivers**, and community frontline health workers (**ASHA** – *Accredited Social Health Activists*).

In conventional dementia care, cognitive exercises often feel like tests—causing performance anxiety, agitation, and abandonment. Monor Xur reimagines this paradigm by blending:
- **Gentle Gerontological UX**: High-contrast, warm cream palette (`#FDFBF7`), deep botanical sage (`#2D3A2F`), generous negative space, large tactile targets ($\ge 48\text{px}$), and zero cognitive clutter.
- **Reminiscence Therapy**: Familiar family photos, voice journal entries, comforting regional memories, and soothing raga frequencies.
- **Invisible Adaptive Intelligence**: Dynamic Difficulty Adjustment (DDA) powered by **Google Gemini 3.8 Flash** with an offline-resilient local ML heuristic fail-safe.
- **Clinical Actionability**: Longitudinal cognitive telemetry, Recharts trend lines, and downloadable clinical PDF dossiers for doctors and neurologists.

---

## 🏛️ Ecosystem Architecture & System Topology

Monor Xur employs a dual-tiered architecture combining a client-side Progressive Web App (PWA) with a Node.js/Express full-stack companion service and dual-layer data persistence (Cloud Firestore + Local Indexed/Storage Cache).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT TIER (Progressive Web App)                       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   👵 Patient Experience            👨‍👩‍👧 Family Portal              🩺 ASHA Clinical Hub   │
│   ├── Orientation & Daily Plan     ├── 9-Section Care Dashboard   ├── Household Visit Protocol│
│   ├── Memory Match Game (DDA)      ├── Recharts Cognitive Trends  ├── Vitals & BP Entry │
│   ├── Photo Jigsaw Puzzle (DDA)    ├── Routine & Med Manager      ├── MMSE-Aligned Notes│
│   ├── Diaphragmatic Box Breathing  ├── Voice & Photo Reminiscence ├── Doctor Referrals  │
│   ├── Web Audio Soundscapes        ├── Emergency SOS Dispatch     └── Task Assignment   │
│   └── Web Speech Voice Journals    └── jsPDF Vector Report Engine                       │
│                                                                                        │
│   ──────────────────────────────────┬───────────────────────────────────────────────   │
│                                     ▼                                                  │
│   [ Service Worker & PWA Cache ]   [ Offline Mutation Queue ]    [ Web Audio Synthesizer ]
│   - Workbox cache (HTML/JS/Assets) - Queue offline reminders    - 432Hz/528Hz Solfeggio │
│   - Google Fonts CacheFirst        - Auto-flush on 'online'      - Chimes & Ripple audio │
└─────────────────────────────────────┬──────────────────────────────────────────────────┘
                                      │ HTTP / JSON REST & WebSocket Sync
                                      ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              FULL-STACK APPLICATION SERVER                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│   Node.js (v20+) + Express 5 Runtime (Port 3000)                                       │
│                                                                                        │
│   ┌───────────────────────────────┐          ┌──────────────────────────────────────┐  │
│   │     REST API Endpoints        │          │       Adaptive Difficulty Engine     │  │
│   │  • GET  /api/health           │ ───────► │  • Gemini 3.8 Flash SDK (GenAI)      │  │
│   │  • POST /api/ai/analyze-diff  │          │  • Deterministic Local ML Heuristic  │  │
│   │  • POST /api/ai/analyze-puzzle│          │  • Cognitive Fatigue & Latency Eval  │  │
│   └───────────────────────────────┘          └──────────────────────────────────────┘  │
│                   │                                              │                     │
│                   ▼                                              ▼                     │
│   ┌───────────────────────────────┐          ┌──────────────────────────────────────┐  │
│   │ Vite SPA Middleware (Dev)     │          │ Bundled Production Dist (esbuild)    │  │
│   │ Vite HMR / Static Asset Serv  │          │ Compiled CJS: dist/server.cjs        │  │
│   └───────────────────────────────┘          └──────────────────────────────────────┘  │
└─────────────────────────────────────┬──────────────────────────────────────────────────┘
                                      │
          ┌───────────────────────────┴───────────────────────────┐
          ▼                                                       ▼
┌───────────────────────────────────┐               ┌───────────────────────────────────┐
│     EXTERNAL AI INTELLIGENCE      │               │     REAL-TIME CLOUD DATABASE      │
├───────────────────────────────────┤               ├───────────────────────────────────┤
│ Google GenAI API                  │               │ Google Cloud Firestore            │
│ • Model: gemini-3.8-flash         │               │ • Collection: patients/{id}       │
│ • Structured JSON Schema Outputs  │               │ • Sub: profile, medical, memories │
│ • Cognitive latency & error eval  │               │ • Sub: reminders, calendar, alerts│
│ • Non-stigmatizing encouragement  │               │ • Sub: careTasks, ddaMetrics      │
└───────────────────────────────────┘               └───────────────────────────────────┘
```

### Detailed Layer Breakdown

| Architectural Layer | Core Technologies | Functional Responsibilities |
| :--- | :--- | :--- |
| **Presentation Layer** | React 18.3, TypeScript 5.7, Tailwind CSS 4 | Gerontological UI components, high-contrast layouts, touch optimization, role-based navigation guards. |
| **Data Visualization** | Recharts 3.10 | Engagement trend lines (`AreaChart`), latency vs. difficulty (`LineChart`), error/hint distribution (`BarChart`). |
| **PWA & Offline Layer** | Vite PWA, Workbox, Service Worker, LocalStorage | Client asset caching, offline snapshot persistence (`saveOfflineSnapshot`), queue-and-replay mutation sync. |
| **Audio & Speech Engine** | Web Audio API, Web Speech API, MediaRecorder | Synthesized frequency generators, natural soundscape mixing, real-time speech transcription for voice diaries. |
| **Application Server** | Express 5.2, `tsx`, `esbuild` | Host `/api` endpoints, proxy Google GenAI requests, serve static assets and single-page fallback in production. |
| **Cognitive Intelligence** | `@google/genai` (Gemini 3.8 Flash) | Analyzes move latency, consecutive errors, solve times, and emits non-stigmatizing adaptive instructions. |
| **Cloud Persistence** | Firebase Firestore 12.19 | Real-time bi-directional data synchronization with subcollections for clinical and daily care tracking. |
| **Export & Reporting** | jsPDF 4.2 | Multi-page, print-ready vector PDF document generator for neurologist visits and caregiver reviews. |

---

## 👥 Core Pillars & User Personas

```
                  ┌──────────────────────────────────────────────┐
                  │            MONOR XUR ECOSYSTEM               │
                  └──────────────────────┬───────────────────────┘
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         ▼                               ▼                               ▼
  👵 Patient Mode                👨‍👩‍👧 Family Portal              🩺 ASHA Clinical Hub
 • Gentle, High-Contrast UI     • Recharts DDA Trend Lines     • MMSE-Aligned Logbooks
 • Dynamic Difficulty (DDA)     • Audio Diary & Photo Gallery  • Home Visit Checklists
 • Voice Diaries (Web Speech)   • Remote Telemetry Tracking    • Cognitive Trend Reports
 • Calming Audio & Breathing    • Medication Scheduling        • Vitals & BP Logging
 • Emergency SOS & Reminders    • Cloud Firestore Live Sync    • AI Doctor Consultation Logs
```

### 1. 👵 Patient Experience (Persona: Anita Sharma, 68)
- **Visual & Temporal Orientation**: Clear, calming greeting with current date, time of day, and comforting affirmations.
- **Cognitive Stimulation Hub**:
  - **Memory Match Game**: Active paired-card recall featuring nature, daily comforts, and musical instruments.
  - **Photo Jigsaw Puzzle**: Familiar family photographs segmented into 2×2, 3×3, or 4×4 tactile grid puzzles.
- **Voice Journal & Reminiscence Gallery**:
  - **Elder-Friendly Voice Station**: Uses the browser's **Web SpeechRecognition API** for real-time speech-to-text paired with audio recording.
  - **Categorized Memories**: Family, Places, People, Special Moments, and Voice Diaries.
- **Sensory Calming Hub**:
  - **Diaphragmatic 4-4-4-4 Breathing**: Gentle visual pulsing ring guiding inhale, hold, exhale, and rest phases.
  - **Solfeggio Soundscapes**: Web Audio synthesized 432 Hz / 528 Hz ambient raga tones and natural binaural rhythms.
- **Daily Living Support**: Visual medication adherence checklists with audio announcements and one-tap emergency calling.

### 2. 👨‍👩‍👧 Family Caregiver Portal (PIN-Guarded)
- **9 Specialized Care Sections**:
  1. **Patient Profile**: Full demographics, stage of cognitive condition, language, and primary caregiver identity.
  2. **Medical Baseline**: Recorded physician consultations, allergies, current prescriptions, and specialist care guidance.
  3. **Cognitive Progress & Telemetry**: Recharts graphs analyzing session speed, error rates, and difficulty level shifts.
  4. **Vector PDF Export**: Instant download of comprehensive multi-page clinical summaries.
  5. **Routine & Medications**: Create, toggle, and manage medication times and daily routines.
  6. **Care Calendar**: Schedule doctor visits, household events, and family visits with Firestore sync.
  7. **Memories & Media Hub**: Upload family pictures, view voice journals, and play recorded audio notes.
  8. **Alert Feeds**: Real-time notifications of missed medications, low engagement, or SOS triggers.
  9. **Emergency Contacts**: Quick-dial configuration for primary doctor, caregiver, and emergency responders.

### 3. 🩺 ASHA Health Worker Portal (Passcode-Guarded)
- **Community Field Visit Protocol**: Standardized checklist covering hydration inspection, medication box audit, nutrition check, and blood pressure logging.
- **MMSE-Aligned Cognitive Progression**: Observation logs tracking patient orientation, recall speed, and agitation markers.
- **Clinical Summary Formulation**: Synthesizes longitudinal metrics into concise referral summaries for community health clinics (PHCs) and consulting neurologists.

---

## 🧠 Clinical Dynamic Difficulty Adjustment (DDA) Engine

To eliminate frustration (which induces anxiety and catastrophic reactions in dementia patients) while preventing boredom, Monor Xur implements a clinical DDA engine.

```
       ┌────────────────────────┐
       │   Active Game Event    │  (Card flip / Mismatch / Puzzle Move / Timer)
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ /api/ai/analyze-...    │
       └───────────┬────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
 ┌───────────────┐   ┌───────────────────────┐
 │ Gemini Flash  │   │ Local ML Heuristic    │
 │ 3.8 SDK       │   │ (Offline / Fallback)  │
 └───────┬───────┘   └───────────┬───────────┘
         │                       │
         └─────────┬─────────────┘
                   ▼
       ┌────────────────────────┐
       │ Structured DDA Result  │
       │ • recommendedLevel     │
       │ • triggerAutoShift     │
       │ • non-stigmatizing msg │
       │ • fatigueRisk (L/M/H)  │
       └───────────┬────────────┘
                   │
     ┌─────────────┴─────────────┐
     ▼                           ▼
[ In-Game UI Shift ]    [ Firestore ddaMetrics ]
(Gentle board resize)   (Logged for Caregivers)
```

### Game-Specific Clinical Rules

#### 🎴 Memory Match Game:
- **Strict 1-Step Downshift**:
  - *Hard (6 Pairs, Level 3)* $\rightarrow$ If patient reaches **10 total mistakes** or **4 consecutive mismatches**, auto-shifts strictly to **Medium (4 Pairs, Level 2)**. The engine never abruptly drops two levels to Easy.
  - *Medium (4 Pairs, Level 2)* $\rightarrow$ If patient reaches **5 total mistakes** or **3 consecutive mismatches**, auto-shifts to **Easy (3 Pairs, Level 1)**.
- **5-Win Streak Advancement**:
  - Winning **5 consecutive rounds** on Easy prompts advancement to Medium.
  - Winning **5 consecutive rounds** on Medium prompts advancement to Hard.
- **Dignified Language**: Shifts are framed reassuringly: *"Let's take our time on a gentle board so you can relax and enjoy matching."* (Never mentions "mistakes" or "difficulty").

#### 🧩 Photo Jigsaw Puzzle:
- **Designated Baselines**:
  - *Easy (2×2)*: 25 seconds
  - *Medium (3×3)*: 45 seconds
  - *Tough (4×4)*: 120 seconds
- **Degrade Trigger**: If solve time exceeds designated baseline by **$+25\text{ seconds}$**, the grid downshifts 1 tier.
- **Promotion Trigger**: Achieving **3 consecutive solves under baseline** promotes the player to the next grid size.

---

## 💾 Data Persistence & Offline-First Synchronization

Monor Xur is engineered for high-availability in rural and semi-urban settings with unstable internet access.

```
                  ┌────────────────────────────────┐
                  │    Patient / Caregiver UI      │
                  └───────┬────────────────┬───────┘
                          │                │
            [Online Read] │                │ [Offline Write]
                          ▼                ▼
           ┌─────────────────────┐  ┌──────────────────────────────┐
           │ Firebase Firestore  │  │ LocalStorage Mutation Queue  │
           │ (Real-Time listener)│  │ (monor_xur_offline_queue_v1) │
           └──────────────┬──────┘  └──────────────┬───────────────┘
                          │                        │
                          │   Network Reconnected  │
                          │ ◄──────────────────────┘
                          │ (Flushes queued mutations: reminders,
                          │  care tasks, profile updates)
                          ▼
           ┌────────────────────────────────┐
           │ Offline Snapshot LocalStorage  │
           │ (monor_xur_offline_cache_v1)   │
           └────────────────────────────────┘
```

### Storage Collections & Keys

1. **Cloud Firestore Collections**:
   - `patients/{patientId}`: Core demographic and care profile document.
   - `patients/{patientId}/medical/profile`: Neurologist consults, prescriptions, allergies.
   - `patients/{patientId}/memories`: Photo/video stories and transcribed voice journals.
   - `patients/{patientId}/reminders`: Scheduled medication times and routine alarms.
   - `patients/{patientId}/calendarEvents`: Medical appointments and family events.
   - `patients/{patientId}/careTasks`: ASHA and family home-care task list.
   - `patients/{patientId}/contacts`: Emergency contact network.
   - `patients/{patientId}/ddaMetrics`: Session latency, errors, and Gemini telemetry logs.

2. **Client-Side Cache & Queue**:
   - `monor_xur_offline_cache_v1`: JSON snapshot containing complete patient profile, active reminders, contacts, and calendar.
   - `monor_xur_offline_mutation_queue_v1`: FIFO queue storing pending mutations performed while offline. A global `window.addEventListener('online')` hook automatically executes and flushes these mutations upon network recovery.

---

## 📡 API Reference

The Node.js Express server (`server.ts`) exposes high-performance endpoints:

### 1. Health & Status
- **Endpoint**: `GET /api/health`
- **Response**:
  ```json
  {
    "status": "ok",
    "app": "Monor Xur",
    "aiAvailable": true
  }
  ```

### 2. Memory Match Difficulty Analysis
- **Endpoint**: `POST /api/ai/analyze-difficulty`
- **Payload**:
  ```json
  {
    "playerName": "Anita Sharma",
    "currentLevel": 3,
    "moves": 14,
    "mistakes": 10,
    "consecutiveMistakes": 4,
    "matchedPairs": 2,
    "totalPairs": 6,
    "elapsedSeconds": 62,
    "triggerEvent": "mistake",
    "consecutiveWins": 0
  }
  ```
- **Response**:
  ```json
  {
    "action": "EASE_DIFFICULTY",
    "recommendedLevel": 2,
    "triggerAutoShift": true,
    "reasoning": "Player reached threshold on Level 3 (10 mistakes, 4 consecutive). Auto-shifting 1 step to Medium (4 Pairs) to reduce cognitive load.",
    "encouragement": "You're doing wonderfully, Anita! Let's step down to a 4-pair board so you can relax and enjoy.",
    "fatigueRisk": "HIGH",
    "modelSource": "gemini-3.8-flash",
    "timestamp": 1789134567890
  }
  ```

### 3. Puzzle Difficulty Analysis
- **Endpoint**: `POST /api/ai/analyze-puzzle-difficulty`
- **Payload**:
  ```json
  {
    "playerName": "Anita Sharma",
    "currentGrid": 3,
    "timeTaken": 75,
    "previousAverageSeconds": 45,
    "designatedAverageSeconds": 45,
    "consecutiveSolves": 0,
    "triggerEvent": "round_complete"
  }
  ```
- **Response**:
  ```json
  {
    "action": "EASE_DIFFICULTY",
    "currentGrid": 3,
    "recommendedGrid": 2,
    "triggerAutoShift": true,
    "reasoning": "Solve time (75s) exceeded designated baseline (45s) by >25 seconds. Easing to 2x2 grid.",
    "encouragement": "Lovely patience, Anita. Let's play with fewer pieces so you can relax.",
    "fatigueRisk": "MODERATE",
    "modelSource": "gemini-3.8-flash",
    "timestamp": 1789134589123
  }
  ```

---

## 📄 Vector Clinical PDF Report Generator

Monor Xur includes a client-side vector document compiler powered by **jsPDF**:
- **Format**: Structured medical dossier in A4 format.
- **Sections**:
  1. **Executive Clinical Summary**: Patient demographics, stage of cognitive condition, blood group, primary physician contacts.
  2. **Longitudinal Cognitive Metrics**: Average latency, mistake frequency, hint utilization, and AI difficulty trajectory.
  3. **Physician Visit Logs**: Detailed history of neurologist consultations, clinical observations, and care instructions.
  4. **Daily Routine & Medication Adherence**: Weekly compliance breakdown and schedule.
  5. **Caregiver Field Notes**: Qualitative observations entered by family members.
  6. **Standard Geriatric Disclaimer**: Verified medical notice regarding non-diagnostic assistive technology.

---

## 🎵 Auditory & Relaxation Engineering

All audio components are built on the browser's native **Web Audio API**:
- **Tone Synthesizer**: Uses pure sine and triangle wave oscillators to generate harmonic frequencies:
  - **432 Hz**: Promotes parasympathetic nervous system activation.
  - **528 Hz**: Known in solfeggio research for stress relief and emotional calm.
  - **Raga Melodies**: Soft pentatonic intervals suited to South Asian cultural reminiscence.
- **Card Flip Chimes**: Discrete, pentatonic chime bursts ($440\text{Hz} \rightarrow 880\text{Hz}$) confirming card selections without jarring or loud transients.
- **No External Sound Assets Required**: Works completely offline without loading remote MP3 or WAV files.

---

## 📂 Project Directory Structure

```
monor-xur/
├── .env.example                          # Blueprint for required environment secrets (GEMINI_API_KEY)
├── firebase-applet-config.json           # Firebase project credentials & Firestore database ID
├── firestore.rules                       # Firestore security rules for patient & telemetry data
├── index.html                            # HTML entry point with Nunito typography & meta tags
├── metadata.json                         # Platform capabilities, frame permissions (microphone)
├── package.json                          # Dependencies, scripts, and build metadata
├── server.ts                             # Express 5 backend, Gemini 3.8 Flash SDK, Vite middleware
├── tsconfig.json                         # TypeScript strict compiler configuration
├── vite.config.ts                        # Vite bundler, Tailwind 4, and PWA Service Worker config
│
├── public/                               # PWA assets, icons, and web manifest resources
│   ├── favicon.ico
│   ├── icon.svg
│   ├── logo.jpg
│   ├── pwa-192x192.png
│   ├── pwa-512x512.png
│   └── pwa-maskable-512x512.png
│
└── src/
    ├── main.tsx                          # React DOM mount point & Service Worker registration
    ├── App.tsx                           # Root orchestrator: roles, views, and Firebase sync
    ├── index.css                         # Tailwind CSS v4 design token layer
    ├── types.ts                          # TypeScript domain models (Patient, DDA, Memory, etc.)
    │
    ├── components/
    │   ├── caregiver/                    # Family & ASHA portal views
    │   │   ├── AshaDashboard.tsx         # ASHA home visit protocol & MMSE observation logs
    │   │   ├── AshaLogin.tsx             # Passcode authentication for health workers
    │   │   ├── CaregiverSelect.tsx       # Dual-portal gateway (Family vs ASHA)
    │   │   ├── CognitiveProgressView.tsx # Recharts interactive DDA visualization
    │   │   ├── ExportPdfModal.tsx        # Vector PDF configuration modal
    │   │   ├── FamilyDashboard.tsx       # Caregiver 9-tab command dashboard
    │   │   └── FamilyLogin.tsx           # 4-digit PIN security lock
    │   │
    │   ├── common/                       # Shared design system components
    │   │   ├── BottomNav.tsx             # Role-specific tactile bottom navigation bars
    │   │   ├── DifficultyToast.tsx       # Non-stigmatizing adaptive encouragement notification
    │   │   ├── Header.tsx                # Context-aware header with time, role & SOS
    │   │   ├── OfflineIndicator.tsx      # Network status pill with pending queue count
    │   │   └── PWAInstallButton.tsx      # Native browser home-screen install prompt
    │   │
    │   ├── patient/                      # Tactile elder-friendly interfaces
    │   │   ├── AudioDiaryRecorder.tsx    # Web Speech + MediaRecorder voice journal modal
    │   │   ├── BreathingExercise.tsx     # Diaphragmatic 4-4-4-4 rhythm animation
    │   │   ├── DailyLife.tsx             # Large-target daily routine & medication tracker
    │   │   ├── GamesHub.tsx              # Cognitive stimulation selection menu
    │   │   ├── MemoriesGallery.tsx       # Reminiscence gallery with audio badges
    │   │   ├── MemoryMatchGame.tsx       # Adaptive paired-card recall game with DDA
    │   │   ├── MemoryViewer.tsx          # Fullscreen media reader with audio playback
    │   │   ├── PatientHome.tsx           # Daily orientation dashboard for Anita
    │   │   ├── PatientSettings.tsx       # Font scale, contrast, and volume preferences
    │   │   ├── PuzzleGame.tsx            # Photo jigsaw puzzle with time baseline pacing
    │   │   ├── RelaxationHub.tsx         # Calming audio & breathing gateway
    │   │   └── RelaxationMusic.tsx       # Solfeggio frequency & raga tone generator
    │   │
    │   └── setup/
    │       └── InitialSetupPage.tsx      # Onboarding configuration wizard
    │
    ├── data/
    │   └── mockData.ts                   # Initial clinical baselines, memories & contacts
    ├── hooks/
    │   ├── useOnlineStatus.ts            # Reactive online/offline navigator status hook
    │   └── usePWAInstall.ts              # PWA beforeinstallprompt handler hook
    ├── services/
    │   ├── aiDifficultyService.ts        # Client bridge to server DDA endpoints
    │   ├── firebase.ts                   # Firestore real-time listeners & CRUD operations
    │   └── offlineStorage.ts             # Snapshot cache & mutation queue manager
    └── utils/
        ├── audio.ts                      # Web Audio API harmonic sound synthesizers
        └── pdfReportGenerator.ts         # jsPDF vector clinical report compiler
```

---

## 🚀 Getting Started & Local Development

### Prerequisites
- **Node.js**: `v20.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Modern Web Browser**: Chrome, Edge, or Safari (microphone permissions enabled for voice diaries)
- **Google Gemini API Key** *(Optional - the app seamlessly falls back to the local ML heuristic if missing)*: [Get an API Key on Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/simrangupta8920-spec/Monor-Xur.git
   cd Monor-Xur
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment template:
   ```bash
   cp .env.example .env
   ```
   Provide your Gemini API key in `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Launch Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

---

## 📜 Available NPM Scripts

| Command | Action | Description |
| :--- | :--- | :--- |
| `npm run dev` | `tsx server.ts` | Boots the full-stack server on port 3000 with live Vite middleware |
| `npm run build` | `vite build && esbuild server.ts ...` | Compiles client assets into `dist/` and bundles server into `dist/server.cjs` |
| `npm start` | `node dist/server.cjs` | Runs the standalone compiled production CommonJS server |
| `npm run lint` | `tsc --noEmit` | Validates TypeScript syntax, interfaces, and strict type safety |
| `npm run preview` | `vite preview --port 3000` | Serves compiled `dist` directory locally |

---

## 🚢 Production Deployment & Containerization

### Docker Deployment
The project is built to execute cleanly in standardized container environments (such as **Google Cloud Run**):

```dockerfile
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

---

## 🛡️ Accessibility & Ethical AI Principles

1. **WCAG 2.1 AA Compliance**:
   - Contrast ratios surpass $\ge 4.5:1$ for body text and $\ge 7:1$ for large text headers.
   - Clickable touch boundaries strictly measure $\ge 48\text{px} \times 48\text{px}$ to accommodate intention tremors.
2. **Zero Involuntary Disclosures**:
   - All AI prompts are constrained to ensure clinical terms like *"dementia"*, *"cognitive decline"*, or *"mistake"* are never displayed to the patient.
   - Adaptations are positioned as relaxing choices rather than performance remedies.
3. **Privacy by Design**:
   - API secrets remain isolated on the Node.js server.
   - Voice transcriptions are executed locally in the browser via the SpeechRecognition API without external third-party data broker routing.

---

<p align="center">
  Crafted with care for <strong>Anita Sharma</strong> and families everywhere navigating memory challenges.
</p>
