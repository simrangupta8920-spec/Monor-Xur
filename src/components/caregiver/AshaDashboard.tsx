import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, Stethoscope, AlertTriangle, CheckCircle2, Circle, Phone, ShieldAlert, Award,
  Puzzle, Brain, ShieldCheck, Lock, History, Shield, Check
} from 'lucide-react';
import { AshaTab, CareTask, AlertItem, PatientProfile, MedicalProfile, DDAMetric, AuditLog } from '../../types';
import { PATIENT as DEFAULT_PATIENT, MEDICAL_DISCLAIMER } from '../../data/mockData';
import { soundController } from '../../utils/audio';
import { 
  computeGameStats, 
  getGameBreakdown, 
  filterLogsByGame, 
  generateClinicalReportSummary, 
  GameFilterType
} from '../../utils/gameAnalytics';
import { useLanguage } from '../../context/LanguageContext';

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
  auditLogs?: AuditLog[];
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
  auditLogs = [],
}) => {
  const { tx } = useLanguage();
  const [gameFilter, setGameFilter] = useState<GameFilterType>('all');
  const patient = patientProfile || DEFAULT_PATIENT;
  const completedTasks = tasks.filter((t) => t.done).length;

  const effectiveLogs = useMemo(() => {
    return ddaLogs || [];
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
                  {tx('Community Member & Player', 'समुदाय सदस्य व खिलाड़ी')}
                </span>
                <h3 className="text-xl font-black text-[#2D3A2F] mt-0.5">{patient.fullName}</h3>
                <p className="text-xs text-[#5A6E5D]">
                  {tx(`${patient.age} yrs • ${patient.region}`, `${patient.age} वर्ष • ${patient.region}`)}
                </p>
              </div>
            </div>
            <button
              onClick={onCallEmergency}
              className="p-3 rounded-2xl bg-[#C46A66] text-white hover:bg-[#b05854]"
              aria-label={tx('Call Family', 'परिवार को कॉल करें')}
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
              <span className="text-[10px] font-black uppercase text-[#3D2423]/70">{tx('Major Care Priority', 'प्रमुख देखभाल प्राथमिकता')}</span>
              <h4 className="font-extrabold text-base text-[#3D2423] leading-tight">
                {patient.majorCareIssue}
              </h4>
              <p className="text-xs text-[#3D2423]/80 mt-1">
                {tx('Monitor memory stimulation adherence and ensure evening BP pills are acknowledged.', 'याददाश्त अभ्यास की निगरानी करें और सुनिश्चित करें कि शाम की रक्तचाप दवा ली गई है।')}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-3xl border border-[#E0DCD3] shadow-xs text-center">
              <span className="text-3xl font-black text-[#5B825B]">{globalGameStats.avgAccuracy}%</span>
              <span className="block text-xs font-bold text-[#5A6E5D] mt-1">{tx('Cognitive Accuracy', 'संज्ञानात्मक सटीकता')}</span>
              <span className="block text-[10px] text-[#5B825B] font-extrabold mt-0.5">
                {tx(`${gameBreakdown.memoryMatch.sessions} Match • ${gameBreakdown.puzzle.sessions} Puzzle`, `${gameBreakdown.memoryMatch.sessions} मैच • ${gameBreakdown.puzzle.sessions} पहेली`)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-[#E0DCD3] shadow-xs text-center">
              <span className="text-3xl font-black text-[#2D3A2F]">{completedTasks}/{tasks.length}</span>
              <span className="block text-xs font-bold text-[#5A6E5D] mt-1">{tx('Follow-Up Tasks', 'अनुवर्ती कार्य')}</span>
              <span className="block text-[10px] text-[#5A6E5D] font-extrabold mt-0.5">
                {tx(`${globalGameStats.totalSessions} Game Sessions`, `${globalGameStats.totalSessions} खेल सत्र`)}
              </span>
            </div>
          </div>

          {/* Upcoming Appointment */}
          <div className="bg-white rounded-3xl p-4 border border-[#E0DCD3] shadow-xs space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#5A6E5D]">{tx('Next Clinical Review', 'अगली क्लीनिकल समीक्षा')}</h4>
            <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3]">
              <h5 className="font-extrabold text-sm text-[#2D3A2F]">Dr. Meera Rao (Neurology)</h5>
              <p className="text-xs text-[#5B825B] font-semibold">{tx('Today, 11:00 AM • City Neuro Clinic', 'आज, सुबह 11:00 बजे • सिटी न्यूरो क्लिनिक')}</p>
            </div>
          </div>

          {/* ASHA Worker Profile & Credentials */}
          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#5A6E5D]">{tx('Configured ASHA Worker', 'कॉन्फ़िगर की गई आशा कार्यकर्ता')}</h4>
                <p className="text-xs text-[#5B825B] font-extrabold">{tx('Active Community Healthcare Link', 'सक्रिय सामुदायिक स्वास्थ्य सेवा संपर्क')}</p>
              </div>
              {onOpenSetup && (
                <button
                  onClick={() => {
                    soundController.playClick();
                    onOpenSetup();
                  }}
                  className="px-3 py-1 rounded-xl bg-[#FDF0D5] text-[#A66E14] text-xs font-black hover:bg-[#fae7b9]"
                >
                  {tx('Edit Profile', 'प्रोफ़ाइल बदलें')}
                </button>
              )}
            </div>
            <div className="divide-y divide-[#EAE6DF] text-xs">
              <div className="py-2 flex items-center justify-between">
                <span className="text-[#5A6E5D] font-bold">{tx('Worker ID', 'कार्यकर्ता आईडी')}</span>
                <span className="font-extrabold text-[#2D3A2F]">{patient.asha?.workerId || 'ASHA-001'}</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-[#5A6E5D] font-bold">{tx('Worker Name', 'कार्यकर्ता का नाम')}</span>
                <span className="font-extrabold text-[#2D3A2F]">{patient.asha?.name || 'Sunita Das'}</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-[#5A6E5D] font-bold">{tx('Sub-Centre / Village', 'उप-केंद्र / गांव')}</span>
                <span className="font-extrabold text-[#2D3A2F]">{patient.asha?.subCentre || 'Kamrup Community Health Sub-Centre'}</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-[#5A6E5D] font-bold">{tx('Contact Phone', 'संपर्क फोन')}</span>
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
            <h2 className="text-2xl font-black text-[#2D3A2F]">{tx('ASHA Health Report', 'आशा स्वास्थ्य रिपोर्ट')}</h2>
            <p className="text-xs text-[#5A6E5D]">{tx('Clinical engagement summary and game performance assessment.', 'क्लीनिकल जुड़ाव सारांश और खेल प्रदर्शन मूल्यांकन।')}</p>
          </div>

          {/* Game Filter Bar */}
          <div className="bg-white p-3 rounded-2xl border border-[#E0DCD3] shadow-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-[#2D3A2F] uppercase tracking-wider pl-1">{tx('Report Scope:', 'रिपोर्ट का दायरा:')}</span>
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
                <span>{tx(`Combined Overview (${effectiveLogs.length})`, `संयुक्त अवलोकन (${effectiveLogs.length})`)}</span>
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
                <span>{tx(`Memory Match (${gameBreakdown.memoryMatch.sessions})`, `मेमोरी मैच (${gameBreakdown.memoryMatch.sessions})`)}</span>
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
                <span>{tx(`Photo Puzzle (${gameBreakdown.puzzle.sessions})`, `फोटो पहेली (${gameBreakdown.puzzle.sessions})`)}</span>
              </button>
            </div>
            <span className="text-[11px] font-bold text-[#5A6E5D]">
              {tx(`${filteredLogs.length} Sessions Assessed`, `${filteredLogs.length} मूल्यांकित सत्र`)}
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
                      <h4 className="font-extrabold text-sm text-[#2D3A2F]">{tx('Memory Match', 'मेमोरी मैच')}</h4>
                      <p className="text-[11px] text-[#5A6E5D]">{tx(`${gameBreakdown.memoryMatch.sessions} sessions`, `${gameBreakdown.memoryMatch.sessions} सत्र`)}</p>
                    </div>
                  </div>
                  <span className="text-xl font-black text-[#5B825B]">{gameBreakdown.memoryMatch.accuracy}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#EAE6DF] text-center text-xs">
                  <div>
                    <span className="block text-[10px] text-[#5A6E5D]">{tx('Errors', 'गलतियां')}</span>
                    <strong className="text-[#2D3A2F] font-black">{gameBreakdown.memoryMatch.avgMistakes}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#5A6E5D]">{tx('Speed', 'गति')}</span>
                    <strong className="text-[#2D3A2F] font-black">{gameBreakdown.memoryMatch.avgLatencySec}s</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#5A6E5D]">{tx('DDA Tier', 'डीडीए स्तर')}</span>
                    <strong className="text-[#5B825B] font-black">{tx(`Lvl ${gameBreakdown.memoryMatch.level}`, `स्तर ${gameBreakdown.memoryMatch.level}`)}</strong>
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
                      <h4 className="font-extrabold text-sm text-[#2D3A2F]">{tx('Photo Puzzle', 'फोटो पहेली')}</h4>
                      <p className="text-[11px] text-[#5A6E5D]">{tx(`${gameBreakdown.puzzle.sessions} sessions`, `${gameBreakdown.puzzle.sessions} सत्र`)}</p>
                    </div>
                  </div>
                  <span className="text-xl font-black text-[#E8B25C]">{gameBreakdown.puzzle.accuracy}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#EAE6DF] text-center text-xs">
                  <div>
                    <span className="block text-[10px] text-[#5A6E5D]">{tx('Errors', 'गलतियां')}</span>
                    <strong className="text-[#2D3A2F] font-black">{gameBreakdown.puzzle.avgMistakes}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#5A6E5D]">{tx('Speed', 'गति')}</span>
                    <strong className="text-[#2D3A2F] font-black">{gameBreakdown.puzzle.avgLatencySec}s</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#5A6E5D]">{tx('DDA Tier', 'डीडीए स्तर')}</span>
                    <strong className="text-[#E8B25C] font-black">{tx(`Lvl ${gameBreakdown.puzzle.level}`, `स्तर ${gameBreakdown.puzzle.level}`)}</strong>
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
                  {gameFilter === 'all' 
                    ? tx('Total Game Sessions', 'कुल खेल सत्र') 
                    : tx(`${gameFilter === 'puzzle' ? 'Photo Puzzle' : 'Memory Match'} Sessions`, `${gameFilter === 'puzzle' ? 'फोटो पहेली' : 'मेमोरी मैच'} सत्र`)}
                </span>
                <span className="font-black text-[#2D3A2F]">{tx(`${filteredStats.totalSessions} sessions`, `${filteredStats.totalSessions} सत्र`)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-bold text-[#5A6E5D]">{tx('Average Accuracy', 'औसत सटीकता')}</span>
                <span className="font-black text-[#5B825B]">{filteredStats.avgAccuracy}%</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-bold text-[#5A6E5D]">{tx('Average Hesitation / Latency', 'औसत संकोच / विलंबता')}</span>
                <span className="font-black text-[#2D3A2F]">{filteredStats.avgLatencySec}s</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-bold text-[#5A6E5D]">{tx('Adaptive Difficulty Tier', 'अनुकूली कठिनाई स्तर')}</span>
                <span className="font-black text-[#2D3A2F]">{tx(`Level ${filteredStats.currentLevel}`, `स्तर ${filteredStats.currentLevel}`)}</span>
              </div>
            </div>
          </div>

          {/* AI Cognitive Safeguard & DDA Telemetry */}
          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#5B825B]">{tx('AI Dynamic Cognitive Safeguard', 'एआई गतिशील संज्ञानात्मक सुरक्षा')}</span>
              <span className="text-[10px] font-black uppercase text-[#5B825B] bg-[#EAF1E8] px-2.5 py-0.5 rounded-full">
                {tx('Live Active', 'सक्रिय')}
              </span>
            </div>
            <p className="text-xs text-[#5A6E5D] leading-relaxed">
              {tx(
                'The AI model continuously monitors mistake patterns, latency, and hesitation. When consecutive wrong attempts indicate cognitive load, the system auto-shifts down to Level 1 (Easy) to protect mood and prevent abandonment.',
                'एआई मॉडल गलतियों के पैटर्न, विलंबता और झिझक की निरंतर निगरानी करता है। जब लगातार गलत प्रयास मानसिक तनाव का संकेत देते हैं, तो सिस्टम मूड को सुरक्षित रखने के लिए स्वचालित रूप से लेवल 1 (आसान) पर आ जाता है।'
              )}
            </p>
            <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] flex items-center justify-between text-xs">
              <span className="font-bold text-[#2D3A2F]">{tx('Model Engine:', 'मॉडल इंजन:')}</span>
              <span className="font-black text-[#5B825B]">Gemini 3.8 Flash + Adaptive ML</span>
            </div>
          </div>

          {/* DPDP Act 2023 Compliance & ASHA Audit Trail */}
          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DF]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#EAF1E8] text-[#3D663D] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#2D3A2F]">{tx('DPDP Act 2023 Security & Audit Trail', 'डीपीडीपी अधिनियम 2023 सुरक्षा व ऑडिट ट्रेल')}</h3>
                  <p className="text-[11px] text-[#5A6E5D]">{tx('Tamper-evident visit activity logs & role-scoped clinical access', 'छेड़छाड़-रोधी गतिविधि लॉग व भूमिका-आधारित क्लीनिकल पहुंच')}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#EAF1E8] text-[#3D663D] text-[10px] font-black uppercase tracking-wider">
                {tx('Audited', 'सत्यापित')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#ECE8DE] space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-[#5A6E5D] block">{tx('Patient Consent', 'मरीज़ की सहमति')}</span>
                <p className="font-extrabold text-[#3D663D] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> {tx('Granted & Verified', 'प्रदत्त एवं सत्यापित')}
                </p>
                <p className="text-[10px] text-[#8C9B8E]">
                  {patient.consentDate ? new Date(patient.consentDate).toLocaleDateString() : tx('Signed', 'हस्ताक्षरित')}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#ECE8DE] space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-[#5A6E5D] block">{tx('Access Scope', 'पहुंच का दायरा')}</span>
                <p className="font-extrabold text-[#2D3A2F] flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#5B825B]" /> {tx('Scoped to ASHA / Caregiver', 'आशा / देखभालकर्ता तक सीमित')}
                </p>
                <p className="text-[10px] text-[#8C9B8E]">{tx('Zero unauthorized data leakage', 'शून्य अनधिकृत डेटा रिसाव')}</p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-[#2D3A2F] flex items-center gap-1.5">
                  <History className="w-4 h-4 text-[#5A6E5D]" />
                  <span>{tx('Recent System & Worker Audit Events', 'हाल की सिस्टम व कार्यकर्ता ऑडिट गतिविधियां')}</span>
                </h4>
                <span className="text-[10px] font-bold text-[#8C9B8E]">{tx(`${auditLogs.length} total`, `कुल ${auditLogs.length}`)}</span>
              </div>

              <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                {auditLogs.length === 0 ? (
                  <div className="p-3 rounded-2xl bg-[#FAF8F5] text-center text-xs text-[#5A6E5D]">
                    {tx('No field actions logged yet. Visits and updates will be logged immutably.', 'अभी कोई फ़ील्ड गतिविधि दर्ज नहीं है। विज़िट और अपडेट सुरक्षित रूप से दर्ज किए जाएंगे।')}
                  </div>
                ) : (
                  auditLogs.slice(0, 8).map((log) => {
                    const dateStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-2xl bg-[#FAF8F5] border border-[#ECE8DE] flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#2D3A2F] text-xs">
                              {log.actorName || (log.actorRole === 'asha' ? tx('ASHA Worker', 'आशा कार्यकर्ता') : tx('Caregiver', 'देखभालकर्ता'))}
                            </span>
                            <span className="text-[10px] text-[#8C9B8E]">
                              • {log.action.replace(/_/g, ' ')}
                            </span>
                          </div>
                          {log.details && (
                            <p className="text-[11px] text-[#5A6E5D]">{log.details}</p>
                          )}
                        </div>
                        <span className="text-[10px] font-medium text-[#8C9B8E] shrink-0">{dateStr}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Medical Disclaimer Banner */}
          <div className="bg-[#FDF0D5] p-4 rounded-3xl border border-[#eadbbf] text-xs text-[#332610] leading-relaxed">
            <strong>{tx('Clinical Notice:', 'क्लीनिकल सूचना:')}</strong> {MEDICAL_DISCLAIMER}
          </div>
        </div>
      )}

      {/* 3. TASKS TAB */}
      {currentTab === 'tasks' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-black text-[#2D3A2F]">{tx('Community Care Tasks', 'सामुदायिक देखभाल कार्य')}</h2>
            <p className="text-xs text-[#5A6E5D]">{tx('Checklist for home visits, medicine checks, and cognitive support.', 'गृह भेंट, दवा जांच और संज्ञानात्मक सहायता की चेकलिस्ट।')}</p>
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
                  {task.done ? tx('Completed', 'पूर्ण') : tx('Pending', 'लंबित')}
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
            <h2 className="text-2xl font-black text-[#2D3A2F]">{tx('Active Alerts', 'सक्रिय चेतावनियां')}</h2>
            <p className="text-xs text-[#5A6E5D]">{tx('Issues requiring healthcare worker observation.', 'स्वास्थ्य कार्यकर्ता के अवलोकन योग्य समस्याएं।')}</p>
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
