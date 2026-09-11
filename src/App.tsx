import React, { useState, useEffect } from 'react';
import { 
  AppRole, PatientTab, PatientSubView, FamilyCaregiverTab, AshaTab, Memory, 
  DDAMetric, CalendarEvent, Reminder, AlertItem, EmergencyContact, 
  PatientProfile, MedicalProfile, CaregiverAccount, AshaAccount, CareTask 
} from './types';
import { 
  INITIAL_PATIENT_PROFILE, INITIAL_MEDICAL_PROFILE, INITIAL_MEMORIES, INITIAL_REMINDERS, 
  INITIAL_CALENDAR_EVENTS, INITIAL_ALERTS, 
  INITIAL_CARE_TASKS, EMERGENCY_CONTACTS 
} from './data/mockData';
import { Header } from './components/common/Header';
import { PatientBottomNav, FamilyBottomNav, AshaBottomNav } from './components/common/BottomNav';
import { InitialSetupPage } from './components/setup/InitialSetupPage';
import { PatientHome } from './components/patient/PatientHome';
import { MemoriesGallery } from './components/patient/MemoriesGallery';
import { MemoryViewer } from './components/patient/MemoryViewer';
import { GamesHub } from './components/patient/GamesHub';
import { MemoryMatchGame } from './components/patient/MemoryMatchGame';
import { PuzzleGame } from './components/patient/PuzzleGame';
import { RelaxationHub } from './components/patient/RelaxationHub';
import { BreathingExercise } from './components/patient/BreathingExercise';
import { RelaxationMusic } from './components/patient/RelaxationMusic';
import { DailyLife } from './components/patient/DailyLife';
import { PatientSettings } from './components/patient/PatientSettings';
import { CaregiverSelect } from './components/caregiver/CaregiverSelect';
import { FamilyLogin } from './components/caregiver/FamilyLogin';
import { AshaLogin } from './components/caregiver/AshaLogin';
import { FamilyDashboard } from './components/caregiver/FamilyDashboard';
import { AshaDashboard } from './components/caregiver/AshaDashboard';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { 
  saveOfflineSnapshot, 
  getOfflineSnapshot, 
  queueOfflineMutation, 
  getOfflineQueue, 
  clearOfflineQueue 
} from './services/offlineStorage';
import { soundController } from './utils/audio';
import { Phone } from 'lucide-react';
import { 
  DEFAULT_PATIENT_ID,
  subscribeToPatientProfile,
  savePatientProfile,
  subscribeToMedicalProfile,
  saveMedicalProfile,
  subscribeToMemories,
  addMemoryToDb,
  deleteMemoryFromDb,
  subscribeToReminders,
  saveReminderToDb,
  saveRemindersListToDb,
  deleteReminderFromDb,
  subscribeToEvents,
  saveCalendarEventToDb,
  subscribeToAlerts,
  saveAlertToDb,
  subscribeToCareTasks,
  saveCareTaskToDb,
  subscribeToContacts,
  saveContactToDb,
} from './services/firebase';

export function App() {
  // Check if initial setup was previously completed or stored in offline snapshot
  const cachedOfflineSnapshot = typeof window !== 'undefined' ? getOfflineSnapshot() : null;
  const isSetupCompletedLocally = (typeof window !== 'undefined' && 
    localStorage.getItem('monor_xur_setup_completed') === 'true') || 
    Boolean(cachedOfflineSnapshot?.patientProfile?.name);

  // Roles & View navigation - Default to 'setup' if no user profile configured
  const [role, setRole] = useState<AppRole>(() => {
    return isSetupCompletedLocally ? 'patient' : 'setup';
  });

  const [patientTab, setPatientTab] = useState<PatientTab>('home');
  const [patientSubView, setPatientSubView] = useState<PatientSubView>('none');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  const [familyTab, setFamilyTab] = useState<FamilyCaregiverTab>('home');
  const [ashaTab, setAshaTab] = useState<AshaTab>('home');

  // Application Data States (synced locally, offline storage, and with Firestore)
  const [patientProfile, setPatientProfile] = useState<PatientProfile>(() => {
    if (cachedOfflineSnapshot?.patientProfile?.name) {
      return cachedOfflineSnapshot.patientProfile;
    }
    try {
      const stored = localStorage.getItem('monor_xur_patient');
      return stored ? JSON.parse(stored) : INITIAL_PATIENT_PROFILE;
    } catch {
      return INITIAL_PATIENT_PROFILE;
    }
  });

  const [medicalProfile, setMedicalProfile] = useState<MedicalProfile>(() => {
    if (cachedOfflineSnapshot?.medicalProfile?.stage) {
      return cachedOfflineSnapshot.medicalProfile;
    }
    try {
      const stored = localStorage.getItem('monor_xur_medical');
      return stored ? JSON.parse(stored) : INITIAL_MEDICAL_PROFILE;
    } catch {
      return INITIAL_MEDICAL_PROFILE;
    }
  });

  const [memories, setMemories] = useState<Memory[]>(() => {
    if (cachedOfflineSnapshot?.memories && cachedOfflineSnapshot.memories.length > 0) {
      return cachedOfflineSnapshot.memories;
    }
    return INITIAL_MEMORIES;
  });

  // Current daily plan reminders (accessible offline)
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    if (cachedOfflineSnapshot?.reminders && cachedOfflineSnapshot.reminders.length > 0) {
      return cachedOfflineSnapshot.reminders;
    }
    return INITIAL_REMINDERS;
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    if (cachedOfflineSnapshot?.calendarEvents && cachedOfflineSnapshot.calendarEvents.length > 0) {
      return cachedOfflineSnapshot.calendarEvents;
    }
    return INITIAL_CALENDAR_EVENTS;
  });

  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);

  const [tasks, setTasks] = useState<CareTask[]>(() => {
    if (cachedOfflineSnapshot?.tasks && cachedOfflineSnapshot.tasks.length > 0) {
      return cachedOfflineSnapshot.tasks;
    }
    return INITIAL_CARE_TASKS;
  });

  const [ddaLogs, setDdaLogs] = useState<DDAMetric[]>([]);

  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    if (cachedOfflineSnapshot?.contacts && cachedOfflineSnapshot.contacts.length > 0) {
      return cachedOfflineSnapshot.contacts;
    }
    return EMERGENCY_CONTACTS;
  });

  // Calling simulation modal
  const [callingContact, setCallingContact] = useState<EmergencyContact | null>(null);

  // --- Background synchronization of offline queue when network reconnects ---
  useEffect(() => {
    const handleOnlineSync = async () => {
      const queue = getOfflineQueue();
      if (queue.length === 0) return;
      console.log(`Monor Xur: Network online. Flushing ${queue.length} offline updates...`);
      for (const item of queue) {
        try {
          if (item.type === 'toggle_reminder' || item.type === 'add_reminder') {
            await saveReminderToDb(DEFAULT_PATIENT_ID, item.payload);
          } else if (item.type === 'update_task') {
            await saveCareTaskToDb(DEFAULT_PATIENT_ID, item.payload);
          } else if (item.type === 'update_profile') {
            await savePatientProfile(DEFAULT_PATIENT_ID, item.payload);
          }
        } catch (err) {
          console.warn('Failed to flush offline queue item:', err);
        }
      }
      clearOfflineQueue();
    };

    window.addEventListener('online', handleOnlineSync);
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      handleOnlineSync();
    }

    return () => {
      window.removeEventListener('online', handleOnlineSync);
    };
  }, []);

  // --- Real-time Firebase Synchronization & Offline Cache Update ---
  useEffect(() => {
    // 1. Patient Profile
    const unsubPatient = subscribeToPatientProfile(DEFAULT_PATIENT_ID, (data) => {
      if (data && data.name) {
        setPatientProfile(data);
        localStorage.setItem('monor_xur_setup_completed', 'true');
        saveOfflineSnapshot({ patientProfile: data });
      }
    });

    // 2. Medical Profile
    const unsubMedical = subscribeToMedicalProfile(DEFAULT_PATIENT_ID, (data) => {
      if (data) {
        setMedicalProfile(data);
        saveOfflineSnapshot({ medicalProfile: data });
      }
    });

    // 3. Memories
    const unsubMemories = subscribeToMemories(DEFAULT_PATIENT_ID, (data) => {
      setMemories(data);
      saveOfflineSnapshot({ memories: data });
    });

    // 4. Reminders (Daily plan)
    const unsubReminders = subscribeToReminders(DEFAULT_PATIENT_ID, (data) => {
      setReminders(data);
      saveOfflineSnapshot({ reminders: data });
    });

    // 5. Calendar Events (Daily plan)
    const unsubEvents = subscribeToEvents(DEFAULT_PATIENT_ID, (data: CalendarEvent[]) => {
      setCalendarEvents(data);
      saveOfflineSnapshot({ calendarEvents: data });
    });

    // 6. Alerts
    const unsubAlerts = subscribeToAlerts(DEFAULT_PATIENT_ID, (data: AlertItem[]) => {
      setAlerts(data);
    });

    // 7. Care Tasks
    const unsubTasks = subscribeToCareTasks(DEFAULT_PATIENT_ID, (data) => {
      setTasks(data);
      saveOfflineSnapshot({ tasks: data });
    });

    // 8. Emergency Contacts
    const unsubContacts = subscribeToContacts(DEFAULT_PATIENT_ID, (data) => {
      if (data && data.length > 0) {
        setContacts(data);
        saveOfflineSnapshot({ contacts: data });
      }
    });

    return () => {
      unsubPatient();
      unsubMedical();
      unsubMemories();
      unsubReminders();
      unsubEvents();
      unsubAlerts();
      unsubTasks();
      unsubContacts();
    };
  }, []);

  // Handlers
  const handleSwitchRole = (newRole: AppRole) => {
    soundController.playClick();
    setRole(newRole);
    if (newRole === 'patient') {
      setPatientTab('home');
      setPatientSubView('none');
      setSelectedMemory(null);
    } else if (newRole === 'family') {
      setFamilyTab('home');
    } else if (newRole === 'asha') {
      setAshaTab('home');
    }
  };

  const handlePatientSelectTab = (tab: PatientTab) => {
    soundController.playClick();
    setPatientTab(tab);
    setPatientSubView('none');
    setSelectedMemory(null);
  };

  const handleCompleteSetup = async (data: {
    patient: PatientProfile;
    medical: MedicalProfile;
    caregiver: CaregiverAccount;
    asha?: AshaAccount;
    emergencyContact: EmergencyContact;
  }) => {
    setPatientProfile(data.patient);
    setMedicalProfile(data.medical);
    setContacts([data.emergencyContact]);

    localStorage.setItem('monor_xur_setup_completed', 'true');
    localStorage.setItem('monor_xur_patient', JSON.stringify(data.patient));
    localStorage.setItem('monor_xur_medical', JSON.stringify(data.medical));

    try {
      await savePatientProfile(DEFAULT_PATIENT_ID, data.patient);
      await saveMedicalProfile(DEFAULT_PATIENT_ID, data.medical);
      await saveContactToDb(DEFAULT_PATIENT_ID, data.emergencyContact);

      // Create reminders based on prescriptions if user has no reminders yet
      if (data.medical.prescriptions && data.medical.prescriptions.length > 0 && reminders.length === 0) {
        const initialReminders: Reminder[] = data.medical.prescriptions.map((rx, i) => {
          const isNight = rx.toLowerCase().includes('night') || rx.toLowerCase().includes('evening');
          return {
            id: `rx_${Date.now()}_${i}`,
            title: `Take ${rx}`,
            type: 'medicine',
            time_label: isNight ? '08:00 PM' : '09:00 AM',
            minutes: isNight ? 20 * 60 : 9 * 60,
            note: 'Prescribed daily medicine',
            completed: false,
          };
        });
        await saveRemindersListToDb(DEFAULT_PATIENT_ID, initialReminders);
      }
    } catch (err) {
      console.error('Error saving setup data to Firestore:', err);
    }

    soundController.playSuccess();
    soundController.speak(`Welcome to Monor Xur, ${data.patient.name}!`);
    handleSwitchRole('patient');
  };

  const handleUpdateAsha = async (updatedAsha: AshaAccount) => {
    const updatedPatient: PatientProfile = {
      ...patientProfile,
      asha: updatedAsha,
    };
    setPatientProfile(updatedPatient);
    await savePatientProfile(DEFAULT_PATIENT_ID, updatedPatient);
  };

  const handleToggleReminder = async (id: string) => {
    const target = reminders.find((r) => r.id === id);
    if (target) {
      const updated = { ...target, completed: !target.completed };
      const updatedList = reminders.map((r) => (r.id === id ? updated : r));
      setReminders(updatedList);
      saveOfflineSnapshot({ reminders: updatedList });

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        queueOfflineMutation({ type: 'toggle_reminder', payload: updated });
      } else {
        await saveReminderToDb(DEFAULT_PATIENT_ID, updated);
      }
    }
  };

  const handleAddReminder = async (reminder: Reminder) => {
    const updatedList = [reminder, ...reminders];
    setReminders(updatedList);
    saveOfflineSnapshot({ reminders: updatedList });

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      queueOfflineMutation({ type: 'add_reminder', payload: reminder });
    } else {
      await saveReminderToDb(DEFAULT_PATIENT_ID, reminder);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    soundController.playClick();
    const updatedList = reminders.filter((r) => r.id !== id);
    setReminders(updatedList);
    saveOfflineSnapshot({ reminders: updatedList });
    await deleteReminderFromDb(DEFAULT_PATIENT_ID, id);
  };

  const handleAddCalendarEvent = async (event: CalendarEvent) => {
    const updatedList = [event, ...calendarEvents];
    setCalendarEvents(updatedList);
    saveOfflineSnapshot({ calendarEvents: updatedList });
    await saveCalendarEventToDb(DEFAULT_PATIENT_ID, event);
  };

  const handleAcknowledgeAlert = async (id: string) => {
    soundController.playClick();
    const target = alerts.find((a) => a.id === id);
    if (target) {
      const updated = { ...target, acknowledged: true };
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
      await saveAlertToDb(DEFAULT_PATIENT_ID, updated);
    }
  };

  const handleToggleTask = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (target) {
      const updated = { ...target, done: !target.done };
      const updatedTasks = tasks.map((t) => (t.id === id ? updated : t));
      setTasks(updatedTasks);
      saveOfflineSnapshot({ tasks: updatedTasks });

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        queueOfflineMutation({ type: 'update_task', payload: updated });
      } else {
        await saveCareTaskToDb(DEFAULT_PATIENT_ID, updated);
      }
    }
  };

  const handleLogDDAMetric = (metric: DDAMetric) => {
    setDdaLogs((prev) => [metric, ...prev]);
  };

  const handleAddMemory = async (memory: Memory) => {
    const updated = [memory, ...memories];
    setMemories(updated);
    saveOfflineSnapshot({ memories: updated });
    await addMemoryToDb(DEFAULT_PATIENT_ID, memory);
  };

  const handleDeleteMemory = async (id: string) => {
    soundController.playClick();
    const updated = memories.filter((m) => m.id !== id);
    setMemories(updated);
    saveOfflineSnapshot({ memories: updated });
    await deleteMemoryFromDb(DEFAULT_PATIENT_ID, id);
  };

  const handleUpdatePatientProfile = async (updated: PatientProfile) => {
    setPatientProfile(updated);
    localStorage.setItem('monor_xur_patient', JSON.stringify(updated));
    saveOfflineSnapshot({ patientProfile: updated });

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      queueOfflineMutation({ type: 'update_profile', payload: updated });
    } else {
      await savePatientProfile(DEFAULT_PATIENT_ID, updated);
    }
  };

  const handleUpdateMedicalProfile = async (updated: MedicalProfile) => {
    setMedicalProfile(updated);
    localStorage.setItem('monor_xur_medical', JSON.stringify(updated));
    saveOfflineSnapshot({ medicalProfile: updated });
    await saveMedicalProfile(DEFAULT_PATIENT_ID, updated);
  };

  const triggerCallFamily = () => {
    soundController.playChime(440, 0.5);
    const activeContact = contacts[0] || (patientProfile.caregiver ? {
      id: 'primary-caregiver',
      name: patientProfile.caregiver.name,
      relationship: patientProfile.caregiver.relationship,
      phone: patientProfile.caregiver.phone,
    } : null);
    if (activeContact) {
      setCallingContact(activeContact);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D3A2F] flex flex-col font-sans selection:bg-[#5B825B]/20">
      <OfflineIndicator />
      {/* Top Header */}
      <Header
        role={role}
        onSwitchRole={handleSwitchRole}
        onCallEmergency={triggerCallFamily}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-lg w-full mx-auto pb-6">
        {/* ROLE 0: INITIAL FIRST INSTALL SETUP PAGE */}
        {role === 'setup' && (
          <InitialSetupPage
            initialPatient={patientProfile.name ? patientProfile : undefined}
            initialMedical={medicalProfile.stage ? medicalProfile : undefined}
            onComplete={handleCompleteSetup}
            onCancel={() => handleSwitchRole('patient')}
            isEditing={Boolean(patientProfile.name && isSetupCompletedLocally)}
          />
        )}

        {/* ROLE 1: PATIENT MODE */}
        {role === 'patient' && (
          <div>
            {/* Sub-view: Puzzle Game */}
            {patientSubView === 'puzzle' && (
              <PuzzleGame
                memories={memories}
                onBack={() => setPatientSubView('none')}
                onLogDDAMetric={handleLogDDAMetric}
              />
            )}

            {/* Sub-view: Memory Match Game */}
            {patientSubView === 'memory_match' && (
              <MemoryMatchGame
                onBack={() => setPatientSubView('none')}
                onLogDDAMetric={handleLogDDAMetric}
              />
            )}

            {/* Sub-view: Relaxation Hub */}
            {patientSubView === 'relaxation' && (
              <RelaxationHub
                onSelectSubView={setPatientSubView}
                onBack={() => setPatientSubView('none')}
              />
            )}

            {/* Sub-view: Breathing Exercise */}
            {patientSubView === 'breathing' && (
              <BreathingExercise onBack={() => setPatientSubView('relaxation')} />
            )}

            {/* Sub-view: Music */}
            {patientSubView === 'music' && (
              <RelaxationMusic onBack={() => setPatientSubView('relaxation')} />
            )}

            {/* Sub-view: Daily Life / Reminders */}
            {patientSubView === 'daily_life' && (
              <DailyLife
                reminders={reminders}
                onToggleReminder={handleToggleReminder}
                onBack={() => setPatientSubView('none')}
              />
            )}

            {/* Sub-view: Memory Viewer */}
            {patientSubView === 'none' && selectedMemory && (
              <MemoryViewer
                memories={memories}
                currentMemoryId={selectedMemory.id}
                onClose={() => setSelectedMemory(null)}
              />
            )}

            {/* Default Tab Views when no sub-view is active */}
            {patientSubView === 'none' && !selectedMemory && (
              <>
                {patientTab === 'home' && (
                  <PatientHome
                    patientName={patientProfile.name || 'Friend'}
                    onSelectTab={handlePatientSelectTab}
                    onSelectSubView={setPatientSubView}
                    reminders={reminders}
                    onCallFamily={triggerCallFamily}
                  />
                )}

                {patientTab === 'memories' && (
                  <MemoriesGallery
                    memories={memories}
                    patientName={patientProfile.name || 'Friend'}
                    onOpenMemory={(mem) => setSelectedMemory(mem)}
                    onAddMemory={handleAddMemory}
                  />
                )}

                {patientTab === 'play' && (
                  <GamesHub
                    onSelectGame={(g) => setPatientSubView(g)}
                    currentLevel={2}
                  />
                )}

                {patientTab === 'settings' && (
                  <PatientSettings
                    onOpenCaregiverSelect={() => handleSwitchRole('caregiver_select')}
                    onCallEmergency={triggerCallFamily}
                    patientProfile={patientProfile}
                    contacts={contacts}
                    onOpenSetup={() => handleSwitchRole('setup')}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* ROLE 2: CAREGIVER SELECTION */}
        {role === 'caregiver_select' && (
          <CaregiverSelect
            onSelectRole={(r) => handleSwitchRole(r)}
            onBack={() => handleSwitchRole('patient')}
            patientName={patientProfile.name || 'Player'}
            onOpenSetup={() => handleSwitchRole('setup')}
          />
        )}

        {/* ROLE 3: FAMILY LOGIN */}
        {role === 'family_login' && (
          <FamilyLogin
            onSuccess={() => handleSwitchRole('family')}
            onBack={() => handleSwitchRole('caregiver_select')}
            patientName={patientProfile.name || 'Player'}
            configuredPin={patientProfile.caregiver?.pin || '1234'}
            onReopenSetup={() => handleSwitchRole('setup')}
          />
        )}

        {/* ROLE 4: ASHA LOGIN */}
        {role === 'asha_login' && (
          <AshaLogin
            onSuccess={() => handleSwitchRole('asha')}
            onBack={() => handleSwitchRole('caregiver_select')}
            configuredAsha={patientProfile.asha}
            onUpdateAsha={handleUpdateAsha}
          />
        )}

        {/* ROLE 5: FAMILY CAREGIVER DASHBOARD */}
        {role === 'family' && (
          <FamilyDashboard
            currentTab={familyTab}
            onSelectTab={setFamilyTab}
            calendarEvents={calendarEvents}
            onAddCalendarEvent={handleAddCalendarEvent}
            reminders={reminders}
            onAddReminder={handleAddReminder}
            onDeleteReminder={handleDeleteReminder}
            onToggleReminder={handleToggleReminder}
            alerts={alerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            contacts={contacts}
            onCallContact={(c) => setCallingContact(c)}
            ddaLogs={ddaLogs}
            onLogDDAMetric={handleLogDDAMetric}
            onNavigateToGames={() => {
              setRole('patient');
              setPatientTab('play');
            }}
            memories={memories}
            onAddMemory={handleAddMemory}
            onDeleteMemory={handleDeleteMemory}
            patientProfile={patientProfile}
            onUpdatePatientProfile={handleUpdatePatientProfile}
            medicalProfile={medicalProfile}
            onUpdateMedicalProfile={handleUpdateMedicalProfile}
            onOpenSetup={() => handleSwitchRole('setup')}
          />
        )}

        {/* ROLE 6: ASHA HEALTH WORKER DASHBOARD */}
        {role === 'asha' && (
          <AshaDashboard
            currentTab={ashaTab}
            onSelectTab={setAshaTab}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            alerts={alerts}
            onCallEmergency={triggerCallFamily}
            patientProfile={patientProfile}
            medicalProfile={medicalProfile}
            onOpenSetup={() => handleSwitchRole('setup')}
          />
        )}
      </main>

      {/* Persistent Bottom Nav according to role (hidden during setup) */}
      {role === 'patient' && (
        <PatientBottomNav
          activeTab={patientTab}
          onSelectTab={handlePatientSelectTab}
        />
      )}

      {role === 'family' && (
        <FamilyBottomNav
          activeTab={familyTab}
          onSelectTab={setFamilyTab}
          alertCount={alerts.filter((a) => !a.acknowledged).length}
        />
      )}

      {role === 'asha' && (
        <AshaBottomNav
          activeTab={ashaTab}
          onSelectTab={setAshaTab}
          pendingTasksCount={tasks.filter((t) => !t.done).length}
        />
      )}

      {/* Simulated Emergency Call Popup Modal */}
      {callingContact && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-[#E0DCD3] animate-scaleUp">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#EAF1E8] text-[#5B825B] flex items-center justify-center shadow-inner animate-pulse">
              <Phone className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs font-black uppercase text-[#5B825B] tracking-wider">
                Connecting Call...
              </span>
              <h3 className="text-2xl font-black text-[#2D3A2F] mt-1">
                {callingContact.name}
              </h3>
              <p className="text-sm font-semibold text-[#5A6E5D]">
                {callingContact.relationship} • {callingContact.phone}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] text-xs text-[#5A6E5D]">
              One-touch emergency & family calling connects older adults immediately with their primary caregiver.
            </div>

            <button
              onClick={() => {
                soundController.playClick();
                setCallingContact(null);
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#C46A66] text-white font-extrabold text-sm hover:bg-[#b05854] shadow-xs active:scale-95 transition-all"
            >
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
