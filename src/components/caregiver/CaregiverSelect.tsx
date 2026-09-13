import React from 'react';
import { ArrowLeft, Users, Stethoscope, ShieldCheck, Gamepad2, Cloud, CloudOff, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { AppRole } from '../../types';
import { soundController } from '../../utils/audio';
import { useLanguage } from '../../context/LanguageContext';
import { User } from 'firebase/auth';

interface CaregiverSelectProps {
  onSelectRole: (role: AppRole) => void;
  onBack: () => void;
  patientName?: string;
  onOpenSetup?: () => void;
  currentUser?: User | null;
  onSignInGoogle?: () => Promise<void>;
  onSignOutGoogle?: () => Promise<void>;
}

export const CaregiverSelect: React.FC<CaregiverSelectProps> = ({ 
  onSelectRole, 
  onBack,
  patientName = 'Player',
  onOpenSetup,
  currentUser,
  onSignInGoogle,
  onSignOutGoogle,
}) => {
  const { tx } = useLanguage();
  const [authLoading, setAuthLoading] = React.useState(false);

  const handleGoogleAuth = async () => {
    if (!onSignInGoogle) return;
    try {
      setAuthLoading(true);
      await onSignInGoogle();
    } catch (err) {
      console.warn('Google sign-in action notice:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!onSignOutGoogle) return;
    try {
      setAuthLoading(true);
      await onSignOutGoogle();
    } catch (err) {
      console.warn('Sign-out action notice:', err);
    } finally {
      setAuthLoading(false);
    }
  };

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
              {tx('Caregiver Portals', 'देखभालकर्ता पोर्टल', 'সেৱাযত্নকাৰী প’ৰ্টেল')}
            </h2>
            <p className="text-xs text-[#5A6E5D]">
              {tx('Choose your access portal or return to play', 'अपना एक्सेस पोर्टल चुनें या खेलने के लिए वापस जाएं', 'আপোনাৰ প্ৰৱেশ প’ৰ্টেল বাছক বা খেলিবলৈ উভতি যাওক')}
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-2 rounded-2xl bg-[#EAF1E8] border border-[#5B825B]/30 text-xs font-black text-[#5B825B] flex items-center gap-1.5 hover:bg-[#d8ebd5] active:scale-95"
          title={tx('Return to Player Mode', 'प्लेयर मोड पर लौटें', 'প্লেয়াৰ ম’ডলৈ উভতি যাওক')}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>{tx('Player Mode', 'प्लेयर मोड', 'প্লেয়াৰ ম’ড')}</span>
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
                  {tx('Primary Mode', 'मुख्य मोड', 'প্ৰাথমিক ম’ড')}
                </span>
                <h3 className="text-lg font-black text-[#2D3A2F] mt-0.5">
                  {tx('Player Mode (Elder Friendly)', 'प्लेयर मोड (बुजुर्गों के अनुकूल)', 'প্লেয়াৰ ম’ড (জেষ্ঠ্যসুলভ)')}
                </h3>
                <p className="text-xs text-[#2D3A2F]/75">
                  {tx(
                    `Designed for ${patientName} to enjoy games, stories, and calm`,
                    `${patientName} के लिए खेल, कहानियां और शांति का आनंद लेने के लिए डिज़ाइन किया गया`,
                    `${patientName}ৰ বাবে খেল, সাধু আৰু শান্তি উপভোগ কৰিবলৈ নিৰ্মিত`
                  )}
                </p>
              </div>
            </div>
            <span className="px-3.5 py-1.5 rounded-xl bg-[#5B825B] text-white font-black text-xs shrink-0">
              {tx('Enter →', 'प्रवेश करें →', 'সোমাওক →')}
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
              {tx('Full Care Access', 'पूर्ण देखभाल पहुंच', 'সম্পূৰ্ণ সেৱা প্ৰৱেশাধিকাৰ')}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-black text-[#2D3A2F]">
              {tx('Family Caregiver', 'पारिवारिक देखभालकर्ता', 'পৰিয়ালৰ সেৱাযত্নকাৰী')}
            </h3>
            <p className="text-sm text-[#5A6E5D] mt-1">
              {tx(
                `Manage ${patientName}'s profile, memories, medical consultations, calendar appointments, and track adaptive cognitive game telemetry.`,
                `${patientName} की प्रोफ़ाइल, यादें, चिकित्सा परामर्श, कैलेंडर अपॉइंटमेंट प्रबंधित करें और गेम टेलीमेट्री ट्रैक करें।`,
                `${patientName}ৰ প্ৰ’ফাইল, স্মৃতি, চিকিৎসাজনিত পৰামৰ্শ, কেলেণ্ডাৰৰ সময়সূচী নিয়ন্ত্ৰণ কৰক আৰু বৌদ্ধিক খেলৰ তথ্য পৰ্যবেক্ষণ কৰক।`
              )}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs font-black text-[#5B825B]">
            <span>{tx('Secured via 4-digit PIN', '4-अंकीय पिन द्वारा सुरक्षित', '৪-অংকৰ পিনৰ দ্বাৰা সুৰক্ষিত')}</span>
            <span className="px-4 py-2 rounded-xl bg-[#5B825B] text-white">
              {tx('Enter PIN →', 'पिन दर्ज करें →', 'পিন দিয়ক →')}
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
              {tx('Field & Community', 'क्षेत्र और समुदाय', 'ক্ষেত্ৰ আৰু সম্প্ৰদায়')}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-black text-[#2D3A2F]">
              {tx('ASHA / Health Worker', 'आशा / स्वास्थ्य कार्यकर्ता', 'আশা / স্বাস্থ্যকৰ্মী')}
            </h3>
            <p className="text-sm text-[#5A6E5D] mt-1">
              {tx(
                'Focused community health worker portal with cognitive status reports, follow-up checklist, and clinical guidance disclaimers.',
                'संज्ञानात्मक स्थिति रिपोर्ट, फॉलो-अप चेकलिस्ट और नैदानिक मार्गदर्शन के साथ सामुदायिक स्वास्थ्य कार्यकर्ता पोर्टल।',
                'বৌদ্ধিক স্থিতিৰ প্ৰতিবেদন, পৰৱৰ্তী পৰীক্ষাৰ তালিকা আৰু চিকিৎসা পৰামৰ্শৰ সৈতে আশা স্বাস্থ্যকৰ্মীৰ বিশেষ প’ৰ্টেল।'
              )}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs font-black text-[#5A6E5D]">
            <span>{tx('Worker ID & Password', 'कार्यकर्ता आईडी और पासवर्ड', 'কৰ্মী আইডি আৰু পাছৱৰ্ড')}</span>
            <span className="px-4 py-2 rounded-xl bg-[#2D3A2F] text-white">
              {tx('Sign In →', 'लॉग इन करें →', 'লগ ইন কৰক →')}
            </span>
          </div>
        </div>

        {/* Cloud Synchronization Section */}
        <div className="bg-white p-5 rounded-3xl border-2 border-[#E0DCD3] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${currentUser ? 'bg-[#EAF1E8] text-[#5B825B]' : 'bg-[#F2EFE9] text-[#5A6E5D]'}`}>
                {currentUser ? <Cloud className="w-6 h-6 text-[#5B825B]" /> : <CloudOff className="w-6 h-6 text-[#8C827A]" />}
              </div>
              <div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${currentUser ? 'bg-[#EAF1E8] text-[#5B825B]' : 'bg-[#F2EFE9] text-[#5A6E5D]'}`}>
                  {currentUser ? tx('Live Cloud Sync Active', 'क्लाउड सिंक सक्रिय', 'ক্লাউড চিন্ক সক্ৰিয়') : tx('Offline / Local Mode', 'ऑफ़लाइन / स्थानीय मोड', 'অফলাইন / স্থানীয় ম’ড')}
                </span>
                <h4 className="text-sm font-black text-[#2D3A2F] mt-0.5">
                  {currentUser 
                    ? (currentUser.email || currentUser.displayName || tx('Caregiver Account Connected', 'देखभालकर्ता खाता कनेक्टेड', 'সেৱাযত্নকাৰী একাউণ্ট সংযোগিত'))
                    : tx('Cross-Device Cloud Sync', 'मल्टी-डिवाइस क्लाउड सिंक', 'একাধিক ডিভাইচ ক্লাউড চিন্ক')}
                </h4>
                <p className="text-xs text-[#5A6E5D]">
                  {currentUser
                    ? tx('All memories, appointments, and care logs synchronize automatically.', 'सभी यादें, अपॉइंटमेंट और केयर लॉग स्वचालित रूप से सिंक होते हैं।', 'সকলো স্মৃতি, নিযুক্তি আৰু সেৱা লগ স্বয়ংক্ৰিয়ভাৱে চিন্ক হয়।')
                    : tx('Sign in with your Google account to sync memories & telemetry across phones.', 'फ़ोन पर यादों और टेलीमेट्री को सिंक करने के लिए अपने Google खाते से साइन इन करें।', 'মোবাইলসমূহত স্মৃতি আৰু তথ্য সংৰক্ষণ কৰিবলৈ আপোনাৰ গুগল একাউণ্টেৰে লগ ইন কৰক।')}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-end">
            {currentUser ? (
              <button
                onClick={handleSignOut}
                disabled={authLoading}
                className="px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD3] text-xs font-bold text-[#8C827A] hover:text-[#C55345] hover:border-[#C55345]/30 flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{authLoading ? '...' : tx('Disconnect Cloud Account', 'क्लाउड खाता डिस्कनेक्ट करें', 'ক্লাউড একাউণ্ট আঁতৰাওক')}</span>
              </button>
            ) : (
              <button
                onClick={handleGoogleAuth}
                disabled={authLoading}
                className="px-4 py-2.5 rounded-xl bg-[#2D3A2F] hover:bg-[#1C2A2D] text-white text-xs font-black flex items-center gap-2 shadow-xs active:scale-95 transition-all"
              >
                <LogIn className="w-4 h-4 text-[#E8B25C]" />
                <span>{authLoading ? '...' : tx('Sign in with Google', 'Google से साइन इन करें', 'Google ৰে ছাইন ইন কৰক')}</span>
              </button>
            )}
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
              <span>{tx('Edit Setup & Profiles (Player, Medical, PIN)', 'सेटअप और प्रोफ़ाइल संपादित करें (प्लेयर, मेडिकल, पिन)', 'ছেটআপ আৰু প্ৰ’ফাইল সম্পাদনা কৰক (খেলুৱৈ, চিকিৎসা, পিন)')}</span>
            </button>
          </div>
        )}
      </div>

      <div className="p-4 rounded-3xl bg-[#FDFBF7] border border-[#E0DCD3] flex items-center gap-3 text-xs text-[#5A6E5D]">
        <ShieldCheck className="w-6 h-6 text-[#5B825B] shrink-0" />
        <span>
          {tx(
            'Caregiver authentication keeps private memories, medical details, and routines safe and organized.',
            'देखभालकर्ता प्रमाणीकरण निजी यादों, चिकित्सा विवरणों और दिनचर्या को सुरक्षित और व्यवस्थित रखता है।',
            'সেৱাযত্নকাৰীৰ প্ৰমাণীকৰণে ব্যক্তিগত স্মৃতি, চিকিৎসা তথ্য আৰু দৈনন্দিন নিয়মসমূহ সুৰক্ষিত আৰু শৃংখলিত কৰি ৰাখে।'
          )}
        </span>
      </div>
    </div>
  );
};
