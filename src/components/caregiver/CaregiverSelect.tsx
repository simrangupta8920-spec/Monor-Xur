import React from 'react';
import { ArrowLeft, Users, Stethoscope, ShieldCheck, Gamepad2 } from 'lucide-react';
import { AppRole } from '../../types';
import { soundController } from '../../utils/audio';

interface CaregiverSelectProps {
  onSelectRole: (role: AppRole) => void;
  onBack: () => void;
}

export const CaregiverSelect: React.FC<CaregiverSelectProps> = ({ onSelectRole, onBack }) => {
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
            <h2 className="text-xl font-black text-[#2D3A2F] leading-tight">Caregiver Portals</h2>
            <p className="text-xs text-[#5A6E5D]">Choose your access portal or return to play</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-2 rounded-2xl bg-[#EAF1E8] border border-[#5B825B]/30 text-xs font-black text-[#5B825B] flex items-center gap-1.5 hover:bg-[#d8ebd5] active:scale-95"
          title="Return to Player Mode"
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Player Mode</span>
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
                  Primary Mode
                </span>
                <h3 className="text-lg font-black text-[#2D3A2F] mt-0.5">Player Mode (Elder Friendly)</h3>
                <p className="text-xs text-[#2D3A2F]/75">Designed for Anita to enjoy games, stories, and calm</p>
              </div>
            </div>
            <span className="px-3.5 py-1.5 rounded-xl bg-[#5B825B] text-white font-black text-xs shrink-0">
              Enter →
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
              Full Care Access
            </span>
          </div>

          <div>
            <h3 className="text-xl font-black text-[#2D3A2F]">Family Caregiver</h3>
            <p className="text-sm text-[#5A6E5D] mt-1">
              Manage loved one's profile, memories, medical consultations, calendar appointments, and track adaptive cognitive game telemetry.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs font-black text-[#5B825B]">
            <span>Secured via 4-digit PIN</span>
            <span className="px-4 py-2 rounded-xl bg-[#5B825B] text-white">Enter PIN →</span>
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
              Field & Community
            </span>
          </div>

          <div>
            <h3 className="text-xl font-black text-[#2D3A2F]">ASHA / Health Worker</h3>
            <p className="text-sm text-[#5A6E5D] mt-1">
              Focused community health worker portal with cognitive status reports, follow-up checklist, and clinical guidance disclaimers.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs font-black text-[#5A6E5D]">
            <span>Worker ID & Password</span>
            <span className="px-4 py-2 rounded-xl bg-[#2D3A2F] text-white">Sign In →</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-3xl bg-[#FDFBF7] border border-[#E0DCD3] flex items-center gap-3 text-xs text-[#5A6E5D]">
        <ShieldCheck className="w-6 h-6 text-[#5B825B] shrink-0" />
        <span>Caregiver authentication keeps private memories, medical details, and routines safe and organized.</span>
      </div>
    </div>
  );
};
