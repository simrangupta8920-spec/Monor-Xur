import React from 'react';
import { Gamepad2, Stethoscope, ArrowLeft, Phone, Languages } from 'lucide-react';
import { AppRole } from '../../types';
import { PWAInstallButton } from './PWAInstallButton';
import { useLanguage } from '../../context/LanguageContext';
import { soundController } from '../../utils/audio';

interface HeaderProps {
  role: AppRole;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  onSwitchRole?: (role: AppRole) => void;
  onCallEmergency?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  role,
  title,
  subtitle,
  showBack,
  onBack,
  onSwitchRole,
  onCallEmergency,
  onOpenSettings,
}) => {
  const { t, language, setLanguage } = useLanguage();

  const handleToggleLanguage = () => {
    soundController.playClick();
    const nextLang = language === 'en' ? 'hi' : language === 'hi' ? 'as' : 'en';
    setLanguage(nextLang);
    if (nextLang === 'as') {
      soundController.speak('ভাষা অসমীয়ালৈ নিৰ্ধাৰণ কৰা হ’ল।', undefined, 'as');
    } else if (nextLang === 'hi') {
      soundController.speak('भाषा हिन्दी पर सेट कर दी गई है।', undefined, 'hi');
    } else {
      soundController.speak('Language set to English.', undefined, 'en');
    }
  };

  const getRoleSubtitle = () => {
    switch (role) {
      case 'setup':
        return t('setupAndProfiles');
      case 'patient':
        return t('playerMode');
      case 'family':
        return t('familyPortal');
      case 'asha':
        return t('ashaWorker');
      default:
        return t('caregiverPortal');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E0DCD3] px-3.5 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            onClick={onBack}
            className="w-11 h-11 rounded-2xl bg-white border border-[#E0DCD3] text-[#2D3A2F] flex items-center justify-center hover:bg-[#EAF1E8] transition-colors shadow-xs active:scale-95"
            aria-label={t('goBack')}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        ) : (
          <button 
            onClick={() => onSwitchRole?.('patient')}
            className="flex items-center gap-2.5 text-left group"
            title={t('monorXur')}
          >
            <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-[#5B825B]/30 bg-[#FDFBF7] flex items-center justify-center shadow-xs group-hover:border-[#5B825B] transition-all">
              <img 
                src="/logo.jpg" 
                alt="Monor Xur" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="font-black text-xl text-[#2D3A2F] block leading-tight tracking-tight">{t('monorXur')}</span>
              <span className="text-xs font-bold text-[#5A6E5D] block">
                {getRoleSubtitle()}
              </span>
            </div>
          </button>
        )}

        {showBack && title && (
          <div>
            <h1 className="font-extrabold text-lg text-[#2D3A2F] leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-[#5A6E5D]">{subtitle}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Quick Language Toggle */}
        <button
          onClick={handleToggleLanguage}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl border border-[#E0DCD3] bg-white text-[#2D3A2F] hover:bg-[#EAF1E8] transition-all shadow-xs active:scale-95 text-xs font-black"
          title={language === 'en' ? 'हिन्दी में बदलें' : language === 'hi' ? 'অসমীয়ালৈ সলনি কৰক' : 'Switch to English'}
          aria-label="Switch language"
        >
          <Languages className="w-3.5 h-3.5 text-[#5B825B]" />
          <span>{language === 'as' ? 'অসমীয়া' : language === 'hi' ? 'हिन्दी' : 'EN'}</span>
        </button>

        <PWAInstallButton compact />

        {role === 'patient' && onCallEmergency && (
          <button
            onClick={onCallEmergency}
            className="w-10 h-10 rounded-2xl bg-[#F0D8D6] text-[#C46A66] flex items-center justify-center hover:bg-[#ebd0ce] active:scale-95 transition-all shadow-xs"
            aria-label={t('emergencyCall')}
            title={t('emergencyCall')}
          >
            <Phone className="w-5 h-5" />
          </button>
        )}

        {role === 'patient' && onSwitchRole && (
          <button
            onClick={() => onSwitchRole('caregiver_select')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#D4E4E6] text-[#1C2A2D] font-extrabold text-xs hover:bg-[#c2d7da] transition-colors active:scale-95 shadow-xs"
          >
            <Stethoscope className="w-4 h-4 text-[#1C2A2D]" />
            <span>{t('caregiver')}</span>
          </button>
        )}

        {role !== 'patient' && role !== 'setup' && onSwitchRole && (
          <button
            onClick={() => onSwitchRole('patient')}
            className="px-3.5 py-2 rounded-2xl border border-[#5B825B]/40 bg-[#EAF1E8] text-xs font-black text-[#5B825B] hover:bg-[#d8ebd5] transition-colors active:scale-95 shadow-xs flex items-center gap-1.5"
            title={t('returnToPlayer')}
          >
            <Gamepad2 className="w-4 h-4 text-[#5B825B]" />
            <span>{t('returnToPlayer')}</span>
          </button>
        )}
      </div>
    </header>
  );
};
