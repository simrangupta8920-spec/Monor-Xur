// Demo data for caregiver / ASHA dashboards (prototype). Patient: Anita.

export const PATIENT = {
  name: "Anita",
  fullName: "Anita Sharma",
  age: 68,
  gender: "Female",
  region: "Pune, Maharashtra",
  language: "Marathi, Hindi",
  bloodGroup: "B+",
  about: "Loves gardening, old film songs, and spending time with her grandchildren.",
  majorCareIssue: "Memory-related cognitive difficulty",
  avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
};

export const PERSONAL_DETAILS = [
  { label: "Full name", value: "Anita Sharma" },
  { label: "Age", value: "68 years" },
  { label: "Gender", value: "Female" },
  { label: "Region", value: "Pune, Maharashtra" },
  { label: "Languages", value: "Marathi, Hindi" },
  { label: "Blood group", value: "B+" },
];

export const MEDICAL = {
  concerns: ["Mild memory loss", "High blood pressure", "Occasional disorientation"],
  consultations: [
    { doctor: "Dr. Meera Rao", specialty: "Neurologist", date: "12 May 2026", notes: "Stable. Continue cognitive activities." },
    { doctor: "Dr. Anil Kulkarni", specialty: "Physician", date: "28 Apr 2026", notes: "BP under control with medication." },
  ],
  careInfo: "Daily memory games recommended. Gentle reminders for medication at 9 AM and 8 PM.",
};

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
    { game: "Memory Match", score: "8 / 10", date: "Today" },
    { game: "Picture Pairs", score: "7 / 10", date: "Yesterday" },
    { game: "Word Recall", score: "6 / 10", date: "2 days ago" },
  ],
};

export type CalEventType = "appointment" | "routine" | "event" | "doctor" | "family";

export const CALENDAR_EVENTS: {
  id: string;
  title: string;
  type: CalEventType;
  time: string;
  date: string;
}[] = [
  { id: "e1", title: "Morning walk", type: "routine", time: "7:30 AM", date: "Today" },
  { id: "e2", title: "Dr. Rao check-up", type: "doctor", time: "11:00 AM", date: "Today" },
  { id: "e3", title: "Grandchildren visit", type: "family", time: "5:00 PM", date: "Today" },
  { id: "e4", title: "Evening medicine", type: "routine", time: "8:00 PM", date: "Today" },
  { id: "e5", title: "Physiotherapy session", type: "appointment", time: "10:00 AM", date: "Tomorrow" },
  { id: "e6", title: "Birthday celebration", type: "event", time: "6:00 PM", date: "24 Jun" },
];

export const APPOINTMENTS = [
  { id: "a1", title: "Dr. Rao check-up", when: "Today, 11:00 AM", where: "City Neuro Clinic" },
  { id: "a2", title: "Physiotherapy session", when: "Tomorrow, 10:00 AM", where: "Wellness Center" },
  { id: "a3", title: "Monthly review", when: "30 Jun, 3:00 PM", where: "Home visit" },
];

export const CARE_TASKS = [
  { id: "t1", title: "Follow-up home visit", done: false },
  { id: "t2", title: "Encourage cognitive activity", done: true },
  { id: "t3", title: "Check routine adherence", done: false },
  { id: "t4", title: "Review recent engagement", done: false },
];

export const EMERGENCY_CONTACTS = [
  { id: "c1", name: "Rahul Sharma", relationship: "Son", phone: "+91 98200 12345" },
  { id: "c2", name: "Meera Sharma", relationship: "Daughter-in-law", phone: "+91 98200 67890" },
  { id: "c3", name: "Dr. Meera Rao", relationship: "Neurologist", phone: "+91 20 2555 1234" },
];

export type AlertKind = "missed_routine" | "low_engagement" | "upcoming_appointment";

export const ALERTS: {
  id: string;
  kind: AlertKind;
  title: string;
  description: string;
  time: string;
}[] = [
  {
    id: "al1",
    kind: "missed_routine",
    title: "Missed routine",
    description: "Evening medicine reminder was not acknowledged yesterday.",
    time: "Yesterday, 8:00 PM",
  },
  {
    id: "al2",
    kind: "low_engagement",
    title: "Low game engagement",
    description: "Only 1 game session on Thursday. Encourage more activity.",
    time: "Thu",
  },
  {
    id: "al3",
    kind: "upcoming_appointment",
    title: "Upcoming appointment",
    description: "Dr. Rao check-up scheduled today at 11:00 AM.",
    time: "Today, 11:00 AM",
  },
];

export const REPORT_SUMMARY = {
  period: "This week",
  totalSessions: 12,
  avgAccuracy: 78,
  bestGame: "Memory Match",
  engagement: "Good",
  note: "Anita has stayed active this week with steady accuracy. Cognitive engagement is healthy.",
};

export const DISCLAIMER =
  "Monor Xur activity results describe engagement within the application and are not a medical diagnosis.";

export const REPORTS = {
  totalSessions: 12,
  gamesCompleted: 9,
  avgAccuracy: 78,
  frequency: "5 days / week",
  daily: [
    { label: "Mon", value: 3 },
    { label: "Tue", value: 2 },
    { label: "Wed", value: 4 },
    { label: "Thu", value: 1 },
    { label: "Fri", value: 3 },
    { label: "Sat", value: 2 },
    { label: "Sun", value: 0 },
  ],
  weekly: [
    { label: "W1", value: 9 },
    { label: "W2", value: 11 },
    { label: "W3", value: 8 },
    { label: "W4", value: 12 },
  ],
  monthly: [
    { label: "Jan", value: 34 },
    { label: "Feb", value: 40 },
    { label: "Mar", value: 38 },
    { label: "Apr", value: 45 },
    { label: "May", value: 42 },
    { label: "Jun", value: 40 },
  ],
  trend: [
    { label: "W1", value: 70 },
    { label: "W2", value: 74 },
    { label: "W3", value: 72 },
    { label: "W4", value: 78 },
  ],
  recent: [
    { game: "Memory Match", score: "8 / 10", date: "Today" },
    { game: "Picture Pairs", score: "7 / 10", date: "Yesterday" },
    { game: "Word Recall", score: "6 / 10", date: "2 days ago" },
    { game: "Number Fun", score: "9 / 10", date: "3 days ago" },
  ],
};
