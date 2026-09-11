export type AppRole = 
  | 'setup'
  | 'patient' 
  | 'caregiver_select' 
  | 'family_login' 
  | 'asha_login' 
  | 'family' 
  | 'asha';

export type PatientTab = 'home' | 'play' | 'memories' | 'settings';

export type PatientSubView = 
  | 'none' 
  | 'relaxation' 
  | 'breathing' 
  | 'music' 
  | 'daily_life' 
  | 'memory_viewer' 
  | 'memory_match' 
  | 'puzzle';

export type FamilyCaregiverTab = 
  | 'home' 
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
}

export interface CaregiverAccount {
  name: string;
  relationship: string;
  phone: string;
  pin: string; // 4-digit security PIN set by caregiver
  email?: string;
  isPrimary?: boolean;
}

export interface AshaAccount {
  workerId: string;
  name: string;
  phone: string;
  subCentre: string;
  passcode: string;
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
}
