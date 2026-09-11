import React, { useState } from 'react';
import { 
  Heart, User, ShieldCheck, Stethoscope, Sparkles, ArrowRight, ArrowLeft, 
  Check, Lock, Phone, Plus, Trash2, KeyRound, AlertCircle, RefreshCw 
} from 'lucide-react';
import { PatientProfile, MedicalProfile, CaregiverAccount, AshaAccount, EmergencyContact } from '../../types';
import { soundController } from '../../utils/audio';
import { useLanguage } from '../../context/LanguageContext';

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
      consentGiven: true,
      consentDate: initialPatient?.consentDate || new Date().toISOString(),
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
            <div>
              <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1.5">
                {tx('Choose Player Avatar / Photo', 'खिलाड़ी का अवतार / फोटो चुनें')}
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
                  placeholder={tx('Or paste custom photo URL...', 'या कस्टम फोटो URL पेस्ट करें...')}
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
                <Check className="w-4 h-4" /> {tx('Ready to Launch', 'आरंभ करने के लिए तैयार')}
              </div>
              <p className="text-[11px] text-[#556657]">
                {tx('Player:', 'खिलाड़ी:')} <strong>{name || 'Player'}</strong> ({age} {tx('yrs', 'वर्ष')}, {region}) • {tx('Caregiver PIN:', 'देखभालकर्ता पिन:')} <strong>••••</strong>
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
                    <span>{tx('DPDP Act 2023 Consent & Care Coordination Authorization *', 'DPDP अधिनियम 2023 सहमति एवं देखभाल समन्वय प्राधिकरण *')}</span>
                  </span>
                  <p className="mt-1 text-[11px] text-[#4A5D4C]">
                    {tx(
                      `I grant verifiable digital consent under India's Digital Personal Data Protection (DPDP) Act, 2023 to securely process and store routine medication schedules, elder well-being logs, and cognitive telemetry strictly for the care of ${name || 'the player'}. Access is strictly scoped to designated family caregivers and accredited ASHA workers.`,
                      `मैं भारत के डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम, 2023 के तहत ${name || 'खिलाड़ी'} की देखभाल के लिए दवा समय सारिणी, बुजुर्ग स्वास्थ्य लॉग और संज्ञानात्मक टेलीमेट्री को सुरक्षित रूप से संसाधित और संग्रहीत करने के लिए डिजिटल सहमति प्रदान करता/करती हूं। यह पहुंच केवल नामित परिवार और आशा कार्यकर्ताओं तक सीमित है।`
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
                <span>{tx('Back', 'पीछे')}</span>
              </button>

              <button
                type="submit"
                className="flex-1 py-3.5 px-4 rounded-2xl bg-[#5B825B] text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-[#4a6b4a] shadow-md active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#FDF0D5]" />
                <span>{isEditing ? tx('Save & Return to App', 'सहेजें और ऐप पर वापस जाएं') : tx('Complete Setup & Launch', 'सेटअप पूर्ण करें और शुरू करें')}</span>
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
    </div>
  );
};
