import React from 'react';
import { Gamepad2, Stethoscope, ArrowLeft, Phone } from 'lucide-react';
import { AppRole } from '../../types';

interface HeaderProps {
  role: AppRole;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  onSwitchRole?: (role: AppRole) => void;
  onCallEmergency?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  role,
  title,
  subtitle,
  showBack,
  onBack,
  onSwitchRole,
  onCallEmergency,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E0DCD3] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            onClick={onBack}
            className="w-11 h-11 rounded-2xl bg-white border border-[#E0DCD3] text-[#2D3A2F] flex items-center justify-center hover:bg-[#EAF1E8] transition-colors shadow-xs active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        ) : (
          <button 
            onClick={() => onSwitchRole?.('patient')}
            className="flex items-center gap-2.5 text-left group"
            title="Monor Xur Player Space"
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
              <span className="font-black text-xl text-[#2D3A2F] block leading-tight tracking-tight">Monor Xur</span>
              <span className="text-xs font-bold text-[#5A6E5D] block">
                {role === 'patient' 
                  ? 'Player Mode • Mind Explorer' 
                  : role === 'family' 
                  ? 'Family Companion Portal' 
                  : role === 'asha' 
                  ? 'ASHA Health Worker' 
                  : 'Caregiver Portal'}
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
        {role === 'patient' && onCallEmergency && (
          <button
            onClick={onCallEmergency}
            className="w-11 h-11 rounded-2xl bg-[#F0D8D6] text-[#C46A66] flex items-center justify-center hover:bg-[#ebd0ce] active:scale-95 transition-all shadow-xs"
            aria-label="Emergency Call"
            title="Call Family"
          >
            <Phone className="w-5 h-5" />
          </button>
        )}

        {role === 'patient' && onSwitchRole && (
          <button
            onClick={() => onSwitchRole('caregiver_select')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#D4E4E6] text-[#1C2A2D] font-extrabold text-xs hover:bg-[#c2d7da] transition-colors active:scale-95 shadow-xs"
          >
            <Stethoscope className="w-4 h-4 text-[#1C2A2D]" />
            <span>Caregiver</span>
          </button>
        )}

        {role !== 'patient' && onSwitchRole && (
          <button
            onClick={() => onSwitchRole('patient')}
            className="px-3.5 py-2 rounded-2xl border border-[#5B825B]/40 bg-[#EAF1E8] text-xs font-black text-[#5B825B] hover:bg-[#d8ebd5] transition-colors active:scale-95 shadow-xs flex items-center gap-1.5"
            title="Return to Player Mode"
          >
            <Gamepad2 className="w-4 h-4 text-[#5B825B]" />
            <span>Player Mode</span>
          </button>
        )}
      </div>
    </header>
  );
};
