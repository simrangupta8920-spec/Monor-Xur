import { Memory, MemoryCategory, CalendarEvent, Reminder, CareTask, AlertItem, EmergencyContact, PatientProfile, MedicalProfile } from '../types';

export const SAMPLE_MEDIA_PRESETS = [
  {
    type: 'photo' as const,
    label: 'Family Wedding + Voice Reminiscence (Priya)',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
    title: "Rohan's Wedding in Jaipur",
    person: 'Daughter Priya & Family',
    category: 'Special Moments' as MemoryCategory,
    desc: 'Papa and Priya smiling happily under the floral canopy at Rohan’s wedding in Jaipur, 2019.',
    voicePromptText: "Papa, this was Rohan's wedding in Jaipur, 2019. You danced so happily with all of us and we shared sweets!",
    voiceDuration: 14,
    voiceRecordedBy: 'Daughter Priya',
  },
  {
    type: 'video' as const,
    label: 'Family Celebration Video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    title: 'Grandkids Singing & Dancing',
    person: 'Meera & Kabir',
    category: 'Family' as MemoryCategory,
    desc: 'Lively home video of grandchildren singing joyful songs in the living room.',
  },
  {
    type: 'video' as const,
    label: 'Garden Butterflies Video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    title: 'Morning Garden Butterflies',
    person: 'Home Garden',
    category: 'Places' as MemoryCategory,
    desc: 'A calm, sunny morning recording of the garden flowers and gentle breeze.',
  },
  {
    type: 'photo' as const,
    label: 'Family Festival Photo',
    url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80',
    title: 'Diwali Gathering at Home',
    person: 'Whole Family',
    category: 'Special Moments' as MemoryCategory,
    desc: 'The entire family dressed in traditional festive attire sharing sweets and smiles.',
  },
];

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
