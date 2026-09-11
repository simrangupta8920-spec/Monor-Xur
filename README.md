# 🌿 Monor Xur (मनोर सुर)
### *Mobile-First Cognitive Engagement & Dementia Care-Support Ecosystem*

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38b2ac.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-3.10-22c55e.svg)](https://recharts.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFA611.svg?logo=firebase)](https://firebase.google.com/)
[![Express](https://img.shields.io/badge/Express-5.2-lightgrey.svg?logo=express)](https://expressjs.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini_3.8_Flash-orange.svg?logo=google)](https://ai.google.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933.svg?logo=node.js)](https://nodejs.org/)

---

## 📖 Overview

**Monor Xur** (*"Tune of the Mind"*) is a specialized, mobile-first healthcare web application tailored for older adults experiencing mild cognitive impairment (MCI) or dementia, their family caregivers, and frontline community healthcare workers (**ASHA** – *Accredited Social Health Activists*).

Built around dignity, reminiscence therapy, and clinical pacing, Monor Xur bridges the gap between daily cognitive stimulation at home and coordinated medical tracking in community healthcare settings.

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

---

## ✨ Core Pillars & Features

### 1. 👵 Patient Experience (Persona: Anita Sharma, 68)
Designed with gerontological UX principles—high contrast, calm natural earth tones, zero cognitive friction, large touch targets (≥48px), and gentle auditory confirmation.

- **Warm Daily Orientation**: Instant orientation to time of day, date, and comforting affirmations.
- **Voice Diary & Reminiscence Therapy Gallery**:
  - **Voice Diary Recording**: Integrates the browser's **Web SpeechRecognition API** for real-time speech-to-text transcription paired with **MediaRecorder** audio capture.
  - **Elder-Friendly Voice Station**: Big tactile record controls, live waveform indicators, personalized themes (Serene Garden, Warm Sunset, Cozy Hearth), and instant audio playback.
  - **Family Memories**: Personal family photographs, videos, and cherished life stories.
- **Cognitive Stimulation Hub**:
  - **Memory Match Game**: Active paired-card recall with nature and comfort iconography.
  - **Photo Jigsaw Puzzle**: Reassemble familiar family pictures in 2×2, 3×3, or 4×4 arrangements.
- **Mindful Relaxation & Sensory Hub**:
  - **Diaphragmatic Box Breathing**: Visual pulse animation following a 4-4-4-4 rhythm for anxiety reduction.
  - **Soothing Soundscapes**: Synthesized 432 Hz / 528 Hz ambient raga tones and natural soundscapes via the Web Audio API.
- **Daily Living & Medication Support**:
  - Medication reminders with visual status chips and audio announcements.
  - Simple daily routines and one-tap emergency SOS quick-calling.

---

### 2. 🧠 Clinical Dynamic Difficulty Adjustment (DDA) Engine
To prevent both frustration (which triggers agitation in dementia) and boredom, the games implement an intelligent, clinical adaptive engine powered by **Google Gemini 3.8 Flash** with an offline-resilient **Local ML Heuristic Fail-Safe**.

#### 🎴 Memory Match DDA Rules:
- **Strict 1-Step Downshift**:
  - *Hard Mode (6 Pairs)*: If the player reaches **10 mistakes** (or 4 consecutive mismatches), difficulty auto-shifts strictly to **Medium Mode (4 Pairs)**. The engine never makes an abrupt drop straight to Easy.
  - *Medium Mode (4 Pairs)*: If the player reaches **5 mistakes** (or 3 consecutive mismatches), difficulty auto-shifts strictly to **Easy Mode (3 Pairs)**.
- **5-Win Streak Level Advancement**:
  - Winning **5 consecutive games** on Easy advances the player 1 level up to Medium.
  - Winning **5 consecutive games** on Medium advances the player 1 level up to Hard.
- **Non-Stigmatizing Voice**: All difficulty shifts are framed with warm, dignified language (e.g., *"Let's step down to a gentle board so you can relax, take your time, and enjoy"*). Never uses terms like "failure" or "mistake".

#### 🧩 Photo Puzzle DDA Rules:
- **Designated Baseline Times**:
  - *Easy (2×2)*: 25 seconds
  - *Medium (3×3)*: 45 seconds
  - *Tough (4×4)*: 120 seconds
- **Adaptive Triggers**:
  - If a player takes **>25 seconds longer than designated baseline time**, the puzzle auto-shifts 1 grid size lower.
  - If a player achieves **3 consecutive solves under baseline time**, the puzzle unlocks the next grid tier.

---

### 3. 👨‍👩‍👧 Family Caregiver Portal
- **📈 Recharts DDA Cognitive Progress Visualizer**:
  - Dedicated **Progress** tab featuring interactive charts powered by **Recharts**:
    - **Cognitive Engagement Trend Line** (`AreaChart`): Gradient area trend tracking patient engagement score over time with a 75% target baseline reference line.
    - **Speed & Difficulty Trajectory** (`LineChart`): Dual-axis tracking of decision latency (in seconds) against adaptive difficulty levels (1 to 5).
    - **Mistakes & Hint Distribution** (`BarChart`): Error rate versus hint dependency monitoring.
    - **Live Telemetry Rationale**: Transparent clinical breakdown explaining each difficulty adjustment made by the Gemini DDA engine.
- **📄 Downloadable Clinical & Progress PDF Summary**:
  - One-click vector PDF generation powered by **jsPDF** for medical consultations, ASHA reviews, and family records.
  - Configurable sections:
    - **Patient Profile & Clinical Baseline**: Full demographics, blood group, diagnosis, caregiver and emergency contacts.
    - **Cognitive Engagement Trends & DDA Telemetry**: KPI summary cards, session-by-session speed and error log table, and AI adaptive rationales.
    - **Medical Concerns & Doctor Consultations**: Primary medical concerns, physician care guidance, and complete visit history.
    - **Daily Routine & Medication Adherence**: Scheduled tasks with compliance percentages.
    - **Caregiver Observations**: Custom notes written by caregivers included directly in the report.
    - **Standard Clinical Healthcare Disclaimer & Page Numbering**.
- **🎙️ Media & Audio Diary Manager**:
  - View and listen to patient voice diaries, upload celebration videos and photos, and filter items by Photo, Video, or Voice Diary.
- **Routine & Calendar Management**:
  - Configure medication times, doctor visits, and daily hydration reminders with real-time cloud synchronization.
- **Safety Logs & Alert Feeds**:
  - Instant visibility into emergency SOS triggers, missed reminders, and patient check-ins.

---

### 4. 🩺 ASHA Health Worker Portal
- **Clinical Cognitive Progression**: Longitudinal charts tracking cognitive latency, mistake frequency, and fatigue risks across days and weeks.
- **Community Home Visits**: Step-by-step visit checklists (hydration check, medication verification, blood pressure & vitals logging).
- **AI Visit Summary Generator**: Synthesizes patient interaction logs into concise clinical reports for consulting doctors and neurologists.

---

### 5. ☁️ Real-Time Cloud Persistence (Firebase Firestore)
- Resilient cloud database synchronization for:
  - Patient & Medical Profiles
  - Calendar Events & Appointments
  - Reminders & Care Tasks
  - Safety Alerts & SOS Logs
  - Emergency Contacts
  - Reminiscence Memories & Voice Diaries
  - DDA Game Telemetry & Historical Metrics

---

## 🛠️ Architecture & Tech Stack

```
monor-xur/
├── server.ts                             # Express 5 backend with Vite SSR/SPA middleware
├── src/
│   ├── main.tsx                          # Application mount point
│   ├── App.tsx                           # Role management (Patient, Family, ASHA) & state sync
│   ├── index.css                         # Tailwind CSS 4 design token foundation
│   ├── types.ts                          # TypeScript interfaces for clinical data & DDA metrics
│   ├── components/
│   │   ├── patient/
│   │   │   ├── AudioDiaryRecorder.tsx   # SpeechRecognition + MediaRecorder voice journal modal
│   │   │   ├── MemoriesGallery.tsx      # Reminiscence gallery with audio diary badges
│   │   │   ├── MemoryViewer.tsx         # Media viewer with audio playback controls
│   │   │   ├── MemoryMatchGame.tsx      # Adaptive paired-card recall game with DDA
│   │   │   ├── PuzzleGame.tsx           # Reminiscence photo jigsaw with DDA
│   │   │   └── RelaxationHub.tsx        # 4-4-4-4 diaphragmatic breathing & soundscapes
│   │   ├── caregiver/
│   │   │   ├── CognitiveProgressView.tsx # Recharts DDA visualizer & engagement trend lines
│   │   │   ├── FamilyDashboard.tsx       # Caregiver hub, routines, media & progress
│   │   │   └── AshaDashboard.tsx         # Community health worker clinical portal
│   │   └── common/                       # Navigation (BottomNav), headers, DDA notifications
│   ├── data/
│   │   └── mockData.ts                   # Clinical baseline profiles, reminders, emergency contacts
│   ├── services/
│   │   ├── aiService.ts                  # Client bridge to /api/ai endpoints
│   │   └── firebase.ts                   # Firestore real-time listeners & persistence operations
│   └── utils/
│       ├── audio.ts                      # Synthesized Web Audio chimes & solfeggio frequencies
│       └── pdfReportGenerator.ts         # Vector PDF report compiler for medical & DDA progress
```

### Technology Highlights:
- **Frontend**: [React 18](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Data Visualization**: [Recharts 3.10](https://recharts.org/) (Interactive area charts, dual-axis line charts, bar distribution)
- **PDF Report Generation**: [jsPDF](https://github.com/parallax/jsPDF) (Vector PDF document creation with formatted tables, KPIs, and multi-page layout)
- **Voice Journaling**: Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) + HTML5 `MediaRecorder`
- **Cloud Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore) (Live snapshot listeners, subdocument collections)
- **Backend & Middleware**: [Express 5](https://expressjs.com/) with Node.js runtime, bundled via [esbuild](https://esbuild.github.io/)
- **Generative AI**: [@google/genai](https://www.npmjs.com/package/@google/genai) (`gemini-3.8-flash` with structured JSON schema responses)
- **Audio Engine**: Web Audio API (real-time harmonic synthesizers for relaxing frequencies at 396 Hz, 528 Hz, and binaural rhythms)
- **Icons & Visuals**: [Lucide React](https://lucide.dev/), Canvas Confetti

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Modern Web Browser**: Chrome, Edge, or Safari with microphone permissions enabled for voice diaries.
- **Google Gemini API Key** *(Optional for local heuristic fallback, required for live Gemini intelligence)*: [Get an API Key](https://aistudio.google.com/)

---

### Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/monor-xur.git
   cd monor-xur
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory (based on `.env.example`):
   ```bash
   cp .env.example .env
   ```

   Add your configuration:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   > *Note: If no API key is provided, Monor Xur automatically falls back to its built-in offline Cognitive ML Heuristic engine without crashing.*

4. **Run in Development Mode**:
   ```bash
   npm run dev
   ```
   Open your browser at: `http://localhost:3000`

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Boots the full-stack server using `tsx server.ts` on port 3000 |
| `npm run build` | Builds client static assets via `vite build` and bundles `server.ts` into `dist/server.cjs` |
| `npm start` | Runs the compiled production server (`node dist/server.cjs`) |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run preview` | Previews the production build locally on port 3000 |

---

## 🔒 Safety, Privacy & Accessibility

1. **Zero Data Leakage**: Sensitive API keys remain strictly on the backend (`server.ts`) and are never exposed to client-side bundles.
2. **Offline-Resilient Intelligence**: In rural or offline connectivity scenarios (common for ASHA field workers), the app gracefully switches to deterministic heuristic evaluation algorithms.
3. **Accessibility (WCAG 2.1 AA Compliance)**:
   - High color contrast ratios (≥4.5:1 for standard text, ≥7:1 for headers).
   - Large clickable touch targets (≥48×48px) for older hands with tremors or reduced motor control.
   - Auditory feedback options for every critical screen interaction.
   - Microphone permission declarations in `metadata.json` for secure browser speech recognition.
4. **Non-Stigmatizing Clinical Design**: The UI deliberately avoids medicalized alert colors, clinical jargon, or alarmist failure prompts.

---

## 🤝 Contributing

Contributions are welcome! If you are a healthcare professional, developer, or caregiver interested in improving dementia care:

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/CognitiveActivity`).
3. Commit your Changes (`git commit -m 'Add new cognitive exercise'`).
4. Push to the Branch (`git push origin feature/CognitiveActivity`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  Crafted with care for <strong>Anita</strong> and families everywhere coping with memory challenges.
</p>
