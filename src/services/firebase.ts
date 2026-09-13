import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signOut, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  collection, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  PatientProfile, 
  MedicalProfile, 
  Memory, 
  Reminder, 
  CalendarEvent, 
  AlertItem, 
  CareTask, 
  EmergencyContact, 
  AuditLog 
} from '../types';

export const DEFAULT_PATIENT_ID = 'default_patient';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db: Firestore = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

// 1. Patient Profile
export function subscribeToPatientProfile(
  patientId: string, 
  callback: (data: PatientProfile | null) => void
): () => void {
  const patientDoc = doc(db, 'patients', patientId);
  return onSnapshot(patientDoc, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as PatientProfile);
    } else {
      callback(null);
    }
  }, (err) => {
    console.warn('Patient profile sync notice:', err);
  });
}

export async function savePatientProfile(patientId: string, profile: PatientProfile): Promise<void> {
  const patientDoc = doc(db, 'patients', patientId);
  await setDoc(patientDoc, {
    ...profile,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

// 2. Medical Profile
export function subscribeToMedicalProfile(
  patientId: string, 
  callback: (data: MedicalProfile | null) => void
): () => void {
  const medicalDoc = doc(db, 'patients', patientId, 'medical', 'current');
  return onSnapshot(medicalDoc, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as MedicalProfile);
    } else {
      callback(null);
    }
  }, (err) => {
    console.warn('Medical profile sync notice:', err);
  });
}

export async function saveMedicalProfile(patientId: string, profile: MedicalProfile): Promise<void> {
  const medicalDoc = doc(db, 'patients', patientId, 'medical', 'current');
  await setDoc(medicalDoc, {
    ...profile,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

// 3. Memories Subcollection
export function subscribeToMemories(
  patientId: string, 
  callback: (data: Memory[]) => void
): () => void {
  const memoriesCol = collection(db, 'patients', patientId, 'memories');
  return onSnapshot(memoriesCol, (snapshot) => {
    const list: Memory[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as Memory);
    });
    callback(list);
  }, (err) => {
    console.warn('Memories sync notice:', err);
  });
}

export async function addMemoryToDb(patientId: string, memory: Memory): Promise<void> {
  const memDoc = doc(db, 'patients', patientId, 'memories', memory.id);
  await setDoc(memDoc, {
    ...memory,
    createdAt: memory.createdAt || new Date().toISOString(),
  });
}

export async function deleteMemoryFromDb(patientId: string, memoryId: string): Promise<void> {
  const memDoc = doc(db, 'patients', patientId, 'memories', memoryId);
  await deleteDoc(memDoc);
}

// 4. Reminders Subcollection
export function subscribeToReminders(
  patientId: string, 
  callback: (data: Reminder[]) => void
): () => void {
  const remindersCol = collection(db, 'patients', patientId, 'reminders');
  return onSnapshot(remindersCol, (snapshot) => {
    const list: Reminder[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as Reminder);
    });
    callback(list);
  }, (err) => {
    console.warn('Reminders sync notice:', err);
  });
}

export async function saveReminderToDb(patientId: string, reminder: Reminder): Promise<void> {
  const remDoc = doc(db, 'patients', patientId, 'reminders', reminder.id);
  await setDoc(remDoc, {
    ...reminder,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

export async function saveRemindersListToDb(patientId: string, reminders: Reminder[]): Promise<void> {
  for (const rem of reminders) {
    await saveReminderToDb(patientId, rem);
  }
}

export async function deleteReminderFromDb(patientId: string, reminderId: string): Promise<void> {
  const remDoc = doc(db, 'patients', patientId, 'reminders', reminderId);
  await deleteDoc(remDoc);
}

// 5. Calendar Events Subcollection
export function subscribeToEvents(
  patientId: string, 
  callback: (data: CalendarEvent[]) => void
): () => void {
  const eventsCol = collection(db, 'patients', patientId, 'events');
  return onSnapshot(eventsCol, (snapshot) => {
    const list: CalendarEvent[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as CalendarEvent);
    });
    callback(list);
  }, (err) => {
    console.warn('Events sync notice:', err);
  });
}

export async function saveCalendarEventToDb(patientId: string, event: CalendarEvent): Promise<void> {
  const evDoc = doc(db, 'patients', patientId, 'events', event.id);
  await setDoc(evDoc, {
    ...event,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

// 6. Alerts Subcollection
export function subscribeToAlerts(
  patientId: string, 
  callback: (data: AlertItem[]) => void
): () => void {
  const alertsCol = collection(db, 'patients', patientId, 'alerts');
  return onSnapshot(alertsCol, (snapshot) => {
    const list: AlertItem[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as AlertItem);
    });
    callback(list);
  }, (err) => {
    console.warn('Alerts sync notice:', err);
  });
}

export async function saveAlertToDb(patientId: string, alert: AlertItem): Promise<void> {
  const alertDoc = doc(db, 'patients', patientId, 'alerts', alert.id);
  await setDoc(alertDoc, {
    ...alert,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

// 7. Care Tasks Subcollection
export function subscribeToCareTasks(
  patientId: string, 
  callback: (data: CareTask[]) => void
): () => void {
  const tasksCol = collection(db, 'patients', patientId, 'care_tasks');
  return onSnapshot(tasksCol, (snapshot) => {
    const list: CareTask[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as CareTask);
    });
    callback(list);
  }, (err) => {
    console.warn('Tasks sync notice:', err);
  });
}

export async function saveCareTaskToDb(patientId: string, task: CareTask): Promise<void> {
  const taskDoc = doc(db, 'patients', patientId, 'care_tasks', task.id);
  await setDoc(taskDoc, {
    ...task,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

// 8. Emergency Contacts Subcollection
export function subscribeToContacts(
  patientId: string, 
  callback: (data: EmergencyContact[]) => void
): () => void {
  const contactsCol = collection(db, 'patients', patientId, 'contacts');
  return onSnapshot(contactsCol, (snapshot) => {
    const list: EmergencyContact[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as EmergencyContact);
    });
    callback(list);
  }, (err) => {
    console.warn('Contacts sync notice:', err);
  });
}

export async function saveContactToDb(patientId: string, contact: EmergencyContact): Promise<void> {
  const contactDoc = doc(db, 'patients', patientId, 'contacts', contact.id);
  await setDoc(contactDoc, {
    ...contact,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

// 9. DPDP Act 2023 Audit Logs Subcollection (Append-only)
export function subscribeToAuditLogs(
  patientId: string, 
  callback: (data: AuditLog[]) => void
): () => void {
  const auditCol = collection(db, 'patients', patientId, 'auditLogs');
  const q = query(auditCol, orderBy('timestamp', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const list: AuditLog[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as AuditLog);
    });
    callback(list);
  }, (err) => {
    console.warn('Audit logs sync notice:', err);
  });
}

export async function logAuditEvent(
  patientId: string, 
  log: Omit<AuditLog, 'id' | 'timestamp'> & { timestamp?: string }
): Promise<void> {
  const logId = 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const logDoc = doc(db, 'patients', patientId, 'auditLogs', logId);
  await setDoc(logDoc, {
    ...log,
    timestamp: log.timestamp || new Date().toISOString(),
  });
}
