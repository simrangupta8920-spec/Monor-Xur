import { 
  PatientProfile, 
  MedicalProfile, 
  Reminder, 
  CalendarEvent, 
  CareTask, 
  Memory, 
  EmergencyContact 
} from '../types';

export const OFFLINE_CACHE_KEY = 'monor_xur_offline_cache_v1';
export const OFFLINE_QUEUE_KEY = 'monor_xur_offline_mutation_queue_v1';

export interface OfflinePatientData {
  patientProfile: PatientProfile | null;
  medicalProfile: MedicalProfile | null;
  reminders: Reminder[];
  calendarEvents: CalendarEvent[];
  tasks: CareTask[];
  memories: Memory[];
  contacts: EmergencyContact[];
  lastCachedAt: string;
}

export interface OfflineMutation {
  id: string;
  type: 'toggle_reminder' | 'update_task' | 'add_reminder' | 'update_profile';
  payload: any;
  timestamp: number;
}

/**
 * Save complete core patient state and current daily plan into offline storage.
 */
export function saveOfflineSnapshot(snapshot: {
  patientProfile?: PatientProfile | null;
  medicalProfile?: MedicalProfile | null;
  reminders?: Reminder[];
  calendarEvents?: CalendarEvent[];
  tasks?: CareTask[];
  memories?: Memory[];
  contacts?: EmergencyContact[];
}): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = getOfflineSnapshot() || {
      patientProfile: null,
      medicalProfile: null,
      reminders: [],
      calendarEvents: [],
      tasks: [],
      memories: [],
      contacts: [],
      lastCachedAt: new Date().toISOString(),
    };

    const updated: OfflinePatientData = {
      patientProfile: snapshot.patientProfile !== undefined ? snapshot.patientProfile : existing.patientProfile,
      medicalProfile: snapshot.medicalProfile !== undefined ? snapshot.medicalProfile : existing.medicalProfile,
      reminders: snapshot.reminders !== undefined ? snapshot.reminders : existing.reminders,
      calendarEvents: snapshot.calendarEvents !== undefined ? snapshot.calendarEvents : existing.calendarEvents,
      tasks: snapshot.tasks !== undefined ? snapshot.tasks : existing.tasks,
      memories: snapshot.memories !== undefined ? snapshot.memories : existing.memories,
      contacts: snapshot.contacts !== undefined ? snapshot.contacts : existing.contacts,
      lastCachedAt: new Date().toISOString(),
    };

    localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to cache offline patient snapshot:', err);
  }
}

/**
 * Retrieve cached core patient data and daily plan from offline storage.
 */
export function getOfflineSnapshot(): OfflinePatientData | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(OFFLINE_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OfflinePatientData;
  } catch (err) {
    console.warn('Failed to parse offline patient snapshot:', err);
    return null;
  }
}

/**
 * Enqueue a mutation performed while offline (e.g. checked medication, completed task).
 */
export function queueOfflineMutation(mutation: Omit<OfflineMutation, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;

  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    const list: OfflineMutation[] = raw ? JSON.parse(raw) : [];
    const item: OfflineMutation = {
      ...mutation,
      id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };
    list.push(item);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Failed to queue offline mutation:', err);
  }
}

export function getOfflineQueue(): OfflineMutation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearOfflineQueue(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (err) {
    console.warn('Failed to clear offline queue:', err);
  }
}
