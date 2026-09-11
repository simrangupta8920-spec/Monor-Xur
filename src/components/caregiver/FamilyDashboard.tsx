import React, { useState, useMemo } from 'react';
import { 
  User, Heart, Calendar, Bell, ShieldAlert, BarChart3, Plus, Trash2, 
  Phone, Clock, AlertTriangle, CheckCircle2, ChevronRight, Activity, Award, Sparkles, FileText,
  Edit3, Video, Image as ImageIcon, Upload, Eye, X, Stethoscope, Check, Play, Film, Mic, TrendingUp, Download,
  Puzzle, Brain
} from 'lucide-react';
import { 
  FamilyCaregiverTab, CalendarEvent, Reminder, AlertItem, EmergencyContact, DDAMetric, Memory, 
  PatientProfile, MedicalProfile, MedicalConsultation, MemoryCategory 
} from '../../types';
import { GAME_PROGRESS, REPORTS, REPORT_SUMMARY, MEDICAL_DISCLAIMER } from '../../data/mockData';
import { soundController } from '../../utils/audio';
import { CognitiveProgressView } from './CognitiveProgressView';
import { MemoryInsightsView } from './MemoryInsightsView';
import { ExportPdfModal } from './ExportPdfModal';
import { 
  computeGameStats, 
  getGameBreakdown, 
  filterLogsByGame, 
  generateClinicalReportSummary, 
  getWeeklyActivityDistribution, 
  GameFilterType,
  BASELINE_GAME_SESSIONS
} from '../../utils/gameAnalytics';

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
}

const SAMPLE_MEDIA_PRESETS = [
  {
    type: 'video' as const,
    label: 'Family Celebration Video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    title: 'Grandkids Singing & Dancing',
    person: 'Meera & Kabir',
    category: 'Family' as MemoryCategory,
    desc: 'Lively home video of grandchildren singing joyful songs in the living room.',
  },
  {
    type: 'video' as const,
    label: 'Garden Butterflies Video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    title: 'Morning Garden Butterflies',
    person: 'Home Garden',
    category: 'Places' as MemoryCategory,
    desc: 'A calm, sunny morning recording of the garden flowers and gentle breeze.',
  },
  {
    type: 'photo' as const,
    label: 'Family Festival Photo',
    url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80',
    title: 'Diwali Gathering at Home',
    person: 'Whole Family',
    category: 'Special Moments' as MemoryCategory,
    desc: 'The entire family dressed in traditional festive attire sharing sweets and smiles.',
  },
];

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
}) => {
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

  // Filter for Memories in Caregiver view
  const [memoryFilter, setMemoryFilter] = useState<'All' | 'photo' | 'video' | 'audio'>('All');
  const [previewMemory, setPreviewMemory] = useState<Memory | null>(null);

  // PDF Export Modal state
  const [showExportPdfModal, setShowExportPdfModal] = useState(false);

  // Game-specific filter states
  const [reportsGameFilter, setReportsGameFilter] = useState<GameFilterType>('all');
  const [telemetryGameFilter, setTelemetryGameFilter] = useState<GameFilterType>('all');

  // Dynamic game analytics derived from actual player telemetry
  const effectiveDdaLogs = useMemo(() => {
    return ddaLogs && ddaLogs.length > 0 ? ddaLogs : BASELINE_GAME_SESSIONS;
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
      minutes: 600,
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
    };

    onAddMemory(newMem);
    setNewMemoryTitle('');
    setNewMemoryPerson('');
    setNewMemoryDesc('');
    setNewMemoryMediaUrl('');
    setMemoryUploadPreview(null);
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
                  Active Player & Loved One
                </span>
                <h2 className="text-xl font-black text-[#2D3A2F] mt-0.5">{patientProfile.fullName}</h2>
                <p className="text-xs text-[#5A6E5D]">
                  {patientProfile.age} yrs • {patientProfile.region}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => {
                  soundController.playClick();
                  setShowExportPdfModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#F0EBE1] text-[#2D3A2F] border border-[#D5CFBF] text-xs font-extrabold hover:bg-[#EAE4D6] flex items-center gap-1 shadow-2xs"
                title="Download medical logs & cognitive progress PDF"
              >
                <FileText className="w-3.5 h-3.5 text-[#5B825B]" /> PDF Summary
              </button>
              <button
                onClick={() => {
                  setProfileForm(patientProfile);
                  setShowEditProfileModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#EAF1E8] text-[#5B825B] text-xs font-extrabold hover:bg-[#d9e8d6] flex items-center gap-1 shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Details
              </button>
              <button
                onClick={() => onSelectTab('profile')}
                className="px-3 py-1.5 rounded-xl bg-[#FDFBF7] border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] hover:bg-[#EAF1E8]"
              >
                Full Profile
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white p-3 rounded-2xl border border-[#E0DCD3] shadow-xs">
              <span className="text-2xl font-black text-[#5B825B]">{globalGameStats.avgAccuracy}%</span>
              <span className="block text-[11px] font-bold text-[#5A6E5D] mt-0.5">Avg Accuracy</span>
              <span className="block text-[9px] text-[#5B825B] font-extrabold truncate">
                {gameBreakdown.memoryMatch.sessions} Match • {gameBreakdown.puzzle.sessions} Puzzle
              </span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-[#E0DCD3] shadow-xs">
              <span className="text-2xl font-black text-[#2D3A2F]">{globalGameStats.totalSessions}</span>
              <span className="block text-[11px] font-bold text-[#5A6E5D] mt-0.5">Rounds Recorded</span>
              <span className="block text-[9px] text-[#5A6E5D] font-extrabold truncate">
                Level {globalGameStats.currentLevel} Adaptive Tier
              </span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-[#E0DCD3] shadow-xs">
              <span className="text-2xl font-black text-[#E8B25C]">{globalGameStats.activeDays}</span>
              <span className="block text-[11px] font-bold text-[#5A6E5D] mt-0.5">Active Days</span>
              <span className="block text-[9px] text-[#8C651E] font-extrabold truncate">
                {globalGameStats.avgLatencySec}s avg latency
              </span>
            </div>
          </div>

          {/* Care Sections Navigation Hub */}
          <div className="bg-white rounded-3xl p-4 border border-[#E0DCD3] shadow-xs space-y-2">
            <h3 className="font-black text-sm text-[#2D3A2F] uppercase tracking-wider px-2">Care Modules</h3>

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
                      <h4 className="font-extrabold text-sm text-[#2D3A2F]">Memory Games Insights</h4>
                      <span className="px-2 py-0.2 rounded-full bg-[#5B825B] text-white text-[10px] font-black uppercase tracking-wider">
                        Recharts
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5A6E5D]">Track accuracy, mistakes, reaction speed & DDA shifts over time</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-white border border-[#5B825B]/30 text-[#5B825B] text-xs font-black">
                  View Insights →
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
                      <h4 className="font-extrabold text-sm text-[#2D3A2F]">DDA Cognitive Progress</h4>
                      <span className="px-2 py-0.2 rounded-full bg-white text-[#5B825B] text-[10px] font-black uppercase">
                        Clinical Report
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5A6E5D]">Holistic cognitive engagement score and PDF health export</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-white border border-[#E0DCD3] text-[#2D3A2F] text-xs font-black">
                  View Trends →
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
                    <h4 className="font-extrabold text-sm text-[#2D3A2F]">Player Memories & Media</h4>
                    <p className="text-[11px] text-[#5A6E5D]">Upload family photos, videos, and stories</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-[#5B825B] text-white text-xs font-black">
                  {memories.length} Items
                </span>
              </button>

              <button
                onClick={() => onSelectTab('medical')}
                className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] text-left hover:bg-[#EAF1E8] transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-[#EAF1E8] text-[#5B825B] flex items-center justify-center mb-1.5">
                  <Heart className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-sm text-[#2D3A2F]">Medical Details</h4>
                <p className="text-[11px] text-[#5A6E5D]">Doctors & care notes</p>
              </button>

              <button
                onClick={() => onSelectTab('insights')}
                className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] text-left hover:bg-[#EAF1E8] transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-[#FDF0D5] text-[#8C651E] flex items-center justify-center mb-1.5">
                  <Activity className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-sm text-[#2D3A2F]">DDA Insights</h4>
                <p className="text-[11px] text-[#5A6E5D]">Charts & telemetry</p>
              </button>

              <button
                onClick={() => onSelectTab('reports')}
                className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] text-left hover:bg-[#EAF1E8] transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-[#D4E4E6] text-[#7A9CA4] flex items-center justify-center mb-1.5">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-sm text-[#2D3A2F]">Reports</h4>
                <p className="text-[11px] text-[#5A6E5D]">Trends & frequency</p>
              </button>

              <button
                onClick={() => onSelectTab('reminders')}
                className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] text-left hover:bg-[#EAF1E8] transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-[#F0D8D6] text-[#C46A66] flex items-center justify-center mb-1.5">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-sm text-[#2D3A2F]">Reminders</h4>
                <p className="text-[11px] text-[#5A6E5D]">Medicine & routines</p>
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
                      <h4 className="font-extrabold text-sm text-[#2D3A2F]">Generate Clinical PDF Summary</h4>
                      <span className="px-2 py-0.2 rounded-full bg-[#EAF1E8] text-[#5B825B] text-[10px] font-black uppercase">
                        Printable
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5A6E5D]">Download patient medical logs & engagement progress trends</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-white border border-[#E0DCD3] text-[#2D3A2F] text-xs font-black">
                  Export PDF ↓
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
                  <h3 className="font-black text-sm uppercase tracking-wide">Care Alerts</h3>
                </div>
                <button
                  onClick={() => onSelectTab('alerts')}
                  className="text-xs font-bold text-[#5B825B] hover:underline"
                >
                  View All ({alerts.length})
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
              <h2 className="text-2xl font-black text-[#2D3A2F]">Care Calendar</h2>
              <p className="text-xs text-[#5A6E5D]">{patientProfile.name}'s medical appointments & daily schedule</p>
            </div>
            <button
              onClick={() => setShowAddEventModal(true)}
              className="flex items-center gap-1 px-3.5 py-2 rounded-2xl bg-[#5B825B] text-white font-extrabold text-xs shadow-xs hover:bg-[#4d704d]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
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
                  {evt.type}
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
            <h2 className="text-2xl font-black text-[#2D3A2F]">Caregiver Alerts</h2>
            <p className="text-xs text-[#5A6E5D]">System notices for missed routines and upcoming appointments.</p>
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
                      Acknowledge
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
              <Edit3 className="w-3.5 h-3.5" /> Edit Details
            </button>

            <img
              src={patientProfile.avatar}
              alt={patientProfile.fullName}
              className="w-24 h-24 rounded-3xl object-cover mx-auto border-3 border-[#5B825B] shadow-sm"
            />
            <div>
              <h2 className="text-2xl font-black text-[#2D3A2F]">{patientProfile.fullName}</h2>
              <p className="text-xs font-semibold text-[#5B825B] mt-0.5">Player Profile • Loved One & Care Recipient</p>
            </div>
            <p className="text-xs text-[#5A6E5D] italic max-w-xs mx-auto">"{patientProfile.about}"</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-[#2D3A2F] uppercase tracking-wider">Personal Records</h3>
              <button
                onClick={() => {
                  setProfileForm(patientProfile);
                  setShowEditProfileModal(true);
                }}
                className="text-xs font-extrabold text-[#5B825B] hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            </div>
            <div className="divide-y divide-[#EAE6DF]">
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-[#5A6E5D]">Preferred Name</span>
                <span className="font-extrabold text-[#2D3A2F]">{patientProfile.name}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-[#5A6E5D]">Full name</span>
                <span className="font-extrabold text-[#2D3A2F]">{patientProfile.fullName}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-[#5A6E5D]">Age</span>
                <span className="font-extrabold text-[#2D3A2F]">{patientProfile.age} years</span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-[#5A6E5D]">Gender</span>
                <span className="font-extrabold text-[#2D3A2F]">{patientProfile.gender}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-[#5A6E5D]">Region</span>
                <span className="font-extrabold text-[#2D3A2F]">{patientProfile.region}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-[#5A6E5D]">Languages</span>
                <span className="font-extrabold text-[#2D3A2F]">{patientProfile.language}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-[#5A6E5D]">Blood group</span>
                <span className="font-extrabold text-[#2D3A2F]">{patientProfile.bloodGroup}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-[#5A6E5D]">Care Focus</span>
                <span className="font-extrabold text-[#5B825B] text-right max-w-[180px]">{patientProfile.majorCareIssue}</span>
              </div>
            </div>
          </div>

          {/* Emergency Contacts List */}
          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
            <h3 className="font-black text-sm text-[#2D3A2F] uppercase tracking-wider">Emergency Contacts</h3>
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
                <h3 className="font-black text-sm text-[#2D3A2F] uppercase tracking-wider">Caregiver Security & Access</h3>
                <p className="text-xs text-[#5A6E5D]">Family portal credentials and PIN protection</p>
              </div>
              {onOpenSetup && (
                <button
                  onClick={() => {
                    soundController.playClick();
                    onOpenSetup();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#EAF1E8] text-[#5B825B] text-xs font-black hover:bg-[#d6ebd3] transition-colors"
                >
                  Configure Profiles
                </button>
              )}
            </div>

            <div className="divide-y divide-[#EAE6DF]">
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-[#5A6E5D]">Caregiver Name</span>
                <span className="font-extrabold text-[#2D3A2F]">{patientProfile.caregiver?.name || 'Family Caregiver'}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-[#5A6E5D]">Relationship</span>
                <span className="font-extrabold text-[#2D3A2F]">{patientProfile.caregiver?.relationship || 'Family'}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-[#5A6E5D]">Phone Contact</span>
                <span className="font-extrabold text-[#2D3A2F]">{patientProfile.caregiver?.phone || 'Configured in setup'}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-[#5A6E5D]">Caregiver PIN</span>
                <span className="font-extrabold text-[#5B825B] tracking-widest bg-[#EAF1E8] px-2.5 py-0.5 rounded-lg text-xs">
                  {patientProfile.caregiver?.pin ? '•••• (Configured)' : '1234 (Default)'}
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
                  <span>Launch Initial Setup / Configuration Wizard</span>
                </button>
              </div>
            )}
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
                ← Back
              </button>
              <h2 className="text-xl font-black text-[#2D3A2F]">Medical Details</h2>
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
                <Download className="w-3.5 h-3.5 text-[#5B825B]" /> Export PDF
              </button>
              <button
                onClick={() => {
                  setMedicalForm(medicalProfile);
                  setShowEditMedicalModal(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#EAF1E8] text-[#5B825B] text-xs font-black hover:bg-[#d9e8d6]"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Guidance
              </button>
              <button
                onClick={() => setShowAddConsultationModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#5B825B] text-white text-xs font-black shadow-xs hover:bg-[#4d704d]"
              >
                <Plus className="w-3.5 h-3.5" /> Consultation
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-[#2D3A2F] uppercase tracking-wider">Primary Medical Concerns</h3>
              <button
                onClick={() => {
                  setMedicalForm(medicalProfile);
                  setShowEditMedicalModal(true);
                }}
                className="text-xs font-bold text-[#5B825B] hover:underline"
              >
                + Add / Manage Concerns
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
                <h4 className="font-extrabold text-xs text-[#5A6E5D] uppercase">Physician Care Guidance</h4>
                <button
                  onClick={() => {
                    setMedicalForm(medicalProfile);
                    setShowEditMedicalModal(true);
                  }}
                  className="text-xs font-bold text-[#5B825B] hover:underline"
                >
                  Edit
                </button>
              </div>
              <p className="text-sm font-medium text-[#2D3A2F] mt-1.5 bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#E0DCD3] leading-relaxed">
                {medicalProfile.careInfo}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-[#2D3A2F] uppercase tracking-wider">Doctor Consultations</h3>
              <span className="text-xs font-bold text-[#5A6E5D]">{medicalProfile.consultations.length} Visits Logged</span>
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
                ← Back
              </button>
              <div>
                <h2 className="text-xl font-black text-[#2D3A2F]">Player Memories & Media</h2>
                <p className="text-xs text-[#5A6E5D]">Photos and videos for {patientProfile.name} to view in Player Mode</p>
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
              <span>Add Memory</span>
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
                  ? `All Items (${memories.length})`
                  : filter === 'photo'
                  ? 'Photos Only'
                  : filter === 'video'
                  ? 'Videos Only'
                  : 'Voice Diaries'}
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
                              <Video className="w-2.5 h-2.5" /> Video
                            </span>
                          ) : isVoiceDiary ? (
                            <span className="text-[10px] font-black uppercase text-[#5B825B] bg-[#EAF1E8] px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Mic className="w-2.5 h-2.5" /> Voice Diary
                            </span>
                          ) : (
                            <span className="text-[10px] font-black uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <ImageIcon className="w-2.5 h-2.5" /> Photo
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
                ← Back
              </button>
              <h2 className="text-xl font-black text-[#2D3A2F]">DDA Insights & Telemetry</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('insights')}
                className="px-3 py-1.5 rounded-xl bg-[#EAF1E8] border border-[#5B825B]/40 text-[#5B825B] text-xs font-black flex items-center gap-1.5 shadow-2xs hover:bg-[#dfeade]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Memory Charts</span>
              </button>
              <button
                onClick={() => onSelectTab('progress')}
                className="px-3 py-1.5 rounded-xl bg-[#5B825B] text-white text-xs font-black flex items-center gap-1.5 shadow-2xs hover:bg-[#4a6b4a]"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Cognitive Progress</span>
              </button>
            </div>
          </div>

          {/* DDA explanation banner */}
          <div className="bg-[#EAF1E8] rounded-3xl p-4 border border-[#5B825B]/30 text-xs text-[#28331F] space-y-1">
            <span className="font-black uppercase tracking-wider block text-[#5B825B]">Dynamic Difficulty Adjustment (DDA)</span>
            <p>
              The engine automatically analyzes latency, hesitation, and mistakes during gameplay to dynamically scale difficulty without frustrating the player.
            </p>
          </div>

          {/* Game Filter Bar */}
          <div className="bg-white p-3 rounded-2xl border border-[#E0DCD3] shadow-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-[#2D3A2F] uppercase tracking-wider pl-1">Filter by Game:</span>
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
                <span>All Games ({effectiveDdaLogs.length})</span>
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
                <span>Memory Match ({gameBreakdown.memoryMatch.sessions})</span>
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
                <span>Photo Puzzle ({gameBreakdown.puzzle.sessions})</span>
              </button>
            </div>
            <span className="text-[11px] font-bold text-[#5A6E5D]">
              Showing {filteredTelemetryLogs.length} logs
            </span>
          </div>

          {/* Live Telemetry Logs from player sessions */}
          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
            <h3 className="font-black text-sm text-[#2D3A2F] uppercase tracking-wider">
              Telemetry Logs ({filteredTelemetryLogs.length})
            </h3>
            {filteredTelemetryLogs.length === 0 ? (
              <p className="text-xs text-[#5A6E5D]">No game sessions found matching the selected filter. Play a round in Player Mode!</p>
            ) : (
              <div className="space-y-2.5">
                {filteredTelemetryLogs.map((log, idx) => {
                  const resolvedGameType = log.gameType === 'puzzle' || (log.gameTitle && log.gameTitle.toLowerCase().includes('puzzle'))
                    ? 'puzzle'
                    : 'memory_match';
                  const resolvedGameTitle = log.gameTitle || (resolvedGameType === 'puzzle' ? 'Photo Puzzle' : 'Memory Match');

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
                          <span className="text-[#2D3A2F]">Round {log.roundNumber} (Level {log.difficultyLevel})</span>
                          {log.aiModel && (
                            <span className="text-[10px] font-black uppercase text-[#5B825B] bg-[#EAF1E8] px-2 py-0.5 rounded-full">
                              AI Analyzed
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
                          AI: {log.adaptiveAction}
                        </span>
                      </div>

                      <p className="text-[#5A6E5D]">
                        Latency: {(log.latencyMs / 1000).toFixed(1)}s • Moves: {log.moves} • Mistakes: <strong className={log.mistakes >= 3 ? 'text-[#C46A66]' : 'text-[#2D3A2F]'}>{log.mistakes}</strong> • Hints: {log.hintsUsed}
                      </p>

                      {log.aiReasoning && (
                        <div className="bg-white p-2.5 rounded-xl border border-[#5B825B]/20 text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-black text-[#5B825B]">
                            <span>AI MODEL RATIONALE</span>
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
                ← Back
              </button>
              <h2 className="text-xl font-black text-[#2D3A2F]">Cognitive Reports</h2>
            </div>
            <button
              onClick={() => {
                soundController.playClick();
                setShowExportPdfModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5B825B] text-white text-xs font-black shadow-2xs hover:bg-[#4a6b4a]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Summary</span>
            </button>
          </div>

          {/* Reports Game Filter Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#E0DCD3] shadow-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-[#2D3A2F] uppercase tracking-wider pl-1">Report Filter:</span>
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
                <span>Combined Overview ({effectiveDdaLogs.length})</span>
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
                <span>Memory Match Report ({gameBreakdown.memoryMatch.sessions})</span>
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
                <span>Photo Puzzle Report ({gameBreakdown.puzzle.sessions})</span>
              </button>
            </div>
            <span className="text-[11px] font-bold text-[#5A6E5D]">
              Active Scope: {reportsGameFilter === 'all' ? 'All Games' : reportsGameFilter === 'puzzle' ? 'Photo Puzzle' : 'Memory Match'}
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
                      <h4 className="font-extrabold text-sm text-[#2D3A2F]">Memory Match Performance</h4>
                      <p className="text-[11px] text-[#5A6E5D]">{gameBreakdown.memoryMatch.sessions} sessions played</p>
                    </div>
                  </div>
                  <span className="text-xl font-black text-[#5B825B]">{gameBreakdown.memoryMatch.accuracy}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#EAE6DF] text-center text-xs">
                  <div>
                    <span className="block text-[10px] text-[#5A6E5D]">Avg Errors</span>
                    <strong className="text-[#2D3A2F] font-black">{gameBreakdown.memoryMatch.avgMistakes}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#5A6E5D]">Avg Speed</span>
                    <strong className="text-[#2D3A2F] font-black">{gameBreakdown.memoryMatch.avgLatencySec}s</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#5A6E5D]">Current Level</span>
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
                      <h4 className="font-extrabold text-sm text-[#2D3A2F]">Photo Puzzle Performance</h4>
                      <p className="text-[11px] text-[#5A6E5D]">{gameBreakdown.puzzle.sessions} sessions played</p>
                    </div>
                  </div>
                  <span className="text-xl font-black text-[#E8B25C]">{gameBreakdown.puzzle.accuracy}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#EAE6DF] text-center text-xs">
                  <div>
                    <span className="block text-[10px] text-[#5A6E5D]">Avg Errors</span>
                    <strong className="text-[#2D3A2F] font-black">{gameBreakdown.puzzle.avgMistakes}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#5A6E5D]">Avg Speed</span>
                    <strong className="text-[#2D3A2F] font-black">{gameBreakdown.puzzle.avgLatencySec}s</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#5A6E5D]">Current Level</span>
                    <strong className="text-[#E8B25C] font-black">Lvl {gameBreakdown.puzzle.level}</strong>
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
                ? 'Clinical Summary & Cognitive Routine' 
                : reportsGameFilter === 'puzzle'
                ? 'Photo Puzzle Clinical Telemetry Summary'
                : 'Memory Match Clinical Telemetry Summary'}
            </h3>
            <p className="text-xs text-[#5A6E5D] bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#E0DCD3] leading-relaxed">
              {dynamicReportSummary.note}
            </p>

            {/* Weekly bar visualizer from actual game sessions */}
            <div className="pt-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-extrabold text-xs text-[#2D3A2F]">
                  Daily Game Activity Hours (This Week)
                </h4>
                <span className="text-[11px] font-bold text-[#5A6E5D]">
                  {filteredReportLogs.length} total sessions accounted
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
            <strong>Disclaimer:</strong> {MEDICAL_DISCLAIMER}
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
                ← Back
              </button>
              <h2 className="text-xl font-black text-[#2D3A2F]">Reminders Manager</h2>
            </div>
            <button
              onClick={() => setShowAddReminderModal(true)}
              className="flex items-center gap-1 px-3.5 py-2 rounded-2xl bg-[#5B825B] text-white font-extrabold text-xs shadow-xs hover:bg-[#4d704d]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Reminder</span>
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
                      {r.type}
                    </span>
                    {r.completed && (
                      <span className="text-[10px] font-bold text-[#5B825B] bg-[#EAF1E8] px-2 py-0.5 rounded-full">
                        Done
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
                <h3 className="text-lg font-black text-[#2D3A2F]">Edit Personal Details</h3>
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
                  <label className="block font-black text-[#2D3A2F]">Profile Photo</label>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 rounded-xl bg-white border border-[#E0DCD3] text-[#5B825B] font-bold cursor-pointer hover:bg-[#EAF1E8] flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" /> Upload File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-[#5A6E5D]">or enter URL below</span>
                  </div>
                  <input
                    type="text"
                    value={profileForm.avatar}
                    onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                    placeholder="Image URL"
                    className="w-full px-2.5 py-1 rounded-lg border border-[#E0DCD3] text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-black text-[#2D3A2F] mb-1">Preferred Name</label>
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
                  <label className="block font-black text-[#2D3A2F] mb-1">Full Name</label>
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
                  <label className="block font-black text-[#2D3A2F] mb-1">Age</label>
                  <input
                    type="number"
                    value={profileForm.age}
                    onChange={(e) => setProfileForm({ ...profileForm, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-black text-[#2D3A2F] mb-1">Gender</label>
                  <select
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-black text-[#2D3A2F] mb-1">Blood Group</label>
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
                  <label className="block font-black text-[#2D3A2F] mb-1">Region / City</label>
                  <input
                    type="text"
                    value={profileForm.region}
                    onChange={(e) => setProfileForm({ ...profileForm, region: e.target.value })}
                    placeholder="Pune, Maharashtra"
                    className="w-full px-3 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                  />
                </div>
                <div>
                  <label className="block font-black text-[#2D3A2F] mb-1">Languages</label>
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
                <label className="block font-black text-[#2D3A2F] mb-1">About / Bio & Hobbies</label>
                <textarea
                  rows={2}
                  value={profileForm.about}
                  onChange={(e) => setProfileForm({ ...profileForm, about: e.target.value })}
                  placeholder="Loves gardening, old songs, grandkids..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                />
              </div>

              <div>
                <label className="block font-black text-[#2D3A2F] mb-1">Major Care Focus Note</label>
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#5B825B] text-white text-xs font-black shadow-xs hover:bg-[#4d704d]"
                >
                  Save Changes
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
                <h3 className="text-lg font-black text-[#2D3A2F]">Edit Medical Details</h3>
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
                <label className="block font-black text-[#2D3A2F]">Primary Health & Cognitive Concerns</label>
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
                    placeholder="Add concern (e.g. Sleep irregularity)"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-[#E0DCD3] text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddConcern}
                    className="px-3 py-1.5 rounded-xl bg-[#EAF1E8] text-[#5B825B] font-black text-xs hover:bg-[#d4e6d0]"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Physician care guidance */}
              <div className="space-y-1">
                <label className="block font-black text-[#2D3A2F]">Physician Care Guidance & Notes</label>
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#5B825B] text-white text-xs font-black shadow-xs hover:bg-[#4d704d]"
                >
                  Save Medical Details
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
            <h3 className="text-lg font-black text-[#2D3A2F]">Log Doctor Consultation</h3>
            <form onSubmit={handleAddConsultation} className="space-y-3 text-xs">
              <div>
                <label className="block font-black text-[#2D3A2F] mb-1">Doctor Name</label>
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
                <label className="block font-black text-[#2D3A2F] mb-1">Specialty</label>
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
                <label className="block font-black text-[#2D3A2F] mb-1">Date</label>
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
                <label className="block font-black text-[#2D3A2F] mb-1">Consultation Summary / Notes</label>
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#5B825B] text-white text-xs font-black shadow-xs hover:bg-[#4d704d]"
                >
                  Save Visit
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
                  <h3 className="text-lg font-black text-[#2D3A2F]">Add Player Memory</h3>
                  <p className="text-[11px] text-[#5A6E5D]">Upload photos, videos, or memories for {patientProfile.name}</p>
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
                <ImageIcon className="w-3.5 h-3.5" /> Photo Memory
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
                <Video className="w-3.5 h-3.5" /> Video Story
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
                    {memoryUploadPreview ? 'File Selected! Tap to change' : 'Upload Photo or Video'}
                  </span>
                  <span className="text-[11px] text-[#5A6E5D]">
                    Supports JPG, PNG, MP4, WebM from your computer/phone
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
                  Or Paste {newMemoryMediaType === 'video' ? 'Video' : 'Photo'} URL
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
                <span className="text-[11px] font-bold text-[#5A6E5D] block">Quick Sample Media:</span>
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
                <label className="block font-black text-[#2D3A2F] mb-1">Memory Title</label>
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
                  <label className="block font-black text-[#2D3A2F] mb-1">People in this Memory</label>
                  <input
                    type="text"
                    value={newMemoryPerson}
                    onChange={(e) => setNewMemoryPerson(e.target.value)}
                    placeholder="e.g. Meera, Rohan"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                  />
                </div>
                <div>
                  <label className="block font-black text-[#2D3A2F] mb-1">Category</label>
                  <select
                    value={newMemoryCategory}
                    onChange={(e) => setNewMemoryCategory(e.target.value as MemoryCategory)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                  >
                    <option value="Family">Family</option>
                    <option value="People">People</option>
                    <option value="Places">Places</option>
                    <option value="Special Moments">Special Moments</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-black text-[#2D3A2F] mb-1">Story / Heartfelt Narration</label>
                <textarea
                  rows={3}
                  value={newMemoryDesc}
                  onChange={(e) => setNewMemoryDesc(e.target.value)}
                  placeholder="Write a loving story or description that can be read aloud to Anita in Player Mode..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E0DCD3] text-xs font-medium leading-relaxed focus:border-[#5B825B]"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemoryModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-xs font-extrabold text-[#5A6E5D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#5B825B] text-white text-xs font-black shadow-xs hover:bg-[#4d704d]"
                >
                  Save to Player Memories
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
            <h3 className="text-xl font-black text-[#2D3A2F]">Add Calendar Event</h3>
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">Title</label>
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
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">Time</label>
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
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">Type</label>
                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-sm focus:outline-hidden focus:border-[#5B825B]"
                >
                  <option value="doctor">Doctor Consultation</option>
                  <option value="routine">Routine</option>
                  <option value="family">Family Visit</option>
                  <option value="appointment">Appointment</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-xs font-extrabold text-[#5A6E5D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#5B825B] text-white text-xs font-extrabold shadow-xs hover:bg-[#4d704d]"
                >
                  Save Event
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
            <h3 className="text-xl font-black text-[#2D3A2F]">Add Daily Reminder</h3>
            <form onSubmit={handleCreateReminder} className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">Title</label>
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
                  <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">Time</label>
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
                  <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">Type</label>
                  <select
                    value={newReminderType}
                    onChange={(e) => setNewReminderType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-sm focus:outline-hidden focus:border-[#5B825B]"
                  >
                    <option value="medicine">Medicine</option>
                    <option value="routine">Routine</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">Notes / Guidance</label>
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#5B825B] text-white text-xs font-extrabold shadow-xs hover:bg-[#4d704d]"
                >
                  Save Reminder
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
