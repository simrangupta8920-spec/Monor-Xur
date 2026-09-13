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

export const INITIAL_REMINDERS: Reminder[] = [
  {
    id: 'rem_med_morning',
    title: 'Morning Memory Support (Donepezil 5mg)',
    type: 'medicine',
    time_label: '08:30 AM',
    minutes: 510,
    note: 'Take after breakfast with half a glass of warm water',
    completed: false,
  },
  {
    id: 'rem_med_afternoon',
    title: 'Afternoon Multivitamin & Hydration',
    type: 'medicine',
    time_label: '01:30 PM',
    minutes: 810,
    note: 'Take with midday meal and fresh water',
    completed: false,
  },
  {
    id: 'rem_med_evening',
    title: 'Evening Blood Pressure Care (Amlodipine 5mg)',
    type: 'medicine',
    time_label: '08:00 PM',
    minutes: 1200,
    note: 'Take before dinner as prescribed by family physician',
    completed: false,
  },
];

export const INITIAL_CARE_TASKS: CareTask[] = [];

export const EMERGENCY_CONTACTS: EmergencyContact[] = [];

export const INITIAL_ALERTS: AlertItem[] = [];

export const MEDICAL_DISCLAIMER =
  "Monor Xur activity results describe engagement within the application and are not a clinical medical diagnosis.";
