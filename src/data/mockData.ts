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

export const MEDICAL_DISCLAIMER =
  "Monor Xur activity results describe engagement within the application and are not a clinical medical diagnosis.";
