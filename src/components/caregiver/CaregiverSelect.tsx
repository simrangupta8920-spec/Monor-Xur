import React from 'react';
import { ArrowLeft, Users, Stethoscope, ShieldCheck, Gamepad2 } from 'lucide-react';
import { AppRole } from '../../types';
import { soundController } from '../../utils/audio';
import { useLanguage } from '../../context/LanguageContext';

interface CaregiverSelectProps {
  onSelectRole: (role: AppRole) => void;
  onBack: () => void;
  patientName?: string;
  onOpenSetup?: () => void;
}

export const CaregiverSelect: React.FC<CaregiverSelectProps> = ({ 
  onSelectRole, 
  onBack,
  patientName = 'Player',
  onOpenSetup,
}) => {
  const { tx } = useLanguage();

  return (
    <div className="p-4 pb-24 space-y-5 animate-fadeIn">
      {/* Brand Header */}
      <div className="flex items-center justify-between bg-white rounded-3xl p-4 border border-[#E0DCD3] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[#5B825B]/30 bg-[#FDFBF7]">
            <img 
              src="/logo.jpg" 
              alt="Monor Xur" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#2D3A2F] leading-tight">
              {tx('Caregiver Portals', 'देखभालकर्ता पोर्टल')}
            </h2>
            <p className="text-xs text-[#5A6E5D]">
              {tx('Choose your access portal or return to play', 'अपना एक्सेस पोर्टल चुनें या खेलने के लिए वापस जाएं')}
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-2 rounded-2xl bg-[#EAF1E8] border border-[#5B825B]/30 text-xs font-black text-[#5B825B] flex items-center gap-1.5 hover:bg-[#d8ebd5] active:scale-95"
          title={tx('Return to Player Mode', 'प्लेयर मोड पर लौटें')}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>{tx('Player Mode', 'प्लेयर मोड')}</span>
        </button>
      </div>

      <div className="space-y-3.5">
        {/* Quick return to Player Mode card */}
        <div
          onClick={() => {
            soundController.playClick();
            onBack();
          }}
          className="bg-gradient-to-br from-[#EAF1E8] to-[#DCEAD2] p-5 rounded-3xl border-2 border-[#5B825B]/30 shadow-xs hover:border-[#5B825B] hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#5B825B] text-white flex items-center justify-center shadow-xs">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#5B825B] bg-white/80 px-2 py-0.5 rounded-full">
                  {tx('Primary Mode', 'मुख्य मोड')}
                </span>
                <h3 className="text-lg font-black text-[#2D3A2F] mt-0.5">
                  {tx('Player Mode (Elder Friendly)', 'प्लेयर मोड (बुजुर्गों के अनुकूल)')}
                </h3>
                <p className="text-xs text-[#2D3A2F]/75">
                  {tx(`Designed for ${patientName} to enjoy games, stories, and calm`, `${patientName} के लिए खेल, कहानियां और शांति का आनंद लेने के लिए डिज़ाइन किया गया`)}
                </p>
              </div>
            </div>
            <span className="px-3.5 py-1.5 rounded-xl bg-[#5B825B] text-white font-black text-xs shrink-0">
              {tx('Enter →', 'प्रवेश करें →')}
            </span>
          </div>
        </div>

        {/* Family Caregiver Option */}
        <div
          onClick={() => {
            soundController.playClick();
            onSelectRole('family_login');
          }}
          className="bg-white p-6 rounded-3xl border-2 border-[#E0DCD3] shadow-xs hover:border-[#5B825B] hover:shadow-md transition-all active:scale-[0.98] cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-14 h-14 rounded-2xl bg-[#D4E4E6] text-[#1C2A2D] flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <span className="px-3 py-1 rounded-full bg-[#EAF1E8] text-[#5B825B] text-xs font-black">
              {tx('Full Care Access', 'पूर्ण देखभाल पहुंच')}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-black text-[#2D3A2F]">
              {tx('Family Caregiver', 'पारिवारिक देखभालकर्ता')}
            </h3>
            <p className="text-sm text-[#5A6E5D] mt-1">
              {tx(
                `Manage ${patientName}'s profile, memories, medical consultations, calendar appointments, and track adaptive cognitive game telemetry.`,
                `${patientName} की प्रोफ़ाइल, यादें, चिकित्सा परामर्श, कैलेंडर अपॉइंटमेंट प्रबंधित करें और गेम टेलीमेट्री ट्रैक करें।`
              )}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs font-black text-[#5B825B]">
            <span>{tx('Secured via 4-digit PIN', '4-अंकीय पिन द्वारा सुरक्षित')}</span>
            <span className="px-4 py-2 rounded-xl bg-[#5B825B] text-white">
              {tx('Enter PIN →', 'पिन दर्ज करें →')}
            </span>
          </div>
        </div>

        {/* ASHA / Health Worker Option */}
        <div
          onClick={() => {
            soundController.playClick();
            onSelectRole('asha_login');
          }}
          className="bg-white p-6 rounded-3xl border-2 border-[#E0DCD3] shadow-xs hover:border-[#7A9CA4] hover:shadow-md transition-all active:scale-[0.98] cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-14 h-14 rounded-2xl bg-[#FDF0D5] text-[#332610] flex items-center justify-center">
              <Stethoscope className="w-7 h-7 text-[#E8B25C]" />
            </div>
            <span className="px-3 py-1 rounded-full bg-[#FDF0D5] text-[#332610] text-xs font-black">
              {tx('Field & Community', 'क्षेत्र और समुदाय')}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-black text-[#2D3A2F]">
              {tx('ASHA / Health Worker', 'आशा / स्वास्थ्य कार्यकर्ता')}
            </h3>
            <p className="text-sm text-[#5A6E5D] mt-1">
              {tx(
                'Focused community health worker portal with cognitive status reports, follow-up checklist, and clinical guidance disclaimers.',
                'संज्ञानात्मक स्थिति रिपोर्ट, फॉलो-अप चेकलिस्ट और नैदानिक मार्गदर्शन के साथ सामुदायिक स्वास्थ्य कार्यकर्ता पोर्टल।'
              )}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs font-black text-[#5A6E5D]">
            <span>{tx('Worker ID & Password', 'कार्यकर्ता आईडी और पासवर्ड')}</span>
            <span className="px-4 py-2 rounded-xl bg-[#2D3A2F] text-white">
              {tx('Sign In →', 'लॉग इन करें →')}
            </span>
          </div>
        </div>

        {/* Re-open Setup Button */}
        {onOpenSetup && (
          <div className="pt-2 text-center">
            <button
              onClick={() => {
                soundController.playClick();
                onOpenSetup();
              }}
              className="px-4 py-2.5 rounded-2xl bg-white border border-[#E0DCD3] text-xs font-extrabold text-[#5A6E5D] hover:bg-[#FAF8F5] transition-colors inline-flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#5B825B]" />
              <span>{tx('Edit Setup & Profiles (Player, Medical, PIN)', 'सेटअप और प्रोफ़ाइल संपादित करें (प्लेयर, मेडिकल, पिन)')}</span>
            </button>
          </div>
        )}
      </div>

      <div className="p-4 rounded-3xl bg-[#FDFBF7] border border-[#E0DCD3] flex items-center gap-3 text-xs text-[#5A6E5D]">
        <ShieldCheck className="w-6 h-6 text-[#5B825B] shrink-0" />
        <span>
          {tx(
            'Caregiver authentication keeps private memories, medical details, and routines safe and organized.',
            'देखभालकर्ता प्रमाणीकरण निजी यादों, चिकित्सा विवरणों और दिनचर्या को सुरक्षित और व्यवस्थित रखता है।'
          )}
        </span>
      </div>
    </div>
  );
};
