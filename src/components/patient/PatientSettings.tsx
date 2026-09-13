import React, { useState } from 'react';
import { Type, Volume2, Bell, PhoneCall, Stethoscope, Check, HeartHandshake, Wifi, WifiOff, HardDrive, ShieldCheck, Languages, Palette, Sparkles } from 'lucide-react';
import { PatientProfile, EmergencyContact } from '../../types';
import { soundController } from '../../utils/audio';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { getOfflineSnapshot } from '../../services/offlineStorage';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme, AppTheme } from '../../context/ThemeContext';

interface PatientSettingsProps {
  onOpenCaregiverSelect: () => void;
  onCallEmergency: () => void;
  patientProfile?: PatientProfile;
  contacts?: EmergencyContact[];
  onOpenSetup?: () => void;
}

export const PatientSettings: React.FC<PatientSettingsProps> = ({
  onOpenCaregiverSelect,
  onCallEmergency,
  patientProfile,
  contacts = [],
  onOpenSetup,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { language, setLanguage, t, tx, isHindi, isAssamese } = useLanguage();
  const { theme, setTheme, toggleTheme, isNorthEast, largeText, toggleLargeText } = useTheme();

  const playerName = patientProfile?.name || (isAssamese ? 'খেলুৱৈ' : isHindi ? 'खिलाड़ी' : 'Player');
  const playerFullName = patientProfile?.fullName || (isAssamese ? 'মনৰ অন্বেষক' : isHindi ? 'माइंड एक्सप्लोरर' : 'Mind Explorer');
  const primaryContact = contacts[0];
  const isOnline = useOnlineStatus();
  const offlineData = getOfflineSnapshot();
  const cachedRemindersCount = offlineData?.reminders?.length || 0;

  const handleSelectTheme = (newTheme: AppTheme) => {
    if (newTheme === theme) return;
    soundController.playClick();
    setTheme(newTheme);
    if (newTheme === 'northeast') {
      if (language === 'as') {
        soundController.speak('উত্তৰ-পূব ঐতিহ্যৰ ৰং নিৰ্ধাৰণ কৰা হ’ল।', undefined, 'as');
      } else if (language === 'hi') {
        soundController.speak('उत्तर-पूर्व हेरिटेज पैलेट सेट किया गया।', undefined, 'hi');
      } else {
        soundController.speak('North Eastern Heritage palette activated.', undefined, 'en');
      }
    } else {
      if (language === 'as') {
        soundController.speak('চিৰাচৰিত চাহ বাগিচাৰ সেউজীয়া ৰং নিৰ্ধাৰণ কৰা হ’ল।', undefined, 'as');
      } else if (language === 'hi') {
        soundController.speak('क्लासिक चाय बगान पैलेट सेट किया गया।', undefined, 'hi');
      } else {
        soundController.speak('Classic Tea Garden palette activated.', undefined, 'en');
      }
    }
  };

  const handleSelectLanguage = (newLang: 'en' | 'hi' | 'as') => {
    if (newLang === language) return;
    soundController.playClick();
    setLanguage(newLang);
    if (newLang === 'as') {
      soundController.speak('ভাষা অসমীয়ালৈ নিৰ্ধাৰণ কৰা হ’ল।', undefined, 'as');
    } else if (newLang === 'hi') {
      soundController.speak('भाषा हिन्दी पर सेट कर दी गई है।', undefined, 'hi');
    } else {
      soundController.speak('Language set to English.', undefined, 'en');
    }
  };

  const testReadAloud = () => {
    if (language === 'as') {
      soundController.speak(`নমস্কাৰ ${playerName}। কথা কোৱা মাত স্পষ্টভাৱে চলি আছে।`, undefined, 'as');
    } else if (language === 'hi') {
      soundController.speak(`नमस्ते ${playerName}। बोलने वाली आवाज़ साफ़ और स्पष्ट काम कर रही है।`, undefined, 'hi');
    } else {
      soundController.speak(`Hello ${playerName}. Read aloud is working warmly and clearly.`, undefined, 'en');
    }
  };

  return (
    <div className="p-4 pb-24 space-y-4 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-black text-[#2D3A2F]">{t('preferencesTitle')}</h2>
        <p className="text-sm text-[#5A6E5D]">{t('preferencesSub')}</p>
      </div>

      {/* Active Player Card */}
      <div className="bg-white rounded-3xl p-4 border border-[#E0DCD3] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[#5B825B]/30">
            <img 
              src={patientProfile?.avatar || "/logo.jpg"} 
              alt={playerFullName} 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer" 
            />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase text-[#5B825B] bg-[#EAF1E8] px-2 py-0.5 rounded-full">
              {t('activePlayer')}
            </span>
            <h3 className="text-base font-black text-[#2D3A2F] mt-0.5">{playerFullName}</h3>
            <p className="text-xs text-[#5A6E5D]">{tx('Loving Care Active • Play at your own pace', 'सप्रेम देखभाल सक्रिय • अपनी गति से खेलें', 'মৰমীয়াল যত্ন সক্ৰিয় • নিজৰ গতিত খেলক')}</p>
          </div>
        </div>
      </div>

      {/* North Eastern States & Classic Palette Theme Bar */}
      <div id="theme-settings-section" className="bg-white rounded-3xl p-5 border-2 border-[#5B825B]/30 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#EAF1E8] text-[#5B825B] flex items-center justify-center shrink-0">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-base text-[#2D3A2F]">{t('themeSettingTitle')}</h4>
                <span className="text-[10px] font-black uppercase text-[#5B825B] bg-[#EAF1E8] px-2 py-0.5 rounded-full">
                  {isNorthEast ? 'North East' : 'Default'}
                </span>
              </div>
              <p className="text-xs text-[#5A6E5D]">{t('themeSettingSub')}</p>
            </div>
          </div>

          {/* Quick Toggle Bar Switch */}
          <button
            onClick={toggleTheme}
            className={`w-14 h-8 rounded-full transition-colors p-1 flex items-center shrink-0 cursor-pointer ${
              isNorthEast ? 'bg-[#B23B2A] justify-end' : 'bg-[#5B825B] justify-start'
            }`}
            title="Toggle theme palette"
            aria-label="Toggle between Default and North Eastern theme"
          >
            <div className="w-6 h-6 rounded-full bg-white shadow-xs flex items-center justify-center text-[11px]">
              {isNorthEast ? '🌺' : '🌿'}
            </div>
          </button>
        </div>

        {/* Segmented Palette Selector Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Default Theme Card (Classic Tea Garden) */}
          <button
            onClick={() => handleSelectTheme('default')}
            className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col text-left cursor-pointer relative ${
              theme === 'default'
                ? 'border-[#5B825B] bg-[#EAF1E8] text-[#2D3A2F] shadow-xs scale-[1.01]'
                : 'border-[#E0DCD3] bg-[#FDFBF7] text-[#5A6E5D] hover:bg-white'
            }`}
          >
            {theme === 'default' && (
              <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#5B825B] text-white flex items-center justify-center text-[10px]">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            )}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">🌿</span>
              <span className="font-black text-sm block text-[#2D3A2F]">{t('themeDefaultLabel')}</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-white border border-[#E0DCD3] text-[#5A6E5D]">
                Default
              </span>
            </div>
            <p className="text-xs text-[#5A6E5D] mb-2.5">{t('themeDefaultDesc')}</p>
            
            {/* Color Swatches */}
            <div className="flex items-center gap-1.5 mt-auto pt-1">
              <div className="w-5 h-5 rounded-full bg-[#5B825B] border border-white shadow-xs" title="Assam Tea Green (#5B825B)" />
              <div className="w-5 h-5 rounded-full bg-[#EAF1E8] border border-[#E0DCD3] shadow-xs" title="Tea Mist Ivory (#EAF1E8)" />
              <div className="w-5 h-5 rounded-full bg-[#FDFBF7] border border-[#E0DCD3] shadow-xs" title="Warm Cream (#FDFBF7)" />
              <div className="w-5 h-5 rounded-full bg-[#2D3A2F] border border-white shadow-xs" title="Dark Moss Slate (#2D3A2F)" />
              <span className="text-[11px] font-bold text-[#5A6E5D] ml-1">Assam Tea Garden</span>
            </div>
          </button>

          {/* North Eastern States Heritage Theme Card */}
          <button
            onClick={() => handleSelectTheme('northeast')}
            className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col text-left cursor-pointer relative ${
              theme === 'northeast'
                ? 'border-[#B23B2A] bg-[#FCEEEB] text-[#2B1E1C] shadow-xs scale-[1.01]'
                : 'border-[#E0DCD3] bg-[#FDFBF7] text-[#5A6E5D] hover:bg-white'
            }`}
          >
            {theme === 'northeast' && (
              <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#B23B2A] text-white flex items-center justify-center text-[10px]">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            )}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">🌺</span>
              <span className="font-black text-sm block text-[#2D3A2F]">{t('themeNorthEastLabel')}</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-[#FAF6F0] border border-[#E5D9D3] text-[#B23B2A]">
                NE States
              </span>
            </div>
            <p className="text-xs text-[#5A6E5D] mb-2.5">{t('themeNorthEastDesc')}</p>

            {/* Color Swatches */}
            <div className="flex items-center gap-1.5 mt-auto pt-1">
              <div className="w-5 h-5 rounded-full bg-[#B23B2A] border border-white shadow-xs" title="Gamusa Crimson (#B23B2A)" />
              <div className="w-5 h-5 rounded-full bg-[#D97706] border border-white shadow-xs" title="Muga Golden Silk (#D97706)" />
              <div className="w-5 h-5 rounded-full bg-[#FAF6F0] border border-[#E5D9D3] shadow-xs" title="Eri Silk Ivory (#FAF6F0)" />
              <div className="w-5 h-5 rounded-full bg-[#3D6B75] border border-white shadow-xs" title="Patkai Blue Hills (#3D6B75)" />
              <span className="text-[11px] font-bold text-[#5A6E5D] ml-1">Seven Sisters</span>
            </div>
          </button>
        </div>

        {/* North Eastern Cultural States Footnote */}
        <div className="bg-[#FDFBF7] p-2.5 rounded-2xl border border-[#EAE4D6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] text-[#5A6E5D]">
          <span className="font-bold flex items-center gap-1 text-[#2D3A2F]">
            <Sparkles className="w-3.5 h-3.5 text-[#E8B25C]" />
            {tx('Seven Sisters & Sikkim Cultural Heritage Palette', 'सेवन सिस्टर्स एवं सिक्किम सांस्कृतिक हेरिटेज', 'সাতভনী আৰু ছিক্কিমৰ ঐতিহ্যমণ্ডিত ৰং')}
          </span>
          <span className="text-[10px] font-semibold text-[#8A8070]">
            Assam • Meghalaya • Nagaland • Manipur • Mizoram • Arunachal • Tripura • Sikkim
          </span>
        </div>
      </div>

      {/* Language Switcher Setting Option (Hindi & English) */}
      <div className="bg-white rounded-3xl p-5 border-2 border-[#5B825B]/30 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#EAF1E8] text-[#5B825B] flex items-center justify-center shrink-0">
            <Languages className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-[#2D3A2F]">{t('languageSettingTitle')}</h4>
            <p className="text-xs text-[#5A6E5D]">{t('languageSettingSub')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* English Switch Button */}
          <button
            onClick={() => handleSelectLanguage('en')}
            className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center relative ${
              language === 'en'
                ? 'border-[#5B825B] bg-[#EAF1E8] text-[#2D3A2F] shadow-xs scale-[1.02]'
                : 'border-[#E0DCD3] bg-[#FDFBF7] text-[#5A6E5D] hover:bg-white'
            }`}
          >
            {language === 'en' && (
              <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#5B825B] text-white flex items-center justify-center text-[10px]">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            )}
            <span className="text-2xl">🇬🇧</span>
            <span className="font-black text-sm block">English</span>
            <span className="text-[11px] font-bold text-[#5A6E5D]">
              {language === 'en' ? t('activeBadge') : 'English'}
            </span>
          </button>

          {/* Hindi Switch Button */}
          <button
            onClick={() => handleSelectLanguage('hi')}
            className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center relative ${
              language === 'hi'
                ? 'border-[#5B825B] bg-[#EAF1E8] text-[#2D3A2F] shadow-xs scale-[1.02]'
                : 'border-[#E0DCD3] bg-[#FDFBF7] text-[#5A6E5D] hover:bg-white'
            }`}
          >
            {language === 'hi' && (
              <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#5B825B] text-white flex items-center justify-center text-[10px]">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            )}
            <span className="text-2xl">🇮🇳</span>
            <span className="font-black text-sm block">हिन्दी (Hindi)</span>
            <span className="text-[11px] font-bold text-[#5A6E5D]">
              {language === 'hi' ? t('activeBadge') : 'हिन्दी'}
            </span>
          </button>

          {/* Assamese Switch Button */}
          <button
            onClick={() => handleSelectLanguage('as')}
            className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center relative ${
              language === 'as'
                ? 'border-[#5B825B] bg-[#EAF1E8] text-[#2D3A2F] shadow-xs scale-[1.02]'
                : 'border-[#E0DCD3] bg-[#FDFBF7] text-[#5A6E5D] hover:bg-white'
            }`}
          >
            {language === 'as' && (
              <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#5B825B] text-white flex items-center justify-center text-[10px]">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            )}
            <span className="text-2xl">🌿</span>
            <span className="font-black text-sm block">অসমীয়া (Assamese)</span>
            <span className="text-[11px] font-bold text-[#5A6E5D]">
              {language === 'as' ? t('activeBadge') : 'অসমীয়া'}
            </span>
          </button>
        </div>
      </div>

      {/* Offline & Service Worker Resilience Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
              isOnline ? 'bg-[#EAF1E8] text-[#5B825B]' : 'bg-[#FDF0D5] text-[#8B5E3C]'
            }`}>
              {isOnline ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-base text-[#2D3A2F]">{t('offlineReadiness')}</h4>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  isOnline ? 'bg-[#EAF1E8] text-[#5B825B]' : 'bg-[#FDF0D5] text-[#8B5E3C]'
                }`}>
                  {isOnline ? t('cloudSynced') : t('offlineMode')}
                </span>
              </div>
              <p className="text-xs text-[#5A6E5D]">
                {t('serviceWorkerActive')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-[#EAE4D6] space-y-1.5 text-xs text-[#5A6E5D]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5B825B]" /> {t('coreProfile')}
            </span>
            <span className="font-bold text-[#2D3A2F]">{t('cachedLocally')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-[#5B825B]" /> {t('todayDailyPlan')}
            </span>
            <span className="font-bold text-[#2D3A2F]">{t('routineItemsCount', { count: cachedRemindersCount })}</span>
          </div>
        </div>

        <div className="pt-1 flex items-center justify-between">
          <span className="text-xs text-[#5A6E5D]">{t('installHomeScreen')}</span>
          <PWAInstallButton />
        </div>
      </div>

      <div className="space-y-3">
        {/* Large Text Preference */}
        <div 
          id="extra-large-text-setting"
          className={`rounded-3xl p-5 border shadow-xs flex items-center justify-between transition-all ${
            largeText 
              ? 'bg-[#F7FAF7] border-[#5B825B] ring-1 ring-[#5B825B]/30' 
              : 'bg-white border-[#E0DCD3]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
              largeText ? 'bg-[#5B825B] text-white' : 'bg-[#EAF1E8] text-[#5B825B]'
            }`}>
              <Type className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-base text-[#2D3A2F]">{t('extraLargeText')}</h4>
                {largeText && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#EAF1E8] text-[#5B825B] border border-[#5B825B]/30">
                    {language === 'as' ? 'সক্ৰিয়' : language === 'hi' ? 'सक्रिय' : 'Active'}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#5A6E5D]">{t('extraLargeTextSub')}</p>
            </div>
          </div>
          <button
            id="extra-large-text-toggle"
            role="switch"
            aria-checked={largeText}
            aria-label={t('extraLargeText')}
            onClick={() => {
              soundController.playClick();
              toggleLargeText();
              if (soundEnabled) {
                if (!largeText) {
                  if (language === 'as') {
                    soundController.speak('ডাঙৰ আখৰ সক্ৰিয় কৰা হ’ল।', undefined, 'as');
                  } else if (language === 'hi') {
                    soundController.speak('बड़ा फ़ॉन्ट सक्रिय किया गया।', undefined, 'hi');
                  } else {
                    soundController.speak('Extra large text enabled.', undefined, 'en');
                  }
                } else {
                  if (language === 'as') {
                    soundController.speak('স্বাভাৱিক ফন্ট নিৰ্ধাৰণ কৰা হ’ল।', undefined, 'as');
                  } else if (language === 'hi') {
                    soundController.speak('सामान्य फ़ॉन्ट सेट किया गया।', undefined, 'hi');
                  } else {
                    soundController.speak('Standard text size restored.', undefined, 'en');
                  }
                }
              }
            }}
            className={`w-14 h-8 rounded-full transition-colors p-1 flex items-center cursor-pointer shadow-inner ${
              largeText ? 'bg-[#5B825B] justify-end' : 'bg-gray-200 justify-start'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-white shadow-xs transition-transform" />
          </button>
        </div>

        {/* Sound Feedback */}
        <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FDF0D5] text-[#E8B25C] flex items-center justify-center">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-[#2D3A2F]">{t('audioChimes')}</h4>
              <p className="text-xs text-[#5A6E5D]">{t('audioChimesSub')}</p>
            </div>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-14 h-8 rounded-full transition-colors p-1 flex items-center ${
              soundEnabled ? 'bg-[#5B825B] justify-end' : 'bg-gray-200 justify-start'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-white shadow-xs" />
          </button>
        </div>

        {/* Read Aloud Voice Test */}
        <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D4E4E6] text-[#7A9CA4] flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-[#2D3A2F]">{t('testVoiceTitle')}</h4>
              <p className="text-xs text-[#5A6E5D]">{t('testVoiceSub')}</p>
            </div>
          </div>
          <button
            onClick={testReadAloud}
            className="px-4 py-2 rounded-2xl bg-[#5B825B] text-white font-bold text-xs hover:bg-[#4d704d]"
          >
            {t('playSample')}
          </button>
        </div>

        {/* Emergency Call Contact */}
        <div className="bg-[#F0D8D6] rounded-3xl p-5 border border-[#e0c3c0] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white text-[#C46A66] flex items-center justify-center">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-[#3D2423]">{t('emergencyContactTitle')}</h4>
                <p className="text-xs text-[#3D2423]/80">
                  {primaryContact 
                    ? `${primaryContact.relationship ? `${primaryContact.relationship}: ` : ''}${primaryContact.name} (${primaryContact.phone})`
                    : t('emergencyContactUnconfigured')}
                </p>
              </div>
            </div>
            <button
              onClick={onCallEmergency}
              className="px-4 py-2 rounded-2xl bg-[#C46A66] text-white font-black text-xs hover:bg-[#b05854]"
            >
              {t('callBtn')}
            </button>
          </div>
        </div>

        {/* Switch to Caregiver Mode */}
        <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#EAF1E8] text-[#5B825B] flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-[#2D3A2F]">{t('caregiverDashboardTitle')}</h4>
              <p className="text-xs text-[#5A6E5D]">{t('caregiverDashboardSub')}</p>
            </div>
          </div>
          <button
            onClick={onOpenCaregiverSelect}
            className="w-full py-3 px-4 rounded-2xl bg-[#D4E4E6] text-[#1C2A2D] font-extrabold text-sm hover:bg-[#c2d7da] transition-colors"
          >
            {t('switchToCaregiver')}
          </button>

          {onOpenSetup && (
            <button
              onClick={onOpenSetup}
              className="w-full py-2.5 px-4 rounded-2xl bg-[#F4F1EA] text-[#2D3A2F] font-extrabold text-xs hover:bg-[#EAE5DC] transition-colors flex items-center justify-center gap-2"
            >
              <span>{t('reconfigureProfile')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
