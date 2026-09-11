import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, Stethoscope, AlertTriangle, CheckCircle2, Circle, Phone, ShieldAlert, Award,
  Puzzle, Brain 
} from 'lucide-react';
import { AshaTab, CareTask, AlertItem, PatientProfile, MedicalProfile, DDAMetric } from '../../types';
import { PATIENT as DEFAULT_PATIENT, MEDICAL_DISCLAIMER } from '../../data/mockData';
import { soundController } from '../../utils/audio';
import { 
  computeGameStats, 
  getGameBreakdown, 
  filterLogsByGame, 
  generateClinicalReportSummary, 
  GameFilterType,
  BASELINE_GAME_SESSIONS
} from '../../utils/gameAnalytics';

interface AshaDashboardProps {
  currentTab: AshaTab;
  onSelectTab: (tab: AshaTab) => void;
  tasks: CareTask[];
  onToggleTask: (id: string) => void;
  alerts: AlertItem[];
  onCallEmergency: () => void;
  patientProfile?: PatientProfile;
  medicalProfile?: MedicalProfile;
  onOpenSetup?: () => void;
  ddaLogs?: DDAMetric[];
}

export const AshaDashboard: React.FC<AshaDashboardProps> = ({
  currentTab,
  onSelectTab,
  tasks,
  onToggleTask,
  alerts,
  onCallEmergency,
  patientProfile,
  medicalProfile,
  onOpenSetup,
  ddaLogs = [],
}) => {
  const [gameFilter, setGameFilter] = useState<GameFilterType>('all');
  const patient = patientProfile || DEFAULT_PATIENT;
  const completedTasks = tasks.filter((t) => t.done).length;

  const effectiveLogs = useMemo(() => {
    return ddaLogs && ddaLogs.length > 0 ? ddaLogs : BASELINE_GAME_SESSIONS;
  }, [ddaLogs]);

  const globalGameStats = useMemo(() => {
    return computeGameStats(effectiveLogs);
  }, [effectiveLogs]);

  const gameBreakdown = useMemo(() => {
    return getGameBreakdown(effectiveLogs);
  }, [effectiveLogs]);

  const filteredLogs = useMemo(() => {
    return filterLogsByGame(effectiveLogs, gameFilter);
  }, [effectiveLogs, gameFilter]);

  const filteredStats = useMemo(() => {
    return computeGameStats(filteredLogs);
  }, [filteredLogs]);

  const reportSummary = useMemo(() => {
    return generateClinicalReportSummary(filteredLogs, patient.fullName);
  }, [filteredLogs, patient.fullName]);

  return (
    <div className="p-4 pb-24 space-y-4 animate-fadeIn">
      {/* 1. ASHA HOME */}
      {currentTab === 'home' && (
        <div className="space-y-4">
          {/* Patient Card for ASHA */}
          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <img
                src={patient.avatar}
                alt={patient.fullName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#E8B25C]"
              />
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FDF0D5] text-[#332610] text-[10px] font-black uppercase">
                  Community Member & Player
                </span>
                <h3 className="text-xl font-black text-[#2D3A2F] mt-0.5">{patient.fullName}</h3>
                <p className="text-xs text-[#5A6E5D]">
                  {patient.age} yrs • {patient.region}
                </p>
              </div>
            </div>
            <button
              onClick={onCallEmergency}
              className="p-3 rounded-2xl bg-[#C46A66] text-white hover:bg-[#b05854]"
              aria-label="Call Family"
            >
              <Phone className="w-5 h-5" />
            </button>
          </div>

          {/* Major Care Issue Highlight */}
          <div className="bg-[#F0D8D6] rounded-3xl p-4 border border-[#e0c3c0] shadow-xs flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-[#C46A66] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-[#3D2423]/70">Major Care Priority</span>
              <h4 className="font-extrabold text-base text-[#3D2423] leading-tight">
                {patient.majorCareIssue}
              </h4>
              <p className="text-xs text-[#3D2423]/80 mt-1">
                Monitor memory stimulation adherence and ensure evening BP pills are acknowledged.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-3xl border border-[#E0DCD3] shadow-xs text-center">
              <span className="text-3xl font-black text-[#5B825B]">{globalGameStats.avgAccuracy}%</span>
              <span className="block text-xs font-bold text-[#5A6E5D] mt-1">Cognitive Accuracy</span>
              <span className="block text-[10px] text-[#5B825B] font-extrabold mt-0.5">
                {gameBreakdown.memoryMatch.sessions} Match • {gameBreakdown.puzzle.sessions} Puzzle
              </span>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-[#E0DCD3] shadow-xs text-center">
              <span className="text-3xl font-black text-[#2D3A2F]">{completedTasks}/{tasks.length}</span>
              <span className="block text-xs font-bold text-[#5A6E5D] mt-1">Follow-Up Tasks</span>
              <span className="block text-[10px] text-[#5A6E5D] font-extrabold mt-0.5">
                {globalGameStats.totalSessions} Game Sessions
              </span>
            </div>
          </div>

          {/* Upcoming Appointment */}
          <div className="bg-white rounded-3xl p-4 border border-[#E0DCD3] shadow-xs space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#5A6E5D]">Next Clinical Review</h4>
            <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3]">
              <h5 className="font-extrabold text-sm text-[#2D3A2F]">Dr. Meera Rao (Neurology)</h5>
              <p className="text-xs text-[#5B825B] font-semibold">Today, 11:00 AM • City Neuro Clinic</p>
            </div>
          </div>

          {/* ASHA Worker Profile & Credentials */}
          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#5A6E5D]">Configured ASHA Worker</h4>
                <p className="text-xs text-[#5B825B] font-extrabold">Active Community Healthcare Link</p>
              </div>
              {onOpenSetup && (
                <button
                  onClick={() => {
                    soundController.playClick();
                    onOpenSetup();
                  }}
                  className="px-3 py-1 rounded-xl bg-[#FDF0D5] text-[#A66E14] text-xs font-black hover:bg-[#fae7b9]"
                >
                  Edit Profile
                </button>
              )}
            </div>
            <div className="divide-y divide-[#EAE6DF] text-xs">
              <div className="py-2 flex items-center justify-between">
                <span className="text-[#5A6E5D] font-bold">Worker ID</span>
                <span className="font-extrabold text-[#2D3A2F]">{patient.asha?.workerId || 'ASHA-001'}</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-[#5A6E5D] font-bold">Worker Name</span>
                <span className="font-extrabold text-[#2D3A2F]">{patient.asha?.name || 'Sunita Das'}</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-[#5A6E5D] font-bold">Sub-Centre / Village</span>
                <span className="font-extrabold text-[#2D3A2F]">{patient.asha?.subCentre || 'Kamrup Community Health Sub-Centre'}</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-[#5A6E5D] font-bold">Contact Phone</span>
                <span className="font-extrabold text-[#2D3A2F]">{patient.asha?.phone || '+91 91234 56789'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. REPORT TAB */}
      {currentTab === 'report' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-black text-[#2D3A2F]">ASHA Health Report</h2>
            <p className="text-xs text-[#5A6E5D]">Clinical engagement summary and game performance assessment.</p>
          </div>

          {/* Game Filter Bar */}
          <div className="bg-white p-3 rounded-2xl border border-[#E0DCD3] shadow-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-[#2D3A2F] uppercase tracking-wider pl-1">Report Scope:</span>
              <button
                onClick={() => {
                  soundController.playClick();
                  setGameFilter('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  gameFilter === 'all'
                    ? 'bg-[#2D3A2F] text-white shadow-2xs'
                    : 'bg-[#FDFBF7] text-[#5A6E5D] border border-[#E0DCD3] hover:bg-[#EAF1E8]'
                }`}
              >
                <span>Combined Overview ({effectiveLogs.length})</span>
              </button>
              <button
                onClick={() => {
                  soundController.playClick();
                  setGameFilter('memory_match');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  gameFilter === 'memory_match'
                    ? 'bg-[#5B825B] text-white shadow-2xs'
                    : 'bg-[#FDFBF7] text-[#5A6E5D] border border-[#E0DCD3] hover:bg-[#EAF1E8]'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Memory Match ({gameBreakdown.memoryMatch.sessions})</span>
              </button>
              <button
                onClick={() => {
                  soundController.playClick();
                  setGameFilter('puzzle');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  gameFilter === 'puzzle'
                    ? 'bg-[#E8B25C] text-[#332610] shadow-2xs'
                    : 'bg-[#FDFBF7] text-[#5A6E5D] border border-[#E0DCD3] hover:bg-[#FDF0D5]'
                }`}
              >
                <Puzzle className="w-3.5 h-3.5" />
                <span>Photo Puzzle ({gameBreakdown.puzzle.sessions})</span>
              </button>
            </div>
            <span className="text-[11px] font-bold text-[#5A6E5D]">
              {filteredLogs.length} Sessions Assessed
            </span>
          </div>

          {/* Game Comparison Breakdown when 'All' is selected */}
          {gameFilter === 'all' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-3xl border border-[#5B825B]/30 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#EAF1E8] text-[#5B825B] flex items-center justify-center">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-[#2D3A2F]">Memory Match</h4>
                      <p className="text-[11px] text-[#5A6E5D]">{gameBreakdown.memoryMatch.sessions} sessions</p>
                    </div>
                  </div>
                  <span className="text-xl font-black text-[#5B825B]">{gameBreakdown.memoryMatch.accuracy}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#EAE6DF] text-center text-xs">
                  <div>
                    <span className="block text-[10px] text-[#5A6E5D]">Errors</span>
                    <strong className="text-[#2D3A2F] font-black">{gameBreakdown.memoryMatch.avgMistakes}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#5A6E5D]">Speed</span>
                    <strong className="text-[#2D3A2F] font-black">{gameBreakdown.memoryMatch.avgLatencySec}s</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#5A6E5D]">DDA Tier</span>
                    <strong className="text-[#5B825B] font-black">Lvl {gameBreakdown.memoryMatch.level}</strong>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-[#E8B25C]/40 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#FDF0D5] text-[#8C651E] flex items-center justify-center">
                      <Puzzle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-[#2D3A2F]">Photo Puzzle</h4>
                      <p className="text-[11px] text-[#5A6E5D]">{gameBreakdown.puzzle.sessions} sessions</p>
                    </div>
                  </div>
                  <span className="text-xl font-black text-[#E8B25C]">{gameBreakdown.puzzle.accuracy}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#EAE6DF] text-center text-xs">
                  <div>
                    <span className="block text-[10px] text-[#5A6E5D]">Errors</span>
                    <strong className="text-[#2D3A2F] font-black">{gameBreakdown.puzzle.avgMistakes}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#5A6E5D]">Speed</span>
                    <strong className="text-[#2D3A2F] font-black">{gameBreakdown.puzzle.avgLatencySec}s</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#5A6E5D]">DDA Tier</span>
                    <strong className="text-[#E8B25C] font-black">Lvl {gameBreakdown.puzzle.level}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#5B825B]">{reportSummary.period}</span>
              <span className="px-3 py-1 rounded-full bg-[#EAF1E8] text-[#5B825B] text-xs font-extrabold">
                {reportSummary.engagement}
              </span>
            </div>

            <p className="text-sm text-[#2D3A2F] bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#E0DCD3] leading-relaxed">
              {reportSummary.note}
            </p>

            <div className="divide-y divide-[#EAE6DF] text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="font-bold text-[#5A6E5D]">
                  {gameFilter === 'all' ? 'Total Game Sessions' : `${gameFilter === 'puzzle' ? 'Photo Puzzle' : 'Memory Match'} Sessions`}
                </span>
                <span className="font-black text-[#2D3A2F]">{filteredStats.totalSessions} sessions</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-bold text-[#5A6E5D]">Average Accuracy</span>
                <span className="font-black text-[#5B825B]">{filteredStats.avgAccuracy}%</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-bold text-[#5A6E5D]">Average Hesitation / Latency</span>
                <span className="font-black text-[#2D3A2F]">{filteredStats.avgLatencySec}s</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-bold text-[#5A6E5D]">Adaptive Difficulty Tier</span>
                <span className="font-black text-[#2D3A2F]">Level {filteredStats.currentLevel}</span>
              </div>
            </div>
          </div>

          {/* AI Cognitive Safeguard & DDA Telemetry */}
          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#5B825B]">AI Dynamic Cognitive Safeguard</span>
              <span className="text-[10px] font-black uppercase text-[#5B825B] bg-[#EAF1E8] px-2.5 py-0.5 rounded-full">
                Live Active
              </span>
            </div>
            <p className="text-xs text-[#5A6E5D] leading-relaxed">
              The AI model continuously monitors mistake patterns, latency, and hesitation. When consecutive wrong attempts indicate cognitive load, the system auto-shifts down to Level 1 (Easy) to protect mood and prevent abandonment.
            </p>
            <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] flex items-center justify-between text-xs">
              <span className="font-bold text-[#2D3A2F]">Model Engine:</span>
              <span className="font-black text-[#5B825B]">Gemini 3.8 Flash + Adaptive ML</span>
            </div>
          </div>

          {/* Medical Disclaimer Banner */}
          <div className="bg-[#FDF0D5] p-4 rounded-3xl border border-[#eadbbf] text-xs text-[#332610] leading-relaxed">
            <strong>Clinical Notice:</strong> {MEDICAL_DISCLAIMER}
          </div>
        </div>
      )}

      {/* 3. TASKS TAB */}
      {currentTab === 'tasks' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-black text-[#2D3A2F]">Community Care Tasks</h2>
            <p className="text-xs text-[#5A6E5D]">Checklist for home visits, medicine checks, and cognitive support.</p>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => {
                  soundController.playClick();
                  onToggleTask(task.id);
                }}
                className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-center justify-between ${
                  task.done
                    ? 'bg-[#EAF1E8]/70 border-[#5B825B]/40 opacity-80'
                    : 'bg-white border-[#E0DCD3] shadow-xs hover:border-[#87A987]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      task.done ? 'text-[#5B825B]' : 'text-gray-300'
                    }`}
                  >
                    {task.done ? <CheckCircle2 className="w-6 h-6 fill-[#EAF1E8]" /> : <Circle className="w-6 h-6" />}
                  </button>
                  <span className={`text-sm font-extrabold ${task.done ? 'line-through text-gray-500' : 'text-[#2D3A2F]'}`}>
                    {task.title}
                  </span>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  task.done ? 'bg-[#5B825B] text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {task.done ? 'Completed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ALERTS TAB */}
      {currentTab === 'alerts' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-black text-[#2D3A2F]">Active Alerts</h2>
            <p className="text-xs text-[#5A6E5D]">Issues requiring healthcare worker observation.</p>
          </div>

          <div className="space-y-3">
            {alerts.map((al) => (
              <div key={al.id} className="p-4 rounded-3xl bg-white border border-[#E0DCD3] shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-[#C46A66]">{al.kind.replace('_', ' ')}</span>
                  <span className="text-[11px] text-[#5A6E5D]">{al.time}</span>
                </div>
                <h4 className="font-extrabold text-base text-[#2D3A2F]">{al.title}</h4>
                <p className="text-xs text-[#5A6E5D]">{al.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
