import { Memory, CalendarEvent, Reminder, CareTask, AlertItem, EmergencyContact, PatientProfile, MedicalProfile } from '../types';

export const INITIAL_PATIENT_PROFILE: PatientProfile = {
  name: "Anita",
  fullName: "Anita Sharma",
  age: 68,
  gender: "Female",
  region: "Pune, Maharashtra",
  language: "Marathi, Hindi",
  bloodGroup: "B+",
  about: "Loves gardening, old film songs, and spending time with her grandchildren.",
  majorCareIssue: "Memory-related cognitive difficulty",
  avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
};

export const PATIENT = INITIAL_PATIENT_PROFILE;

export const INITIAL_MEDICAL_PROFILE: MedicalProfile = {
  concerns: ["Mild memory loss", "High blood pressure", "Occasional disorientation"],
  consultations: [
    { id: "c1", doctor: "Dr. Meera Rao", specialty: "Neurologist", date: "12 May 2026", notes: "Stable. Continue cognitive activities daily." },
    { id: "c2", doctor: "Dr. Anil Kulkarni", specialty: "Physician", date: "28 Apr 2026", notes: "BP under control with daily medication." },
  ],
  careInfo: "Daily memory games recommended. Gentle reminders for medication at 9:00 AM and 8:00 PM.",
};

export const MEDICAL = INITIAL_MEDICAL_PROFILE;

export const PERSONAL_DETAILS = [
  { label: "Full name", value: "Anita Sharma" },
  { label: "Age", value: "68 years" },
  { label: "Gender", value: "Female" },
  { label: "Region", value: "Pune, Maharashtra" },
  { label: "Languages", value: "Marathi, Hindi" },
  { label: "Blood group", value: "B+" },
];

export const INITIAL_MEMORIES: Memory[] = [
  {
    id: "m1",
    title: "Family Picnic",
    person: "Everyone together",
    category: "Family",
    mediaType: "photo",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
    description: "A sunny afternoon in the park. Sandwiches, laughter, and a big colorful blanket on the soft green grass.",
  },
  {
    id: "m2",
    title: "Family Celebration & Greetings",
    person: "At home with grandkids",
    category: "Family",
    mediaType: "video",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    description: "Heartwarming home video of the whole family laughing together, sending warm love and blessings.",
  },
  {
    id: "m3",
    title: "Granddaughter Meera",
    person: "Little Meera",
    category: "People",
    mediaType: "photo",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
    description: "Your sweet granddaughter Meera, always full of delightful giggles, songs, and gentle hugs.",
  },
  {
    id: "m4",
    title: "Old Friends",
    person: "Ravi & Lakshmi",
    category: "People",
    image: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&w=900&q=80",
    description: "Dear lifelong friends from the neighbourhood whom you have shared tea and cherished memories with for over 30 years.",
  },
  {
    id: "m5",
    title: "Home Garden",
    person: "Your balcony garden",
    category: "Places",
    image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80",
    description: "The blooming garden you lovingly tend to, filled with jasmine, tulsi leaves, and gentle morning sunlight.",
  },
  {
    id: "m6",
    title: "My Village",
    person: "Hometown",
    category: "Places",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80",
    description: "The open green fields and quiet shaded paths of the peaceful village where you grew up.",
  },
  {
    id: "m7",
    title: "Wedding Day",
    person: "A joyful milestone",
    category: "Special Moments",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
    description: "A joyful celebration surrounded by fragrant marigolds, festive music, and cherished family blessings.",
  },
  {
    id: "m8",
    title: "Festival Lights",
    person: "Diwali evening",
    category: "Special Moments",
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80",
    description: "Warm glowing clay lamps (diyas) and bright lights decorating your home on a peaceful festival night.",
  },
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: "e1", title: "Morning walk in park", type: "routine", time: "7:30 AM", date: "Today" },
  { id: "e2", title: "Dr. Rao check-up", type: "doctor", time: "11:00 AM", date: "Today" },
  { id: "e3", title: "Grandchildren visit", type: "family", time: "5:00 PM", date: "Today" },
  { id: "e4", title: "Evening medicine (BP)", type: "routine", time: "8:00 PM", date: "Today" },
  { id: "e5", title: "Physiotherapy session", type: "appointment", time: "10:00 AM", date: "Tomorrow" },
  { id: "e6", title: "Neighbourhood Bhajan", type: "event", time: "6:00 PM", date: "24 Jun" },
];

export const INITIAL_REMINDERS: Reminder[] = [
  { id: "r1", title: "Morning BP Tablet (Amlodipine 5mg)", type: "medicine", time_label: "9:00 AM", minutes: 540, note: "Take with half glass of water after light breakfast", completed: true },
  { id: "r2", title: "Gentle Stretching & Breathing", type: "routine", time_label: "10:30 AM", minutes: 630, note: "5 minutes sitting exercise in balcony", completed: true },
  { id: "r3", title: "Afternoon Hydration & Fruit Snack", type: "routine", time_label: "3:30 PM", minutes: 930, note: "Drink warm water and fresh seasonal papaya", completed: false },
  { id: "r4", title: "Evening BP & Multivitamin", type: "medicine", time_label: "8:00 PM", minutes: 1200, note: "Take after dinner", completed: false },
];

export const INITIAL_CARE_TASKS: CareTask[] = [
  { id: "t1", title: "Follow-up home visit & BP check", done: false },
  { id: "t2", title: "Encourage cognitive memory game activity", done: true },
  { id: "t3", title: "Check routine medication adherence", done: false },
  { id: "t4", title: "Review recent DDA cognitive stress markers", done: false },
];

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { id: "c1", name: "Rahul Sharma", relationship: "Son", phone: "+91 98200 12345" },
  { id: "c2", name: "Meera Sharma", relationship: "Daughter-in-law", phone: "+91 98200 67890" },
  { id: "c3", name: "Dr. Meera Rao", relationship: "Neurologist (City Clinic)", phone: "+91 20 2555 1234" },
];

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: "al1",
    kind: "missed_routine",
    title: "Missed routine",
    description: "Evening medicine reminder was not acknowledged yesterday.",
    time: "Yesterday, 8:00 PM",
    acknowledged: false,
  },
  {
    id: "al2",
    kind: "low_engagement",
    title: "Low game engagement",
    description: "Only 1 game session logged on Thursday. Encourage gentle play.",
    time: "Thursday",
    acknowledged: false,
  },
  {
    id: "al3",
    kind: "upcoming_appointment",
    title: "Upcoming appointment",
    description: "Dr. Rao routine neurology check-up scheduled today at 11:00 AM.",
    time: "Today, 11:00 AM",
    acknowledged: false,
  },
];

export const GAME_PROGRESS = {
  gamesThisWeek: 9,
  sessions: 12,
  accuracy: 78,
  frequency: "5 days / week",
  weekly: [
    { label: "Mon", value: 3 },
    { label: "Tue", value: 2 },
    { label: "Wed", value: 4 },
    { label: "Thu", value: 1 },
    { label: "Fri", value: 3 },
    { label: "Sat", value: 2 },
    { label: "Sun", value: 0 },
  ],
  recent: [
    { game: "Memory Match", score: "8 / 10", date: "Today", level: "Medium (Adaptive)" },
    { game: "Picture Pairs", score: "7 / 10", date: "Yesterday", level: "Easy" },
    { game: "Word Recall", score: "6 / 10", date: "2 days ago", level: "Medium" },
    { game: "Number Fun", score: "9 / 10", date: "3 days ago", level: "Easy" },
  ],
};

export const REPORTS = {
  daily: GAME_PROGRESS.weekly,
};

export const REPORT_SUMMARY = {
  period: "This week",
  totalSessions: 12,
  avgAccuracy: 78,
  bestGame: "Memory Match",
  engagement: "Good",
  note: "Anita has stayed active this week with steady accuracy. Cognitive engagement is healthy.",
};

export const MEDICAL_DISCLAIMER =
  "Monor Xur activity results describe engagement within the application and are not a clinical medical diagnosis.";
