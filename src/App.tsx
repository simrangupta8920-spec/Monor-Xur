import React, { useState } from 'react';
import { 
  AppRole, PatientTab, PatientSubView, FamilyCaregiverTab, AshaTab, Memory, 
  DDAMetric, CalendarEvent, Reminder, AlertItem, EmergencyContact, 
  PatientProfile, MedicalProfile 
} from './types';
import { 
  INITIAL_PATIENT_PROFILE, INITIAL_MEDICAL_PROFILE, INITIAL_MEMORIES, INITIAL_REMINDERS, 
  INITIAL_CALENDAR_EVENTS, INITIAL_ALERTS, 
  INITIAL_CARE_TASKS, EMERGENCY_CONTACTS 
} from './data/mockData';
import { Header } from './components/common/Header';
import { PatientBottomNav, FamilyBottomNav, AshaBottomNav } from './components/common/BottomNav';
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
import { soundController } from './utils/audio';
import { Phone, X } from 'lucide-react';

export function App() {
  // Roles & View navigation
  const [role, setRole] = useState<AppRole>('patient');
  const [patientTab, setPatientTab] = useState<PatientTab>('home');
  const [patientSubView, setPatientSubView] = useState<PatientSubView>('none');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  const [familyTab, setFamilyTab] = useState<FamilyCaregiverTab>('home');
  const [ashaTab, setAshaTab] = useState<AshaTab>('home');

  // Application Data States (synced locally across modes)
  const [patientProfile, setPatientProfile] = useState<PatientProfile>(INITIAL_PATIENT_PROFILE);
  const [medicalProfile, setMedicalProfile] = useState<MedicalProfile>(INITIAL_MEDICAL_PROFILE);
  const [memories, setMemories] = useState<Memory[]>(INITIAL_MEMORIES);
  const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [tasks, setTasks] = useState(INITIAL_CARE_TASKS);
  const [ddaLogs, setDdaLogs] = useState<DDAMetric[]>([]);
  const [contacts] = useState<EmergencyContact[]>(EMERGENCY_CONTACTS);

  // Calling simulation modal
  const [callingContact, setCallingContact] = useState<EmergencyContact | null>(null);

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

  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const handleAddReminder = (reminder: Reminder) => {
    setReminders((prev) => [reminder, ...prev]);
  };

  const handleDeleteReminder = (id: string) => {
    soundController.playClick();
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddCalendarEvent = (event: CalendarEvent) => {
    setCalendarEvents((prev) => [event, ...prev]);
  };

  const handleAcknowledgeAlert = (id: string) => {
    soundController.playClick();
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const handleLogDDAMetric = (metric: DDAMetric) => {
    setDdaLogs((prev) => [metric, ...prev]);
  };

  const handleAddMemory = (memory: Memory) => {
    setMemories((prev) => [memory, ...prev]);
  };

  const handleDeleteMemory = (id: string) => {
    soundController.playClick();
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleUpdatePatientProfile = (updated: PatientProfile) => {
    setPatientProfile(updated);
  };

  const handleUpdateMedicalProfile = (updated: MedicalProfile) => {
    setMedicalProfile(updated);
  };

  const triggerCallFamily = () => {
    soundController.playChime(440, 0.5);
    setCallingContact(contacts[0]);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D3A2F] flex flex-col font-sans selection:bg-[#5B825B]/20">
      {/* Top Header */}
      <Header
        role={role}
        onSwitchRole={handleSwitchRole}
        onCallEmergency={triggerCallFamily}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-lg w-full mx-auto pb-6">
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

            {/* Sub-view: Picture Pairs Game */}
            {patientSubView === 'picture_pairs' && (
              <MemoryMatchGame
                onBack={() => setPatientSubView('none')}
                onLogDDAMetric={handleLogDDAMetric}
              />
            )}

            {/* Sub-view: Word Recall */}
            {patientSubView === 'word_recall' && (
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
                    patientName={patientProfile.name}
                    onSelectTab={handlePatientSelectTab}
                    onSelectSubView={setPatientSubView}
                    reminders={reminders}
                    onCallFamily={triggerCallFamily}
                  />
                )}

                {patientTab === 'memories' && (
                  <MemoriesGallery
                    memories={memories}
                    onOpenMemory={(mem) => setSelectedMemory(mem)}
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
          />
        )}

        {/* ROLE 3: FAMILY LOGIN */}
        {role === 'family_login' && (
          <FamilyLogin
            onSuccess={() => handleSwitchRole('family')}
            onBack={() => handleSwitchRole('caregiver_select')}
          />
        )}

        {/* ROLE 4: ASHA LOGIN */}
        {role === 'asha_login' && (
          <AshaLogin
            onSuccess={() => handleSwitchRole('asha')}
            onBack={() => handleSwitchRole('caregiver_select')}
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
            memories={memories}
            onAddMemory={handleAddMemory}
            onDeleteMemory={handleDeleteMemory}
            patientProfile={patientProfile}
            onUpdatePatientProfile={handleUpdatePatientProfile}
            medicalProfile={medicalProfile}
            onUpdateMedicalProfile={handleUpdateMedicalProfile}
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
          />
        )}
      </main>

      {/* Persistent Bottom Nav according to role */}
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
