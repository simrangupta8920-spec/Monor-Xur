import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signOut, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  signInAnonymously,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc,
  collection, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
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
  AuditLog,
  DDAMetric
} from '../types';

export const DEFAULT_PATIENT_ID = 'default_patient';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
const firestoreDatabaseId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId;
export const db: Firestore = firestoreDatabaseId 
  ? getFirestore(app, firestoreDatabaseId)
  : getFirestore(app);

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Google sign-in error:', err);
    throw err;
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Google sign-out error:', err);
    throw err;
  }
}

// Ensure an authenticated session is active
export async function ensureFirebaseAuth(): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn('Firebase auth initialization notice:', err);
    return auth.currentUser;
  }
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
  const uid = auth.currentUser?.uid;
  const existingUids = Array.isArray(profile.authorizedUids) ? [...profile.authorizedUids] : [];
  if (uid && !existingUids.includes(uid)) {
    existingUids.push(uid);
  }

  const payload: PatientProfile = {
    ...profile,
    assignedCaregiverUid: profile.assignedCaregiverUid || uid,
    authorizedUids: existingUids,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(patientDoc, payload, { merge: true });
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

// Persist game difficulty progression directly
export async function updateGameDifficultyProgress(
  patientId: string,
  gameKey: 'memory_match' | 'puzzle',
  level: number,
  streaks?: Record<string, number>
): Promise<void> {
  try {
    const nowIso = new Date().toISOString();
    const normalizedLevel = gameKey === 'puzzle'
      ? (level === 2 ? 1 : level === 3 ? 2 : 3)
      : level;

    try {
      localStorage.setItem(`monor_game_level_${gameKey}`, String(level));
      if (gameKey === 'memory_match') {
        localStorage.setItem('monor_memory_level', String(level));
        if (streaks) {
          localStorage.setItem('monor_memory_streaks_v2', JSON.stringify(streaks));
        }
      } else if (gameKey === 'puzzle') {
        localStorage.setItem('monor_puzzle_grid_size', String(level));
      }
    } catch {
      // ignore offline storage errors
    }

    if (!auth.currentUser) return;

    const patientDocRef = doc(db, 'patients', patientId);
    const patientSnap = await getDoc(patientDocRef);
    const existingPatientData = patientSnap.exists() ? (patientSnap.data() as PatientProfile) : null;
    const existingLevels = existingPatientData?.gameDifficultyLevels || {};
    const existingStreaks = existingPatientData?.gameStreaks || {};

    const updatedLevels = {
      ...existingLevels,
      [gameKey]: level,
    };
    const updatedStreaks = streaks ? { ...existingStreaks, ...streaks } : existingStreaks;

    await setDoc(patientDocRef, {
      gameDifficultyLevel: normalizedLevel,
      gameDifficultyLevels: updatedLevels,
      gameStreaks: updatedStreaks,
      lastGameSessionTimestamp: Date.now(),
      updatedAt: nowIso,
    }, { merge: true });

    const medicalDocRef = doc(db, 'patients', patientId, 'medical', 'current');
    await setDoc(medicalDocRef, {
      cognitiveDifficultyLevel: normalizedLevel,
      gameDifficultyLevels: updatedLevels,
      lastCognitiveAssessment: nowIso,
      updatedAt: nowIso,
    }, { merge: true });
  } catch (err) {
    console.warn('Game difficulty progress sync notice:', err);
  }
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
  const memId = memory.id || `mem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const memDoc = doc(db, 'patients', patientId, 'memories', memId);
  await setDoc(memDoc, {
    ...memory,
    id: memId,
    createdAt: memory.createdAt || new Date().toISOString(),
  }, { merge: true });
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
    list.sort((a, b) => a.minutes - b.minutes);
    callback(list);
  }, (err) => {
    console.warn('Reminders sync notice:', err);
  });
}

export async function saveReminderToDb(patientId: string, reminder: Reminder): Promise<void> {
  const remId = reminder.id || `rem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const remDoc = doc(db, 'patients', patientId, 'reminders', remId);
  await setDoc(remDoc, {
    ...reminder,
    id: remId,
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
  const evId = event.id || `ev_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const evDoc = doc(db, 'patients', patientId, 'events', evId);
  await setDoc(evDoc, {
    ...event,
    id: evId,
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
  const alId = alert.id || `alert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const alertDoc = doc(db, 'patients', patientId, 'alerts', alId);
  await setDoc(alertDoc, {
    ...alert,
    id: alId,
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
  const taskId = task.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const taskDoc = doc(db, 'patients', patientId, 'care_tasks', taskId);
  await setDoc(taskDoc, {
    ...task,
    id: taskId,
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
  const contactId = contact.id || `contact_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const contactDoc = doc(db, 'patients', patientId, 'contacts', contactId);
  await setDoc(contactDoc, {
    ...contact,
    id: contactId,
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
    id: logId,
    timestamp: log.timestamp || new Date().toISOString(),
  });
}

// 10. DDA Cognitive Game Metrics Subcollection
export function subscribeToDDALogs(
  patientId: string, 
  callback: (logs: DDAMetric[]) => void
): () => void {
  const ddaCol = collection(db, 'patients', patientId, 'dda_logs');
  const q = query(ddaCol, orderBy('timestamp', 'desc'), limit(100));
  return onSnapshot(q, (snapshot) => {
    const list: DDAMetric[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as DDAMetric);
    });
    callback(list);
  }, (err) => {
    console.warn('DDA logs sync notice:', err);
  });
}

export async function logDDAMetricToDb(patientId: string, metric: DDAMetric): Promise<void> {
  const logId = `dda_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const docRef = doc(db, 'patients', patientId, 'dda_logs', logId);
  await setDoc(docRef, {
    ...metric,
    createdAt: new Date().toISOString(),
  }, { merge: true });
}
