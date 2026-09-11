import React, { useState } from 'react';
import { Type, Volume2, Bell, PhoneCall, Stethoscope, Check, HeartHandshake } from 'lucide-react';
import { PatientProfile } from '../../types';
import { soundController } from '../../utils/audio';

interface PatientSettingsProps {
  onOpenCaregiverSelect: () => void;
  onCallEmergency: () => void;
  patientProfile?: PatientProfile;
}

export const PatientSettings: React.FC<PatientSettingsProps> = ({
  onOpenCaregiverSelect,
  onCallEmergency,
  patientProfile,
}) => {
  const [largeText, setLargeText] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const playerName = patientProfile?.name || 'Anita';
  const playerFullName = patientProfile?.fullName || 'Anita Sharma';

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
                <p className="text-xs text-[#3D2423]/80">Son Rahul Sharma (+91 98200 12345)</p>
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
        </div>
      </div>
    </div>
  );
};
