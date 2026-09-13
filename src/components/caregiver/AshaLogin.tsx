import React, { useState } from 'react';
import { ArrowLeft, Stethoscope, ShieldCheck, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';
import { AshaAccount } from '../../types';
import { soundController } from '../../utils/audio';
import { useLanguage } from '../../context/LanguageContext';

interface AshaLoginProps {
  onSuccess: () => void;
  onBack: () => void;
  configuredAsha?: AshaAccount;
  onUpdateAsha?: (asha: AshaAccount) => void;
}

export const AshaLogin: React.FC<AshaLoginProps> = ({
  onSuccess,
  onBack,
  configuredAsha,
  onUpdateAsha,
}) => {
  const { tx } = useLanguage();

  const [workerId, setWorkerId] = useState(configuredAsha?.workerId || 'ASHA-KAM-042');
  const [passcode, setPasscode] = useState(configuredAsha?.passcode || '9988');
  const [name, setName] = useState(configuredAsha?.name || 'Jonali Barman');
  const [phone, setPhone] = useState(configuredAsha?.phone || '+91 94350 12345');
  const [subCentre, setSubCentre] = useState(configuredAsha?.subCentre || 'Sonapur Health Sub-Centre');

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerId.trim() || !passcode.trim()) {
      setError(tx('Please enter both Worker ID and Passcode', 'कृपया कार्यकर्ता आईडी और पासकोड दर्ज करें', 'অনুগ্ৰহ কৰি ৱৰ্কাৰ আইডি আৰু পাছক’ড দুয়োটাই দিয়ক'));
      return;
    }

    // Save updated ASHA details if provided
    if (onUpdateAsha) {
      onUpdateAsha({
        workerId: workerId.trim(),
        passcode: passcode.trim(),
        name: name.trim() || 'ASHA Worker',
        phone: phone.trim() || '+91 94350 12345',
        subCentre: subCentre.trim() || 'Health Sub-Centre',
      });
    }

    soundController.playSuccess();
    onSuccess();
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center p-4 max-w-md mx-auto animate-fadeIn">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between mb-5">
        <button
          onClick={() => {
            soundController.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-[#5A6E5D] hover:text-[#2D3A2F]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{tx('Back', 'वापस', 'পিছলৈ')}</span>
        </button>

        <span className="text-xs font-extrabold text-[#E8B25C] bg-[#FDF0D5] px-2.5 py-1 rounded-full">
          {tx('Community Health Portal', 'सामुदायिक स्वास्थ्य', 'স্বাস্থ্য প’ৰ্টেল')}
        </span>
      </div>

      <div className="w-full bg-white p-6 rounded-3xl border border-[#E0DCD3] shadow-sm space-y-5">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FDF0D5] text-[#332610] flex items-center justify-center shadow-xs">
            <Stethoscope className="w-7 h-7 text-[#E8B25C]" />
          </div>
          <h2 className="text-xl font-black text-[#2D3A2F]">
            {tx('ASHA Worker Access', 'आशा कार्यकर्ता प्रवेश', 'আশা কৰ্মী প্ৰৱেশ')}
          </h2>
          <p className="text-xs text-[#5A6E5D]">
            {tx(
              'Field verification, home visit logs & clinical telemetry inspection',
              'क्षेत्र सत्यापन, गृह भ्रमण लॉग और नैदानिक टेलीमेट्री निरीक्षण',
              'ক্ষেত্ৰ নিৰীক্ষণ, ঘৰুৱা পৰিদৰ্শন আৰু বৌদ্ধিক স্বাস্থ্য পৰীক্ষা'
            )}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-[#5A6E5D] mb-1">
              {tx('ASHA Worker ID / Government Health Code', 'आशा कार्यकर्ता आईडी', 'আশা ৱৰ্কাৰ আইডি')}
            </label>
            <input
              type="text"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              placeholder="e.g. ASHA-KAM-042"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] text-sm font-semibold text-[#2D3A2F] focus:outline-[#5B825B]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5A6E5D] mb-1">
              {tx('4-Digit Portal Passcode', '4-अंकीय पोर्टल पासकोड', '৪-অংকৰ প’ৰ্টেল পাছক’ড')}
            </label>
            <input
              type="password"
              maxLength={6}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="••••"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] text-sm font-semibold text-[#2D3A2F] focus:outline-[#5B825B]"
              required
            />
          </div>

          <div className="pt-1">
            <label className="block text-xs font-bold text-[#5A6E5D] mb-1">
              {tx('ASHA Name & Assigned Sub-Centre', 'आशा नाम और उप-केंद्र', 'আশাৰ নাম আৰু উপ-কেন্দ্ৰ')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jonali Barman"
                className="px-3 py-2 rounded-xl bg-[#FDFBF7] border border-[#E0DCD3] text-xs font-semibold text-[#2D3A2F]"
              />
              <input
                type="text"
                value={subCentre}
                onChange={(e) => setSubCentre(e.target.value)}
                placeholder="Sonapur Sub-Centre"
                className="px-3 py-2 rounded-xl bg-[#FDFBF7] border border-[#E0DCD3] text-xs font-semibold text-[#2D3A2F]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-[#2D3A2F] text-white font-black text-sm shadow-sm hover:bg-[#1f2921] transition-all cursor-pointer mt-2"
          >
            {tx('Verify & Open ASHA Dashboard →', 'सत्यापित करें और डैशबोर्ड खोलें →', 'প্ৰমাণিত কৰি ডেচব’ৰ্ড খোলক →')}
          </button>
        </form>

        <div className="pt-2 border-t border-[#EAE6DF] text-center">
          <p className="text-[11px] text-[#5A6E5D]">
            {tx('Demo Credentials Pre-filled for Field Validation', 'सत्यापन के लिए डेमो क्रेडेंशियल भरे गए हैं', 'পৰীক্ষণৰ বাবে ডেম’ তথ্য ভৰোৱা হৈছে')}
          </p>
        </div>
      </div>
    </div>
  );
};
