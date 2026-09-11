import React, { useState } from 'react';
import { 
  Heart, User, ShieldCheck, Stethoscope, Sparkles, ArrowRight, ArrowLeft, 
  Check, Lock, Phone, Plus, Trash2, KeyRound, AlertCircle, RefreshCw 
} from 'lucide-react';
import { PatientProfile, MedicalProfile, CaregiverAccount, AshaAccount, EmergencyContact } from '../../types';
import { soundController } from '../../utils/audio';

interface InitialSetupPageProps {
  initialPatient?: PatientProfile;
  initialMedical?: MedicalProfile;
  onComplete: (data: {
    patient: PatientProfile;
    medical: MedicalProfile;
    caregiver: CaregiverAccount;
    asha?: AshaAccount;
    emergencyContact: EmergencyContact;
  }) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

const ELDER_AVATARS = [
  {
    id: 'elder-female-1',
    label: 'Gentle Smile',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'elder-female-2',
    label: 'Warm Grandmother',
    url: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'elder-male-1',
    label: 'Wise Grandfather',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'elder-male-2',
    label: 'Kind Elder',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'elder-symbolic-1',
    label: 'Morning Sun',
    url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'elder-symbolic-2',
    label: 'Lotus Garden',
    url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=300&q=80',
  }
];

export const InitialSetupPage: React.FC<InitialSetupPageProps> = ({
  initialPatient,
  initialMedical,
  onComplete,
  onCancel,
  isEditing = false,
}) => {
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

  const [formError, setFormError] = useState<string | null>(null);

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
      setFormError('Please enter the player\'s familiar calling name.');
      return false;
    }
    setFormError(null);
    return true;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    if (!caregiverName.trim()) {
      setFormError('Please enter the caregiver\'s name.');
      return false;
    }
    if (!caregiverPin || caregiverPin.length !== 4 || !/^\d{4}$/.test(caregiverPin)) {
      setFormError('Please create a 4-digit numeric security PIN for caregiver access.');
      return false;
    }
    if (caregiverPin !== confirmPin) {
      setFormError('The confirmed PIN does not match. Please re-enter.');
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

    soundController.playSuccess();

    const caregiverAccount: CaregiverAccount = {
      name: caregiverName.trim(),
      relationship: relationship.trim(),
      phone: caregiverPhone.trim(),
      pin: caregiverPin.trim(),
      isPrimary: true,
    };

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
                {isEditing ? 'Profile Settings' : 'Initial Setup'}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#E8B25C]" />
            </div>
            <h1 className="text-xl font-black text-[#2D3A2F] mt-0.5 leading-tight">
              {isEditing ? 'Configure Profiles' : 'Welcome to Monor Xur'}
            </h1>
            <p className="text-xs text-[#5A6E5D]">
              {isEditing 
                ? 'Update patient, caregiver PIN, and ASHA credentials' 
                : 'Set up player details & caregiver security PIN to begin'}
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
            <span className="text-[11px] truncate block">Player</span>
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
            <span className="text-[11px] truncate block">Medical</span>
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
            <span className="text-[11px] truncate block">Caregiver</span>
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
            <span className="text-[11px] truncate block">ASHA</span>
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
                  <h2 className="text-base font-black text-[#2D3A2F]">Player Profile (Patient)</h2>
                  <p className="text-[11px] text-[#5A6E5D]">Information for the loved one using the app</p>
                </div>
              </div>
              <span className="text-xs font-black text-[#5B825B] bg-[#EAF1E8] px-2.5 py-1 rounded-full">
                Step 1 of 4
              </span>
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1.5">
                Choose Player Avatar / Photo
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {ELDER_AVATARS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { soundController.playClick(); setAvatar(item.url); }}
                    className={`relative rounded-2xl overflow-hidden border-2 p-1 transition-all ${
                      avatar === item.url
                        ? 'border-[#5B825B] bg-[#EAF1E8] scale-105 shadow-xs'
                        : 'border-[#E0DCD3] bg-[#FDFBF7] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={item.url} 
                      alt={item.label}
                      className="w-full h-16 object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                    <span className="block text-[10px] font-bold text-center mt-1 truncate text-[#2D3A2F]">
                      {item.label}
                    </span>
                    {avatar === item.url && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-[#5B825B] text-white rounded-full flex items-center justify-center shadow-xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="Or paste custom photo URL..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E0DCD3] bg-[#FAF8F5] focus:outline-hidden focus:border-[#5B825B]"
                />
              </div>
            </div>

            {/* Names */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                  Calling Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anita / Maa"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-sm font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
                />
                <span className="text-[10px] text-[#5A6E5D]">Used in voice prompts</span>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Anita Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-sm font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
                />
                <span className="text-[10px] text-[#5A6E5D]">For medical records</span>
              </div>
            </div>

            {/* Age, Gender, Blood Group */}
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                  Age
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
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B] bg-white"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                  Blood Group
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
                  Region / City
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
                  Language Spoken
                </label>
                <input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="e.g. Assamese & Bengali"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
                />
              </div>
            </div>

            {/* Primary Care Concern */}
            <div>
              <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                Primary Memory / Care Focus
              </label>
              <input
                type="text"
                value={majorCareIssue}
                onChange={(e) => setMajorCareIssue(e.target.value)}
                placeholder="e.g. Mild Memory Difficulties & Routine Navigation"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
              />
            </div>

            {/* About / Interests */}
            <div>
              <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                Personal Interests & What Brings Comfort
              </label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows={2}
                placeholder="e.g. Enjoys old classical songs, watering plants, spending quiet time..."
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
                <span>Continue to Medical Info</span>
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
                  <h2 className="text-base font-black text-[#2D3A2F]">Medical & Health Profile</h2>
                  <p className="text-[11px] text-[#5A6E5D]">Medications, allergies, and clinician guidance</p>
                </div>
              </div>
              <span className="text-xs font-black text-[#5B825B] bg-[#EAF1E8] px-2.5 py-1 rounded-full">
                Step 2 of 4
              </span>
            </div>

            {/* Cognitive Care Stage */}
            <div>
              <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                Cognitive Care Category
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B] bg-white"
              >
                <option value="Mild Cognitive Impairment">Mild Cognitive Impairment (MCI)</option>
                <option value="Early Stage Memory Difficulty">Early Stage Memory Difficulty</option>
                <option value="Moderate Support Stage">Moderate Support Stage</option>
                <option value="Healthy Ageing & Cognitive Wellness">Healthy Ageing & Cognitive Wellness</option>
              </select>
            </div>

            {/* Prescriptions List Builder */}
            <div>
              <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                Daily Prescriptions & Medicines
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
                      title="Remove medicine"
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
                  placeholder="e.g. Donepezil 5mg (Night)"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#E0DCD3] focus:outline-hidden focus:border-[#5B825B]"
                />
                <button
                  type="button"
                  onClick={handleAddRx}
                  className="px-3.5 py-2 rounded-xl bg-[#EAF1E8] text-[#5B825B] font-extrabold text-xs flex items-center gap-1 hover:bg-[#d5ebd1]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                Known Allergies
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
                  placeholder="e.g. Penicillin or Peanuts"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#E0DCD3] focus:outline-hidden focus:border-[#5B825B]"
                />
                <button
                  type="button"
                  onClick={handleAddAllergy}
                  className="px-3 py-2 rounded-xl bg-[#F4F1EA] text-[#2D3A2F] font-bold text-xs hover:bg-[#EAE5DC]"
                >
                  Add Allergy
                </button>
              </div>
            </div>

            {/* Doctor & Clinic Contact */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                  Primary Doctor / Clinic
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
                  Doctor / Clinic Phone
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
                Clinical Care Guidance
              </label>
              <textarea
                value={careInfo}
                onChange={(e) => setCareInfo(e.target.value)}
                rows={2}
                placeholder="Guidance for daily routine, rest, and cognitive engagement..."
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
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => { soundController.playClick(); setStep(3); }}
                className="px-5 py-3 rounded-2xl bg-[#5B825B] text-white font-extrabold text-xs flex items-center gap-2 hover:bg-[#4a6b4a] shadow-xs active:scale-95 transition-all"
              >
                <span>Continue to Caregiver PIN</span>
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
                  <h2 className="text-base font-black text-[#2D3A2F]">Caregiver Profile & PIN</h2>
                  <p className="text-[11px] text-[#5A6E5D]">Secure portal access and one-touch emergency phone</p>
                </div>
              </div>
              <span className="text-xs font-black text-[#5B825B] bg-[#EAF1E8] px-2.5 py-1 rounded-full">
                Step 3 of 4
              </span>
            </div>

            {/* Caregiver Name & Relationship */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                  Caregiver Name *
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
                  Relationship to Player
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B] bg-white"
                >
                  <option value="Daughter">Daughter</option>
                  <option value="Son">Son</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Grandchild">Grandchild</option>
                  <option value="Sister/Brother">Sister / Brother</option>
                  <option value="Primary Caregiver">Primary Caregiver</option>
                </select>
              </div>
            </div>

            {/* Phone Number (Used for One-Touch Emergency Call) */}
            <div>
              <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                Emergency & Family Phone Number *
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
                ⭐ This number will be called when the player taps the green emergency family call button.
              </span>
            </div>

            {/* Custom 4-Digit PIN */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE8DE] space-y-3">
              <div className="flex items-center gap-2 text-[#5B825B]">
                <KeyRound className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-wider">Set Caregiver Security PIN</span>
              </div>
              <p className="text-[11px] text-[#5A6E5D] leading-relaxed">
                Create a 4-digit PIN to prevent the player from accidentally altering medication schedules or caregiver settings.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D3A2F] mb-1">
                    4-Digit PIN *
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
                    Confirm PIN *
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
                      <Check className="w-3.5 h-3.5" /> PIN confirmed correctly
                    </span>
                  ) : (
                    <span className="text-[#B83E26]">PINs do not match</span>
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
                <span>Back</span>
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
                <span>Continue to ASHA Setup</span>
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
                  <h2 className="text-base font-black text-[#2D3A2F]">ASHA Worker Mode Setup</h2>
                  <p className="text-[11px] text-[#5A6E5D]">Community healthcare link and village worker login</p>
                </div>
              </div>
              <span className="text-xs font-black text-[#5B825B] bg-[#EAF1E8] px-2.5 py-1 rounded-full">
                Step 4 of 4
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ECE8DE] text-xs text-[#5A6E5D] leading-relaxed">
              💡 <strong>ASHA Worker Portal:</strong> Accredited Social Health Activists (ASHA) monitor routine adherence, cognitive play metrics, and visit tasks. They can also update these credentials anytime inside ASHA mode.
            </div>

            {/* ASHA ID & Passcode */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
                  ASHA Worker ID
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
                  Security Passcode
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
                  ASHA Worker Name
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
                  ASHA Contact Phone
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
                Assigned Sub-Centre / Ward / Village
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
                <Check className="w-4 h-4" /> Ready to Launch
              </div>
              <p className="text-[11px] text-[#556657]">
                Player: <strong>{name || 'Player'}</strong> ({age} yrs, {region}) • Caregiver PIN: <strong>••••</strong>
              </p>
            </div>

            {/* Finish & Launch Buttons */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => { soundController.playClick(); setStep(3); }}
                className="px-4 py-3 rounded-2xl bg-[#F4F1EA] text-[#2D3A2F] font-extrabold text-xs flex items-center gap-1.5 hover:bg-[#EAE5DC]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="flex-1 py-3.5 px-4 rounded-2xl bg-[#5B825B] text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-[#4a6b4a] shadow-md active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#FDF0D5]" />
                <span>{isEditing ? 'Save & Return to App' : 'Complete Setup & Launch'}</span>
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
            Cancel and Return to App
          </button>
        </div>
      )}
    </div>
  );
};
