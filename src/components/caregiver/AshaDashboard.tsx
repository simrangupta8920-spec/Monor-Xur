import React from 'react';
import { 
  ClipboardList, Stethoscope, AlertTriangle, CheckCircle2, Circle, Phone, ShieldAlert, Award 
} from 'lucide-react';
import { AshaTab, CareTask, AlertItem, PatientProfile, MedicalProfile } from '../../types';
import { PATIENT as DEFAULT_PATIENT, REPORT_SUMMARY, MEDICAL_DISCLAIMER, GAME_PROGRESS } from '../../data/mockData';
import { soundController } from '../../utils/audio';

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
}) => {
  const patient = patientProfile || DEFAULT_PATIENT;
  const completedTasks = tasks.filter((t) => t.done).length;

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
              <span className="text-3xl font-black text-[#5B825B]">{GAME_PROGRESS.accuracy}%</span>
              <span className="block text-xs font-bold text-[#5A6E5D] mt-1">Cognitive Accuracy</span>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-[#E0DCD3] shadow-xs text-center">
              <span className="text-3xl font-black text-[#2D3A2F]">{completedTasks}/{tasks.length}</span>
              <span className="block text-xs font-bold text-[#5A6E5D] mt-1">Follow-Up Tasks</span>
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
            <p className="text-xs text-[#5A6E5D]">Clinical engagement summary and activity assessment.</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#5B825B]">{REPORT_SUMMARY.period}</span>
              <span className="px-3 py-1 rounded-full bg-[#EAF1E8] text-[#5B825B] text-xs font-extrabold">
                {REPORT_SUMMARY.engagement} Engagement
              </span>
            </div>

            <p className="text-sm text-[#2D3A2F] bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#E0DCD3] leading-relaxed">
              {REPORT_SUMMARY.note}
            </p>

            <div className="divide-y divide-[#EAE6DF] text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="font-bold text-[#5A6E5D]">Total Memory Sessions</span>
                <span className="font-black text-[#2D3A2F]">{REPORT_SUMMARY.totalSessions} sessions</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-bold text-[#5A6E5D]">Average Accuracy</span>
                <span className="font-black text-[#5B825B]">{REPORT_SUMMARY.avgAccuracy}%</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-bold text-[#5A6E5D]">Most Consistent Exercise</span>
                <span className="font-black text-[#2D3A2F]">{REPORT_SUMMARY.bestGame}</span>
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
