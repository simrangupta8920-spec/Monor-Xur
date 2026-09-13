export type AppRole = 
  | 'setup'
  | 'patient' 
  | 'caregiver_select' 
  | 'family_login' 
  | 'asha_login' 
  | 'family' 
  | 'asha';

export type PatientTab = 'home' | 'medicines' | 'memories' | 'settings' | 'play';

export type PlayMode = 'default' | 'personalized';

export type PatientSubView = 
  | 'none' 
  | 'medicines'
  | 'relaxation' 
  | 'breathing' 
  | 'music' 
  | 'daily_life' 
  | 'memory_viewer' 
  | 'memory_match' 
  | 'puzzle';

export type FamilyCaregiverTab = 
  | 'home' 
  | 'insights'
  | 'progress'
  | 'calendar' 
  | 'alerts' 
  | 'profile' 
  | 'reports' 
  | 'emergency' 
  | 'medical' 
  | 'memories' 
  | 'game_progress'
  | 'reminders';

export type AshaTab = 'home' | 'report' | 'tasks' | 'alerts';

export type MemoryCategory = 'All' | 'Family' | 'People' | 'Places' | 'Special Moments' | 'Voice Diary';

export interface Memory {
  id: string;
  title: string;
  person?: string;
  category: MemoryCategory;
  image: string;
  mediaType?: 'photo' | 'video' | 'audio';
  audioUrl?: string;
  videoUrl?: string;
  description: string;
  date?: string;
  isVoiceDiary?: boolean;
  createdAt?: string;
  // Voice Reminiscence audio recorded in caregiver's own voice
  voiceSnippet?: string; // Data URL or audio link
  voiceSnippetDuration?: number; // Duration in seconds (up to 15s)
  voiceRecordedBy?: string; // Caregiver relation or name (e.g. "Daughter Priya")
  voicePromptText?: string; // Transcript / prompt e.g. "Papa, this was Rohan's wedding in Jaipur, 2019"
}

export interface CaregiverAccount {
  name: string;
  relationship: string;
  phone: string;
  pin: string; // 4-digit security PIN set by caregiver
  email?: string;
  isPrimary?: boolean;
  avatar?: string;
}

export interface AshaAccount {
  workerId: string;
  name: string;
  phone: string;
  subCentre: string;
  passcode: string;
}

export interface GameDifficultyLevels {
  memory_match?: number; // 1 (Easy 3 pairs), 2 (Medium 4 pairs), 3 (Hard 6 pairs)
  puzzle?: number;       // 2 (Easy 2x2), 3 (Medium 3x3), 4 (Tough 4x4)
  [gameKey: string]: number | undefined;
}

export interface PatientProfile {
  name: string;
  fullName: string;
  age: number;
  gender: string;
  region: string;
  language: string;
  bloodGroup: string;
  about: string;
  majorCareIssue: string;
  avatar: string;
  caregiver?: CaregiverAccount;
  asha?: AshaAccount;
  isConfigured?: boolean;
  // Security, Consent & DPDP Act 2023 Compliance
  consentGiven?: boolean;
  consentDate?: string;
  assignedCaregiverUid?: string;
  assignedAshaUid?: string;
  authorizedUids?: string[];
  // Dynamic Game Difficulty Progression (persists across sessions & devices)
  gameDifficultyLevel?: number; // Primary/general difficulty (1: Easy, 2: Medium, 3: Hard)
  gameDifficultyLevels?: GameDifficultyLevels; // Specific game difficulty level mapping
  singleFocusMode?: boolean; // Ultra-Simple single recommendation home screen for elderly
  sundowningAutomationEnabled?: boolean; // Automatically dim to warm amber and soften chimes from 4:30 PM to 7:30 PM
  sundowningManualOverride?: boolean; // Manual test/force toggle for twilight calming
  gameStreaks?: Record<string, number>; // Win streaks or solve streaks per game tier
  lastGameSessionTimestamp?: number; // Timestamp of latest gameplay session
  updatedAt?: string;
}

export type AuditAction = 
  | 'viewed_patient'
  | 'updated_patient_profile'
  | 'viewed_medical_profile'
  | 'updated_medical_profile'
  | 'viewed_reminders'
  | 'updated_reminder'
  | 'added_reminder'
  | 'deleted_reminder'
  | 'toggled_reminder'
  | 'viewed_care_tasks'
  | 'completed_task'
  | 'updated_care_task'
  | 'exported_pdf'
  | 'viewed_memories'
  | 'added_memory'
  | 'deleted_memory'
  | 'viewed_dda_progress'
  | 'logged_in'
  | 'consent_granted';

export interface AuditLog {
  id?: string;
  action: AuditAction | string;
  actorRole: 'family' | 'asha' | 'patient' | 'system' | 'caregiver';
  actorName: string;
  actorId?: string;
  details?: string;
  timestamp: string;
}

export interface MedicalConsultation {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  notes: string;
}

export interface MedicalProfile {
  concerns: string[];
  consultations: MedicalConsultation[];
  careInfo: string;
  stage?: string;
  prescriptions?: string[];
  allergies?: string[];
  doctorName?: string;
  doctorPhone?: string;
  notes?: string;
  lastVisit?: string;
  // Cognitive & Game difficulty progress tracking
  cognitiveDifficultyLevel?: number;
  gameDifficultyLevels?: GameDifficultyLevels;
  lastCognitiveAssessment?: string;
  updatedAt?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'appointment' | 'routine' | 'event' | 'doctor' | 'family';
  time: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Reminder {
  id: string;
  title: string;
  type: 'medicine' | 'routine';
  time_label: string;
  minutes: number;
  note?: string;
  completed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CareTask {
  id: string;
  title: string;
  done: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AlertItem {
  id: string;
  kind: 'missed_routine' | 'low_engagement' | 'upcoming_appointment';
  title: string;
  description: string;
  time: string;
  acknowledged?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AIAnalysisResult {
  action: 'EASE_DIFFICULTY' | 'MAINTAIN' | 'INCREASE_DIFFICULTY';
  recommendedLevel: number;
  triggerAutoShift: boolean;
  reasoning: string;
  encouragement: string;
  fatigueRisk: 'LOW' | 'MODERATE' | 'HIGH';
  modelSource: 'gemini-3.8-flash' | 'adaptive-ml-heuristic';
  timestamp: number;
}

export interface DDAMetric {
  timestamp: number;
  roundNumber: number;
  difficultyLevel: number;
  latencyMs: number;
  mistakes: number;
  moves: number;
  hintsUsed: number;
  adaptiveAction: 'maintained' | 'eased' | 'increased';
  aiReasoning?: string;
  aiModel?: string;
  fatigueRisk?: 'LOW' | 'MODERATE' | 'HIGH';
  gameType?: 'memory_match' | 'puzzle' | string;
  gameTitle?: string;
}
