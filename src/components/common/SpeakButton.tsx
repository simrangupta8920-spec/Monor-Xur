import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundController } from '../../utils/audio';

interface SpeakButtonProps {
  textEn: string;
  textHi?: string;
  textAs?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const SpeakButton: React.FC<SpeakButtonProps> = ({
  textEn,
  textHi,
  textAs,
  size = 'md',
  className = '',
  label,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      // Clean up speaking if unmounted
      if (isPlaying) {
        soundController.stopSpeaking();
      }
    };
  }, [isPlaying]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPlaying) {
      soundController.stopSpeaking();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    soundController.playClick();
    soundController.speakBilingual(
      textEn,
      textHi || textEn,
      () => setIsPlaying(false),
      textAs
    );
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs gap-1',
    md: 'p-2 text-sm gap-1.5',
    lg: 'p-3 text-base gap-2',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label="Read aloud"
      title={isPlaying ? 'Stop voice readout' : 'Listen aloud'}
      className={`inline-flex items-center justify-center rounded-2xl transition-all cursor-pointer select-none ${
        isPlaying
          ? 'bg-[#5B825B] text-white shadow-md animate-pulse'
          : 'bg-[#FDFBF7] text-[#5B825B] hover:bg-[#EAF1E8] border border-[#E0DCD3] shadow-2xs hover:border-[#5B825B]/40'
      } ${sizeClasses[size]} ${className}`}
    >
      {isPlaying ? (
        <VolumeX className={iconSizes[size]} />
      ) : (
        <Volume2 className={iconSizes[size]} />
      )}
      {label && <span className="font-extrabold text-xs">{label}</span>}
    </button>
  );
};
