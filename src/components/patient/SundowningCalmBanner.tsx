import React, { useState } from 'react';
import { SunMedium, Music, Wind, Volume2, X, Sparkles, Check } from 'lucide-react';
import { soundController } from '../../utils/audio';
import { useLanguage } from '../../context/LanguageContext';

interface SundowningCalmBannerProps {
  isActive: boolean;
  isManualOverride?: boolean;
  onOpenBreathing?: () => void;
  onOpenMusic?: () => void;
}

export const SundowningCalmBanner: React.FC<SundowningCalmBannerProps> = ({
  isActive,
  isManualOverride = false,
  onOpenBreathing,
  onOpenMusic,
}) => {
  const { tx, isHindi } = useLanguage();
  const [dismissed, setDismissed] = useState(false);
  const [isPlayingRaga, setIsPlayingRaga] = useState(false);

  if (!isActive || dismissed) return null;

  const handleToggleRaga = () => {
    if (isPlayingRaga) {
      soundController.stopAmbient();
      setIsPlayingRaga(false);
    } else {
      soundController.startAmbient('raga_yaman');
      setIsPlayingRaga(true);
      soundController.playSuccess();
    }
  };

  const handleOpenBreathing = () => {
    soundController.playClick();
    if (onOpenBreathing) {
      onOpenBreathing();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#FFF8ED] via-[#FDF0D5] to-[#FEEED1] border-2 border-[#E8B25C]/50 shadow-md p-4 sm:p-4.5 animate-fadeIn text-[#422D0A]">
      {/* Background warm amber glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#E8B25C]/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E8B25C] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <SunMedium className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-[#E8B25C]/20 text-[#8C651E] text-[10px] font-black uppercase tracking-wider">
                {isManualOverride 
                  ? tx('Twilight Calming • Caregiver Preview', 'गोधूलि शांति • पूर्वावलोकन') 
                  : tx('Sundowning Support (4:30 – 7:30 PM)', 'गोधूलि शांति समय (4:30 – 7:30 PM)')}
              </span>
              <span className="text-[11px] font-bold text-[#8C651E] flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-[#8C651E]" />
                {tx('Soft Chimes & Warm Lighting Active', 'धीमी मधुर ध्वनियां व शांत प्रकाश')}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-black text-[#2D3A2F] mt-0.5 leading-snug">
              {tx('Restful Evening Time', 'आरामदायक संध्या काल')}
            </h4>
            <p className="text-xs text-[#5A6E5D] max-w-xl">
              {tx(
                'Bright screens are softened to warm amber and game sounds are gentle to prevent twilight fatigue. Let’s relax together.',
                'संध्या कालीन थकान और बेचैनी को दूर करने के लिए प्रकाश को हल्का पीला व ध्वनियों को शांत किया गया है।'
              )}
            </p>
          </div>
        </div>

        {/* Calming Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
          <button
            onClick={handleToggleRaga}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs active:scale-95 ${
              isPlayingRaga
                ? 'bg-[#8C651E] text-white animate-pulse'
                : 'bg-white text-[#8C651E] border border-[#E8B25C]/60 hover:bg-[#FDF0D5]'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>
              {isPlayingRaga
                ? tx('Stop Evening Raga', 'राग यमन रोकें')
                : tx('Play Evening Raga', 'संध्या राग यमन सुनें')}
            </span>
          </button>

          {onOpenBreathing && (
            <button
              onClick={handleOpenBreathing}
              className="px-3.5 py-2 rounded-2xl bg-[#5B825B] text-white text-xs font-black flex items-center gap-1.5 shadow-xs hover:bg-[#4a6b4a] transition-colors active:scale-95"
            >
              <Wind className="w-3.5 h-3.5" />
              <span>{tx('4-7-8 Breathing', '4-7-8 श्वास अभ्यास')}</span>
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="w-8 h-8 rounded-full bg-white/70 hover:bg-white text-[#8C651E] flex items-center justify-center transition-colors ml-1"
            title={tx('Minimize', 'छोटा करें')}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
