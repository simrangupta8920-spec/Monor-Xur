import React, { useState } from 'react';
import { Type, Volume2, Bell, PhoneCall, Stethoscope, Check, HeartHandshake, Wifi, WifiOff, HardDrive, ShieldCheck } from 'lucide-react';
import { PatientProfile, EmergencyContact } from '../../types';
import { soundController } from '../../utils/audio';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { getOfflineSnapshot } from '../../services/offlineStorage';
import { PWAInstallButton } from '../common/PWAInstallButton';

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
  const [largeText, setLargeText] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const playerName = patientProfile?.name || 'Player';
  const playerFullName = patientProfile?.fullName || 'Mind Explorer';
  const primaryContact = contacts[0];
  const isOnline = useOnlineStatus();
  const offlineData = getOfflineSnapshot();
  const cachedRemindersCount = offlineData?.reminders?.length || 0;

  const testReadAloud = () => {
    soundController.speak(`Hello ${playerName}. Read aloud is working warmly and clearly.`);
  };

  return (
    <div className="p-4 pb-24 space-y-4 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-black text-[#2D3A2F]">Player Preferences</h2>
        <p className="text-sm text-[#5A6E5D]">Display comfort, sound cues, and gaming settings.</p>
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
              Active Player
            </span>
            <h3 className="text-base font-black text-[#2D3A2F] mt-0.5">{playerFullName}</h3>
            <p className="text-xs text-[#5A6E5D]">Mind Explorer • Level 2</p>
          </div>
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
                <h4 className="font-extrabold text-base text-[#2D3A2F]">Offline Readiness</h4>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  isOnline ? 'bg-[#EAF1E8] text-[#5B825B]' : 'bg-[#FDF0D5] text-[#8B5E3C]'
                }`}>
                  {isOnline ? 'Cloud Synced' : 'Offline Mode'}
                </span>
              </div>
              <p className="text-xs text-[#5A6E5D]">
                Service Worker active: Core patient data & daily plan stored offline.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-[#EAE4D6] space-y-1.5 text-xs text-[#5A6E5D]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5B825B]" /> Core Profile & Medical Stage
            </span>
            <span className="font-bold text-[#2D3A2F]">Cached Locally</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-[#5B825B]" /> Today's Daily Plan & Meds
            </span>
            <span className="font-bold text-[#2D3A2F]">{cachedRemindersCount} Routine items</span>
          </div>
        </div>

        <div className="pt-1 flex items-center justify-between">
          <span className="text-xs text-[#5A6E5D]">Install to home screen for full offline experience:</span>
          <PWAInstallButton />
        </div>
      </div>

      <div className="space-y-3">
        {/* Large Text Preference */}
        <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#EAF1E8] text-[#5B825B] flex items-center justify-center">
              <Type className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-[#2D3A2F]">Extra Large Text</h4>
              <p className="text-xs text-[#5A6E5D]">Enlarge buttons and story descriptions</p>
            </div>
          </div>
          <button
            onClick={() => setLargeText(!largeText)}
            className={`w-14 h-8 rounded-full transition-colors p-1 flex items-center ${
              largeText ? 'bg-[#5B825B] justify-end' : 'bg-gray-200 justify-start'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-white shadow-xs" />
          </button>
        </div>

        {/* Sound Feedback */}
        <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FDF0D5] text-[#E8B25C] flex items-center justify-center">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-[#2D3A2F]">Audio Chimes & Cues</h4>
              <p className="text-xs text-[#5A6E5D]">Gentle sounds on button taps & matches</p>
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
              <h4 className="font-extrabold text-base text-[#2D3A2F]">Test Read-Aloud Voice</h4>
              <p className="text-xs text-[#5A6E5D]">Listen to sample storytelling voice</p>
            </div>
          </div>
          <button
            onClick={testReadAloud}
            className="px-4 py-2 rounded-2xl bg-[#5B825B] text-white font-bold text-xs hover:bg-[#4d704d]"
          >
            Play Sample
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
                <h4 className="font-extrabold text-base text-[#3D2423]">Emergency Contact</h4>
                <p className="text-xs text-[#3D2423]/80">
                  {primaryContact 
                    ? `${primaryContact.relationship ? `${primaryContact.relationship}: ` : ''}${primaryContact.name} (${primaryContact.phone})`
                    : 'Configure emergency contact in Caregiver Portal'}
                </p>
              </div>
            </div>
            <button
              onClick={onCallEmergency}
              className="px-4 py-2 rounded-2xl bg-[#C46A66] text-white font-black text-xs hover:bg-[#b05854]"
            >
              Call
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
              <h4 className="font-extrabold text-base text-[#2D3A2F]">Caregiver Dashboard</h4>
              <p className="text-xs text-[#5A6E5D]">For family members and ASHA health workers</p>
            </div>
          </div>
          <button
            onClick={onOpenCaregiverSelect}
            className="w-full py-3 px-4 rounded-2xl bg-[#D4E4E6] text-[#1C2A2D] font-extrabold text-sm hover:bg-[#c2d7da] transition-colors"
          >
            Switch to Caregiver Mode →
          </button>

          {onOpenSetup && (
            <button
              onClick={onOpenSetup}
              className="w-full py-2.5 px-4 rounded-2xl bg-[#F4F1EA] text-[#2D3A2F] font-extrabold text-xs hover:bg-[#EAE5DC] transition-colors flex items-center justify-center gap-2"
            >
              <span>⚙️ Reconfigure Player Profile & PIN</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
