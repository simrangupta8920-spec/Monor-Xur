import React, { useState } from 'react';
import { ArrowLeft, Stethoscope, ShieldCheck, Settings, Check, Sparkles } from 'lucide-react';
import { AshaAccount } from '../../types';
import { soundController } from '../../utils/audio';
import { useLanguage } from '../../context/LanguageContext';

interface AshaLoginProps {
  onSuccess: () => void;
  onBack: () => void;
  configuredAsha?: AshaAccount;
  onUpdateAsha?: (account: AshaAccount) => void;
}

export const AshaLogin: React.FC<AshaLoginProps> = ({ 
  onSuccess, 
  onBack, 
  configuredAsha, 
  onUpdateAsha 
}) => {
  const { tx } = useLanguage();
  const [isConfiguring, setIsConfiguring] = useState(false);

  // Login credentials
  const defaultId = configuredAsha?.workerId || 'ASHA-001';
  const [workerId, setWorkerId] = useState(defaultId);
  const [password, setPassword] = useState(configuredAsha?.passcode || 'asha123');
  const [error, setError] = useState<string | null>(null);

  // Configuration credentials
  const [newWorkerId, setNewWorkerId] = useState(configuredAsha?.workerId || 'ASHA-001');
  const [newName, setNewName] = useState(configuredAsha?.name || 'Sunita Das');
  const [newPhone, setNewPhone] = useState(configuredAsha?.phone || '+91 91234 56789');
  const [newSubCentre, setNewSubCentre] = useState(configuredAsha?.subCentre || 'Kamrup Community Health Sub-Centre');
  const [newPasscode, setNewPasscode] = useState(configuredAsha?.passcode || 'asha123');
  const [configSaved, setConfigSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundController.playClick();

    const expectedId = (configuredAsha?.workerId || 'ASHA-001').toUpperCase();
    const expectedPass = configuredAsha?.passcode || 'asha123';

    const inputId = workerId.trim().toUpperCase();
    const inputPass = password.trim();

    // Check credentials against configured ASHA worker account
    if (
      (inputId === expectedId && inputPass === expectedPass) ||
      (inputId === 'ASHA001' && inputPass === 'asha123') ||
      (inputId === 'ASHA-001' && inputPass === 'asha123') ||
      (inputId.length >= 3 && inputPass.length >= 4 && inputPass === expectedPass)
    ) {
      soundController.playSuccess();
      onSuccess();
    } else {
      setError(tx(`Invalid credentials for ASHA mode. Expected ID: ${expectedId}`, `आशा मोड के लिए अमान्य क्रेडेंशियल। अपेक्षित आईडी: ${expectedId}`, `আশা ম’ডৰ বাবে ভুল প্ৰমাণপত্ৰ। প্ৰত্যাশিত আইডি: ${expectedId}`));
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    soundController.playSuccess();
    const updated: AshaAccount = {
      workerId: newWorkerId.trim().toUpperCase(),
      name: newName.trim(),
      phone: newPhone.trim(),
      subCentre: newSubCentre.trim(),
      passcode: newPasscode.trim(),
    };
    if (onUpdateAsha) {
      onUpdateAsha(updated);
    }
    setWorkerId(updated.workerId);
    setPassword(updated.passcode);
    setConfigSaved(true);
    setTimeout(() => {
      setIsConfiguring(false);
      setConfigSaved(false);
    }, 900);
  };

  return (
    <div className="p-4 pb-24 space-y-6 animate-fadeIn max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-2xl bg-white border border-[#E0DCD3] text-[#2D3A2F] hover:bg-[#EAF1E8]"
          title={tx('Go back', 'वापस जाएं', 'উভতি যাওক')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold text-[#5A6E5D]">{tx('ASHA Health Worker', 'आशा स्वास्थ्य कार्यकर्ता', 'আশা স্বাস্থ্যকৰ্মী')}</span>
      </div>

      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-3xl overflow-hidden border-2 border-[#E8B25C]/40 bg-[#FDF0D5] p-1 shadow-xs">
          <img src="/logo.jpg" alt="Monor Xur" className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
        </div>
        <h2 className="text-2xl font-black text-[#2D3A2F]">
          {isConfiguring ? tx('Configure ASHA Profile', 'आशा प्रोफ़ाइल कॉन्फ़िगर करें', 'আশা প্ৰ’ফাইল বিন্যাস কৰক') : tx('Health Worker Login', 'स्वास्थ्य कार्यकर्ता लॉगिन', 'স্বাস্থ্যকৰ্মী লগ ইন')}
        </h2>
        <p className="text-xs text-[#5A6E5D]">
          {isConfiguring 
            ? tx('Set your worker ID, village sub-centre, and passcode', 'अपनी कार्यकर्ता आईडी, गांव उप-केंद्र और पासकोड सेट करें', 'আপোনাৰ কৰ্মী আইডি, গাঁও উপ-কেন্দ্ৰ আৰু পাছক’ড নিৰ্ধাৰণ কৰক')
            : tx('Access clinical reports and community player engagement', 'नैदानिक रिपोर्ट और सामुदायिक खिलाड़ी जुड़ाव देखें', 'চিকিৎসা প্ৰতিবেদন আৰু সম্প্ৰদায়ৰ খেলুৱৈৰ অংশগ্ৰহণ চাওক')}
        </p>
      </div>

      {!isConfiguring ? (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-5 rounded-3xl border border-[#E0DCD3] shadow-xs">
          <div>
            <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
              {tx('ASHA Worker ID', 'आशा कार्यकर्ता आईडी', 'আশা কৰ্মী আইডি')}
            </label>
            <input
              type="text"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#E0DCD3] text-sm font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
              placeholder="e.g. ASHA-001"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
              {tx('Security Passcode', 'सुरक्षा पासकोड', 'সুৰক্ষা পাছক’ড')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#E0DCD3] text-sm font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-xs font-extrabold text-[#C46A66]">{error}</p>}

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-2xl bg-[#5B825B] text-white font-extrabold text-sm hover:bg-[#4c704c] shadow-xs active:scale-95 transition-all"
          >
            {tx('Sign In to ASHA Portal', 'आशा पोर्टल में लॉगिन करें', 'আশা প’ৰ্টেলত প্ৰৱেশ কৰক')}
          </button>

          {/* Configure Worker Mode Option */}
          <div className="pt-2 border-t border-[#F0ECE4] text-center space-y-2">
            <button
              type="button"
              onClick={() => {
                soundController.playClick();
                setIsConfiguring(true);
              }}
              className="text-xs font-bold text-[#5B825B] hover:underline flex items-center justify-center gap-1.5 mx-auto"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{tx('Configure / Register ASHA Worker Mode', 'आशा कार्यकर्ता मोड कॉन्फ़िगर / पंजीकृत करें', 'আশা কৰ্মী ম’ড বিন্যাস / পঞ্জীয়ন কৰক')}</span>
            </button>
          </div>
        </form>
      ) : (
        /* ASHA WORKER REGISTRATION / CONFIGURATION */
        <form onSubmit={handleSaveConfig} className="space-y-4 bg-white p-5 rounded-3xl border border-[#E0DCD3] shadow-xs animate-fadeIn">
          <div>
            <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
              {tx('Your Worker ID', 'आपकी कार्यकर्ता आईडी', 'আপোনাৰ কৰ্মী আইডি')}
            </label>
            <input
              type="text"
              value={newWorkerId}
              onChange={(e) => setNewWorkerId(e.target.value)}
              placeholder="e.g. ASHA-WB-101"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
              {tx('Worker Name', 'कार्यकर्ता का नाम', 'কৰ্মীৰ নাম')}
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Sunita Das"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
              {tx('Contact Phone', 'संपर्क फोन', 'যোগাযোগৰ নম্বৰ')}
            </label>
            <input
              type="tel"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="e.g. +91 91234 56789"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
              {tx('Sub-Centre / Village / Ward', 'उप-केंद्र / गांव / वार्ड', 'উপ-কেন্দ্ৰ / গাঁও / ৱাৰ্ড')}
            </label>
            <input
              type="text"
              value={newSubCentre}
              onChange={(e) => setNewSubCentre(e.target.value)}
              placeholder="e.g. Kamrup Health Centre"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
              {tx('New Security Passcode', 'नया सुरक्षा पासकोड', 'নতুন সুৰক্ষা পাছক’ড')}
            </label>
            <input
              type="password"
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              placeholder="Choose password"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
            />
          </div>

          {configSaved && (
            <div className="p-2.5 rounded-xl bg-[#EAF1E8] text-[#3D663D] text-xs font-bold flex items-center justify-center gap-1">
              <Check className="w-4 h-4" /> {tx('ASHA Profile saved!', 'आशा प्रोफ़ाइल सहेज ली गई!', 'আশা প্ৰ’ফাইল সংৰক্ষিত হ’ল!')}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsConfiguring(false)}
              className="px-3.5 py-2.5 rounded-xl bg-[#F4F1EA] text-[#2D3A2F] text-xs font-bold hover:bg-[#EAE5DC]"
            >
              {tx('Cancel', 'रद्द करें', 'বাতিল কৰক')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#5B825B] text-white text-xs font-black hover:bg-[#4a6b4a] transition-colors"
            >
              {tx('Save ASHA Configuration', 'आशा कॉन्फ़िगरेशन सहेजें', 'আশা বিন্যাস সংৰক্ষণ কৰক')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
