import React, { useState, useEffect, useRef, useId } from 'react';
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
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const id = useId();

  useEffect(() => {
    // Keep playback indicator strictly synced with central sound controller
    const removeListener = soundController.addAudioListener((event, data) => {
      if (event === 'speech-start') {
        if (data?.speakerId === id) {
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
        }
      } else if (event === 'speech-stop' || event === 'stop') {
        setIsPlaying(false);
      }
    });

    return () => {
      removeListener();
      // If this specific button was speaking when unmounting, stop speech
      if (soundController.activeSpeakerId === id) {
        soundController.stopSpeaking();
      }
    };
  }, [id]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    // If currently speaking, stop immediately
    if (isPlaying || (soundController.isSpeaking() && soundController.activeSpeakerId === id)) {
      soundController.stopSpeaking();
      setIsPlaying(false);
      return;
    }

    soundController.playClick();
    setIsPlaying(true);
    soundController.speakBilingual(
      textEn,
      textHi || textEn,
      () => setIsPlaying(false),
      textAs,
      id,
      buttonRef.current
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
      ref={buttonRef}
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
