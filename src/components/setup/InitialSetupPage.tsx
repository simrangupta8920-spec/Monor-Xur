import React, { useState } from 'react';
import { 
  Heart, User, ShieldCheck, Stethoscope, Sparkles, ArrowRight, ArrowLeft, 
  Check, Lock, Phone, Plus, Trash2, KeyRound, AlertCircle, RefreshCw, Upload, Image as ImageIcon,
  Video, Film, X, Eye
} from 'lucide-react';
import { PatientProfile, MedicalProfile, CaregiverAccount, AshaAccount, EmergencyContact, Memory, MemoryCategory } from '../../types';
import { SAMPLE_MEDIA_PRESETS } from '../../data/mockData';
import { VoiceReminiscenceRecorder, VoiceReminiscenceData } from '../common/VoiceReminiscenceRecorder';
import { createHarmonicVoiceSnippet } from '../../utils/audioSnippetGenerator';
import { soundController } from '../../utils/audio';
import { useLanguage } from '../../context/LanguageContext';
import avatarKoka from '../../assets/images/avatar_assam_koka_1789331373618.jpg';
import avatarAita from '../../assets/images/avatar_assam_aita_1789331388057.jpg';
import avatarBoanicar from '../../assets/images/avatar_assam_boanicar_1789331402341.jpg';
import caregiverDaughter from '../../assets/images/caregiver_assam_daughter_1789334295494.jpg';
import caregiverSon from '../../assets/images/caregiver_assam_son_1789334311319.jpg';
import caregiverRelative from '../../assets/images/caregiver_assam_relative_1789334327164.jpg';
import caregiverGrandson from '../../assets/images/caregiver_assam_grandson_1789334340256.jpg';
import type { User as FirebaseUser } from 'firebase/auth';

interface InitialSetupPageProps {
  initialPatient?: PatientProfile;
  initialMedical?: MedicalProfile;
  initialMemories?: Memory[];
  onComplete: (data: {
    patient: PatientProfile;
    medical: MedicalProfile;
    caregiver: CaregiverAccount;
    asha?: AshaAccount;
    emergencyContact: EmergencyContact;
    initialMemories?: Memory[];
  }) => void;
  onCancel?: () => void;
  isEditing?: boolean;
  currentUser?: FirebaseUser | null;
  onSignInGoogle?: () => Promise<void>;
  onSignOutGoogle?: () => Promise<void>;
}

export const ELDER_AVATARS = [
  {
    id: 'assam-koka',
    label: 'Koka (ককা)',
    subtitle: 'Assam Grandfather • Gamusa',
    url: avatarKoka,
  },
  {
    id: 'assam-aita',
    label: 'Aita (আইতা)',
    subtitle: 'Assam Grandmother • Chador',
    url: avatarAita,
  },
  {
    id: 'assam-boanicar',
    label: 'Boanicar (বোৱনী)',
    subtitle: 'Assam Weaver & Elder',
    url: avatarBoanicar,
  },
];

export const CAREGIVER_AVATARS = [
  {
    id: 'cg-assam-daughter',
    label: 'Priyadarshini (জীয়াৰী)',
    subtitle: 'Assam Daughter & Caregiver',
    url: caregiverDaughter,
  },
  {
    id: 'cg-assam-son',
    label: 'Nilav (ল’ৰা)',
    subtitle: 'Assam Son with Gamusa',
    url: caregiverSon,
  },
  {
    id: 'cg-assam-relative',
    label: 'Ananya (ভতিজী / জীউ)',
    subtitle: 'Assam Youth Relative',
    url: caregiverRelative,
  },
  {
    id: 'cg-assam-grandson',
    label: 'Manas (নাতি)',
    subtitle: 'Assam Youth Grandson',
    url: caregiverGrandson,
  },
];

export const InitialSetupPage: React.FC<InitialSetupPageProps> = ({
  initialPatient,
  initialMedical,
  initialMemories,
  onComplete,
  onCancel,
  isEditing = false,
  currentUser,
  onSignInGoogle,
  onSignOutGoogle,
}) => {
  const { tx } = useLanguage();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // STEP 1: Player / Patient Details
  const [name, setName] = useState(initialPatient?.name || '');
  const [fullName, setFullName] = useState(initialPatient?.fullName || initialPatient?.name || '');
  const [age, setAge] = useState<number>(initialPatient?.age && initialPatient.age > 0 ? initialPatient.age : 72);
  const [gender, setGender] = useState(initialPatient?.gender || 'Female');
  const [region, setRegion] = useState(initialPatient?.region || 'Guwahati, Assam');
  const [language, setLanguage] = useState(initialPatient?.language || 'Assamese & English');
  const [bloodGroup, setBloodGroup] = useState(initialPatient?.bloodGroup || 'B+');
  const [about, setAbout] = useState(
    initialPatient?.about || 'Loves morning tea, Rabindra Sangeet, watering the garden, and spending quiet evenings with family.'
  );
  const [majorCareIssue, setMajorCareIssue] = useState(
    initialPatient?.majorCareIssue || 'Mild Cognitive Memory Difficulty & Routine Orientation'
  );
  const [avatar, setAvatar] = useState(
    initialPatient?.avatar || ELDER_AVATARS[0].url
  );

  // STEP 2: Medical Profile
  const [stage, setStage] = useState(initialMedical?.stage || 'Mild Cognitive Impairment');
  const [careInfo, setCareInfo] = useState(
    initialMedical?.careInfo || 'Encourage gentle memory exercises daily. Keep surroundings familiar, peaceful, and well lit.'
  );
  const [prescriptions, setPrescriptions] = useState<string[]>(
    initialMedical?.prescriptions && initialMedical.prescriptions.length > 0 
      ? initialMedical.prescriptions 
      : ['Donepezil 5mg (Night after meal)', 'Multivitamin & Omega-3 (Morning)']
  );
  const [newRx, setNewRx] = useState('');
  const [allergies, setAllergies] = useState<string[]>(
    initialMedical?.allergies && initialMedical.allergies.length > 0 
      ? initialMedical.allergies 
      : ['None reported']
  );
  const [newAllergy, setNewAllergy] = useState('');
  const [doctorName, setDoctorName] = useState(initialMedical?.doctorName || 'Dr. B. K. Barooah Clinic');
  const [doctorPhone, setDoctorPhone] = useState(initialMedical?.doctorPhone || '+91 94350 12345');
  const [medicalNotes, setMedicalNotes] = useState(
    initialMedical?.notes || 'Regular health monitoring. Routine blood pressure check once a week.'
  );

  // STEP 3: Caregiver Profile & PIN Setup
  const [caregiverName, setCaregiverName] = useState(
    initialPatient?.caregiver?.name || 'Priya Sharma'
  );
  const [relationship, setRelationship] = useState(
    initialPatient?.caregiver?.relationship || 'Daughter'
  );
  const [caregiverPhone, setCaregiverPhone] = useState(
    initialPatient?.caregiver?.phone || '+91 98765 43210'
  );
  const [caregiverPin, setCaregiverPin] = useState(
    initialPatient?.caregiver?.pin || '1234'
  );
  const [confirmPin, setConfirmPin] = useState(
    initialPatient?.caregiver?.pin || '1234'
  );
  const [caregiverAvatar, setCaregiverAvatar] = useState(
    initialPatient?.caregiver?.avatar || CAREGIVER_AVATARS[0].url
  );
  const [singleFocusMode, setSingleFocusMode] = useState<boolean>(() => {
    try {
      if (initialPatient?.singleFocusMode !== undefined) {
        return initialPatient.singleFocusMode;
      }
      return localStorage.getItem('monor_single_focus_mode') === 'true';
    } catch {
      return false;
    }
  });

  // STEP 4: ASHA Health Worker Setup
  const [ashaWorkerId, setAshaWorkerId] = useState(
    initialPatient?.asha?.workerId || 'ASHA-001'
  );
  const [ashaName, setAshaName] = useState(
    initialPatient?.asha?.name || 'Sunita Das'
  );
  const [ashaPhone, setAshaPhone] = useState(
    initialPatient?.asha?.phone || '+91 91234 56789'
  );
  const [ashaSubCentre, setAshaSubCentre] = useState(
    initialPatient?.asha?.subCentre || 'Kamrup Community Health Sub-Centre'
  );
  const [ashaPasscode, setAshaPasscode] = useState(
    initialPatient?.asha?.passcode || 'asha123'
  );

  // Security & DPDP Act 2023 Consent
  const [consentGiven, setConsentGiven] = useState<boolean>(
    initialPatient?.consentGiven ?? true
  );

  const [formError, setFormError] = useState<string | null>(null);
  const [playerDragOver, setPlayerDragOver] = useState(false);
  const [caregiverDragOver, setCaregiverDragOver] = useState(false);

  // STEP 3: OPTIONAL INITIAL MEMORIES
  const [initialMemoriesList, setInitialMemoriesList] = useState<Memory[]>(initialMemories || []);
  const [showAddMemoryModal, setShowAddMemoryModal] = useState(false);
  const [newMemoryMediaType, setNewMemoryMediaType] = useState<'photo' | 'video'>('photo');
  const [newMemoryTitle, setNewMemoryTitle] = useState('');
  const [newMemoryPerson, setNewMemoryPerson] = useState('');
  const [newMemoryCategory, setNewMemoryCategory] = useState<MemoryCategory>('Family');
  const [newMemoryDesc, setNewMemoryDesc] = useState('');
  const [newMemoryMediaUrl, setNewMemoryMediaUrl] = useState('');
  const [memoryUploadPreview, setMemoryUploadPreview] = useState<string | null>(null);
  const [newMemoryVoiceSnippet, setNewMemoryVoiceSnippet] = useState<VoiceReminiscenceData | null>(null);
  const [previewMemory, setPreviewMemory] = useState<Memory | null>(null);

  const handleMemoryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVid = file.type.startsWith('video');
      setNewMemoryMediaType(isVid ? 'video' : 'photo');
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
      id: 'm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: newMemoryTitle.trim(),
      person: newMemoryPerson.trim() || undefined,
      category: newMemoryCategory,
      mediaType: newMemoryMediaType,
      image: newMemoryMediaType === 'video'
        ? 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80'
        : mediaSrc,
      videoUrl: newMemoryMediaType === 'video' ? mediaSrc : undefined,
      description: newMemoryDesc.trim(),
      date: 'Added in Setup',
      voiceSnippet: newMemoryVoiceSnippet?.audioUrl,
      voiceSnippetDuration: newMemoryVoiceSnippet?.duration,
      voiceRecordedBy: newMemoryVoiceSnippet?.recordedBy,
      voicePromptText: newMemoryVoiceSnippet?.promptText,
    };

    setInitialMemoriesList((prev) => [newMem, ...prev]);
    setNewMemoryTitle('');
    setNewMemoryPerson('');
    setNewMemoryDesc('');
    setNewMemoryMediaUrl('');
    setMemoryUploadPreview(null);
    setNewMemoryVoiceSnippet(null);
    setShowAddMemoryModal(false);
    soundController.playSuccess();
  };

  const applyMemoryPreset = (preset: typeof SAMPLE_MEDIA_PRESETS[0]) => {
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
        recordedBy: preset.voiceRecordedBy || caregiverName || 'Family Caregiver',
        promptText: preset.voicePromptText,
      });
    } else {
      setNewMemoryVoiceSnippet(null);
    }
    soundController.playClick();
  };

  const handleQuickAddPreset = (preset: typeof SAMPLE_MEDIA_PRESETS[0]) => {
    const newMem: Memory = {
      id: 'm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: preset.title,
      person: preset.person || undefined,
      category: preset.category,
      mediaType: preset.type,
      image: preset.type === 'video'
        ? 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80'
        : preset.url,
      videoUrl: preset.type === 'video' ? preset.url : undefined,
      description: preset.desc,
      date: 'Added in Setup',
      voiceSnippet: preset.voicePromptText ? createHarmonicVoiceSnippet(preset.voiceDuration || 14) : undefined,
      voiceSnippetDuration: preset.voiceDuration,
      voiceRecordedBy: preset.voiceRecordedBy || caregiverName || 'Family Caregiver',
      voicePromptText: preset.voicePromptText,
    };
    setInitialMemoriesList((prev) => [newMem, ...prev]);
    soundController.playSuccess();
  };

  const handleRemoveMemory = (id: string) => {
    setInitialMemoriesList((prev) => prev.filter((m) => m.id !== id));
    soundController.playClick();
  };

  const processImageFile = (file: File, callback: (dataUrl: string) => void) => {
    if (!file.type.startsWith('image/')) {
      alert(tx('Please select an image file (JPG, PNG, WEBP).', 'कृपया एक छवि फ़ाइल (JPG, PNG, WEBP) चुनें।', 'অনুগ্ৰহ কৰি এখন ফটো ফাইল (JPG, PNG, WEBP) বাছক।'));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert(tx('Image size must be under 10MB.', 'छवि का आकार 10MB से कम होना चाहिए।', 'ছবিৰ আকাৰ ১০MB তকৈ কম হ’ব লাগে।'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        callback(e.target.result);
        soundController.playClick();
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Prescription item
  const handleAddRx = () => {
    if (newRx.trim()) {
      setPrescriptions([...prescriptions, newRx.trim()]);
      setNewRx('');
    }
  };

  const handleRemoveRx = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  // Add Allergy item
  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  // Step 1 Validation
  const validateStep1 = () => {
    if (!name.trim()) {
      setFormError(tx('Please enter the player\'s familiar calling name.', 'कृपया खिलाड़ी का घरेलू/बोलने वाला नाम दर्ज करें।'));
      return false;
    }
    setFormError(null);
    return true;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    if (!caregiverName.trim()) {
      setFormError(tx('Please enter the caregiver\'s name.', 'कृपया देखभालकर्ता का नाम दर्ज करें।'));
      return false;
    }
    if (!caregiverPin || caregiverPin.length !== 4 || !/^\d{4}$/.test(caregiverPin)) {
      setFormError(tx('Please create a 4-digit numeric security PIN for caregiver access.', 'कृपया देखभालकर्ता के लिए 4-अंकों का सुरक्षा पिन बनाएं।'));
      return false;
    }
    if (caregiverPin !== confirmPin) {
      setFormError(tx('The confirmed PIN does not match. Please re-enter.', 'पुष्टि किया गया पिन मेल नहीं खाता। कृपया पुनः दर्ज करें।'));
      return false;
    }
    setFormError(null);
    return true;
  };

  // Save All
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) {
      setStep(1);
      return;
    }
    if (!validateStep3()) {
      setStep(3);
      return;
    }

    if (!consentGiven) {
      setFormError(tx('Digital Personal Data Protection (DPDP) Act 2023 consent is required to coordinate care and telemetry.', 'देखभाल और टेलीमेट्री के समन्वय के लिए DPDP अधिनियम 2023 की सहमति आवश्यक है।'));
      setStep(4);
      return;
    }

    soundController.playSuccess();

    const caregiverAccount: CaregiverAccount = {
      name: caregiverName.trim(),
      relationship: relationship.trim(),
      phone: caregiverPhone.trim(),
      pin: caregiverPin.trim(),
      isPrimary: true,
      avatar: caregiverAvatar,
    };

    try {
      localStorage.setItem('monor_single_focus_mode', String(singleFocusMode));
    } catch {
      // ignore
    }

    const ashaAccount: AshaAccount = {
      workerId: ashaWorkerId.trim().toUpperCase(),
      name: ashaName.trim(),
      phone: ashaPhone.trim(),
      subCentre: ashaSubCentre.trim(),
      passcode: ashaPasscode.trim(),
    };

    const patientData: PatientProfile = {
      name: name.trim(),
      fullName: fullName.trim() || name.trim(),
      age: Number(age) || 70,
      gender,
      region: region.trim(),
      language: language.trim(),
      bloodGroup: bloodGroup.trim(),
      about: about.trim(),
      majorCareIssue: majorCareIssue.trim(),
      avatar,
      caregiver: caregiverAccount,
      asha: ashaAccount,
      isConfigured: true,
      consentGiven: true,
      consentDate: initialPatient?.consentDate || new Date().toISOString(),
      singleFocusMode,
    };

    const medicalData: MedicalProfile = {
      concerns: [majorCareIssue.trim()],
      consultations: initialMedical?.consultations || [],
      careInfo: careInfo.trim(),
      stage,
      prescriptions,
      allergies,
      doctorName: doctorName.trim(),
      doctorPhone: doctorPhone.trim(),
      notes: medicalNotes.trim(),
      lastVisit: new Date().toISOString().split('T')[0],
    };

    const emergencyContact: EmergencyContact = {
      id: 'primary-caregiver-contact',
      name: caregiverName.trim(),
      relationship: relationship.trim(),
      phone: caregiverPhone.trim(),
    };

    onComplete({
      patient: patientData,
      medical: medicalData,
      caregiver: caregiverAccount,
      asha: ashaAccount,
      emergencyContact,
      initialMemories: initialMemoriesList,
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D3A2F] p-4 pb-20 max-w-lg mx-auto animate-fadeIn">
      {/* Top Welcome Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs mb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl overflow-hidden border-2 border-[#5B825B]/40 bg-[#FDFBF7] p-0.5 shrink-0 shadow-xs">
            <img 
              src="/logo.jpg" 
              alt="Monor Xur" 
              className="w-full h-full object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-[#EAF1E8] text-[#5B825B] text-[10px] font-black uppercase tracking-wider">
                {isEditing ? tx('Profile Settings', 'प्रोफ़ाइल सेटिंग्स') : tx('Initial Setup', 'प्रारंभिक सेटअप')}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#E8B25C]" />
            </div>
            <h1 className="text-xl font-black text-[#2D3A2F] mt-0.5 leading-tight">
              {isEditing ? tx('Configure Profiles', 'प्रोफ़ाइल कॉन्फ़िगर करें') : tx('Welcome to Monor Xur', 'मनोर सुर में आपका स्वागत है')}
            </h1>
            <p className="text-xs text-[#5A6E5D]">
              {isEditing 
                ? tx('Update patient, caregiver PIN, and ASHA credentials', 'रोगी, देखभालकर्ता पिन और आशा विवरण अपडेट करें') 
                : tx('Set up player details & caregiver security PIN to begin', 'शुरू करने के लिए खिलाड़ी का विवरण और देखभालकर्ता पिन सेट करें')}
            </p>
          </div>
        </div>

        {/* Step Progress Pills */}
        <div className="grid grid-cols-4 gap-1.5 mt-4 pt-4 border-t border-[#F0ECE4]">
          <button
            type="button"
            onClick={() => { soundController.playClick(); setStep(1); }}
            className={`py-2 px-1 rounded-xl text-center transition-all ${
              step === 1
                ? 'bg-[#5B825B] text-white font-black shadow-xs'
                : 'bg-[#F4F1EA] text-[#5A6E5D] font-bold hover:bg-[#EAE5DC]'
            }`}
          >
            <span className="text-[10px] block opacity-80">1</span>
            <span className="text-[11px] truncate block">{tx('Player', 'खिलाड़ी')}</span>
          </button>
          <button
            type="button"
            onClick={() => { soundController.playClick(); setStep(2); }}
            className={`py-2 px-1 rounded-xl text-center transition-all ${
              step === 2
                ? 'bg-[#5B825B] text-white font-black shadow-xs'
                : 'bg-[#F4F1EA] text-[#5A6E5D] font-bold hover:bg-[#EAE5DC]'
            }`}
          >
            <span className="text-[10px] block opacity-80">2</span>
            <span className="text-[11px] truncate block">{tx('Medical', 'चिकित्सा')}</span>
          </button>
          <button
            type="button"
            onClick={() => { soundController.playClick(); setStep(3); }}
            className={`py-2 px-1 rounded-xl text-center transition-all ${
              step === 3
                ? 'bg-[#5B825B] text-white font-black shadow-xs'
                : 'bg-[#F4F1EA] text-[#5A6E5D] font-bold hover:bg-[#EAE5DC]'
            }`}
          >
            <span className="text-[10px] block opacity-80">3</span>
            <span className="text-[11px] truncate block">{tx('Caregiver', 'देखभालकर्ता')}</span>
          </button>
          <button
            type="button"
            onClick={() => { soundController.playClick(); setStep(4); }}
            className={`py-2 px-1 rounded-xl text-center transition-all ${
              step === 4
                ? 'bg-[#5B825B] text-white font-black shadow-xs'
                : 'bg-[#F4F1EA] text-[#5A6E5D] font-bold hover:bg-[#EAE5DC]'
            }`}
          >
            <span className="text-[10px] block opacity-80">4</span>
            <span className="text-[11px] truncate block">{tx('ASHA', 'आशा')}</span>
          </button>
        </div>
      </div>

      {formError && (
        <div className="bg-[#FCF2F0] border border-[#F2CAC4] text-[#B83E26] p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 mb-4 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Main Form Content */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ================= STEP 1: PLAYER / PATIENT DETAILS ================= */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EAF1E8] text-[#5B825B] flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-black text-[#2D3A2F]">{tx('Player Profile (Patient)', 'खिलाड़ी प्रोफ़ाइल (रोगी)')}</h2>
                  <p className="text-[11px] text-[#5A6E5D]">{tx('Information for the loved one using the app', 'ऐप का उपयोग करने वाले प्रियजन की जानकारी')}</p>
                </div>
              </div>
              <span className="text-xs font-black text-[#5B825B] bg-[#EAF1E8] px-2.5 py-1 rounded-full">
                {tx('Step 1 of 4', 'चरण 1 / 4')}
              </span>
            </div>

            {/* Avatar Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-[#2D3A2F]">
                  {tx('Choose Player Avatar / Photo', 'खिलाड़ी का अवतार / फोटो चुनें', 'খেলুৱৈৰ অৱতাৰ / ফটো বাছক')}
                </label>
                <span className="text-[10px] font-bold text-[#5B825B] bg-[#EAF1E8] px-2 py-0.5 rounded-full">
                  {tx('Assam Heritage Avatars', 'असम सांस्कृतिक अवतार', 'অসমীয়া ঐতিহ্য অৱতাৰ')}
                </span>
              </div>

              {/* Preset Assam Elder Avatars */}
              <div className="grid grid-cols-3 gap-3">
                {ELDER_AVATARS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { soundController.playClick(); setAvatar(item.url); }}
                    className={`relative rounded-2xl overflow-hidden border-2 p-1.5 transition-all text-left flex flex-col ${
                      avatar === item.url
                        ? 'border-[#5B825B] bg-[#EAF1E8] shadow-sm ring-2 ring-[#5B825B]/20 scale-[1.02]'
                        : 'border-[#E0DCD3] bg-[#FDFBF7] opacity-85 hover:opacity-100 hover:border-[#5B825B]/40'
                    }`}
                  >
                    <div className="w-full aspect-square rounded-xl overflow-hidden mb-1.5 bg-[#EAE5DC]">
                      <img 
                        src={item.url} 
                        alt={item.label}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="block text-[11px] font-black leading-tight text-[#2D3A2F]">
                      {item.label}
                    </span>
                    <span className="block text-[9px] font-semibold text-[#5A6E5D] leading-tight mt-0.5">
                      {item.subtitle}
                    </span>
                    {avatar === item.url && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-[#5B825B] text-white rounded-full flex items-center justify-center shadow-md">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Upload Own Photo Card / Drag & Drop */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setPlayerDragOver(true); }}
                onDragLeave={() => setPlayerDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setPlayerDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) processImageFile(file, setAvatar);
                }}
                className={`p-3 rounded-2xl border-2 transition-all ${
                  playerDragOver 
                    ? 'border-[#5B825B] bg-[#EAF1E8]/70 border-dashed' 
                    : !ELDER_AVATARS.some(a => a.url === avatar) && avatar
                      ? 'border-[#5B825B] bg-[#F4F8F3]'
                      : 'border-[#E0DCD3] bg-[#FAF8F5] border-dashed hover:border-[#5B825B]/60'
                }`}
              >
                {!ELDER_AVATARS.some(a => a.url === avatar) && avatar ? (
                  <div className="flex items-center gap-3">
                    <img 
                      src={avatar} 
                      alt="Custom Player" 
                      className="w-14 h-14 rounded-xl object-cover border-2 border-[#5B825B] shadow-xs shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase text-[#5B825B] bg-[#EAF1E8] px-2 py-0.5 rounded-full">
                          {tx('Custom Photo Active', 'कस्टम फोटो सक्रिय', 'আপলোড কৰা ফটো')}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5A6E5D] truncate mt-0.5">{tx('Uploaded player photo selected', 'अपलोड की गई तस्वीर चुनी गई', 'আপলোড কৰা খেলুৱৈৰ ফটো বাছনি কৰা হ’ল')}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <label className="text-[10px] font-bold text-[#5B825B] hover:underline cursor-pointer flex items-center gap-1">
                          <Upload className="w-3 h-3" /> {tx('Replace File', 'फ़ाइल बदलें', 'ফাইল সলনি কৰক')}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) processImageFile(f, setAvatar);
                            }}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[#A09D96] text-[10px]">•</span>
                        <button
                          type="button"
                          onClick={() => setAvatar(ELDER_AVATARS[0].url)}
                          className="text-[10px] font-bold text-[#C25E5E] hover:underline"
                        >
                          {tx('Reset to Preset', 'प्रीसेट पर रीसेट करें', 'পূৰ্বনিৰ্ধাৰিতলৈ উভতি যাওক')}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white border border-[#E0DCD3] text-[#5B825B] flex items-center justify-center shrink-0 shadow-2xs">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-[#2D3A2F]">
                          {tx('Upload Player\'s Real Photo', 'बुजुर्ग की असली फोटो अपलोड करें', 'খেলুৱৈৰ নিজা ফটো আপলোড কৰক')}
                        </span>
                        <span className="block text-[10px] text-[#5A6E5D]">
                          {tx('Drag & drop photo here or click to browse (PNG, JPG)', 'यहाँ फोटो खींचें या ब्राउज़ करने के लिए क्लिक करें', 'ফটোখন ইয়ালৈ টানি আনক বা ব্ৰাউজ কৰিবলৈ ক্লিক কৰক')}
                        </span>
                      </div>
                    </div>
                    <label className="px-3.5 py-1.5 rounded-xl bg-white border border-[#5B825B] text-[#5B825B] font-bold text-xs hover:bg-[#EAF1E8] transition-colors cursor-pointer shrink-0 shadow-2xs flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{tx('Choose File', 'फ़ाइल चुनें', 'ফাইল বাছক')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) processImageFile(f, setAvatar);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Optional custom URL input */}
              <div>
                <input
                  type="url"
                  value={avatar.startsWith('data:') ? '' : avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder={tx('Or paste photo URL if hosted online...', 'या ऑनलाइन फोटो URL पेस्ट करें...', 'বা অনলাইন ফটো URL পেষ্ট কৰক...')}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E0DCD3] bg-[#FAF8F5] focus:outline-hidden focus:border-[#5B825B]"
                />
              </div>
            </div>

            {/* Names */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                  {tx('Calling Name *', 'बुलाने का नाम *')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anita / Maa"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-sm font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
                />
                <span className="text-[10px] text-[#5A6E5D]">{tx('Used in voice prompts', 'आवाज संकेतों में प्रयुक्त')}</span>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                  {tx('Full Legal Name', 'पूरा कानूनी नाम')}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Anita Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-sm font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
                />
                <span className="text-[10px] text-[#5A6E5D]">{tx('For medical records', 'चिकित्सा रिकॉर्ड के लिए')}</span>
              </div>
            </div>

            {/* Age, Gender, Blood Group */}
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                  {tx('Age', 'उम्र')}
                </label>
                <input
                  type="number"
                  min={40}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E0DCD3] text-sm font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                  {tx('Gender', 'लिंग')}
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B] bg-white"
                >
                  <option value="Female">{tx('Female', 'महिला')}</option>
                  <option value="Male">{tx('Male', 'पुरुष')}</option>
                  <option value="Other">{tx('Other', 'अन्य')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                  {tx('Blood Group', 'रक्त समूह')}
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B] bg-white"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            {/* Region & Language */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                  {tx('Region / City', 'क्षेत्र / शहर')}
                </label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g. Guwahati, Assam"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                  {tx('Language Spoken', 'बोली जाने वाली भाषा')}
                </label>
                <input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="e.g. Hindi & English"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
                />
              </div>
            </div>

            {/* Primary Care Concern */}
            <div>
              <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                {tx('Primary Memory / Care Focus', 'प्राथमिक स्मृति / देखभाल ध्यान')}
              </label>
              <input
                type="text"
                value={majorCareIssue}
                onChange={(e) => setMajorCareIssue(e.target.value)}
                placeholder={tx('e.g. Mild Memory Difficulties & Routine Navigation', 'उदा. हल्की स्मृति कठिनाई और दैनिक दिनचर्या')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
              />
            </div>

            {/* About / Interests */}
            <div>
              <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                {tx('Personal Interests & What Brings Comfort', 'व्यक्तिगत रुचियां और क्या सुकून देता है')}
              </label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows={2}
                placeholder={tx('e.g. Enjoys old classical songs, watering plants, spending quiet time...', 'उदा. पुराने गीत सुनना, पौधों को पानी देना, परिवार के साथ समय बिताना...')}
                className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-[#E0DCD3] text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
              />
            </div>

            {/* Next Button */}
            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) {
                    soundController.playClick();
                    setStep(2);
                  }
                }}
                className="px-5 py-3 rounded-2xl bg-[#5B825B] text-white font-extrabold text-xs flex items-center gap-2 hover:bg-[#4a6b4a] shadow-xs active:scale-95 transition-all"
              >
                <span>{tx('Continue to Medical Info', 'चिकित्सा जानकारी पर जाएं')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: MEDICAL PROFILE ================= */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FDF0D5] text-[#A66E14] flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-black text-[#2D3A2F]">{tx('Medical & Health Profile', 'चिकित्सा एवं स्वास्थ्य प्रोफ़ाइल')}</h2>
                  <p className="text-[11px] text-[#5A6E5D]">{tx('Medications, allergies, and clinician guidance', 'दवाएं, एलर्जी और डॉक्टर मार्गदर्शन')}</p>
                </div>
              </div>
              <span className="text-xs font-black text-[#5B825B] bg-[#EAF1E8] px-2.5 py-1 rounded-full">
                {tx('Step 2 of 4', 'चरण 2 / 4')}
              </span>
            </div>

            {/* Cognitive Care Stage */}
            <div>
              <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                {tx('Cognitive Care Category', 'संज्ञानात्मक देखभाल श्रेणी')}
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B] bg-white"
              >
                <option value="Mild Cognitive Impairment">{tx('Mild Cognitive Impairment (MCI)', 'हल्की संज्ञानात्मक हानि (MCI)')}</option>
                <option value="Early Stage Memory Difficulty">{tx('Early Stage Memory Difficulty', 'प्रारंभिक चरण स्मृति कठिनाई')}</option>
                <option value="Moderate Support Stage">{tx('Moderate Support Stage', 'मध्यम सहायता चरण')}</option>
                <option value="Healthy Ageing & Cognitive Wellness">{tx('Healthy Ageing & Cognitive Wellness', 'स्वस्थ वृद्धावस्था और संज्ञानात्मक कल्याण')}</option>
              </select>
            </div>

            {/* Prescriptions List Builder */}
            <div>
              <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                {tx('Daily Prescriptions & Medicines', 'दैनिक नुस्खे और दवाएं')}
              </label>
              <div className="space-y-2 mb-2">
                {prescriptions.map((rx, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F6F0] border border-[#ECE8DE] text-xs font-bold text-[#2D3A2F]"
                  >
                    <span>💊 {rx}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRx(idx)}
                      className="p-1 text-[#C46A66] hover:bg-[#FCF2F0] rounded-lg transition-colors"
                      title={tx('Remove medicine', 'दवा हटाएं')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRx}
                  onChange={(e) => setNewRx(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddRx(); } }}
                  placeholder={tx('e.g. Donepezil 5mg (Night)', 'उदा. डोनेपेज़िल 5mg (रात)')}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#E0DCD3] focus:outline-hidden focus:border-[#5B825B]"
                />
                <button
                  type="button"
                  onClick={handleAddRx}
                  className="px-3.5 py-2 rounded-xl bg-[#EAF1E8] text-[#5B825B] font-extrabold text-xs flex items-center gap-1 hover:bg-[#d5ebd1]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{tx('Add', 'जोड़ें')}</span>
                </button>
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                {tx('Known Allergies', 'ज्ञात एलर्जी')}
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {allergies.map((allergy, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FCF2F0] text-[#B83E26] text-xs font-bold border border-[#F2CAC4]"
                  >
                    <span>{allergy}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAllergy(idx)}
                      className="hover:opacity-75"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAllergy(); } }}
                  placeholder={tx('e.g. Penicillin or Peanuts', 'उदा. पेनिसिलिन या मूंगफली')}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#E0DCD3] focus:outline-hidden focus:border-[#5B825B]"
                />
                <button
                  type="button"
                  onClick={handleAddAllergy}
                  className="px-3 py-2 rounded-xl bg-[#F4F1EA] text-[#2D3A2F] font-bold text-xs hover:bg-[#EAE5DC]"
                >
                  {tx('Add Allergy', 'एलर्जी जोड़ें')}
                </button>
              </div>
            </div>

            {/* Doctor & Clinic Contact */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                  {tx('Primary Doctor / Clinic', 'प्राथमिक डॉक्टर / क्लिनिक')}
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. B. K. Barooah Clinic"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                  {tx('Doctor / Clinic Phone', 'डॉक्टर / क्लिनिक फोन')}
                </label>
                <input
                  type="text"
                  value={doctorPhone}
                  onChange={(e) => setDoctorPhone(e.target.value)}
                  placeholder="e.g. +91 94350 12345"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                {tx('Clinical Care Guidance', 'नैदानिक देखभाल मार्गदर्शन')}
              </label>
              <textarea
                value={careInfo}
                onChange={(e) => setCareInfo(e.target.value)}
                rows={2}
                placeholder={tx('Guidance for daily routine, rest, and cognitive engagement...', 'दैनिक दिनचर्या, विश्राम और संज्ञानात्मक जुड़ाव के लिए मार्गदर्शन...')}
                className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-[#E0DCD3] text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
              />
            </div>

            {/* Navigation Buttons */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => { soundController.playClick(); setStep(1); }}
                className="px-4 py-2.5 rounded-2xl bg-[#F4F1EA] text-[#2D3A2F] font-extrabold text-xs flex items-center gap-1.5 hover:bg-[#EAE5DC]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{tx('Back', 'पीछे')}</span>
              </button>
              <button
                type="button"
                onClick={() => { soundController.playClick(); setStep(3); }}
                className="px-5 py-3 rounded-2xl bg-[#5B825B] text-white font-extrabold text-xs flex items-center gap-2 hover:bg-[#4a6b4a] shadow-xs active:scale-95 transition-all"
              >
                <span>{tx('Continue to Caregiver PIN', 'देखभालकर्ता पिन पर जाएं')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: FAMILY CAREGIVER PROFILE & PIN ================= */}
        {step === 3 && (
          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EAF1E8] text-[#5B825B] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-black text-[#2D3A2F]">{tx('Caregiver Profile & PIN', 'देखभालकर्ता प्रोफ़ाइल एवं पिन')}</h2>
                  <p className="text-[11px] text-[#5A6E5D]">{tx('Secure portal access and one-touch emergency phone', 'सुरक्षित पोर्टल पहुंच और आपातकालीन फोन')}</p>
                </div>
              </div>
              <span className="text-xs font-black text-[#5B825B] bg-[#EAF1E8] px-2.5 py-1 rounded-full">
                {tx('Step 3 of 4', 'चरण 3 / 4')}
              </span>
            </div>

            {/* Google Cloud Backup & Sync Connection */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ECE8DE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white border border-[#E0DCD3] flex items-center justify-center shrink-0 shadow-2xs text-[#5B825B]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#2D3A2F]">
                      {currentUser ? tx('Google Account Connected', 'गूगल खाता जुड़ा हुआ है', 'গুগল একাউণ্ট সংযোজিত') : tx('Google Cloud Backup & Sync', 'गूगल क्लाउड बैकअप एवं सिंक', 'গুগল ক্লাউড বেকআপ')}
                    </span>
                    {currentUser && (
                      <span className="text-[10px] font-bold text-[#5B825B] bg-[#EAF1E8] px-2 py-0.5 rounded-full">
                        {tx('Online', 'सक्रिय', 'অনলাইন')}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#5A6E5D]">
                    {currentUser 
                      ? currentUser.email 
                      : tx('Sign in with Google to enable multi-device sync and cloud backup', 'मल्टी-डिवाइस सिंक सक्षम करने के लिए गूगल से साइन इन करें', 'অনলাইন বেকআপৰ বাবে গুগল একাউণ্ট ব্যৱহাৰ কৰক')}
                  </p>
                </div>
              </div>
              {currentUser ? (
                <button
                  type="button"
                  onClick={onSignOutGoogle}
                  className="px-3 py-1.5 rounded-xl border border-[#E0DCD3] bg-white text-xs font-bold text-[#C25E5E] hover:bg-[#FDF6F6] transition-colors shrink-0"
                >
                  {tx('Sign Out', 'साइन आउट')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    if (onSignInGoogle) {
                      await onSignInGoogle();
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#5B825B] text-xs font-bold text-[#5B825B] hover:bg-[#F4F8F3] transition-colors shrink-0 flex items-center gap-1.5 shadow-2xs"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  {tx('Sign in with Google', 'गूगल से साइन इन करें', 'গুগলৰ সৈতে ছাইন ইন কৰক')}
                </button>
              )}
            </div>

            {/* Caregiver Name & Relationship */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                  {tx('Caregiver Name *', 'देखभालकर्ता का नाम *')}
                </label>
                <input
                  type="text"
                  value={caregiverName}
                  onChange={(e) => setCaregiverName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-sm font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                  {tx('Relationship to Player', 'खिलाड़ी से संबंध')}
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B] bg-white"
                >
                  <option value="Daughter">{tx('Daughter', 'बेटी')}</option>
                  <option value="Son">{tx('Son', 'बेटा')}</option>
                  <option value="Spouse">{tx('Spouse', 'पति/पत्नी')}</option>
                  <option value="Grandchild">{tx('Grandchild', 'पोता/पोती/नाती/नातिन')}</option>
                  <option value="Sister/Brother">{tx('Sister / Brother', 'बहन / भाई')}</option>
                  <option value="Primary Caregiver">{tx('Primary Caregiver', 'प्राथमिक देखभालकर्ता')}</option>
                </select>
              </div>
            </div>

            {/* Phone Number (Used for One-Touch Emergency Call) */}
            <div>
              <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                {tx('Emergency & Family Phone Number *', 'आपातकालीन एवं परिवार फोन नंबर *')}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={caregiverPhone}
                  onChange={(e) => setCaregiverPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-sm font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
                />
                <Phone className="w-4 h-4 text-[#5B825B] absolute left-3.5 top-3" />
              </div>
              <span className="text-[10px] text-[#5A6E5D] mt-1 block">
                {tx('⭐ This number will be called when the player taps the green emergency family call button.', '⭐ जब खिलाड़ी हरे रंग के आपातकालीन कॉल बटन पर टैप करेगा तब इस नंबर पर कॉल जाएगा।')}
              </span>
            </div>

            {/* ITEM E: Caregiver Face Portrait & Photo Picker */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE8DE] space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#5B825B]">
                  <Heart className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    {tx('Caregiver Photo (Displayed on Senior Call Button)', 'देखभालकर्ता की तस्वीर (कॉल बटन पर दिखेगी)', 'যত্নকৰ্তাৰ ফটো (কল বুটামত দেখা যাব)')}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#5B825B] bg-[#EAF1E8] px-2 py-0.5 rounded-full">
                  {tx('Assam Youth Caregivers', 'असम युवा देखभालकर्ता', 'অসমীয়া যুৱ যত্নকৰ্তা')}
                </span>
              </div>
              <p className="text-[11px] text-[#5A6E5D] leading-relaxed">
                {tx('Choose a familiar, smiling portrait so your elder immediately recognizes who they are calling with zero confusion.', 'एक परिचित, मुस्कुराती हुई तस्वीर चुनें ताकि बुजुर्ग बिना किसी भ्रम के तुरंत पहचान सकें कि वे किसे कॉल कर रहे हैं।', 'এখন চিনাকি, হাঁহিমুখীয়া ছবি বাছক যাতে বৃদ্ধজনে কাক কল কৰিছে কোনো বিভ্ৰান্তি নোহোৱাকৈ চিনি পায়।')}
              </p>

              {/* 4 Assam Youth Caregiver Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {CAREGIVER_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => { soundController.playClick(); setCaregiverAvatar(av.url); }}
                    className={`rounded-2xl overflow-hidden border-2 transition-all p-1.5 text-left flex flex-col relative group ${
                      caregiverAvatar === av.url
                        ? 'border-[#5B825B] bg-[#EAF1E8] shadow-sm ring-2 ring-[#5B825B]/30 scale-[1.02]'
                        : 'border-[#E0DCD3] bg-white hover:border-[#5B825B]/50'
                    }`}
                  >
                    <div className="w-full aspect-square rounded-xl overflow-hidden mb-1 bg-[#EAE5DC]">
                      <img 
                        src={av.url} 
                        alt={av.label} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="block text-[11px] font-extrabold text-[#2D3A2F] truncate leading-tight">
                      {av.label}
                    </span>
                    <span className="block text-[9px] font-medium text-[#5A6E5D] truncate leading-tight mt-0.5">
                      {av.subtitle}
                    </span>
                    {caregiverAvatar === av.url && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#5B825B] text-white flex items-center justify-center shadow-md">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Upload Caregiver's Own Photo Card */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setCaregiverDragOver(true); }}
                onDragLeave={() => setCaregiverDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setCaregiverDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) processImageFile(file, setCaregiverAvatar);
                }}
                className={`p-3 rounded-2xl border-2 transition-all ${
                  caregiverDragOver 
                    ? 'border-[#5B825B] bg-[#EAF1E8]/70 border-dashed' 
                    : !CAREGIVER_AVATARS.some(a => a.url === caregiverAvatar) && caregiverAvatar
                      ? 'border-[#5B825B] bg-[#F4F8F3]'
                      : 'border-[#E0DCD3] bg-white border-dashed hover:border-[#5B825B]/60'
                }`}
              >
                {!CAREGIVER_AVATARS.some(a => a.url === caregiverAvatar) && caregiverAvatar ? (
                  <div className="flex items-center gap-3">
                    <img 
                      src={caregiverAvatar} 
                      alt="Custom Caregiver" 
                      className="w-14 h-14 rounded-xl object-cover border-2 border-[#5B825B] shadow-xs shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase text-[#5B825B] bg-[#EAF1E8] px-2 py-0.5 rounded-full">
                          {tx('Custom Caregiver Photo Active', 'कस्टम देखभालकर्ता फोटो सक्रिय', 'আপলোড কৰা যত্নকৰ্তাৰ ফটো')}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5A6E5D] truncate mt-0.5">{tx('Your real photo will appear on elder\'s screen', 'आपकी असली फोटो बुजुर्ग की स्क्रीन पर दिखेगी', 'আপোনাৰ নিজা ফটো খেলুৱৈৰ স্ক্ৰীনত দেখা যাব')}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <label className="text-[10px] font-bold text-[#5B825B] hover:underline cursor-pointer flex items-center gap-1">
                          <Upload className="w-3 h-3" /> {tx('Replace File', 'फ़ाइल बदलें', 'ফাইল সলনি কৰক')}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) processImageFile(f, setCaregiverAvatar);
                            }}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[#A09D96] text-[10px]">•</span>
                        <button
                          type="button"
                          onClick={() => setCaregiverAvatar(CAREGIVER_AVATARS[0].url)}
                          className="text-[10px] font-bold text-[#C25E5E] hover:underline"
                        >
                          {tx('Reset to Preset', 'प्रीसेट पर रीसेट करें', 'পূৰ্বনিৰ্ধাৰিতলৈ উভতি যাওক')}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#E0DCD3] text-[#5B825B] flex items-center justify-center shrink-0 shadow-2xs">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-[#2D3A2F]">
                          {tx('Upload Caregiver\'s Real Photo', 'अपनी असली तस्वीर अपलोड करें', 'যত্নকৰ্তাৰ নিজা ফটো আপলোড কৰক')}
                        </span>
                        <span className="block text-[10px] text-[#5A6E5D]">
                          {tx('Drag & drop your smiling photo or click to browse (PNG, JPG)', 'अपनी तस्वीर यहाँ खींचें या ब्राउज़ करने के लिए क्लिक करें', 'আপোনাৰ হাঁহিমুখীয়া ফটোখন ইয়ালৈ টানি আনক বা ব্ৰাউজ কৰক')}
                        </span>
                      </div>
                    </div>
                    <label className="px-3.5 py-1.5 rounded-xl bg-white border border-[#5B825B] text-[#5B825B] font-bold text-xs hover:bg-[#EAF1E8] transition-colors cursor-pointer shrink-0 shadow-2xs flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{tx('Choose File', 'फ़ाइल चुनें', 'ফাইল বাছক')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) processImageFile(f, setCaregiverAvatar);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* URL fallback */}
              <div>
                <input
                  type="url"
                  value={caregiverAvatar.startsWith('data:') ? '' : caregiverAvatar}
                  onChange={(e) => setCaregiverAvatar(e.target.value)}
                  placeholder={tx('Or enter custom photo URL...', 'या कस्टम फोटो यूआरएल दर्ज करें...', 'বা অনলাইন ফটো URL দিয়ক...')}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E0DCD3] bg-white focus:outline-hidden focus:border-[#5B825B]"
                />
              </div>
            </div>

            {/* ITEM B: Ultra-Simple Single-Focus Home Option Toggle */}
            <div className="p-4 rounded-2xl bg-[#EAF1E8]/50 border-2 border-[#5B825B]/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#5B825B]">
                  <Sparkles className="w-4 h-4 text-[#E8B25C]" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    {tx('Ultra-Simple (Single-Focus) Home View', 'अति-सरल (एकल-ध्यान) होम दृश्य')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSingleFocusMode(!singleFocusMode)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                    singleFocusMode ? 'bg-[#5B825B]' : 'bg-[#D1C9BC]'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      singleFocusMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] text-[#5A6E5D] leading-relaxed">
                {tx(
                  'Recommended for seniors with moderate dementia. Replaces the 4-tile grid with a single, high-contrast recommendation tailored to the time of day (Bhajan in morning, Memories in afternoon, Gentle Breathing in evening) to prevent choice paralysis.',
                  'मध्यम भूलने की बीमारी वाले वरिष्ठों के लिए अनुशंसित। दिन के समय के आधार पर केवल एक मुख्य गतिविधि दिखाता है (सुबह भजन, दोपहर में यादें, शाम को प्राणायाम) ताकि निर्णय लेने में कोई उलझन न हो।'
                )}
              </p>
            </div>

            {/* Custom 4-Digit PIN */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE8DE] space-y-3">
              <div className="flex items-center gap-2 text-[#5B825B]">
                <KeyRound className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-wider">{tx('Set Caregiver Security PIN', 'देखभालकर्ता सुरक्षा पिन सेट करें')}</span>
              </div>
              <p className="text-[11px] text-[#5A6E5D] leading-relaxed">
                {tx('Create a 4-digit PIN to prevent the player from accidentally altering medication schedules or caregiver settings.', 'दवा कार्यक्रम या सेटिंग्स में अनपेक्षित बदलाव रोकने के लिए 4 अंकों का पिन बनाएं।')}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D3A2F] mb-1">
                    {tx('4-Digit PIN *', '4-अंकों का पिन *')}
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={caregiverPin}
                    onChange={(e) => setCaregiverPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="e.g. 2468"
                    className="w-full px-3.5 py-2.5 text-center tracking-widest text-lg font-black rounded-xl border border-[#E0DCD3] bg-white focus:outline-hidden focus:border-[#5B825B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2D3A2F] mb-1">
                    {tx('Confirm PIN *', 'पिन की पुष्टि करें *')}
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="e.g. 2468"
                    className="w-full px-3.5 py-2.5 text-center tracking-widest text-lg font-black rounded-xl border border-[#E0DCD3] bg-white focus:outline-hidden focus:border-[#5B825B]"
                  />
                </div>
              </div>

              {caregiverPin && confirmPin && (
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  {caregiverPin === confirmPin ? (
                    <span className="text-[#3D663D] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {tx('PIN confirmed correctly', 'पिन सफलतापूर्वक पुष्ट हुआ')}
                    </span>
                  ) : (
                    <span className="text-[#B83E26]">{tx('PINs do not match', 'पिन मेल नहीं खा रहे हैं')}</span>
                  )}
                </div>
              )}
            </div>

            {/* ================= OPTIONAL INITIAL MEMORIES UPLOAD ================= */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE8DE] space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#5B825B]">
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    {tx('Initial Player Memories', 'प्रारंभिक यादें', 'প্ৰাৰম্ভিক স্মৃতি')}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#5B825B] bg-[#EAF1E8] px-2.5 py-0.5 rounded-full border border-[#5B825B]/20">
                  {tx('Optional', 'वैकल्पिक', 'ঐচ্ছিক')}
                </span>
              </div>

              <p className="text-[11px] text-[#5A6E5D] leading-relaxed">
                {tx(
                  'Upload family photos, home videos, or voice recordings so the elder has cherished memories ready to view right from day one. This is completely optional—if you skip, you can always upload memories anytime later from the Caregiver dashboard.',
                  'पारिवारिक तस्वीरें, घरेलू वीडियो या आवाज़ की रिकॉर्डिंग जोड़ें ताकि बुजुर्ग के पास पहले दिन से ही यादें देखने के लिए तैयार हों। यह पूरी तरह से वैकल्पिक है—यदि आप छोड़ते हैं, तो आप बाद में भी देखभालकर्ता डैशबोर्ड से यादें जोड़ सकते हैं।',
                  'পৰিয়ালৰ ফটো, ঘৰুৱা ভিডিঅ’ বা মাতৰ ৰেকৰ্ডিং যোগ কৰক যাতে প্ৰথম দিনৰ পৰাই জেষ্ঠ্যজনে স্মৃতি চাব পাৰে। এইটো সম্পূৰ্ণৰূপে ঐচ্ছিক—আপুনি এতিয়া এৰি পাছতো যত্নকৰ্তাৰ পৰা স্মৃতি যোগ কৰিব পাৰিব।'
                )}
              </p>

              {/* Action Buttons: Add Memory button & Quick Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundController.playClick();
                    setShowAddMemoryModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#5B825B] text-white text-xs font-black flex items-center gap-1.5 shadow-xs hover:bg-[#4a6b4a] active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{tx('Add Memory', 'याद जोड़ें', 'স্মৃতি যোগ কৰক')}</span>
                </button>

                <span className="text-[10px] text-[#8C877D] font-bold">
                  {tx('or quick sample:', 'या त्वरित नमूना:', 'বা নমুনা:')}
                </span>
                {SAMPLE_MEDIA_PRESETS.slice(0, 2).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickAddPreset(preset)}
                    className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E0DCD3] text-[10px] font-bold text-[#2D3A2F] hover:bg-[#EAF1E8] hover:border-[#5B825B]/40 transition-all flex items-center gap-1 shadow-2xs"
                  >
                    <Sparkles className="w-3 h-3 text-[#E8B25C]" />
                    <span>+ {preset.label.split('+')[0].trim()}</span>
                  </button>
                ))}
              </div>

              {/* List of currently added memories (if any) */}
              {initialMemoriesList.length > 0 ? (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#5A6E5D]">
                    <span>
                      {tx('Initial memories configured:', 'प्रारंभिक यादें तैयार:', 'প্ৰাৰম্ভিক স্মৃতি সাজু:')} ({initialMemoriesList.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        soundController.playClick();
                        setShowAddMemoryModal(true);
                      }}
                      className="text-[#5B825B] hover:underline font-extrabold flex items-center gap-1 text-[11px]"
                    >
                      <Plus className="w-3 h-3" />
                      {tx('Add another', 'एक और जोड़ें', 'আৰু এটা যোগ কৰক')}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {initialMemoriesList.map((mem) => (
                      <div
                        key={mem.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E0DCD3] shadow-2xs gap-2"
                      >
                        <div 
                          className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                          onClick={() => { soundController.playClick(); setPreviewMemory(mem); }}
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-black shrink-0 relative">
                            <img
                              src={mem.image}
                              alt={mem.title}
                              className="w-full h-full object-cover"
                            />
                            {mem.mediaType === 'video' && (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <Film className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="block text-xs font-bold text-[#2D3A2F] truncate">
                              {mem.title}
                            </span>
                            <span className="block text-[10px] text-[#5A6E5D] truncate">
                              {mem.category} {mem.person ? `• ${mem.person}` : ''}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMemory(mem.id)}
                          className="p-1.5 text-[#C46A66] hover:bg-[#FCF2F0] rounded-lg transition-colors shrink-0"
                          title={tx('Remove', 'हटाएं', 'আঁতৰাওক')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-white border border-dashed border-[#E0DCD3] text-center text-[11px] text-[#8C877D]">
                  {tx(
                    'No initial memories added yet. This is completely optional—you can proceed or add one above.',
                    'अभी तक कोई याद नहीं जोड़ी गई है। यह पूरी तरह से वैकल्पिक है—आप आगे बढ़ सकते हैं या ऊपर से जोड़ सकते हैं।',
                    'এতিয়ালৈকে কোনো স্মৃতি যোগ কৰা নাই। এইটো সম্পূৰ্ণৰূপে ঐচ্ছিক—আপুনি আগবাঢ়িব পাৰে বা ওপৰত যোগ কৰিব পাৰে।'
                  )}
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => { soundController.playClick(); setStep(2); }}
                className="px-4 py-2.5 rounded-2xl bg-[#F4F1EA] text-[#2D3A2F] font-extrabold text-xs flex items-center gap-1.5 hover:bg-[#EAE5DC]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{tx('Back', 'पीछे')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateStep3()) {
                    soundController.playClick();
                    setStep(4);
                  }
                }}
                className="px-5 py-3 rounded-2xl bg-[#5B825B] text-white font-extrabold text-xs flex items-center gap-2 hover:bg-[#4a6b4a] shadow-xs active:scale-95 transition-all"
              >
                <span>{tx('Continue to ASHA Setup', 'आशा सेटअप पर जाएं')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: ASHA HEALTH WORKER CONFIGURATION ================= */}
        {step === 4 && (
          <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FDF0D5] text-[#A66E14] flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-black text-[#2D3A2F]">{tx('ASHA Worker Mode Setup', 'आशा कार्यकर्ता मोड सेटअप')}</h2>
                  <p className="text-[11px] text-[#5A6E5D]">{tx('Community healthcare link and village worker login', 'सामुदायिक स्वास्थ्य संपर्क एवं कार्यकर्ता लॉगिन')}</p>
                </div>
              </div>
              <span className="text-xs font-black text-[#5B825B] bg-[#EAF1E8] px-2.5 py-1 rounded-full">
                {tx('Step 4 of 4', 'चरण 4 / 4')}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ECE8DE] text-xs text-[#5A6E5D] leading-relaxed">
              💡 <strong>{tx('ASHA Worker Portal:', 'आशा कार्यकर्ता पोर्टल:')}</strong> {tx('Accredited Social Health Activists (ASHA) monitor routine adherence, cognitive play metrics, and visit tasks. They can also update these credentials anytime inside ASHA mode.', 'मान्यता प्राप्त सामाजिक स्वास्थ्य कार्यकर्ता (आशा) नियमित दिनचर्या, संज्ञानात्मक खेल मैट्रिक्स और गृह भेंट कार्यों की निगरानी करते हैं।')}
            </div>

            {/* ASHA ID & Passcode */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                  {tx('ASHA Worker ID', 'आशा कार्यकर्ता आईडी')}
                </label>
                <input
                  type="text"
                  value={ashaWorkerId}
                  onChange={(e) => setAshaWorkerId(e.target.value)}
                  placeholder="e.g. ASHA-001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                  {tx('Security Passcode', 'सुरक्षा पासकोड')}
                </label>
                <input
                  type="text"
                  value={ashaPasscode}
                  onChange={(e) => setAshaPasscode(e.target.value)}
                  placeholder="e.g. asha123"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
                />
              </div>
            </div>

            {/* Worker Name & Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                  {tx('ASHA Worker Name', 'आशा कार्यकर्ता का नाम')}
                </label>
                <input
                  type="text"
                  value={ashaName}
                  onChange={(e) => setAshaName(e.target.value)}
                  placeholder="e.g. Sunita Das"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                  {tx('ASHA Contact Phone', 'आशा संपर्क फोन')}
                </label>
                <input
                  type="tel"
                  value={ashaPhone}
                  onChange={(e) => setAshaPhone(e.target.value)}
                  placeholder="e.g. +91 91234 56789"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
                />
              </div>
            </div>

            {/* Sub-centre */}
            <div>
              <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                {tx('Assigned Sub-Centre / Ward / Village', 'आवंटित उप-केंद्र / वार्ड / गांव')}
              </label>
              <input
                type="text"
                value={ashaSubCentre}
                onChange={(e) => setAshaSubCentre(e.target.value)}
                placeholder="e.g. Kamrup Health Sub-Centre"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
              />
            </div>

            {/* Summary Reassurance Box */}
            <div className="p-4 rounded-2xl bg-[#EAF1E8]/70 border border-[#5B825B]/20 text-xs text-[#2D3A2F] space-y-1.5">
              <div className="font-extrabold text-[#3D663D] flex items-center gap-1.5">
                <Check className="w-4 h-4" /> {tx('Ready to Launch', 'आरंभ करने के लिए तैयार', 'আৰম্ভ কৰিবলৈ সাজু')}
              </div>
              <p className="text-[11px] text-[#556657]">
                {tx('Player:', 'खिलाड़ी:', 'খেলুৱৈ:')} <strong>{name || 'Player'}</strong> ({age} {tx('yrs', 'वर्ष', 'বছৰ')}, {region}) • {tx('Caregiver PIN:', 'देखभालकर्ता पिन:', 'সেৱাযত্নকাৰী পিন:')} <strong>••••</strong>
              </p>
            </div>

            {/* DPDP Act 2023 Consent Checkbox Card */}
            <div className="p-4 rounded-2xl border-2 border-[#5B825B]/40 bg-[#F4F8F4] space-y-2.5">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="dpdp-consent-checkbox"
                  checked={consentGiven}
                  onChange={(e) => {
                    setConsentGiven(e.target.checked);
                    if (e.target.checked) setFormError(null);
                  }}
                  className="mt-0.5 w-4 h-4 text-[#5B825B] rounded border-[#C2BDB2] focus:ring-[#5B825B] cursor-pointer"
                />
                <div className="text-xs text-[#2D3A2F] leading-relaxed">
                  <span className="font-extrabold text-[#2D3A2F] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#3D663D]" />
                    <span>{tx('DPDP Act 2023 Consent & Care Coordination Authorization *', 'DPDP अधिनियम 2023 सहमति एवं देखभाल समन्वय प्राधिकरण *', 'DPDP আইন ২০২৩ সন্মতি আৰু সেৱা সমন্বয় কৰ্তৃত্ব *')}</span>
                  </span>
                  <p className="mt-1 text-[11px] text-[#4A5D4C]">
                    {tx(
                      `I grant verifiable digital consent under India's Digital Personal Data Protection (DPDP) Act, 2023 to securely process and store routine medication schedules, elder well-being logs, and cognitive telemetry strictly for the care of ${name || 'the player'}. Access is strictly scoped to designated family caregivers and accredited ASHA workers.`,
                      `मैं भारत के डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम, 2023 के तहत ${name || 'खिलाड़ी'} की देखभाल के लिए दवा समय सारिणी, बुजुर्ग स्वास्थ्य लॉग और संज्ञानात्मक टेलीमेट्री को सुरक्षित रूप से संसाधित और संग्रहीत करने के लिए डिजिटल सहमति प्रदान करता/करती हूं। यह पहुंच केवल नामित परिवार और आशा कार्यकर्ताओं तक सीमित है।`,
                      `মই ভাৰতৰ ডিজিটেল ব্যক্তিগত তথ্য সুৰক্ষা (DPDP) আইন ২০২৩ অনুসৰি ${name || 'খেলুৱৈ'}ৰ যত্নৰ বাবে নিয়মীয়া ঔষধৰ সময়সূচী, জেষ্ঠ্যৰ স্বাস্থ্যৰ তথ্য আৰু বৌদ্ধিক টেলিমেট্ৰী সুৰক্ষিতভাৱে প্ৰক্ৰিয়াকৰণ আৰু সংৰক্ষণ কৰিবলৈ ডিজিটেল সন্মতি জনাইছো। এই প্ৰৱেশাধিকাৰ কেৱল নিৰ্ধাৰিত পৰিয়াল আৰু স্বীকৃতিপ্ৰাপ্ত আশা স্বাস্থ্যকৰ্মীৰ মাজত কঠোৰভাৱে সীমাবদ্ধ।`
                    )}
                  </p>
                </div>
              </label>
            </div>

            {/* Finish & Launch Buttons */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => { soundController.playClick(); setStep(3); }}
                className="px-4 py-3 rounded-2xl bg-[#F4F1EA] text-[#2D3A2F] font-extrabold text-xs flex items-center gap-1.5 hover:bg-[#EAE5DC]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{tx('Back', 'पीछे', 'উভতি যাওক')}</span>
              </button>

              <button
                type="submit"
                className="flex-1 py-3.5 px-4 rounded-2xl bg-[#5B825B] text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-[#4a6b4a] shadow-md active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#FDF0D5]" />
                <span>{isEditing ? tx('Save & Return to App', 'सहेजें और ऐप पर वापस जाएं', 'সংৰক্ষণ কৰক আৰু উভতি যাওক') : tx('Complete Setup & Launch', 'सेटअप पूर्ण करें और शुरू करें', 'ছেটআপ সম্পূৰ্ণ কৰক আৰু আৰম্ভ কৰক')}</span>
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Cancel button if editing from settings */}
      {isEditing && onCancel && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-bold text-[#5A6E5D] hover:underline"
          >
            {tx('Cancel and Return to App', 'रद्द करें और ऐप पर वापस जाएं')}
          </button>
        </div>
      )}

      {/* ================= ADD MEMORY MODAL (STEP 3 CAREGIVER) ================= */}
      {showAddMemoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-[#E0DCD3] space-y-4 my-8 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EAF1E8] text-[#5B825B] flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#2D3A2F]">
                    {tx('Add Initial Memory', 'प्रारंभिक याद जोड़ें', 'প্ৰাৰম্ভিক স্মৃতি যোগ কৰক')}
                  </h3>
                  <p className="text-[10px] text-[#5A6E5D]">
                    {tx('Upload photos, videos & voice messages', 'तस्वीरें, वीडियो और आवाज़ जोड़ें', 'ফটো, ভিডিঅ’ আৰু কণ্ঠস্বৰ যোগ কৰক')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { soundController.stopSpeaking(); setShowAddMemoryModal(false); }}
                className="w-7 h-7 rounded-full bg-[#FAF8F5] text-[#5A6E5D] hover:bg-[#F0ECE4] flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Media Type Switcher: Photo Memory vs Video Story */}
            <div className="flex rounded-xl bg-[#FAF8F5] p-1 border border-[#E0DCD3]">
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
                <ImageIcon className="w-3.5 h-3.5" /> {tx('Photo Memory', 'फ़ोटो याद', 'ফটো স্মৃতি')}
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
                <Video className="w-3.5 h-3.5" /> {tx('Video Story', 'वीडियो कहानी', 'ভিডিঅ’ কাহিনী')}
              </button>
            </div>

            <form onSubmit={handleCreateMemory} className="space-y-3 text-xs">
              {/* Media File Upload Area */}
              <div className="border-2 border-dashed border-[#5B825B]/40 rounded-2xl p-4 text-center bg-[#FDFBF7] space-y-2 hover:bg-[#EAF1E8]/30 transition-colors">
                <input
                  type="file"
                  id="setup-memory-file-input"
                  accept="image/*,video/*"
                  onChange={handleMemoryFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="setup-memory-file-input"
                  className="cursor-pointer flex flex-col items-center gap-1.5"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#EAF1E8] text-[#5B825B] flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-sm text-[#2D3A2F]">
                    {memoryUploadPreview ? tx('File Selected! Tap to change', 'फ़ाइल चुनी गई! बदलने के लिए टैप करें', 'ফাইল নিৰ্বাচিত! সলনি কৰিবলৈ টেপ কৰক') : tx('Upload Photo or Video', 'फ़ोटो या वीडियो अपलोड करें', 'ফটো বা ভিডিঅ’ আপলোড কৰক')}
                  </span>
                  <span className="text-[11px] text-[#5A6E5D]">
                    {tx('Supports JPG, PNG, MP4, WebM from your device', 'उपकरण से JPG, PNG, MP4, WebM समर्थित', 'ডিভাইচৰ পৰা JPG, PNG, MP4, WebM')}
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
                  {tx('Or Paste', 'या पेस्ट करें', 'বা পেষ্ট কৰক')} {newMemoryMediaType === 'video' ? tx('Video URL', 'वीडियो URL', 'ভিডিঅ’ URL') : tx('Photo URL', 'फ़ोटो URL', 'ফটো URL')}
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
                <span className="text-[11px] font-bold text-[#5A6E5D] block">
                  {tx('Quick Sample Media:', 'त्वरित नमूना मीडिया:', 'নমুনা বাছক:')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_MEDIA_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyMemoryPreset(preset)}
                      className="px-2.5 py-1 rounded-xl bg-[#FDFBF7] border border-[#E0DCD3] text-[11px] font-bold text-[#2D3A2F] hover:bg-[#EAF1E8]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-black text-[#2D3A2F] mb-1">
                  {tx('Memory Title *', 'याद का शीर्षक *', 'স্মৃতিৰ শীৰ্ষক *')}
                </label>
                <input
                  type="text"
                  value={newMemoryTitle}
                  onChange={(e) => setNewMemoryTitle(e.target.value)}
                  placeholder="e.g. Grandkids Visiting Guwahati"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-black text-[#2D3A2F] mb-1">
                    {tx('People in this Memory', 'इस याद में लोग', 'এই স্মৃতিত থকা লোক')}
                  </label>
                  <input
                    type="text"
                    value={newMemoryPerson}
                    onChange={(e) => setNewMemoryPerson(e.target.value)}
                    placeholder="e.g. Priya, Kabir"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                  />
                </div>
                <div>
                  <label className="block font-black text-[#2D3A2F] mb-1">
                    {tx('Category', 'श्रेणी', 'শ্ৰেণী')}
                  </label>
                  <select
                    value={newMemoryCategory}
                    onChange={(e) => setNewMemoryCategory(e.target.value as MemoryCategory)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E0DCD3] text-xs font-semibold focus:border-[#5B825B]"
                  >
                    <option value="Family">{tx('Family', 'परिवार', 'পৰিয়াল')}</option>
                    <option value="People">{tx('People', 'लोग', 'মানুহ')}</option>
                    <option value="Places">{tx('Places', 'स्थान', 'ঠাই')}</option>
                    <option value="Special Moments">{tx('Special Moments', 'खास पल', 'বিশেষ মুহূৰ্ত')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-black text-[#2D3A2F] mb-1">
                  {tx('Story / Heartfelt Narration *', 'कहानी / भावनात्मक विवरण *', 'কাহিনী / চমু বিৱৰণ *')}
                </label>
                <textarea
                  rows={3}
                  value={newMemoryDesc}
                  onChange={(e) => setNewMemoryDesc(e.target.value)}
                  placeholder="Write a loving story or description that can be read aloud or shown in Player Mode..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E0DCD3] text-xs font-medium leading-relaxed focus:border-[#5B825B]"
                  required
                />
              </div>

              {/* Voice Reminiscence: 15-second audio snippet in caregiver/loved one's real voice */}
              <div className="pt-1">
                <VoiceReminiscenceRecorder
                  defaultRecordedBy={caregiverName || 'Family Caregiver'}
                  defaultPromptText={newMemoryVoiceSnippet?.promptText || ''}
                  initialAudioUrl={newMemoryVoiceSnippet?.audioUrl}
                  initialDuration={newMemoryVoiceSnippet?.duration}
                  onSaveVoiceSnippet={(voiceData: VoiceReminiscenceData | null) => setNewMemoryVoiceSnippet(voiceData)}
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundController.stopSpeaking();
                    setShowAddMemoryModal(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-xs font-extrabold text-[#5A6E5D]"
                >
                  {tx('Cancel', 'रद्द करें', 'বাতিল')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#5B825B] text-white text-xs font-black shadow-xs hover:bg-[#4d704d]"
                >
                  {tx('Save to Initial Memories', 'प्रारंभिक यादों में सहेजें', 'প্ৰাৰম্ভিক স্মৃতিত সংৰক্ষণ কৰক')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= PREVIEW MEMORY MODAL ================= */}
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
                type="button"
                onClick={() => setPreviewMemory(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-black font-bold flex items-center justify-center cursor-pointer shadow-md"
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
    </div>
  );
};
