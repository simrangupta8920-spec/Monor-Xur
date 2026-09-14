import React, { useState, useMemo } from 'react';
import { 
  User, Heart, Calendar, Bell, ShieldAlert, BarChart3, Plus, Trash2, 
  Phone, Clock, AlertTriangle, CheckCircle2, ChevronRight, Activity, Award, Sparkles, FileText,
  Edit3, Video, Image as ImageIcon, Upload, Eye, X, Stethoscope, Check, Play, Film, Mic, TrendingUp, Download,
  Puzzle, Brain, ShieldCheck, Lock, History, Shield, SunMedium, Sun
} from 'lucide-react';
import { 
  FamilyCaregiverTab, CalendarEvent, Reminder, AlertItem, EmergencyContact, DDAMetric, Memory, 
  PatientProfile, MedicalProfile, MedicalConsultation, MemoryCategory, AuditLog 
} from '../../types';
import { MEDICAL_DISCLAIMER, SAMPLE_MEDIA_PRESETS } from '../../data/mockData';
import { soundController } from '../../utils/audio';
import { useLanguage } from '../../context/LanguageContext';
import { CognitiveProgressView } from './CognitiveProgressView';
import { MemoryInsightsView } from './MemoryInsightsView';
import { ExportPdfModal } from './ExportPdfModal';
import { VoiceReminiscenceRecorder, VoiceReminiscenceData } from '../common/VoiceReminiscenceRecorder';
import { generateDoctorVisitSummaryPdf } from '../../utils/pdfReportGenerator';
import { createHarmonicVoiceSnippet } from '../../utils/audioSnippetGenerator';
import { 
  computeGameStats, 
  getGameBreakdown, 
  filterLogsByGame, 
  generateClinicalReportSummary, 
  getWeeklyActivityDistribution, 
  GameFilterType
} from '../../utils/gameAnalytics';
import { parseTimeToMinutes } from '../../utils/timeUtils';
import { ELDER_AVATARS } from '../setup/InitialSetupPage';

interface FamilyDashboardProps {
  currentTab: FamilyCaregiverTab;
  onSelectTab: (tab: FamilyCaregiverTab) => void;
  calendarEvents: CalendarEvent[];
  onAddCalendarEvent: (event: CalendarEvent) => void;
  reminders: Reminder[];
  onAddReminder: (reminder: Reminder) => void;
  onDeleteReminder: (id: string) => void;
  onToggleReminder: (id: string) => void;
  alerts: AlertItem[];
  onAcknowledgeAlert: (id: string) => void;
  contacts: EmergencyContact[];
  onCallContact: (contact: EmergencyContact) => void;
  ddaLogs: DDAMetric[];
  onLogDDAMetric?: (metric: DDAMetric) => void;
  onNavigateToGames?: () => void;
  memories: Memory[];
  onAddMemory: (memory: Memory) => void;
  onDeleteMemory?: (id: string) => void;
  patientProfile: PatientProfile;
  onUpdatePatientProfile: (profile: PatientProfile) => void;
  medicalProfile: MedicalProfile;
  onUpdateMedicalProfile: (profile: MedicalProfile) => void;
  onOpenSetup?: () => void;
  auditLogs?: AuditLog[];
}

export const FamilyDashboard: React.FC<FamilyDashboardProps> = ({
  currentTab,
  onSelectTab,
  calendarEvents,
  onAddCalendarEvent,
  reminders,
  onAddReminder,
  onDeleteReminder,
  onToggleReminder,
  alerts,
  onAcknowledgeAlert,
  contacts,
  onCallContact,
  ddaLogs,
  onLogDDAMetric,
  onNavigateToGames,
  memories,
  onAddMemory,
  onDeleteMemory,
  patientProfile,
  onUpdatePatientProfile,
  medicalProfile,
  onUpdateMedicalProfile,
  onOpenSetup,
  auditLogs = [],
}) => {
  const { tx, isHindi } = useLanguage();

  // Modal states for Calendar & Reminders
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('10:00 AM');
  const [newEventType, setNewEventType] = useState<'appointment' | 'routine' | 'doctor' | 'family'>('routine');

  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('9:00 AM');
  const [newReminderType, setNewReminderType] = useState<'medicine' | 'routine'>('medicine');
  const [newReminderNote, setNewReminderNote] = useState('');

  // 1. EDIT PERSONAL DETAILS MODAL STATE
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState<PatientProfile>(patientProfile);

  // 2. EDIT MEDICAL DETAILS MODAL STATE
  const [showEditMedicalModal, setShowEditMedicalModal] = useState(false);
  const [medicalForm, setMedicalForm] = useState<MedicalProfile>(medicalProfile);
  const [newConcernInput, setNewConcernInput] = useState('');

  // Add consultation modal state
  const [showAddConsultationModal, setShowAddConsultationModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocSpecialty, setNewDocSpecialty] = useState('');
  const [newDocDate, setNewDocDate] = useState('15 June 2026');
  const [newDocNotes, setNewDocNotes] = useState('');

  // 3. ADD MEMORY (PHOTO / VIDEO) MODAL STATE
  const [showAddMemoryModal, setShowAddMemoryModal] = useState(false);
  const [newMemoryMediaType, setNewMemoryMediaType] = useState<'photo' | 'video'>('photo');
  const [newMemoryTitle, setNewMemoryTitle] = useState('');
  const [newMemoryPerson, setNewMemoryPerson] = useState('');
  const [newMemoryCategory, setNewMemoryCategory] = useState<MemoryCategory>('Family');
  const [newMemoryDesc, setNewMemoryDesc] = useState('');
  const [newMemoryMediaUrl, setNewMemoryMediaUrl] = useState('');
  const [memoryUploadPreview, setMemoryUploadPreview] = useState<string | null>(null);
  const [newMemoryVoiceSnippet, setNewMemoryVoiceSnippet] = useState<VoiceReminiscenceData | null>(null);

  // Filter for Memories in Caregiver view
  const [memoryFilter, setMemoryFilter] = useState<'All' | 'photo' | 'video' | 'audio'>('All');
  const [previewMemory, setPreviewMemory] = useState<Memory | null>(null);

  // PDF Export Modal state
  const [showExportPdfModal, setShowExportPdfModal] = useState(false);

  // One-click 1-Page Clinical Summary for Geriatrician/Neurologist visit
  const handleExportDoctorSummary = () => {
    soundController.playSuccess();
    generateDoctorVisitSummaryPdf(patientProfile, medicalProfile, ddaLogs, reminders, {
      caregiverNotes: 'Caregiver note: Patient routine and cognitive latency monitored. Evening calming active.',
    });
  };

  // Game-specific filter states
  const [reportsGameFilter, setReportsGameFilter] = useState<GameFilterType>('all');
  const [telemetryGameFilter, setTelemetryGameFilter] = useState<GameFilterType>('all');

  // Dynamic game analytics derived purely from actual player telemetry
  const effectiveDdaLogs = useMemo(() => {
    return ddaLogs || [];
  }, [ddaLogs]);

  const globalGameStats = useMemo(() => {
    return computeGameStats(effectiveDdaLogs);
  }, [effectiveDdaLogs]);

  const gameBreakdown = useMemo(() => {
    return getGameBreakdown(effectiveDdaLogs);
  }, [effectiveDdaLogs]);

  const filteredReportLogs = useMemo(() => {
    return filterLogsByGame(effectiveDdaLogs, reportsGameFilter);
  }, [effectiveDdaLogs, reportsGameFilter]);

  const dynamicReportSummary = useMemo(() => {
    return generateClinicalReportSummary(filteredReportLogs, patientProfile.fullName);
  }, [filteredReportLogs, patientProfile.fullName]);

  const weeklyActivity = useMemo(() => {
    return getWeeklyActivityDistribution(filteredReportLogs);
  }, [filteredReportLogs]);

  const filteredTelemetryLogs = useMemo(() => {
    return filterLogsByGame(effectiveDdaLogs, telemetryGameFilter);
  }, [effectiveDdaLogs, telemetryGameFilter]);

  // Handlers for Events & Reminders
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    onAddCalendarEvent({
      id: 'e_' + Date.now(),
      title: newEventTitle.trim(),
      type: newEventType,
      time: newEventTime,
      date: 'Today',
    });
    setNewEventTitle('');
    setShowAddEventModal(false);
    soundController.playSuccess();
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle.trim()) return;
    onAddReminder({
      id: 'r_' + Date.now(),
      title: newReminderTitle.trim(),
      type: newReminderType,
      time_label: newReminderTime,
      minutes: parseTimeToMinutes(newReminderTime),
      note: newReminderNote.trim(),
      completed: false,
    });
    setNewReminderTitle('');
    setNewReminderNote('');
    setShowAddReminderModal(false);
    soundController.playSuccess();
  };

  // Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePatientProfile(profileForm);
    setShowEditProfileModal(false);
    soundController.playSuccess();
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setProfileForm((prev) => ({ ...prev, avatar: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Medical Details Handlers
  const handleAddConcern = () => {
    if (!newConcernInput.trim()) return;
    setMedicalForm((prev) => ({
      ...prev,
      concerns: [...prev.concerns, newConcernInput.trim()],
    }));
    setNewConcernInput('');
  };

  const handleRemoveConcern = (index: number) => {
    setMedicalForm((prev) => ({
      ...prev,
      concerns: prev.concerns.filter((_, i) => i !== index),
    }));
  };

  const handleSaveMedical = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMedicalProfile(medicalForm);
    setShowEditMedicalModal(false);
    soundController.playSuccess();
  };

  const handleAddConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    const newConsultation: MedicalConsultation = {
      id: 'c_' + Date.now(),
      doctor: newDocName.trim(),
      specialty: newDocSpecialty.trim() || 'General Specialist',
      date: newDocDate.trim() || 'Today',
      notes: newDocNotes.trim() || 'Routine checkup completed smoothly.',
    };
    const updated = {
      ...medicalProfile,
      consultations: [newConsultation, ...medicalProfile.consultations],
    };
    onUpdateMedicalProfile(updated);
    setMedicalForm(updated);
    setNewDocName('');
    setNewDocSpecialty('');
    setNewDocNotes('');
    setShowAddConsultationModal(false);
    soundController.playSuccess();
  };

  const handleDeleteConsultation = (id: string) => {
    const updated = {
      ...medicalProfile,
      consultations: medicalProfile.consultations.filter((c) => c.id !== id),
    };
    onUpdateMedicalProfile(updated);
    setMedicalForm(updated);
    soundController.playClick();
  };

  // Memory File Upload (Photo or Video)
  const handleMemoryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVid = file.type.startsWith('video');
      if (isVid) {
        setNewMemoryMediaType('video');
      } else {
        setNewMemoryMediaType('photo');
      }

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setMemoryUploadPreview(result);
          setNewMemoryMediaUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryTitle.trim() || !newMemoryDesc.trim()) return;

    const mediaSrc = newMemoryMediaUrl.trim() || memoryUploadPreview || (
      newMemoryMediaType === 'video'
        ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
        : 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80'
    );

    const newMem: Memory = {
      id: 'm_' + Date.now(),
      title: newMemoryTitle.trim(),
      person: newMemoryPerson.trim() || undefined,
      category: newMemoryCategory,
      mediaType: newMemoryMediaType,
      image: newMemoryMediaType === 'video'
        ? 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80'
        : mediaSrc,
      videoUrl: newMemoryMediaType === 'video' ? mediaSrc : undefined,
      description: newMemoryDesc.trim(),
      date: 'Added Today',
      voiceSnippet: newMemoryVoiceSnippet?.audioUrl,
      voiceSnippetDuration: newMemoryVoiceSnippet?.duration,
      voiceRecordedBy: newMemoryVoiceSnippet?.recordedBy,
      voicePromptText: newMemoryVoiceSnippet?.promptText,
    };

    onAddMemory(newMem);
    setNewMemoryTitle('');
    setNewMemoryPerson('');
    setNewMemoryDesc('');
    setNewMemoryMediaUrl('');
    setMemoryUploadPreview(null);
    setNewMemoryVoiceSnippet(null);
    setShowAddMemoryModal(false);
    soundController.playSuccess();
  };

  const applyPreset = (preset: typeof SAMPLE_MEDIA_PRESETS[0]) => {
    setNewMemoryMediaType(preset.type);
    setNewMemoryTitle(preset.title);
    setNewMemoryPerson(preset.person);
    setNewMemoryCategory(preset.category);
    setNewMemoryDesc(preset.desc);
    setNewMemoryMediaUrl(preset.url);
    setMemoryUploadPreview(preset.url);

    if (preset.voicePromptText) {
      setNewMemoryVoiceSnippet({
        audioUrl: createHarmonicVoiceSnippet(preset.voiceDuration || 14),
        duration: preset.voiceDuration || 14,
        recordedBy: preset.voiceRecordedBy || 'Daughter Priya',
        promptText: preset.voicePromptText,
      });
    } else {
      setNewMemoryVoiceSnippet(null);
    }

    soundController.playClick();
  };

  return (
    <div className="p-4 pb-24 space-y-4 animate-fadeIn">
      {/* 1. HOME TAB */}
      {currentTab === 'home' && (
        <div className="space-y-4">
          {/* Patient Overview Card with Edit Action */}
          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <img
                src={patientProfile.avatar}
                alt={patientProfile.fullName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#5B825B] shadow-xs"
              />
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EAF1E8] text-[#5B825B] text-[11px] font-black uppercase">
                  {tx('Active Player & Loved One', 'सक्रिय खिलाड़ी व प्रियजन')}
                </span>
                <h2 className="text-xl font-black text-[#2D3A2F] mt-0.5">{patientProfile.fullName}</h2>
                <p className="text-xs text-[#5A6E5D]">
                  {patientProfile.age} {tx('yrs', 'वर्ष')} • {patientProfile.region}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={handleExportDoctorSummary}
                className="px-3 py-1.5 rounded-xl bg-[#3D663D] text-white text-xs font-black hover:bg-[#2D4D2D] flex items-center gap-1 shadow-2xs transition-all active:scale-95"
                title={tx('Export 1-Page Clinical Summary for Geriatrician visit', 'जेरियाट्रिशियन के लिए 1-पेज क्लीनिकल सारांश डाउनलोड करें')}
              >
                <Stethoscope className="w-3.5 h-3.5 text-emerald-200" /> {tx('Doctor Summary', 'डॉक्टर सारांश')}
              </button>
              <button
                onClick={() => {
                  soundController.playClick();
                  setShowExportPdfModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#F0EBE1] text-[#2D3A2F] border border-[#D5CFBF] text-xs font-extrabold hover:bg-[#EAE4D6] flex items-center gap-1 shadow-2xs"
                title={tx('Download medical logs & cognitive progress PDF', 'चिकित्सा लॉग और संज्ञानात्मक प्रगति पीडीएफ डाउनलोड करें')}
              >
                <FileText className="w-3.5 h-3.5 text-[#5B825B]" /> {tx('PDF Summary', 'पीडीएफ़ सारांश')}
              </button>
              <button
                onClick={() => {
                  setProfileForm(patientProfile);
                  setShowEditProfileModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#EAF1E8] text-[#5B825B] text-xs font-extrabold hover:bg-[#d9e8d6] flex items-center gap-1 shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5" /> {tx('Edit Details', 'विवरण बदलें')}
              </button>
              <button
                onClick={() => onSelectTab('profile')}
                className="px-3 py-1.5 rounded-xl bg-[#FDFBF7] border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] hover:bg-[#EAF1E8]"
              >
                {tx('Full Profile', 'पूरा प्रोफ़ाइल')}
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white p-3 rounded-2xl border border-[#E0DCD3] shadow-xs">
              <span className="text-2xl font-black text-[#5B825B]">{globalGameStats.avgAccuracy}%</span>
              <span className="block text-[11px] font-bold text-[#5A6E5D] mt-0.5">{tx('Avg Accuracy', 'औसत सटीकता')}</span>
              <span className="block text-[9px] text-[#5B825B] font-extrabold truncate">
                {gameBreakdown.memoryMatch.sessions} {tx('Match', 'मैच')} • {gameBreakdown.puzzle.sessions} {tx('Puzzle', 'पहेली')}
              </span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-[#E0DCD3] shadow-xs">
              <span className="text-2xl font-black text-[#2D3A2F]">{globalGameStats.totalSessions}</span>
              <span className="block text-[11px] font-bold text-[#5A6E5D] mt-0.5">{tx('Rounds Recorded', 'कुल सत्र दर्ज')}</span>
              <span className="block text-[9px] text-[#5A6E5D] font-extrabold truncate">
                {tx('Level', 'स्तर')} {globalGameStats.currentLevel} {tx('Adaptive Tier', 'अनुकूली स्तर')}
              </span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-[#E0DCD3] shadow-xs">
              <span className="text-2xl font-black text-[#E8B25C]">{globalGameStats.activeDays}</span>
              <span className="block text-[11px] font-bold text-[#5A6E5D] mt-0.5">{tx('Active Days', 'सक्रिय दिन')}</span>
              <span className="block text-[9px] text-[#8C651E] font-extrabold truncate">
                {globalGameStats.avgLatencySec}s {tx('avg latency', 'औसत प्रतिक्रिया')}
              </span>
            </div>
          </div>

          {/* Care Sections Navigation Hub */}
          <div className="bg-white rounded-3xl p-4 border border-[#E0DCD3] shadow-xs space-y-2">
            <h3 className="font-black text-sm text-[#2D3A2F] uppercase tracking-wider px-2">{tx('Care Modules', 'देखभाल मॉड्यूल')}</h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  soundController.playClick();
                  onSelectTab('insights');
                }}
                className="p-3.5 rounded-2xl bg-[#EAF1E8] border border-[#5B825B]/40 text-left hover:bg-[#dfeade] transition-colors col-span-2 flex items-center justify-between shadow-2xs group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#5B825B] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-[#2D3A2F]">{tx('Memory Games Insights', 'स्मृति खेल इनसाइट्स')}</h4>
                      <span className="px-2 py-0.2 rounded-full bg-[#5B825B] text-white text-[10px] font-black uppercase tracking-wider">
                        Recharts
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5A6E5D]">{tx('Track accuracy, mistakes, reaction speed & DDA shifts over time', 'समय के साथ सटीकता, गलतियाँ, गति और डीडीए बदलाव ट्रैक करें')}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-white border border-[#5B825B]/30 text-[#5B825B] text-xs font-black">
                  {tx('View Insights →', 'इनसाइट्स देखें →')}
                </span>
              </button>

              <button
                onClick={() => onSelectTab('progress')}
                className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] text-left hover:bg-[#EAF1E8] transition-colors col-span-2 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#5B825B]/80 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-[#2D3A2F]">{tx('DDA Cognitive Progress', 'डीडीए संज्ञानात्मक प्रगति')}</h4>
                      <span className="px-2 py-0.2 rounded-full bg-white text-[#5B825B] text-[10px] font-black uppercase">
                        {tx('Clinical Report', 'चिकित्सीय रिपोर्ट')}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5A6E5D]">{tx('Holistic cognitive engagement score and PDF health export', 'संज्ञानात्मक जुड़ाव स्कोर और स्वास्थ्य पीडीएफ़ निर्यात')}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-white border border-[#E0DCD3] text-[#2D3A2F] text-xs font-black">
                  {tx('View Trends →', 'ट्रेंड्स देखें →')}
                </span>
              </button>

              <button
                onClick={() => onSelectTab('memories')}
                className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] text-left hover:bg-[#EAF1E8] transition-colors col-span-2 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#F0D8D6] text-[#C46A66] flex items-center justify-center shrink-0">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#2D3A2F]">{tx('Player Memories & Media', 'खिलाड़ी की यादें और मीडिया')}</h4>
                    <p className="text-[11px] text-[#5A6E5D]">{tx('Upload family photos, videos, and stories', 'पारिवारिक फ़ोटो, वीडियो और कहानियां अपलोड करें')}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-[#5B825B] text-white text-xs font-black">
                  {memories.length} {tx('Items', 'आइटम')}
                </span>
              </button>

              <button
                onClick={() => onSelectTab('medical')}
                className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] text-left hover:bg-[#EAF1E8] transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-[#EAF1E8] text-[#5B825B] flex items-center justify-center mb-1.5">
                  <Heart className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-sm text-[#2D3A2F]">{tx('Medical Details', 'चिकित्सा विवरण')}</h4>
                <p className="text-[11px] text-[#5A6E5D]">{tx('Doctors & care notes', 'डॉक्टर व देखभाल नोट्स')}</p>
              </button>

              <button
                onClick={() => onSelectTab('insights')}
                className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] text-left hover:bg-[#EAF1E8] transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-[#FDF0D5] text-[#8C651E] flex items-center justify-center mb-1.5">
                  <Activity className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-sm text-[#2D3A2F]">{tx('DDA Insights', 'डीडीए इनसाइट्स')}</h4>
                <p className="text-[11px] text-[#5A6E5D]">{tx('Charts & telemetry', 'चार्ट और टेलीमेट्री')}</p>
              </button>

              <button
                onClick={() => onSelectTab('reports')}
                className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] text-left hover:bg-[#EAF1E8] transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-[#D4E4E6] text-[#7A9CA4] flex items-center justify-center mb-1.5">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-sm text-[#2D3A2F]">{tx('Reports', 'रिपोर्ट्स')}</h4>
                <p className="text-[11px] text-[#5A6E5D]">{tx('Trends & frequency', 'ट्रेंड्स और आवृत्ति')}</p>
              </button>

              <button
                onClick={() => onSelectTab('reminders')}
                className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] text-left hover:bg-[#EAF1E8] transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-[#F0D8D6] text-[#C46A66] flex items-center justify-center mb-1.5">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-sm text-[#2D3A2F]">{tx('Reminders', 'रिमाइंडर')}</h4>
                <p className="text-[11px] text-[#5A6E5D]">{tx('Medicine & routines', 'दवा और दिनचर्या')}</p>
              </button>

              {/* Sundowning Evening Calming Automation Card */}
              <div className="p-4 rounded-3xl bg-linear-to-r from-[#FFF6E5] via-[#FFF0D4] to-[#FCE7BE] border-2 border-[#E8B25C]/70 shadow-xs col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#E8B25C] text-[#3D2504] flex items-center justify-center shrink-0 shadow-xs">
                      <SunMedium className="w-5 h-5 animate-spin-slow" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-[#2D3A2F]">{tx('Sundowning Evening Calming Automation', 'शाम की सूयार्स्त शांति स्वचालन')}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-[#E8B25C] text-[#3D2504] text-[10px] font-black uppercase tracking-wider">
                          4:30 PM - 7:30 PM
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5A6E5D] mt-0.5">
                        {tx('Dims bright glare to warm amber, reduces chime volume, and plays soothing Raga Yaman & 4-7-8 breathing.', 'आँखों को सुकून देने वाले एम्बर टोन, कम घंटी आवाज़ और शांत राग यमन संगीत।')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      soundController.playClick();
                      const currentMode = soundController.getSundowningMode();
                      soundController.setSundowningMode(!currentMode);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/90 border border-[#E8B25C] text-[#8C651E] text-xs font-black hover:bg-white shadow-2xs shrink-0"
                  >
                    {tx('Test / Toggle Audio', 'ऑडियो जांचें')}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                  <div className="bg-white/80 p-2 rounded-xl border border-[#E8B25C]/40">
                    <span className="block text-[10px] text-[#8C651E] font-bold">{tx('Warm Amber Filter', 'गर्म एम्बर फ़िल्टर')}</span>
                    <strong className="text-[#2D3A2F] font-black">{tx('Auto-Active', 'स्वचालित सक्रिय')}</strong>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-[#E8B25C]/40">
                    <span className="block text-[10px] text-[#8C651E] font-bold">{tx('Chime Attenuation', 'धीमी घंटी आवाज़')}</span>
                    <strong className="text-[#2D3A2F] font-black">{tx('-50% Volume', '-50% आवाज़')}</strong>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-[#E8B25C]/40">
                    <span className="block text-[10px] text-[#8C651E] font-bold">{tx('Evening Melody', 'शाम की धुन')}</span>
                    <strong className="text-[#8C651E] font-black">Raga Yaman</strong>
                  </div>
                </div>
              </div>

              {/* 1-Page Doctor Visit Clinical Summary */}
              <button
                onClick={handleExportDoctorSummary}
                className="p-3.5 rounded-2xl bg-linear-to-r from-[#EAF1E8] to-[#D9EADB] border-2 border-[#5B825B]/60 text-left hover:bg-[#D1E5D4] transition-colors col-span-2 flex items-center justify-between shadow-2xs active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#3D663D] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Stethoscope className="w-5 h-5 text-emerald-200" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-[#2D3A2F]">{tx('Export 1-Page Doctor Summary (Geriatrician Visit)', '1-पेज डॉक्टर सारांश निर्यात (जेरियाट्रिशियन हेतु)')}</h4>
                      <span className="px-2 py-0.2 rounded-full bg-[#3D663D] text-white text-[10px] font-black uppercase">
                        1-Click PDF
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5A6E5D]">{tx('30-day cognitive latency trends, processing speed, fatigue risk, and medication adherence.', '30-दिवसीय संज्ञानात्मक विलंबता, प्रसंस्करण गति, थकान जोखिम और दवा अनुपालन।')}</p>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-[#3D663D] text-white text-xs font-black shadow-2xs">
                  {tx('Export Now ↓', 'अभी निर्यात करें ↓')}
                </span>
              </button>

              <button
                onClick={() => {
                  soundController.playClick();
                  setShowExportPdfModal(true);
                }}
                className="p-3.5 rounded-2xl bg-[#F4EFE6] border border-[#E2DDD2] text-left hover:bg-[#EAE4D6] transition-colors col-span-2 flex items-center justify-between shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#4A3D29] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-[#2D3A2F]">{tx('Generate Multi-Page Longitudinal Dossier', 'बहु-पृष्ठीय विस्तृत डोजियर बनाएं')}</h4>
                      <span className="px-2 py-0.2 rounded-full bg-[#EAF1E8] text-[#5B825B] text-[10px] font-black uppercase">
                        {tx('Printable', 'प्रिंट योग्य')}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5A6E5D]">{tx('Download patient medical logs & engagement progress trends', 'रोगी के मेडिकल लॉग और प्रगति रिपोर्ट डाउनलोड करें')}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-white border border-[#E0DCD3] text-[#2D3A2F] text-xs font-black">
                  {tx('Options ↓', 'विकल्प ↓')}
                </span>
              </button>
            </div>
          </div>

          {/* Active Alerts Snippet */}
          {alerts.length > 0 && (
            <div className="bg-white rounded-3xl p-4 border border-[#E0DCD3] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#C46A66]">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-black text-sm uppercase tracking-wide">{tx('Care Alerts', 'देखभाल अलर्ट्स')}</h3>
                </div>
                <button
                  onClick={() => onSelectTab('alerts')}
                  className="text-xs font-bold text-[#5B825B] hover:underline"
                >
                  {tx('View All', 'सभी देखें')} ({alerts.length})
                </button>
              </div>

              <div className="space-y-2">
                {alerts.slice(0, 2).map((al) => (
                  <div key={al.id} className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#2D3A2F]">{al.title}</h4>
                      <p className="text-xs text-[#5A6E5D] mt-0.5">{al.description}</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#5A6E5D] whitespace-nowrap">{al.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. CALENDAR TAB */}
      {currentTab === 'calendar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#2D3A2F]">{tx('Care Calendar', 'देखभाल कैलेंडर')}</h2>
              <p className="text-xs text-[#5A6E5D]">{patientProfile.name} {tx("'s medical appointments & daily schedule", 'की चिकित्सा मुलाक़ातें और दैनिक समय-सारणी')}</p>
            </div>
            <button
              onClick={() => setShowAddEventModal(true)}
              className="flex items-center gap-1 px-3.5 py-2 rounded-2xl bg-[#5B825B] text-white font-extrabold text-xs shadow-xs hover:bg-[#4d704d]"
            >
              <Plus className="w-4 h-4" />
              <span>{tx('Add Event', 'इवेंट जोड़ें')}</span>
            </button>
          </div>

          {/* Events List */}
          <div className="space-y-2.5">
            {calendarEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-white p-4 rounded-3xl border border-[#E0DCD3] shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs ${
                      evt.type === 'doctor'
                        ? 'bg-[#EAF1E8] text-[#5B825B]'
                        : evt.type === 'family'
                        ? 'bg-[#F0D8D6] text-[#C46A66]'
                        : 'bg-[#FDF0D5] text-[#E8B25C]'
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold text-[#5B825B] uppercase block">
                      {evt.date} • {evt.time}
                    </span>
                    <h4 className="font-extrabold text-base text-[#2D3A2F]">{evt.title}</h4>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#FDFBF7] border border-[#E0DCD3] text-[11px] font-bold text-[#5A6E5D] uppercase">
                  {evt.type === 'doctor' ? tx('Doctor', 'डॉक्टर') : evt.type === 'family' ? tx('Family', 'परिवार') : evt.type === 'routine' ? tx('Routine', 'दिनचर्या') : evt.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. ALERTS TAB */}
      {currentTab === 'alerts' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-black text-[#2D3A2F]">{tx('Caregiver Alerts', 'देखभालकर्ता अलर्ट्स')}</h2>
            <p className="text-xs text-[#5A6E5D]">{tx('System notices for missed routines and upcoming appointments.', 'छूटी हुई दिनचर्या और आगामी मुलाक़ातों की प्रणाली सूचनाएं।')}</p>
          </div>

          <div className="space-y-3">
            {alerts.map((al) => (
              <div
                key={al.id}
                className={`p-4 rounded-3xl border transition-all ${
                  al.acknowledged
                    ? 'bg-white border-[#E0DCD3] opacity-60'
                    : 'bg-white border-[#C46A66]/40 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#F0D8D6] text-[#C46A66] flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-[#C46A66]">{al.kind.replace('_', ' ')}</span>
                        <span className="text-[11px] text-[#5A6E5D]">• {al.time}</span>
                      </div>
                      <h4 className="font-extrabold text-base text-[#2D3A2F] mt-0.5">{al.title}</h4>
                      <p className="text-xs text-[#5A6E5D] mt-1">{al.description}</p>
                    </div>
                  </div>

                  {!al.acknowledged && (
                    <button
                      onClick={() => onAcknowledgeAlert(al.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#EAF1E8] text-[#5B825B] font-extrabold text-xs whitespace-nowrap hover:bg-[#d6e5d3]"
                    >
                      {tx('Acknowledge', 'स्वीकार करें')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PROFILE & PERSONAL DETAILS TAB */}
      {currentTab === 'profile' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs text-center space-y-3 relative">
            <button
              onClick={() => {
                setProfileForm(patientProfile);
                setShowEditProfileModal(true);
              }}
              className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-[#5B825B] text-white text-xs font-black shadow-xs hover:bg-[#4d704d]"
            >
              <Edit3 className="w-3.5 h-3.5" /> {tx('Edit Details', 'विवरण बदलें')}
            </button>

            <img
              src={patientProfile.avatar}
              alt={patientProfile.fullName}
              className="w-24 h-24 rounded-3xl object-cover mx-auto border-3 border-[#5B825B] shadow-sm"
            />
            <div>
              <h2 className="text-2xl font-black text-[#2D3A2F]">{patientProfile.fullName}</h2>
              <p className="text-xs font-semibold text-[#5B825B] mt-0.5">{tx('Player Profile • Loved One & Care Recipient', 'खिलाड़ी प्रोफ़ाइल • प्रियजन और देखभाल प्राप्तकर्ता')}</p>
            </div>
            <p className="text-xs text-[#5A6E5D] italic max-w-xs mx-auto">"{patientProfile.about}"</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-[#2D3A2F] uppercase tracking-wider">{tx('Personal Records', 'व्यक्तिगत रिकॉर्ड')}</h3>
              <button
                onClick={() => {
                  setProfileForm(patientProfile);
                  setShowEditProfileModal(true);
                }}
                className="text-xs font-extrabold text-[#5B825B] hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> {tx('Edit', 'संपादित करें')}
              </button>
            </div>
            <div className="divide-y divide-[#EAE6DF]">
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-[#5A6E5D]">{tx('Preferred Name', 'पसंदीदा नाम')}</span>
                <span className="font-extrabold text-[#2D3A2F]">{patientProfile.name}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-[#5A6E5D]">{tx('Full name', 'पूरा नाम')}</span>
                <span className="font-extrabold text-[#2D3A2F]">{patientProfile.fullName}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-[#5A6E5D]">{tx('Age', 'आयु')}</span>
                <span className="font-extrabold text-[#2D3A2F]">{patientProfile.age} {tx('years', 'वर्ष')}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-[#5A6E5D]">{tx('Gender', 'लिंग')}</span>
                <span className="font-extrabold text-[#2D3A2F]">
                  {patientProfile.gender === 'Female' ? tx('Female', 'महिला') : patientProfile.gender === 'Male' ? tx('Male', 'पुरुष') : patientProfile.gender}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-[#5A6E5D]">{tx('Region', 'क्षेत्र')}</span>
                <span className="font-extrabold text-[#2D3A2F]">{patientProfile.region}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-[#5A6E5D]">{tx('Languages', 'भाषाएं')}</span>
                <span className="font-extrabold text-[#2D3A2F]">{patientProfile.language}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-[#5A6E5D]">{tx('Blood group', 'रक्त समूह')}</span>
                <span className="font-extrabold text-[#2D3A2F]">{patientProfile.bloodGroup}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-[#5A6E5D]">{tx('Care Focus', 'देखभाल का मुख्य केंद्र')}</span>
                <span className="font-extrabold text-[#5B825B] text-right max-w-[180px]">{patientProfile.majorCareIssue}</span>
              </div>
            </div>
          </div>

          {/* Emergency Contacts List */}
          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
            <h3 className="font-black text-sm text-[#2D3A2F] uppercase tracking-wider">{tx('Emergency Contacts', 'आपातकालीन संपर्क')}</h3>
            <div className="space-y-2">
              {contacts.map((c) => (
                <div key={c.id} className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#2D3A2F]">{c.name}</h4>
                    <p className="text-xs text-[#5A6E5D]">{c.relationship} • {c.phone}</p>
                  </div>
                  <button
                    onClick={() => onCallContact(c)}
                    className="p-2.5 rounded-xl bg-[#5B825B] text-white hover:bg-[#4d704d]"
                    aria-label={`Call ${c.name}`}
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Caregiver Security & PIN Account Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-[#2D3A2F] uppercase tracking-wider">{tx('Caregiver Security & Access', 'देखभालकर्ता सुरक्षा व पहुंच')}</h3>
                <p className="text-xs text-[#5A6E5D]">{tx('Family portal credentials and PIN protection', 'पारिवारिक पोर्टल क्रेडेंशियल्स और पिन सुरक्षा')}</p>
              </div>
              {onOpenSetup && (
                <button
                  onClick={() => {
                    soundController.playClick();
                    onOpenSetup();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#EAF1E8] text-[#5B825B] text-xs font-black hover:bg-[#d6ebd3] transition-colors"
                >
                  {tx('Configure Profiles', 'प्रोफ़ाइल कॉन्फ़िगर करें')}
                </button>
              )}
            </div>

            <div className="divide-y divide-[#EAE6DF]">
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-[#5A6E5D]">{tx('Caregiver Name', 'देखभालकर्ता का नाम')}</span>
                <div className="flex items-center gap-2">
                  <img
                    src={patientProfile.caregiver?.avatar || '/images/avatars/caregiver-assam-daughter.jpg'}
                    alt="Caregiver"
                    className="w-7 h-7 rounded-full object-cover border border-[#5B825B]"
                  />
                  <span className="font-extrabold text-[#2D3A2F]">{patientProfile.caregiver?.name || tx('Family Caregiver', 'पारिवारिक देखभालकर्ता')}</span>
                </div>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-[#5A6E5D]">{tx('Relationship', 'संबंध')}</span>
                <span className="font-extrabold text-[#2D3A2F]">{patientProfile.caregiver?.relationship || tx('Family', 'परिवार')}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-[#5A6E5D]">{tx('Phone Contact', 'फ़ोन संपर्क')}</span>
                <span className="font-extrabold text-[#2D3A2F]">{patientProfile.caregiver?.phone || tx('Configured in setup', 'सेटअप में कॉन्फ़िगर किया गया')}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-[#5A6E5D]">{tx('Caregiver PIN', 'देखभालकर्ता पिन')}</span>
                <span className="font-extrabold text-[#5B825B] tracking-widest bg-[#EAF1E8] px-2.5 py-0.5 rounded-lg text-xs">
                  {patientProfile.caregiver?.pin ? tx('•••• (Configured)', '•••• (सेट किया गया)') : tx('1234 (Default)', '1234 (डिफ़ॉल्ट)')}
                </span>
              </div>
            </div>

            {onOpenSetup && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    soundController.playClick();
                    onOpenSetup();
                  }}
                  className="w-full py-3 rounded-2xl bg-[#5B825B] text-white font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-[#4a6b4a] shadow-xs"
                >
                  <span>{tx('Launch Initial Setup / Configuration Wizard', 'प्रारंभिक सेटअप / कॉन्फ़िगरेशन विज़ार्ड खोलें')}</span>
                </button>
              </div>
            )}
          </div>

          {/* DPDP Act 2023 Compliance & Security Audit Trail */}
          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DF]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#EAF1E8] text-[#3D663D] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#2D3A2F]">{tx('Data Privacy & DPDP Act 2023', 'डेटा गोपनीयता व डीपी़डीपी अधिनियम 2023')}</h3>
                  <p className="text-[11px] text-[#5A6E5D]">{tx('End-to-end security, consent, and tamper-evident audit logs', 'सुरक्षा, सहमति और छेड़छाड़-रहित ऑडिट लॉग्स')}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#EAF1E8] text-[#3D663D] text-[10px] font-black uppercase tracking-wider">
                {tx('Protected', 'संरक्षित')}
              </span>
            </div>

            {/* Compliance Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#ECE8DE] space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-[#5A6E5D] block">{tx('Consent Status', 'सहमति स्थिति')}</span>
                <p className="font-extrabold text-[#3D663D] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> {tx('Granted', 'स्वीकृत')}
                </p>
                <p className="text-[10px] text-[#8C9B8E]">
                  {patientProfile.consentDate ? new Date(patientProfile.consentDate).toLocaleDateString() : tx('Active in profile', 'प्रोफ़ाइल में सक्रिय')}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#ECE8DE] space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-[#5A6E5D] block">{tx('Data at Rest', 'संग्रहीत डेटा')}</span>
                <p className="font-extrabold text-[#2D3A2F] flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#5B825B]" /> AES-256-GCM
                </p>
                <p className="text-[10px] text-[#8C9B8E]">{tx('Firestore + Client encrypted cache', 'फ़ायरस्टोर + एन्क्रिप्टेड कैश')}</p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#ECE8DE] space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-[#5A6E5D] block">{tx('Access Scope', 'पहुंच का दायरा')}</span>
                <p className="font-extrabold text-[#2D3A2F] flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-[#3D663D]" /> {tx('Caregiver & ASHA', 'देखभालकर्ता और आशा')}
                </p>
                <p className="text-[10px] text-[#8C9B8E]">{tx('RBAC security rules enforced', 'आरबीएसी सुरक्षा नियम लागू')}</p>
              </div>
            </div>

            {/* Real-Time Immutable Audit Log Stream */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-[#2D3A2F] flex items-center gap-1.5">
                  <History className="w-4 h-4 text-[#5A6E5D]" />
                  <span>{tx('Immutable Caregiver & ASHA Audit Trail', 'देखभालकर्ता व आशा अपरिवर्तनीय ऑडिट ट्रेल')}</span>
                </h4>
                <span className="text-[10px] font-bold text-[#8C9B8E]">
                  {auditLogs.length} {tx('events recorded', 'घटनाएं दर्ज')}
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {auditLogs.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] text-center text-xs text-[#5A6E5D]">
                    {tx('Initial profile created. Live caregiver and ASHA interactions will stream here.', 'प्रारंभिक प्रोफ़ाइल बनाई गई। देखभालकर्ता और आशा की गतिविधियां यहाँ दिखाई देंगी।')}
                  </div>
                ) : (
                  auditLogs.map((log) => {
                    const dateStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const roleBadge = log.actorRole === 'asha' ? 'bg-[#FDF0D5] text-[#A66E14]' : 'bg-[#EAF1E8] text-[#3D663D]';
                    return (
                      <div
                        key={log.id}
                        className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#ECE8DE] flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${roleBadge}`}>
                              {log.actorRole === 'asha' ? tx('ASHA', 'आशा') : tx('Caregiver', 'देखभालकर्ता')}
                            </span>
                            <span className="font-bold text-[#2D3A2F]">
                              {log.actorName || (log.actorRole === 'asha' ? tx('ASHA Worker', 'आशा कार्यकर्ता') : tx('Caregiver', 'देखभालकर्ता'))}
                            </span>
                            <span className="text-[10px] text-[#8C9B8E]">
                              {log.action.replace(/_/g, ' ')}
                            </span>
                          </div>
                          {log.details && (
                            <p className="text-[11px] text-[#5A6E5D] leading-relaxed">
                              {log.details}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] font-medium text-[#8C9B8E] shrink-0">
                          {dateStr}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MEDICAL DETAILS TAB */}
      {currentTab === 'medical' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('home')}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#E0DCD3] text-xs font-bold"
              >
                ← {tx('Back', 'वापस')}
              </button>
              <h2 className="text-xl font-black text-[#2D3A2F]">{tx('Medical Details', 'चिकित्सा विवरण')}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  soundController.playClick();
                  setShowExportPdfModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0EBE1] border border-[#D5CFBF] text-[#2D3A2F] text-xs font-extrabold hover:bg-[#EAE4D6] shadow-2xs"
                title="Download medical logs & progress summary as PDF"
              >
                <Download className="w-3.5 h-3.5 text-[#5B825B]" /> {tx('Export PDF', 'पीडीएफ़ डाउनलोड करें')}
              </button>
              <button
                onClick={() => {
                  setMedicalForm(medicalProfile);
                  setShowEditMedicalModal(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#EAF1E8] text-[#5B825B] text-xs font-black hover:bg-[#d9e8d6]"
              >
                <Edit3 className="w-3.5 h-3.5" /> {tx('Edit Guidance', 'मार्गदर्शन बदलें')}
              </button>
              <button
                onClick={() => setShowAddConsultationModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#5B825B] text-white text-xs font-black shadow-xs hover:bg-[#4d704d]"
              >
                <Plus className="w-3.5 h-3.5" /> {tx('Consultation', 'परामर्श')}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-[#2D3A2F] uppercase tracking-wider">{tx('Primary Medical Concerns', 'प्रमुख चिकित्सीय चिंताएं')}</h3>
              <button
                onClick={() => {
                  setMedicalForm(medicalProfile);
                  setShowEditMedicalModal(true);
                }}
                className="text-xs font-bold text-[#5B825B] hover:underline"
              >
                {tx('+ Add / Manage Concerns', '+ चिंताएं जोड़ें / प्रबंधित करें')}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {medicalProfile.concerns.map((c) => (
                <span key={c} className="px-3 py-1 rounded-full bg-[#F0D8D6] text-[#3D2423] font-extrabold text-xs">
                  {c}
                </span>
              ))}
            </div>

            <div className="pt-3 border-t border-[#EAE6DF]">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-[#5A6E5D] uppercase">{tx('Physician Care Guidance', 'चिकित्सक देखभाल मार्गदर्शन')}</h4>
                <button
                  onClick={() => {
                    setMedicalForm(medicalProfile);
                    setShowEditMedicalModal(true);
                  }}
                  className="text-xs font-bold text-[#5B825B] hover:underline"
                >
                  {tx('Edit', 'संपादित करें')}
                </button>
              </div>
              <p className="text-sm font-medium text-[#2D3A2F] mt-1.5 bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#E0DCD3] leading-relaxed">
                {medicalProfile.careInfo}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-[#2D3A2F] uppercase tracking-wider">{tx('Doctor Consultations', 'डॉक्टर परामर्श')}</h3>
              <span className="text-xs font-bold text-[#5A6E5D]">{medicalProfile.consultations.length} {tx('Visits Logged', 'मुलाक़ातें दर्ज')}</span>
            </div>

            <div className="space-y-3">
              {medicalProfile.consultations.map((doc) => (
                <div key={doc.id || doc.doctor} className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] space-y-1.5 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-base text-[#2D3A2F]">{doc.doctor}</h4>
                      <p className="text-xs font-semibold text-[#5B825B]">{doc.specialty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#5A6E5D]">{doc.date}</span>
                      <button
                        onClick={() => handleDeleteConsultation(doc.id)}
                        className="p-1 text-gray-400 hover:text-[#C46A66]"
                        title="Delete consultation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-[#2D3A2F] bg-white/70 p-2.5 rounded-xl border border-[#EAE6DF] italic">
                    "{doc.notes}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. MEMORIES & MEDIA MANAGER TAB */}
      {currentTab === 'memories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('home')}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#E0DCD3] text-xs font-bold"
              >
                ← {tx('Back', 'वापस')}
              </button>
              <div>
                <h2 className="text-xl font-black text-[#2D3A2F]">{tx('Player Memories & Media', 'खिलाड़ी की यादें और मीडिया')}</h2>
                <p className="text-xs text-[#5A6E5D]">{tx('Photos and videos for', 'तस्वीरें और वीडियो')} {patientProfile.name} {tx('to view in Player Mode', 'के लिए प्लेयर मोड में देखने हेतु')}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setMemoryUploadPreview(null);
                setShowAddMemoryModal(true);
              }}
              className="flex items-center gap-1 px-3.5 py-2 rounded-2xl bg-[#5B825B] text-white font-extrabold text-xs shadow-xs hover:bg-[#4d704d]"
            >
              <Plus className="w-4 h-4" />
              <span>{tx('Add Memory', 'याद जोड़ें')}</span>
            </button>
          </div>

          {/* Media filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {(['All', 'photo', 'video', 'audio'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setMemoryFilter(filter)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  memoryFilter === filter
                    ? 'bg-[#5B825B] text-white shadow-xs'
                    : 'bg-white text-[#5A6E5D] border border-[#E0DCD3] hover:bg-[#EAF1E8]'
                }`}
              >
                {filter === 'All'
                  ? `${tx('All Items', 'सभी वस्तुएं')} (${memories.length})`
                  : filter === 'photo'
                  ? tx('Photos Only', 'केवल तस्वीरें')
                  : filter === 'video'
                  ? tx('Videos Only', 'केवल वीडियो')
                  : tx('Voice Diaries', 'वॉयस डायरी')}
              </button>
            ))}
          </div>

          {/* Memories Grid */}
          <div className="space-y-3">
            {memories
              .filter((m) => {
                if (memoryFilter === 'All') return true;
                if (memoryFilter === 'video') return m.mediaType === 'video' || Boolean(m.videoUrl);
                if (memoryFilter === 'audio') return m.isVoiceDiary || m.mediaType === 'audio' || Boolean(m.audioUrl);
                return m.mediaType !== 'video' && m.mediaType !== 'audio' && !m.isVoiceDiary;
              })
              .map((mem) => {
                const isVideo = mem.mediaType === 'video' || Boolean(mem.videoUrl);
                const isVoiceDiary = mem.isVoiceDiary || mem.mediaType === 'audio' || Boolean(mem.audioUrl);

                return (
                  <div
                    key={mem.id}
                    className="bg-white rounded-3xl p-4 border border-[#E0DCD3] shadow-xs flex items-center justify-between gap-3 hover:border-[#87A987] transition-all"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black relative shrink-0 border border-[#E0DCD3]">
                        <img
                          src={mem.image}
                          alt={mem.title}
                          className="w-full h-full object-cover"
                        />
                        {isVideo && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                            <Play className="w-5 h-5 fill-white" />
                          </div>
                        )}
                        {isVoiceDiary && (
                          <div className="absolute inset-0 bg-[#5B825B]/40 flex items-center justify-center text-white">
                            <Mic className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-[#5B825B] bg-[#EAF1E8] px-2 py-0.5 rounded-full">
                            {mem.category}
                          </span>
                          {isVideo ? (
                            <span className="text-[10px] font-black uppercase text-[#E8B25C] bg-[#FDF0D5] px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Video className="w-2.5 h-2.5" /> {tx('Video', 'वीडियो')}
                            </span>
                          ) : isVoiceDiary ? (
                            <span className="text-[10px] font-black uppercase text-[#5B825B] bg-[#EAF1E8] px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Mic className="w-2.5 h-2.5" /> {tx('Voice Diary', 'वॉयस डायरी')}
                            </span>
                          ) : (
                            <span className="text-[10px] font-black uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <ImageIcon className="w-2.5 h-2.5" /> {tx('Photo', 'तस्वीर')}
                            </span>
                          )}
                        </div>
                        <h4 className="font-black text-base text-[#2D3A2F] truncate mt-0.5">{mem.title}</h4>
                        <p className="text-xs text-[#5A6E5D] truncate">{mem.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setPreviewMemory(mem)}
                        className="p-2 rounded-xl bg-[#FDFBF7] border border-[#E0DCD3] text-[#5B825B] hover:bg-[#EAF1E8]"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {onDeleteMemory && (
                        <button
                          onClick={() => onDeleteMemory(mem.id)}
                          className="p-2 rounded-xl bg-[#FDFBF7] border border-[#E0DCD3] text-gray-400 hover:text-[#C46A66]"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* INSIGHTS TAB - RECHARTS MEMORY GAMES PERFORMANCE TRENDS (ACCURACY, MISTAKES, LATENCY, DDA TIER) */}
      {currentTab === 'insights' && (
        <MemoryInsightsView
          ddaLogs={ddaLogs}
          patientName={patientProfile.name}
          onBack={() => onSelectTab('home')}
          onNavigateToGames={onNavigateToGames}
          onAddSampleSession={onLogDDAMetric}
          onOpenPdfExport={() => {
            soundController.playClick();
            setShowExportPdfModal(true);
          }}
          onExportDoctorSummary={handleExportDoctorSummary}
        />
      )}

      {/* PROGRESS TAB - RECHARTS DDA TELEMETRY & COGNITIVE ENGAGEMENT */}
      {currentTab === 'progress' && (
        <CognitiveProgressView
          ddaLogs={ddaLogs}
          patientName={patientProfile.name}
          onBack={() => onSelectTab('home')}
          onNavigateToGames={onNavigateToGames}
          onAddSampleSession={onLogDDAMetric}
          onNavigateToInsights={() => onSelectTab('insights')}
          onOpenPdfExport={() => {
            soundController.playClick();
            setShowExportPdfModal(true);
          }}
        />
      )}

      {/* 7. GAME PROGRESS & DDA INSIGHTS (SUB-TAB) */}
      {currentTab === 'game_progress' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('home')}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#E0DCD3] text-xs font-bold"
              >
                ← {tx('Back', 'वापस')}
              </button>
              <h2 className="text-xl font-black text-[#2D3A2F]">{tx('DDA Insights & Telemetry', 'डीडीए इनसाइट्स और टेलीमेट्री')}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('insights')}
                className="px-3 py-1.5 rounded-xl bg-[#EAF1E8] border border-[#5B825B]/40 text-[#5B825B] text-xs font-black flex items-center gap-1.5 shadow-2xs hover:bg-[#dfeade]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{tx('Memory Charts', 'स्मृति चार्ट')}</span>
              </button>
              <button
                onClick={() => onSelectTab('progress')}
                className="px-3 py-1.5 rounded-xl bg-[#5B825B] text-white text-xs font-black flex items-center gap-1.5 shadow-2xs hover:bg-[#4a6b4a]"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{tx('Cognitive Progress', 'संज्ञानात्मक प्रगति')}</span>
              </button>
            </div>
          </div>

          {/* DDA explanation banner */}
          <div className="bg-[#EAF1E8] rounded-3xl p-4 border border-[#5B825B]/30 text-xs text-[#28331F] space-y-1">
            <span className="font-black uppercase tracking-wider block text-[#5B825B]">{tx('Dynamic Difficulty Adjustment (DDA)', 'गतिशील कठिनाई समायोजन (DDA)')}</span>
            <p>
              {tx('The engine automatically analyzes latency, hesitation, and mistakes during gameplay to dynamically scale difficulty without frustrating the player.', 'यह इंजन खेल के दौरान विलंब, झिझक और गलतियों का स्वचालित रूप से विश्लेषण करके कठिनाई को गतिशील रूप से समायोजित करता है ताकि खिलाड़ी निराश न हो।')}
            </p>
          </div>

          {/* Game Filter Bar */}
          <div className="bg-white p-3 rounded-2xl border border-[#E0DCD3] shadow-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-[#2D3A2F] uppercase tracking-wider pl-1">{tx('Filter by Game:', 'खेल द्वारा फ़िल्टर:')}</span>
              <button
                onClick={() => {
                  soundController.playClick();
                  setTelemetryGameFilter('all');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  telemetryGameFilter === 'all'
                    ? 'bg-[#2D3A2F] text-white shadow-2xs'
                    : 'bg-[#FDFBF7] text-[#5A6E5D] border border-[#E0DCD3] hover:bg-[#EAF1E8]'
                }`}
              >
                <span>{tx('All Games', 'सभी खेल')} ({effectiveDdaLogs.length})</span>
              </button>
              <button
                onClick={() => {
                  soundController.playClick();
                  setTelemetryGameFilter('memory_match');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  telemetryGameFilter === 'memory_match'
                    ? 'bg-[#5B825B] text-white shadow-2xs'
                    : 'bg-[#FDFBF7] text-[#5A6E5D] border border-[#E0DCD3] hover:bg-[#EAF1E8]'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>{tx('Memory Match', 'मेमोरी मैच')} ({gameBreakdown.memoryMatch.sessions})</span>
              </button>
              <button
                onClick={() => {
                  soundController.playClick();
                  setTelemetryGameFilter('puzzle');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  telemetryGameFilter === 'puzzle'
                    ? 'bg-[#E8B25C] text-[#332610] shadow-2xs'
                    : 'bg-[#FDFBF7] text-[#5A6E5D] border border-[#E0DCD3] hover:bg-[#FDF0D5]'
                }`}
              >
                <Puzzle className="w-3.5 h-3.5" />
                <span>{tx('Photo Puzzle', 'फ़ोटो पहेली')} ({gameBreakdown.puzzle.sessions})</span>
              </button>
            </div>
            <span className="text-[11px] font-bold text-[#5A6E5D]">
              {tx('Showing', 'प्रदर्शित')} {filteredTelemetryLogs.length} {tx('logs', 'लॉग्स')}
            </span>
          </div>

          {/* Live Telemetry Logs from player sessions */}
          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
            <h3 className="font-black text-sm text-[#2D3A2F] uppercase tracking-wider">
              {tx('Telemetry Logs', 'टेलीमेट्री लॉग्स')} ({filteredTelemetryLogs.length})
            </h3>
            {filteredTelemetryLogs.length === 0 ? (
              <p className="text-xs text-[#5A6E5D]">{tx('No game sessions found matching the selected filter. Play a round in Player Mode!', 'चयनित फ़िल्टर से मेल खाने वाले कोई सत्र नहीं मिले। प्लेयर मोड में खेलें!')}</p>
            ) : (
              <div className="space-y-2.5">
                {filteredTelemetryLogs.map((log, idx) => {
                  const resolvedGameType = log.gameType === 'puzzle' || (log.gameTitle && log.gameTitle.toLowerCase().includes('puzzle'))
                    ? 'puzzle'
                    : 'memory_match';
                  const resolvedGameTitle = log.gameTitle || (resolvedGameType === 'puzzle' ? tx('Photo Puzzle', 'फ़ोटो पहेली') : tx('Memory Match', 'मेमोरी मैच'));

                  return (
                    <div key={idx} className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] text-xs space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between font-extrabold flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black ${
                            resolvedGameType === 'puzzle'
                              ? 'bg-[#FDF0D5] text-[#8C651E]'
                              : 'bg-[#EAF1E8] text-[#5B825B]'
                          }`}>
                            {resolvedGameType === 'puzzle' ? <Puzzle className="w-2.5 h-2.5" /> : <Brain className="w-2.5 h-2.5" />}
                            {resolvedGameTitle}
                          </span>
                          <span className="text-[#2D3A2F]">{tx('Round', 'राउंड')} {log.roundNumber} ({tx('Level', 'स्तर')} {log.difficultyLevel})</span>
                          {log.aiModel && (
                            <span className="text-[10px] font-black uppercase text-[#5B825B] bg-[#EAF1E8] px-2 py-0.5 rounded-full">
                              {tx('AI Analyzed', 'एआई विश्लेषित')}
                            </span>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-black capitalize ${
                          log.adaptiveAction === 'eased' 
                            ? 'bg-[#FDF0D5] text-[#332610] border border-[#eadbbf]' 
                            : log.adaptiveAction === 'increased'
                            ? 'bg-[#EAF1E8] text-[#5B825B]'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          AI: {log.adaptiveAction === 'eased' ? tx('eased', 'सरल किया') : log.adaptiveAction === 'increased' ? tx('increased', 'बढ़ाया') : log.adaptiveAction}
                        </span>
                      </div>

                      <p className="text-[#5A6E5D]">
                        {tx('Latency:', 'विलंबता:')} {(log.latencyMs / 1000).toFixed(1)}s • {tx('Moves:', 'चालें:')} {log.moves} • {tx('Mistakes:', 'गलतियां:')} <strong className={log.mistakes >= 3 ? 'text-[#C46A66]' : 'text-[#2D3A2F]'}>{log.mistakes}</strong> • {tx('Hints:', 'संकेत:')} {log.hintsUsed}
                      </p>

                      {log.aiReasoning && (
                        <div className="bg-white p-2.5 rounded-xl border border-[#5B825B]/20 text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-black text-[#5B825B]">
                            <span>{tx('AI MODEL RATIONALE', 'एआई मॉडल का तर्क')}</span>
                            <span>{log.aiModel}</span>
                          </div>
                          <p className="text-[#2D3A2F]">{log.aiReasoning}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. REPORTS (SUB-TAB) */}
      {currentTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('home')}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#E0DCD3] text-xs font-bold"
              >
                ← {tx('Back', 'वापस')}
              </button>
              <h2 className="text-xl font-black text-[#2D3A2F]">{tx('Cognitive Reports', 'संज्ञानात्मक रिपोर्ट्स')}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportDoctorSummary}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#3D663D] text-white text-xs font-black shadow-2xs hover:bg-[#2D4D2D] active:scale-95 transition-all"
                title="Printable 1-Page Summary for Doctor Visit"
              >
                <Stethoscope className="w-3.5 h-3.5 text-emerald-200" />
                <span>{tx('1-Page Doctor Summary', '1-पेज डॉक्टर सारांश')}</span>
              </button>
              <button
                onClick={() => {
                  soundController.playClick();
                  setShowExportPdfModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5B825B] text-white text-xs font-black shadow-2xs hover:bg-[#4a6b4a]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{tx('Full PDF Dossier', 'विस्तृत पीडीएफ़')}</span>
              </button>
            </div>
          </div>

          {/* Reports Game Filter Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#E0DCD3] shadow-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-[#2D3A2F] uppercase tracking-wider pl-1">{tx('Report Filter:', 'रिपोर्ट फ़िल्टर:')}</span>
              <button
                onClick={() => {
                  soundController.playClick();
                  setReportsGameFilter('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  reportsGameFilter === 'all'
                    ? 'bg-[#2D3A2F] text-white shadow-2xs'
                    : 'bg-[#FDFBF7] text-[#5A6E5D] border border-[#E0DCD3] hover:bg-[#EAF1E8]'
                }`}
              >
                <span>{tx('Combined Overview', 'संयुक्त अवलोकन')} ({effectiveDdaLogs.length})</span>
              </button>
              <button
                onClick={() => {
                  soundController.playClick();
                  setReportsGameFilter('memory_match');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  reportsGameFilter === 'memory_match'
                    ? 'bg-[#5B825B] text-white shadow-2xs'
                    : 'bg-[#FDFBF7] text-[#5A6E5D] border border-[#E0DCD3] hover:bg-[#EAF1E8]'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>{tx('Memory Match Report', 'मेमोरी मैच रिपोर्ट')} ({gameBreakdown.memoryMatch.sessions})</span>
              </button>
              <button
                onClick={() => {
                  soundController.playClick();
                  setReportsGameFilter('puzzle');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  reportsGameFilter === 'puzzle'
                    ? 'bg-[#E8B25C] text-[#332610] shadow-2xs'
                    : 'bg-[#FDFBF7] text-[#5A6E5D] border border-[#E0DCD3] hover:bg-[#FDF0D5]'
                }`}
              >
                <Puzzle className="w-3.5 h-3.5" />
                <span>{tx('Photo Puzzle Report', 'फ़ोटो पहेली रिपोर्ट')} ({gameBreakdown.puzzle.sessions})</span>
              </button>
            </div>
            <span className="text-[11px] font-bold text-[#5A6E5D]">
              {tx('Active Scope:', 'सक्रिय दायरा:')} {reportsGameFilter === 'all' ? tx('All Games', 'सभी खेल') : reportsGameFilter === 'puzzle' ? tx('Photo Puzzle', 'फ़ोटो पहेली') : tx('Memory Match', 'मेमोरी मैच')}
            </span>
          </div>

          {/* Game Comparison Breakdown when 'All' is selected */}
          {reportsGameFilter === 'all' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-3xl border border-[#5B825B]/30 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#EAF1E8] text-[#5B825B] flex items-center justify-center">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-[#2D3A2F]">{tx('Memory Match Performance', 'मेमोरी मैच प्रदर्शन')}</h4>
                      <p className="text-[11px] text-[#5A6E5D]">{gameBreakdown.memoryMatch.sessions} {tx('sessions played', 'सत्र खेले गए')}</p>
                    </div>
                  </div>
                  <span className="text-xl font-black text-[#5B825B]">{gameBreakdown.memoryMatch.accuracy}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#EAE6DF] text-center text-xs">
                  <div>
                    <span className="block text-[10px] text-[#5A6E5D]">{tx('Avg Errors', 'औसत गलतियां')}</span>
                    <strong className="text-[#2D3A2F] font-black">{gameBreakdown.memoryMatch.avgMistakes}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#5A6E5D]">{tx('Avg Speed', 'औसत गति')}</span>
                    <strong className="text-[#2D3A2F] font-black">{gameBreakdown.memoryMatch.avgLatencySec}s</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#5A6E5D]">{tx('Current Level', 'वर्तमान स्तर')}</span>
                    <strong className="text-[#5B825B] font-black">{tx('Lvl', 'स्तर')} {gameBreakdown.memoryMatch.level}</strong>
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
                      <h4 className="font-extrabold text-sm text-[#2D3A2F]">{tx('Photo Puzzle Performance', 'फ़ोटो पहेली प्रदर्शन')}</h4>
                      <p className="text-[11px] text-[#5A6E5D]">{gameBreakdown.puzzle.sessions} {tx('sessions played', 'सत्र खेले गए')}</p>
                    </div>
                  </div>
                  <span className="text-xl font-black text-[#E8B25C]">{gameBreakdown.puzzle.accuracy}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#EAE6DF] text-center text-xs">
                  <div>
                    <span className="block text-[10px] text-[#5A6E5D]">{tx('Avg Errors', 'औसत गलतियां')}</span>
                    <strong className="text-[#2D3A2F] font-black">{gameBreakdown.puzzle.avgMistakes}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#5A6E5D]">{tx('Avg Speed', 'औसत गति')}</span>
                    <strong className="text-[#2D3A2F] font-black">{gameBreakdown.puzzle.avgLatencySec}s</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#5A6E5D]">{tx('Current Level', 'वर्तमान स्तर')}</span>
                    <strong className="text-[#E8B25C] font-black">{tx('Lvl', 'स्तर')} {gameBreakdown.puzzle.level}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#5B825B]">
                {dynamicReportSummary.period}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#EAF1E8] text-[#5B825B] text-xs font-extrabold">
                {dynamicReportSummary.engagement}
              </span>
            </div>
            <h3 className="text-xl font-black text-[#2D3A2F]">
              {reportsGameFilter === 'all' 
                ? tx('Clinical Summary & Cognitive Routine', 'चिकित्सीय सारांश और संज्ञानात्मक दिनचर्या')
                : reportsGameFilter === 'puzzle'
                ? tx('Photo Puzzle Clinical Telemetry Summary', 'फ़ोटो पहेली टेलीमेट्री सारांश')
                : tx('Memory Match Clinical Telemetry Summary', 'मेमोरी मैच टेलीमेट्री सारांश')}
            </h3>
            <p className="text-xs text-[#5A6E5D] bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#E0DCD3] leading-relaxed">
              {dynamicReportSummary.note}
            </p>

            {/* Weekly bar visualizer from actual game sessions */}
            <div className="pt-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-extrabold text-xs text-[#2D3A2F]">
                  {tx('Daily Game Activity Hours (This Week)', 'दैनिक खेल गतिविधि के घंटे (इस सप्ताह)')}
                </h4>
                <span className="text-[11px] font-bold text-[#5A6E5D]">
                  {filteredReportLogs.length} {tx('total sessions accounted', 'कुल सत्र गिने गए')}
                </span>
              </div>
              <div className="flex items-end justify-between h-32 pt-4 px-2">
                {weeklyActivity.map((d) => (
                  <div key={d.label} className="flex flex-col items-center gap-1.5 flex-1">
                    <span className="text-[10px] font-bold text-[#5A6E5D]">{d.value}h</span>
                    <div
                      className={`w-7 rounded-t-xl transition-all ${
                        reportsGameFilter === 'puzzle'
                          ? 'bg-[#E8B25C]'
                          : reportsGameFilter === 'memory_match'
                          ? 'bg-[#5B825B]'
                          : 'bg-[#5B825B]'
                      }`}
                      style={{ height: `${Math.max(12, d.value * 32)}px` }}
                    />
                    <span className="text-xs font-extrabold text-[#2D3A2F]">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-[#FDF0D5] border border-[#eadbbf] text-xs text-[#332610] leading-relaxed">
            <strong>{tx('Disclaimer:', 'अस्वीकरण:')}</strong> {MEDICAL_DISCLAIMER}
          </div>
        </div>
      )}

      {/* 9. REMINDERS (SUB-TAB) */}
      {currentTab === 'reminders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('home')}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#E0DCD3] text-xs font-bold"
              >
                ← {tx('Back', 'वापस')}
              </button>
              <h2 className="text-xl font-black text-[#2D3A2F]">{tx('Reminders Manager', 'स्मरण प्रबंधक')}</h2>
            </div>
            <button
              onClick={() => setShowAddReminderModal(true)}
              className="flex items-center gap-1 px-3.5 py-2 rounded-2xl bg-[#5B825B] text-white font-extrabold text-xs shadow-xs hover:bg-[#4d704d]"
            >
              <Plus className="w-4 h-4" />
              <span>{tx('Add Reminder', 'स्मरण जोड़ें')}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {reminders.map((r) => (
              <div
                key={r.id}
                className="bg-white p-4 rounded-3xl border border-[#E0DCD3] shadow-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#5B825B]">{r.time_label}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#FDF0D5] text-[#332610]">
                      {r.type === 'medicine' ? tx('Medicine', 'दवा') : r.type === 'routine' ? tx('Routine', 'दिनचर्या') : r.type}
                    </span>
                    {r.completed && (
                      <span className="text-[10px] font-bold text-[#5B825B] bg-[#EAF1E8] px-2 py-0.5 rounded-full">
                        {tx('Done', 'पूर्ण')}
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-base text-[#2D3A2F] mt-0.5">{r.title}</h4>
                  {r.note && <p className="text-xs text-[#5A6E5D] mt-0.5">{r.note}</p>}
                </div>
                <button
                  onClick={() => onDeleteReminder(r.id)}
                  className="p-2 text-gray-400 hover:text-[#C46A66] transition-colors"
                  aria-label="Delete reminder"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT PERSONAL DETAILS */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#5B825B] text-white flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black text-[#2D3A2F]">{tx('Edit Personal Details', 'व्यक्तिगत विवरण संपादित करें')}</h3>
              </div>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              {/* Avatar section */}
              <div className="p-3 bg-[#FDFBF7] rounded-2xl border border-[#E0DCD3] flex items-center gap-3">
                <img
                  src={profileForm.avatar}
                  alt="Profile"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-[#5B825B]"
                />
                <div className="flex-1 space-y-1.5">
                  <label className="block font-black text-[#2D3A2F]">{tx('Profile Photo', 'प्रोफ़ाइल फ़ोटो')}</label>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 rounded-xl bg-white border border-[#E0DCD3] text-[#5B825B] font-bold cursor-pointer hover:bg-[#EAF1E8] flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" /> {tx('Upload File', 'फ़ाइल अपलोड करें')}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-[#5A6E5D]">{tx('or enter URL below', 'या नीचे यूआरएल दर्ज करें')}</span>
                  </div>
                  <input
                    type="text"
                    value={profileForm.avatar}
                    onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                    placeholder={tx('Image URL', 'तस्वीर का URL')}
                    className="w-full px-2.5 py-1 rounded-lg border border-[#E0DCD3] text-[11px]"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-[#5A6E5D]">{tx('Assam Avatars:', 'असम अवतार:', 'অসমীয়া অৱতাৰ:')}</span>
                    {ELDER_AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setProfileForm({ ...profileForm, avatar: av.url })}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold transition-all ${
                          profileForm.avatar === av.url
                            ? 'border-[#5B825B] bg-[#EAF1E8] text-[#5B825B]'
                            : 'border-[#E0DCD3] bg-white text-[#2D3A2F] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <img src={av.url} alt={av.label} className="w-3.5 h-3.5 rounded-full object-cover" />
                        <span>{av.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-black text-[#2D3A2F] mb-1">{tx('Preferred Name', 'पसंदीदा नाम')}</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="e.g. Anita"
                    className="w-full px-3 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-black text-[#2D3A2F] mb-1">{tx('Full Name', 'पूरा नाम')}</label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    placeholder="e.g. Anita Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-black text-[#2D3A2F] mb-1">{tx('Age', 'उम्र')}</label>
                  <input
                    type="number"
                    value={profileForm.age}
                    onChange={(e) => setProfileForm({ ...profileForm, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-black text-[#2D3A2F] mb-1">{tx('Gender', 'लिंग')}</label>
                  <select
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                  >
                    <option value="Female">{tx('Female', 'महिला')}</option>
                    <option value="Male">{tx('Male', 'पुरुष')}</option>
                    <option value="Other">{tx('Other', 'अन्य')}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-black text-[#2D3A2F] mb-1">{tx('Blood Group', 'रक्त समूह')}</label>
                  <input
                    type="text"
                    value={profileForm.bloodGroup}
                    onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                    placeholder="B+"
                    className="w-full px-3 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-black text-[#2D3A2F] mb-1">{tx('Region / City', 'क्षेत्र / शहर')}</label>
                  <input
                    type="text"
                    value={profileForm.region}
                    onChange={(e) => setProfileForm({ ...profileForm, region: e.target.value })}
                    placeholder="Pune, Maharashtra"
                    className="w-full px-3 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                  />
                </div>
                <div>
                  <label className="block font-black text-[#2D3A2F] mb-1">{tx('Languages', 'भाषाएँ')}</label>
                  <input
                    type="text"
                    value={profileForm.language}
                    onChange={(e) => setProfileForm({ ...profileForm, language: e.target.value })}
                    placeholder="Marathi, Hindi"
                    className="w-full px-3 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black text-[#2D3A2F] mb-1">{tx('About / Bio & Hobbies', 'परिचय और शौक')}</label>
                <textarea
                  rows={2}
                  value={profileForm.about}
                  onChange={(e) => setProfileForm({ ...profileForm, about: e.target.value })}
                  placeholder="Loves gardening, old songs, grandkids..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                />
              </div>

              <div>
                <label className="block font-black text-[#2D3A2F] mb-1">{tx('Major Care Focus Note', 'प्रमुख देखभाल टिप्पणी')}</label>
                <input
                  type="text"
                  value={profileForm.majorCareIssue}
                  onChange={(e) => setProfileForm({ ...profileForm, majorCareIssue: e.target.value })}
                  placeholder="Memory-related cognitive difficulty"
                  className="w-full px-3 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-xs font-extrabold text-[#5A6E5D]"
                >
                  {tx('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#5B825B] text-white text-xs font-black shadow-xs hover:bg-[#4d704d]"
                >
                  {tx('Save Changes', 'परिवर्तन सहेजें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT MEDICAL DETAILS & GUIDANCE */}
      {showEditMedicalModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#C46A66] text-white flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black text-[#2D3A2F]">{tx('Edit Medical Details', 'चिकित्सा विवरण संपादित करें')}</h3>
              </div>
              <button
                onClick={() => setShowEditMedicalModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMedical} className="space-y-3.5 text-xs">
              {/* Concerns tags */}
              <div className="space-y-2">
                <label className="block font-black text-[#2D3A2F]">{tx('Primary Health & Cognitive Concerns', 'प्रमुख स्वास्थ्य व संज्ञानात्मक चिंताएं')}</label>
                <div className="flex flex-wrap gap-1.5">
                  {medicalForm.concerns.map((c, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-[#F0D8D6] text-[#3D2423] font-bold text-xs flex items-center gap-1.5"
                    >
                      <span>{c}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveConcern(i)}
                        className="w-3.5 h-3.5 rounded-full hover:bg-black/10 flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newConcernInput}
                    onChange={(e) => setNewConcernInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddConcern();
                      }
                    }}
                    placeholder={tx('Add concern (e.g. Sleep irregularity)', 'चिंता जोड़ें (उदा. नींद की अनियमितता)')}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-[#E0DCD3] text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddConcern}
                    className="px-3 py-1.5 rounded-xl bg-[#EAF1E8] text-[#5B825B] font-black text-xs hover:bg-[#d4e6d0]"
                  >
                    {tx('+ Add', '+ जोड़ें')}
                  </button>
                </div>
              </div>

              {/* Physician care guidance */}
              <div className="space-y-1">
                <label className="block font-black text-[#2D3A2F]">{tx('Physician Care Guidance & Notes', 'चिकित्सक देखभाल मार्गदर्शन व नोट्स')}</label>
                <textarea
                  rows={4}
                  value={medicalForm.careInfo}
                  onChange={(e) => setMedicalForm({ ...medicalForm, careInfo: e.target.value })}
                  placeholder="Daily recommendations, hydration, diet, routine reminders..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-medium leading-relaxed focus:border-[#5B825B]"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditMedicalModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-xs font-extrabold text-[#5A6E5D]"
                >
                  {tx('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#5B825B] text-white text-xs font-black shadow-xs hover:bg-[#4d704d]"
                >
                  {tx('Save Medical Details', 'चिकित्सा विवरण सहेजें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD DOCTOR CONSULTATION */}
      {showAddConsultationModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-black text-[#2D3A2F]">{tx('Log Doctor Consultation', 'डॉक्टर परामर्श दर्ज करें')}</h3>
            <form onSubmit={handleAddConsultation} className="space-y-3 text-xs">
              <div>
                <label className="block font-black text-[#2D3A2F] mb-1">{tx('Doctor Name', 'डॉक्टर का नाम')}</label>
                <input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="e.g. Dr. Meera Rao"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                  required
                />
              </div>
              <div>
                <label className="block font-black text-[#2D3A2F] mb-1">{tx('Specialty', 'विशेषज्ञता')}</label>
                <input
                  type="text"
                  value={newDocSpecialty}
                  onChange={(e) => setNewDocSpecialty(e.target.value)}
                  placeholder="e.g. Neurologist / Geriatrician"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                  required
                />
              </div>
              <div>
                <label className="block font-black text-[#2D3A2F] mb-1">{tx('Date', 'तारीख')}</label>
                <input
                  type="text"
                  value={newDocDate}
                  onChange={(e) => setNewDocDate(e.target.value)}
                  placeholder="e.g. 15 June 2026"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                  required
                />
              </div>
              <div>
                <label className="block font-black text-[#2D3A2F] mb-1">{tx('Consultation Summary / Notes', 'परामर्श सारांश / नोट्स')}</label>
                <textarea
                  rows={3}
                  value={newDocNotes}
                  onChange={(e) => setNewDocNotes(e.target.value)}
                  placeholder="Prescription changes, cognitive test observation, next checkup..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddConsultationModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-xs font-extrabold text-[#5A6E5D]"
                >
                  {tx('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#5B825B] text-white text-xs font-black shadow-xs hover:bg-[#4d704d]"
                >
                  {tx('Save Visit', 'मुलाक़ात सहेजें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD PLAYER MEMORY (PHOTO / VIDEO / UPLOAD) */}
      {showAddMemoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#5B825B] text-white flex items-center justify-center">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#2D3A2F]">{tx('Add Player Memory', 'याद जोड़ें')}</h3>
                  <p className="text-[11px] text-[#5A6E5D]">{tx('Upload photos, videos, or memories for', 'तस्वीरें, वीडियो या यादें अपलोड करें')} {patientProfile.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddMemoryModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Media Type Switcher */}
            <div className="flex gap-2 p-1 bg-[#FDFBF7] rounded-2xl border border-[#E0DCD3]">
              <button
                type="button"
                onClick={() => {
                  setNewMemoryMediaType('photo');
                  soundController.playClick();
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                  newMemoryMediaType === 'photo'
                    ? 'bg-[#5B825B] text-white shadow-xs'
                    : 'text-[#5A6E5D] hover:text-[#2D3A2F]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" /> {tx('Photo Memory', 'फ़ोटो याद')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewMemoryMediaType('video');
                  soundController.playClick();
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                  newMemoryMediaType === 'video'
                    ? 'bg-[#E8B25C] text-white shadow-xs'
                    : 'text-[#5A6E5D] hover:text-[#2D3A2F]'
                }`}
              >
                <Video className="w-3.5 h-3.5" /> {tx('Video Story', 'वीडियो कहानी')}
              </button>
            </div>

            <form onSubmit={handleCreateMemory} className="space-y-3 text-xs">
              {/* Media File Upload Area */}
              <div className="border-2 border-dashed border-[#5B825B]/40 rounded-2xl p-4 text-center bg-[#FDFBF7] space-y-2 hover:bg-[#EAF1E8]/30 transition-colors">
                <input
                  type="file"
                  id="memory-file-input"
                  accept="image/*,video/*"
                  onChange={handleMemoryFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="memory-file-input"
                  className="cursor-pointer flex flex-col items-center gap-1.5"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#EAF1E8] text-[#5B825B] flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-sm text-[#2D3A2F]">
                    {memoryUploadPreview ? tx('File Selected! Tap to change', 'फ़ाइल चुनी गई! बदलने के लिए टैप करें') : tx('Upload Photo or Video', 'फ़ोटो या वीडियो अपलोड करें')}
                  </span>
                  <span className="text-[11px] text-[#5A6E5D]">
                    {tx('Supports JPG, PNG, MP4, WebM from your computer/phone', 'कंप्यूटर या फ़ोन से JPG, PNG, MP4, WebM समर्थित')}
                  </span>
                </label>

                {memoryUploadPreview && (
                  <div className="pt-2">
                    {newMemoryMediaType === 'video' ? (
                      <video
                        src={memoryUploadPreview}
                        controls
                        className="w-full max-h-36 rounded-xl bg-black object-contain mx-auto"
                      />
                    ) : (
                      <img
                        src={memoryUploadPreview}
                        alt="Preview"
                        className="w-full max-h-36 rounded-xl object-cover mx-auto"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Direct Media URL */}
              <div>
                <label className="block font-black text-[#2D3A2F] mb-1">
                  {tx('Or Paste', 'या पेस्ट करें')} {newMemoryMediaType === 'video' ? tx('Video URL', 'वीडियो URL') : tx('Photo URL', 'फ़ोटो URL')}
                </label>
                <input
                  type="text"
                  value={newMemoryMediaUrl}
                  onChange={(e) => {
                    setNewMemoryMediaUrl(e.target.value);
                    setMemoryUploadPreview(e.target.value);
                  }}
                  placeholder={newMemoryMediaType === 'video' ? 'https://.../video.mp4' : 'https://.../photo.jpg'}
                  className="w-full px-3 py-2 rounded-xl border border-[#E0DCD3] text-xs focus:border-[#5B825B]"
                />
              </div>

              {/* Quick Sample Presets */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#5A6E5D] block">{tx('Quick Sample Media:', 'त्वरित नमूना मीडिया:')}</span>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_MEDIA_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="px-2.5 py-1 rounded-xl bg-[#FDFBF7] border border-[#E0DCD3] text-[11px] font-bold text-[#2D3A2F] hover:bg-[#EAF1E8]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-black text-[#2D3A2F] mb-1">{tx('Memory Title', 'याद का शीर्षक')}</label>
                <input
                  type="text"
                  value={newMemoryTitle}
                  onChange={(e) => setNewMemoryTitle(e.target.value)}
                  placeholder="e.g. Grandkids Diwali Celebration"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-black text-[#2D3A2F] mb-1">{tx('People in this Memory', 'इस याद में लोग')}</label>
                  <input
                    type="text"
                    value={newMemoryPerson}
                    onChange={(e) => setNewMemoryPerson(e.target.value)}
                    placeholder="e.g. Meera, Rohan"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                  />
                </div>
                <div>
                  <label className="block font-black text-[#2D3A2F] mb-1">{tx('Category', 'श्रेणी')}</label>
                  <select
                    value={newMemoryCategory}
                    onChange={(e) => setNewMemoryCategory(e.target.value as MemoryCategory)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                  >
                    <option value="Family">{tx('Family', 'परिवार')}</option>
                    <option value="People">{tx('People', 'लोग')}</option>
                    <option value="Places">{tx('Places', 'स्थान')}</option>
                    <option value="Special Moments">{tx('Special Moments', 'खास पल')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-black text-[#2D3A2F] mb-1">{tx('Story / Heartfelt Narration', 'कहानी / भावनात्मक विवरण')}</label>
                <textarea
                  rows={3}
                  value={newMemoryDesc}
                  onChange={(e) => setNewMemoryDesc(e.target.value)}
                  placeholder="Write a loving story or description that can be read aloud to Anita in Player Mode..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E0DCD3] text-xs font-medium leading-relaxed focus:border-[#5B825B]"
                  required
                />
              </div>

              {/* Voice Reminiscence: 15-second audio snippet in caregiver/loved one's real voice */}
              <div className="pt-1">
                <VoiceReminiscenceRecorder
                  defaultRecordedBy={patientProfile.caregiver?.name || 'Daughter Priya'}
                  defaultPromptText={newMemoryVoiceSnippet?.promptText || ''}
                  initialAudioUrl={newMemoryVoiceSnippet?.audioUrl}
                  initialDuration={newMemoryVoiceSnippet?.duration}
                  onSaveVoiceSnippet={(voiceData: VoiceReminiscenceData | null) => setNewMemoryVoiceSnippet(voiceData)}
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemoryModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-xs font-extrabold text-[#5A6E5D]"
                >
                  {tx('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#5B825B] text-white text-xs font-black shadow-xs hover:bg-[#4d704d]"
                >
                  {tx('Save to Player Memories', 'खिलाड़ी की यादों में सहेजें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MEMORY MODAL */}
      {previewMemory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl animate-scaleUp">
            <div className="relative aspect-4/3 bg-black flex items-center justify-center">
              {previewMemory.mediaType === 'video' || previewMemory.videoUrl ? (
                <video
                  src={previewMemory.videoUrl || previewMemory.image}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={previewMemory.image}
                  alt={previewMemory.title}
                  className="w-full h-full object-cover"
                />
              )}
              <button
                onClick={() => setPreviewMemory(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-black font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-2">
              <span className="text-[10px] font-black uppercase text-[#5B825B] bg-[#EAF1E8] px-2 py-0.5 rounded-full">
                {previewMemory.category}
              </span>
              <h3 className="text-lg font-black text-[#2D3A2F]">{previewMemory.title}</h3>
              {previewMemory.person && (
                <p className="text-xs font-bold text-[#5B825B]">{previewMemory.person}</p>
              )}
              <p className="text-xs text-[#5A6E5D] leading-relaxed">{previewMemory.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-xl animate-scaleUp">
            <h3 className="text-xl font-black text-[#2D3A2F]">{tx('Add Calendar Event', 'कैलेंडर कार्यक्रम जोड़ें')}</h3>
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">{tx('Title', 'शीर्षक')}</label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Neurologist review"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-sm focus:outline-hidden focus:border-[#5B825B]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">{tx('Time', 'समय')}</label>
                <input
                  type="text"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  placeholder="e.g. 11:30 AM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-sm focus:outline-hidden focus:border-[#5B825B]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">{tx('Type', 'प्रकार')}</label>
                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-sm focus:outline-hidden focus:border-[#5B825B]"
                >
                  <option value="doctor">{tx('Doctor Consultation', 'डॉक्टर परामर्श')}</option>
                  <option value="routine">{tx('Routine', 'दिनचर्या')}</option>
                  <option value="family">{tx('Family Visit', 'पारिवारिक मुलाक़ात')}</option>
                  <option value="appointment">{tx('Appointment', 'मुलाक़ात')}</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-xs font-extrabold text-[#5A6E5D]"
                >
                  {tx('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#5B825B] text-white text-xs font-extrabold shadow-xs hover:bg-[#4d704d]"
                >
                  {tx('Save Event', 'कार्यक्रम सहेजें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {showAddReminderModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-xl animate-scaleUp">
            <h3 className="text-xl font-black text-[#2D3A2F]">{tx('Add Daily Reminder', 'दैनिक स्मरण जोड़ें')}</h3>
            <form onSubmit={handleCreateReminder} className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">{tx('Title', 'शीर्षक')}</label>
                <input
                  type="text"
                  value={newReminderTitle}
                  onChange={(e) => setNewReminderTitle(e.target.value)}
                  placeholder="e.g. Evening BP Pill"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-sm focus:outline-hidden focus:border-[#5B825B]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">{tx('Time', 'समय')}</label>
                  <input
                    type="text"
                    value={newReminderTime}
                    onChange={(e) => setNewReminderTime(e.target.value)}
                    placeholder="8:00 PM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-sm focus:outline-hidden focus:border-[#5B825B]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">{tx('Type', 'प्रकार')}</label>
                  <select
                    value={newReminderType}
                    onChange={(e) => setNewReminderType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-sm focus:outline-hidden focus:border-[#5B825B]"
                  >
                    <option value="medicine">{tx('Medicine', 'दवा')}</option>
                    <option value="routine">{tx('Routine', 'दिनचर्या')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">{tx('Notes / Guidance', 'नोट्स / मार्गदर्शन')}</label>
                <input
                  type="text"
                  value={newReminderNote}
                  onChange={(e) => setNewReminderNote(e.target.value)}
                  placeholder="e.g. Take with warm water after food"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-sm focus:outline-hidden focus:border-[#5B825B]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddReminderModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-xs font-extrabold text-[#5A6E5D]"
                >
                  {tx('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#5B825B] text-white text-xs font-extrabold shadow-xs hover:bg-[#4d704d]"
                >
                  {tx('Save Reminder', 'स्मरण सहेजें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Clinical PDF Modal */}
      <ExportPdfModal
        isOpen={showExportPdfModal}
        onClose={() => setShowExportPdfModal(false)}
        patientProfile={patientProfile}
        medicalProfile={medicalProfile}
        ddaLogs={ddaLogs}
        reminders={reminders}
      />
    </div>
  );
};
