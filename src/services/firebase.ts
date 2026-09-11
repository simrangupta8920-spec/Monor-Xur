import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  collection, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  PatientProfile, 
  MedicalProfile, 
  Memory, 
  Reminder, 
  CalendarEvent, 
  CareTask, 
  AlertItem, 
  EmergencyContact, 
  DDAMetric 
} from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is offline or initializing.');
    }
    return false;
  }
}

// Primary Patient ID for active session
export const DEFAULT_PATIENT_ID = 'primary-patient';

// --- Patient Profile ---
export function subscribeToPatientProfile(
  patientId: string, 
  onData: (data: PatientProfile | null) => void
) {
  const path = `patients/${patientId}`;
  return onSnapshot(doc(db, 'patients', patientId), (docSnap) => {
    if (docSnap.exists()) {
      onData(docSnap.data() as PatientProfile);
    } else {
      onData(null);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export async function savePatientProfile(patientId: string, profile: PatientProfile): Promise<void> {
  const path = `patients/${patientId}`;
  try {
    await setDoc(doc(db, 'patients', patientId), {
      ...profile,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Medical Profile ---
export function subscribeToMedicalProfile(
  patientId: string, 
  onData: (data: MedicalProfile | null) => void
) {
  const path = `patients/${patientId}/medical/default`;
  return onSnapshot(doc(db, 'patients', patientId, 'medical', 'default'), (docSnap) => {
    if (docSnap.exists()) {
      onData(docSnap.data() as MedicalProfile);
    } else {
      onData(null);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export async function saveMedicalProfile(patientId: string, profile: MedicalProfile): Promise<void> {
  const path = `patients/${patientId}/medical/default`;
  try {
    await setDoc(doc(db, 'patients', patientId, 'medical', 'default'), {
      ...profile,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Memories Collection ---
export function subscribeToMemories(
  patientId: string, 
  onData: (memories: Memory[]) => void
) {
  const path = `patients/${patientId}/memories/default`;
  return onSnapshot(doc(db, 'patients', patientId, 'memories', 'default'), (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      onData((data?.items as Memory[]) || []);
    } else {
      onData([]);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export async function addMemoryToDb(patientId: string, memory: Memory): Promise<void> {
  const path = `patients/${patientId}/memories/default`;
  try {
    const docRef = doc(db, 'patients', patientId, 'memories', 'default');
    const snap = await getDoc(docRef);
    let items: Memory[] = [];
    if (snap.exists()) {
      items = (snap.data()?.items as Memory[]) || [];
    }
    const memoryId = memory.id || `m_${Date.now()}`;
    const newItems = [{ ...memory, id: memoryId, createdAt: new Date().toISOString() }, ...items.filter(m => m.id !== memoryId)];
    await setDoc(docRef, {
      title: 'Family Memories',
      items: newItems,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteMemoryFromDb(patientId: string, memoryId: string): Promise<void> {
  const path = `patients/${patientId}/memories/default`;
  try {
    const docRef = doc(db, 'patients', patientId, 'memories', 'default');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const items = (snap.data()?.items as Memory[]) || [];
      const newItems = items.filter(m => m.id !== memoryId);
      await setDoc(docRef, {
        title: 'Family Memories',
        items: newItems,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Reminders Collection ---
export function subscribeToReminders(
  patientId: string, 
  onData: (reminders: Reminder[]) => void
) {
  const path = `patients/${patientId}/reminders/default`;
  return onSnapshot(doc(db, 'patients', patientId, 'reminders', 'default'), (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      const list = (data?.items as Reminder[]) || [];
      list.sort((a, b) => a.minutes - b.minutes);
      onData(list);
    } else {
      onData([]);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export async function saveReminderToDb(patientId: string, reminder: Reminder): Promise<void> {
  const path = `patients/${patientId}/reminders/default`;
  try {
    const docRef = doc(db, 'patients', patientId, 'reminders', 'default');
    const snap = await getDoc(docRef);
    let items: Reminder[] = [];
    if (snap.exists()) {
      items = (snap.data()?.items as Reminder[]) || [];
    }
    const reminderId = reminder.id || `r_${Date.now()}`;
    const updatedItem = { ...reminder, id: reminderId, updatedAt: new Date().toISOString() };
    const existingIndex = items.findIndex(r => r.id === reminderId);
    let newItems: Reminder[];
    if (existingIndex >= 0) {
      newItems = items.map(r => r.id === reminderId ? updatedItem : r);
    } else {
      newItems = [...items, updatedItem];
    }
    await setDoc(docRef, {
      title: 'Daily Reminders',
      items: newItems,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveRemindersListToDb(patientId: string, reminders: Reminder[]): Promise<void> {
  const path = `patients/${patientId}/reminders/default`;
  try {
    const docRef = doc(db, 'patients', patientId, 'reminders', 'default');
    await setDoc(docRef, {
      title: 'Daily Reminders',
      items: reminders,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteReminderFromDb(patientId: string, reminderId: string): Promise<void> {
  const path = `patients/${patientId}/reminders/default`;
  try {
    const docRef = doc(db, 'patients', patientId, 'reminders', 'default');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const items = (snap.data()?.items as Reminder[]) || [];
      const newItems = items.filter(r => r.id !== reminderId);
      await setDoc(docRef, {
        title: 'Daily Reminders',
        items: newItems,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Calendar Events ---
export function subscribeToCalendarEvents(
  patientId: string, 
  onData: (events: CalendarEvent[]) => void
) {
  const path = `patients/${patientId}/events/default`;
  return onSnapshot(doc(db, 'patients', patientId, 'events', 'default'), (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      onData((data?.items as CalendarEvent[]) || []);
    } else {
      onData([]);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export async function saveCalendarEventToDb(patientId: string, event: CalendarEvent): Promise<void> {
  const path = `patients/${patientId}/events/default`;
  try {
    const docRef = doc(db, 'patients', patientId, 'events', 'default');
    const snap = await getDoc(docRef);
    let items: CalendarEvent[] = [];
    if (snap.exists()) {
      items = (snap.data()?.items as CalendarEvent[]) || [];
    }
    const eventId = event.id || `e_${Date.now()}`;
    const updated = { ...event, id: eventId, createdAt: event.createdAt || new Date().toISOString() };
    const existingIndex = items.findIndex(e => e.id === eventId);
    const newItems = existingIndex >= 0 ? items.map(e => e.id === eventId ? updated : e) : [...items, updated];
    await setDoc(docRef, {
      title: 'Calendar Events',
      items: newItems,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Care Tasks ---
export function subscribeToCareTasks(
  patientId: string, 
  onData: (tasks: CareTask[]) => void
) {
  const path = `patients/${patientId}/care_tasks/default`;
  return onSnapshot(doc(db, 'patients', patientId, 'care_tasks', 'default'), (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      onData((data?.items as CareTask[]) || []);
    } else {
      onData([]);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export async function saveCareTaskToDb(patientId: string, task: CareTask): Promise<void> {
  const path = `patients/${patientId}/care_tasks/default`;
  try {
    const docRef = doc(db, 'patients', patientId, 'care_tasks', 'default');
    const snap = await getDoc(docRef);
    let items: CareTask[] = [];
    if (snap.exists()) {
      items = (snap.data()?.items as CareTask[]) || [];
    }
    const taskId = task.id || `t_${Date.now()}`;
    const updated = { ...task, id: taskId, createdAt: task.createdAt || new Date().toISOString() };
    const existingIndex = items.findIndex(t => t.id === taskId);
    const newItems = existingIndex >= 0 ? items.map(t => t.id === taskId ? updated : t) : [...items, updated];
    await setDoc(docRef, {
      title: 'Care Tasks',
      items: newItems,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Emergency Contacts ---
export function subscribeToContacts(
  patientId: string, 
  onData: (contacts: EmergencyContact[]) => void
) {
  const path = `patients/${patientId}/contacts/default`;
  return onSnapshot(doc(db, 'patients', patientId, 'contacts', 'default'), (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      onData((data?.items as EmergencyContact[]) || []);
    } else {
      onData([]);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export async function saveContactToDb(patientId: string, contact: EmergencyContact): Promise<void> {
  const path = `patients/${patientId}/contacts/default`;
  try {
    const docRef = doc(db, 'patients', patientId, 'contacts', 'default');
    const snap = await getDoc(docRef);
    let items: EmergencyContact[] = [];
    if (snap.exists()) {
      items = (snap.data()?.items as EmergencyContact[]) || [];
    }
    const contactId = contact.id || `c_${Date.now()}`;
    const updated = { ...contact, id: contactId, createdAt: contact.createdAt || new Date().toISOString() };
    const existingIndex = items.findIndex(c => c.id === contactId);
    const newItems = existingIndex >= 0 ? items.map(c => c.id === contactId ? updated : c) : [...items, updated];
    await setDoc(docRef, {
      title: 'Emergency Contacts',
      items: newItems,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- DDA Performance Logs ---
export function subscribeToDDALogs(
  patientId: string, 
  onData: (logs: DDAMetric[]) => void
) {
  const path = `patients/${patientId}/dda_logs/default`;
  return onSnapshot(doc(db, 'patients', patientId, 'dda_logs', 'default'), (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      const list = (data?.items as DDAMetric[]) || [];
      list.sort((a, b) => b.timestamp - a.timestamp);
      onData(list);
    } else {
      onData([]);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export async function logDDAMetricToDb(patientId: string, metric: DDAMetric): Promise<void> {
  const path = `patients/${patientId}/dda_logs/default`;
  try {
    const docRef = doc(db, 'patients', patientId, 'dda_logs', 'default');
    const snap = await getDoc(docRef);
    let items: DDAMetric[] = [];
    if (snap.exists()) {
      items = (snap.data()?.items as DDAMetric[]) || [];
    }
    const logId = `dda_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newItems = [{ ...metric, id: logId, createdAt: new Date().toISOString() }, ...items].slice(0, 100);
    await setDoc(docRef, {
      gameTitle: 'Cognitive Quest',
      level: metric.difficultyLevel || 1,
      items: newItems,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// --- Alerts ---
export function subscribeToAlerts(
  patientId: string,
  onData: (alerts: AlertItem[]) => void
) {
  const path = `patients/${patientId}/alerts/default`;
  return onSnapshot(doc(db, 'patients', patientId, 'alerts', 'default'), (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      onData((data?.items as AlertItem[]) || []);
    } else {
      onData([]);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export async function saveAlertToDb(patientId: string, alert: AlertItem): Promise<void> {
  const path = `patients/${patientId}/alerts/default`;
  try {
    const docRef = doc(db, 'patients', patientId, 'alerts', 'default');
    const snap = await getDoc(docRef);
    let items: AlertItem[] = [];
    if (snap.exists()) {
      items = (snap.data()?.items as AlertItem[]) || [];
    }
    const alertId = alert.id || `a_${Date.now()}`;
    const updated = { ...alert, id: alertId, createdAt: alert.createdAt || new Date().toISOString() };
    const existingIndex = items.findIndex(a => a.id === alertId);
    const newItems = existingIndex >= 0 ? items.map(a => a.id === alertId ? updated : a) : [...items, updated];
    await setDoc(docRef, {
      title: 'Active Alerts',
      items: newItems,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export const subscribeToEvents = subscribeToCalendarEvents;

