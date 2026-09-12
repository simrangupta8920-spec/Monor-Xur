import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundController } from '../../utils/audio';
import { useLanguage } from '../../context/LanguageContext';

interface SpeakButtonProps {
  textEn: string;
  textHi?: string;
  textAs?: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SpeakButton: React.FC<SpeakButtonProps> = ({
  textEn,
  textHi,
  textAs,
  label,
  className = '',
  size = 'md',
}) => {
  const { tx } = useLanguage();
  const [isSpeakingThis, setIsSpeakingThis] = useState(false);

  useEffect(() => {
    const checkSpeaking = () => {
      if (!soundController.isSpeaking() && isSpeakingThis) {
        setIsSpeakingThis(false);
      }
    };
    const interval = setInterval(checkSpeaking, 300);
    return () => clearInterval(interval);
  }, [isSpeakingThis]);

  const handleToggleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeakingThis) {
      soundController.stopSpeaking();
      setIsSpeakingThis(false);
      return;
    }

    soundController.stopSpeaking();
    setIsSpeakingThis(true);

    soundController.speakBilingual(
      textEn,
      textHi || textEn,
      () => setIsSpeakingThis(false),
      textAs
    );
  };

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      type="button"
      onClick={handleToggleSpeak}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full transition-all shrink-0 cursor-pointer active:scale-95 ${
        isSpeakingThis
          ? 'bg-[#5B825B] text-white ring-3 ring-[#5B825B]/30 animate-pulse'
          : 'bg-[#F4F1EA] text-[#5B825B] hover:bg-[#EAF1E8] hover:text-[#2D3A2F] border border-[#DCD6CA]'
      } ${sizeClasses[size]} ${className}`}
      title={tx('Listen aloud', 'बोलकर सुनें', 'শুনি চাওক')}
      aria-label={label || tx('Listen to instructions', 'निर्देश बोलकर सुनें', 'নিৰ্দেশনা শুনি চাওক')}
    >
      {isSpeakingThis ? (
        <VolumeX className={iconSizes[size]} />
      ) : (
        <Volume2 className={iconSizes[size]} />
      )}
      {label && <span className="font-bold text-xs pr-1">{label}</span>}
    </button>
  );
};
