import { Memory, CalendarEvent, Reminder, CareTask, AlertItem, EmergencyContact, PatientProfile, MedicalProfile } from '../types';

export const INITIAL_PATIENT_PROFILE: PatientProfile = {
  name: "",
  fullName: "",
  age: 0,
  gender: "",
  region: "",
  language: "",
  bloodGroup: "",
  about: "",
  majorCareIssue: "",
  avatar: "",
};

export const PATIENT = INITIAL_PATIENT_PROFILE;

export const INITIAL_MEDICAL_PROFILE: MedicalProfile = {
  concerns: [],
  consultations: [],
  careInfo: "",
};

export const MEDICAL = INITIAL_MEDICAL_PROFILE;

export const PERSONAL_DETAILS = [
  { label: "Full name", value: "" },
  { label: "Age", value: "" },
  { label: "Gender", value: "" },
  { label: "Region", value: "" },
  { label: "Languages", value: "" },
  { label: "Blood group", value: "" },
];

export const INITIAL_MEMORIES: Memory[] = [];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [];

export const INITIAL_REMINDERS: Reminder[] = [];

export const INITIAL_CARE_TASKS: CareTask[] = [];

export const EMERGENCY_CONTACTS: EmergencyContact[] = [];

export const INITIAL_ALERTS: AlertItem[] = [];

export const GAME_PROGRESS = {
  gamesThisWeek: 0,
  sessions: 0,
  accuracy: 0,
  frequency: "0 days / week",
  weekly: [
    { label: "Mon", value: 0 },
    { label: "Tue", value: 0 },
    { label: "Wed", value: 0 },
    { label: "Thu", value: 0 },
    { label: "Fri", value: 0 },
    { label: "Sat", value: 0 },
    { label: "Sun", value: 0 },
  ],
  recent: [],
};

export const REPORTS = {
  daily: GAME_PROGRESS.weekly,
};

export const REPORT_SUMMARY = {
  period: "Current",
  totalSessions: 0,
  avgAccuracy: 0,
  bestGame: "Memory Match",
  engagement: "Getting Started",
  note: "Log game sessions to generate personalized clinical reports.",
};

export const MEDICAL_DISCLAIMER =
  "Monor Xur activity results describe engagement within the application and are not a clinical medical diagnosis.";
