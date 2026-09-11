import React from 'react';
import { Wind, Music, Heart, Sparkles, ArrowLeft } from 'lucide-react';
import { PatientSubView } from '../../types';
import { soundController } from '../../utils/audio';

interface RelaxationHubProps {
  onSelectSubView: (view: PatientSubView) => void;
  onBack: () => void;
}

export const RelaxationHub: React.FC<RelaxationHubProps> = ({ onSelectSubView, onBack }) => {
  return (
    <div className="p-4 pb-24 space-y-4 animate-fadeIn">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-2 rounded-2xl bg-white border border-[#E0DCD3] text-[#2D3A2F] hover:bg-[#EAF1E8]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-[#2D3A2F]">Relaxation Space</h2>
          <p className="text-xs text-[#5A6E5D]">Calming breathing & peaceful melodies.</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Breathing Exercise Card */}
        <div
          onClick={() => {
            soundController.playClick();
            onSelectSubView('breathing');
          }}
          className="group bg-gradient-to-br from-[#D4E4E6] to-[#c2d7da] text-[#1C2A2D] p-6 rounded-3xl border border-[#bdd3d6] shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/90 flex items-center justify-center text-[#7A9CA4] shadow-xs mb-4">
            <Wind className="w-8 h-8" />
          </div>
          <span className="px-3 py-1 rounded-full bg-white/80 text-xs font-black text-[#1C2A2D] inline-block mb-2">
            Gentle 4-2-6 Rhythm
          </span>
          <h3 className="text-2xl font-black leading-tight">Breathing Exercise</h3>
          <p className="text-sm font-medium text-[#1C2A2D]/80 mt-1">
            Soothing guided inhalation, hold, and gentle exhalation with expanding botanical petals to relieve tension.
          </p>
          <div className="mt-4 flex items-center justify-between text-xs font-black">
            <span>4 Cycles • ~1 Minute</span>
            <span className="px-4 py-2 rounded-xl bg-white text-[#1C2A2D] shadow-xs">Start Breathing →</span>
          </div>
        </div>

        {/* Calming Sounds & Music Card */}
        <div
          onClick={() => {
            soundController.playClick();
            onSelectSubView('music');
          }}
          className="group bg-gradient-to-br from-[#EAF1E8] to-[#DCEAD2] text-[#28331F] p-6 rounded-3xl border border-[#c3d9b4] shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/90 flex items-center justify-center text-[#5B825B] shadow-xs mb-4">
            <Music className="w-8 h-8" />
          </div>
          <span className="px-3 py-1 rounded-full bg-white/80 text-xs font-black text-[#28331F] inline-block mb-2">
            Ambient & Traditional
          </span>
          <h3 className="text-2xl font-black leading-tight">Calming Melodies</h3>
          <p className="text-sm font-medium text-[#28331F]/80 mt-1">
            Gentle nature sounds, morning sitar, ambient flute, and singing bowl vibrations for peaceful resting.
          </p>
          <div className="mt-4 flex items-center justify-between text-xs font-black">
            <span>Harmonic Sounds</span>
            <span className="px-4 py-2 rounded-xl bg-white text-[#28331F] shadow-xs">Listen Now →</span>
          </div>
        </div>
      </div>
    </div>
  );
};
