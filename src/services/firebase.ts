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
  const path = `patients/${patientId}/memories`;
  const q = collection(db, 'patients', patientId, 'memories');
  return onSnapshot(q, (snapshot) => {
    const list: Memory[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as Memory);
    });
    onData(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function addMemoryToDb(patientId: string, memory: Memory): Promise<void> {
  const memoryId = memory.id || `m_${Date.now()}`;
  const path = `patients/${patientId}/memories/${memoryId}`;
  try {
    await setDoc(doc(db, 'patients', patientId, 'memories', memoryId), {
      ...memory,
      id: memoryId,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteMemoryFromDb(patientId: string, memoryId: string): Promise<void> {
  const path = `patients/${patientId}/memories/${memoryId}`;
  try {
    await deleteDoc(doc(db, 'patients', patientId, 'memories', memoryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Reminders Collection ---
export function subscribeToReminders(
  patientId: string, 
  onData: (reminders: Reminder[]) => void
) {
  const path = `patients/${patientId}/reminders`;
  const colRef = collection(db, 'patients', patientId, 'reminders');
  return onSnapshot(colRef, (snapshot) => {
    const list: Reminder[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as Reminder);
    });
    list.sort((a, b) => a.minutes - b.minutes);
    onData(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function saveReminderToDb(patientId: string, reminder: Reminder): Promise<void> {
  const reminderId = reminder.id || `r_${Date.now()}`;
  const path = `patients/${patientId}/reminders/${reminderId}`;
  try {
    await setDoc(doc(db, 'patients', patientId, 'reminders', reminderId), {
      ...reminder,
      id: reminderId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteReminderFromDb(patientId: string, reminderId: string): Promise<void> {
  const path = `patients/${patientId}/reminders/${reminderId}`;
  try {
    await deleteDoc(doc(db, 'patients', patientId, 'reminders', reminderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Calendar Events ---
export function subscribeToCalendarEvents(
  patientId: string, 
  onData: (events: CalendarEvent[]) => void
) {
  const path = `patients/${patientId}/events`;
  return onSnapshot(collection(db, 'patients', patientId, 'events'), (snapshot) => {
    const list: CalendarEvent[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as CalendarEvent);
    });
    onData(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function saveCalendarEventToDb(patientId: string, event: CalendarEvent): Promise<void> {
  const eventId = event.id || `e_${Date.now()}`;
  const path = `patients/${patientId}/events/${eventId}`;
  try {
    await setDoc(doc(db, 'patients', patientId, 'events', eventId), {
      ...event,
      id: eventId,
      createdAt: new Date().toISOString()
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
  const path = `patients/${patientId}/care_tasks`;
  return onSnapshot(collection(db, 'patients', patientId, 'care_tasks'), (snapshot) => {
    const list: CareTask[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as CareTask);
    });
    onData(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function saveCareTaskToDb(patientId: string, task: CareTask): Promise<void> {
  const taskId = task.id || `t_${Date.now()}`;
  const path = `patients/${patientId}/care_tasks/${taskId}`;
  try {
    await setDoc(doc(db, 'patients', patientId, 'care_tasks', taskId), {
      ...task,
      id: taskId,
      createdAt: new Date().toISOString()
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
  const path = `patients/${patientId}/contacts`;
  return onSnapshot(collection(db, 'patients', patientId, 'contacts'), (snapshot) => {
    const list: EmergencyContact[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as EmergencyContact);
    });
    onData(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function saveContactToDb(patientId: string, contact: EmergencyContact): Promise<void> {
  const contactId = contact.id || `c_${Date.now()}`;
  const path = `patients/${patientId}/contacts/${contactId}`;
  try {
    await setDoc(doc(db, 'patients', patientId, 'contacts', contactId), {
      ...contact,
      id: contactId,
      createdAt: new Date().toISOString()
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
  const path = `patients/${patientId}/dda_logs`;
  const q = query(collection(db, 'patients', patientId, 'dda_logs'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list: DDAMetric[] = [];
    snapshot.forEach((d) => {
      list.push({ ...d.data() } as DDAMetric);
    });
    onData(list);
  }, (error) => {
    // If indexing or order error, fallback to un-ordered query
    onSnapshot(collection(db, 'patients', patientId, 'dda_logs'), (snapshot) => {
      const list: DDAMetric[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data() } as DDAMetric);
      });
      list.sort((a, b) => b.timestamp - a.timestamp);
      onData(list);
    }, (innerErr) => {
      handleFirestoreError(innerErr, OperationType.LIST, path);
    });
  });
}

export async function logDDAMetricToDb(patientId: string, metric: DDAMetric): Promise<void> {
  const logId = `dda_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const path = `patients/${patientId}/dda_logs/${logId}`;
  try {
    await setDoc(doc(db, 'patients', patientId, 'dda_logs', logId), {
      ...metric,
      id: logId,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
