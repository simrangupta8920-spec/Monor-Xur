import React, { useState, useEffect, useRef } from 'react';
import { Memory } from '../../types';
import { Volume2, VolumeX, ChevronLeft, ChevronRight, Heart, Video, Image as ImageIcon, Mic, Play, Pause, Radio } from 'lucide-react';
import { soundController } from '../../utils/audio';

interface MemoryViewerProps {
  memories: Memory[];
  currentMemoryId: string;
  onClose: () => void;
}

export const MemoryViewer: React.FC<MemoryViewerProps> = ({ memories, currentMemoryId, onClose }) => {
  const [index, setIndex] = useState(() => {
    const found = memories.findIndex((m) => m.id === currentMemoryId);
    return found !== -1 ? found : 0;
  });
  const [isReading, setIsReading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const current = memories[index];
  const isVideo = current?.mediaType === 'video' || Boolean(current?.videoUrl);
  const isVoiceDiary = current?.isVoiceDiary || current?.mediaType === 'audio' || Boolean(current?.audioUrl);

  const stopAllMedia = () => {
    soundController.stopSpeaking();
    setIsReading(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    }
  };

  const handleNext = () => {
    stopAllMedia();
    setIndex((prev) => (prev + 1) % memories.length);
  };

  const handlePrev = () => {
    stopAllMedia();
    setIndex((prev) => (prev - 1 + memories.length) % memories.length);
  };

  const togglePlayVoiceRecording = () => {
    soundController.playClick();
    if (!current?.audioUrl) {
      toggleReadAloud();
      return;
    }

    if (!audioRef.current) {
      const audio = new Audio(current.audioUrl);
      audio.onended = () => setIsPlayingAudio(false);
      audioRef.current = audio;
    }

    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      if (isReading) {
        soundController.stopSpeaking();
        setIsReading(false);
      }
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const toggleReadAloud = () => {
    if (isReading) {
      soundController.stopSpeaking();
      setIsReading(false);
    } else {
      if (isPlayingAudio && audioRef.current) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      }
      setIsReading(true);
      const speechText = `${current.title}. ${current.person ? 'With ' + current.person + '. ' : ''}${current.description}`;
      soundController.speak(speechText, () => {
        setIsReading(false);
      });
    }
  };

  useEffect(() => {
    stopAllMedia();
    return () => {
      stopAllMedia();
    };
  }, [index]);

  if (!current) return null;

  return (
    <div className="p-4 pb-24 space-y-4 animate-fadeIn">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            stopAllMedia();
            onClose();
          }}
          className="px-4 py-2 rounded-2xl bg-white border border-[#E0DCD3] text-sm font-bold text-[#2D3A2F] hover:bg-[#EAF1E8] shadow-2xs"
        >
          ← Back to gallery
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#5A6E5D]">
            {index + 1} of {memories.length}
          </span>
        </div>
      </div>

      {/* Main Memory Visual Card */}
      <div className="bg-white rounded-3xl overflow-hidden border border-[#E0DCD3] shadow-md">
        <div className="relative aspect-4/3 max-h-[380px] bg-[#2D3A2F] overflow-hidden flex items-center justify-center">
          {isVideo ? (
            <video
              ref={videoRef}
              src={current.videoUrl || current.image}
              poster={current.image}
              controls
              playsInline
              className="w-full h-full object-contain bg-black"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={current.image}
              alt={current.title}
              className="w-full h-full object-cover"
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 pointer-events-none">
            <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-xs font-bold text-[#2D3A2F] shadow-xs">
              {current.category}
            </span>
            {isVideo && (
              <span className="px-3 py-1 rounded-full bg-[#E8B25C] text-white text-xs font-black flex items-center gap-1 shadow-xs">
                <Video className="w-3.5 h-3.5" /> Video Story
              </span>
            )}
            {isVoiceDiary && (
              <span className="px-3 py-1 rounded-full bg-[#5B825B] text-white text-xs font-black flex items-center gap-1 shadow-xs">
                <Mic className="w-3.5 h-3.5" /> Voice Diary
              </span>
            )}
          </div>

          <button
            onClick={() => setLiked(!liked)}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#C46A66] shadow-xs active:scale-95 z-10"
            aria-label="Favorite memory"
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-2xl font-black text-[#2D3A2F] leading-snug">{current.title}</h3>
              {current.person && (
                <p className="text-sm font-extrabold text-[#5B825B] mt-0.5">Recorded by {current.person}</p>
              )}
              {current.date && (
                <p className="text-xs text-[#5A6E5D] mt-0.5">{current.date}</p>
              )}
            </div>

            {/* Read Aloud / Audio Playback Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {current.audioUrl ? (
                <button
                  onClick={togglePlayVoiceRecording}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all shadow-xs ${
                    isPlayingAudio
                      ? 'bg-[#C46A66] text-white animate-pulse'
                      : 'bg-[#5B825B] text-white hover:bg-[#4d704d]'
                  }`}
                >
                  {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlayingAudio ? 'Pause Voice' : 'Play Voice'}</span>
                </button>
              ) : null}

              <button
                onClick={toggleReadAloud}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all shadow-xs shrink-0 ${
                  isReading
                    ? 'bg-[#C46A66] text-white animate-pulse'
                    : 'bg-[#FAF8F5] text-[#2D3A2F] border border-[#E0DCD3] hover:bg-[#EAF1E8]'
                }`}
              >
                {isReading ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isReading ? 'Stop' : 'Read Aloud'}</span>
              </button>
            </div>
          </div>

          {/* Voice Diary Player Banner if Voice Diary */}
          {isVoiceDiary && (
            <div className="p-3.5 rounded-2xl bg-[#EAF1E8] border border-[#d2e4cf] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#5B825B] text-white flex items-center justify-center shadow-xs">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#2D3A2F]">Patient Voice Journal</h4>
                  <p className="text-[11px] text-[#5A6E5D]">Spoken memory preserved with browser SpeechRecognition</p>
                </div>
              </div>

              {current.audioUrl && (
                <button
                  onClick={togglePlayVoiceRecording}
                  className="px-3 py-1.5 rounded-xl bg-[#5B825B] text-white text-xs font-extrabold flex items-center gap-1 shadow-2xs hover:bg-[#4a6b4a]"
                >
                  {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlayingAudio ? 'Pause' : 'Listen'}</span>
                </button>
              )}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] text-[#2D3A2F] text-base leading-relaxed">
            {current.description}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handlePrev}
          className="flex-1 py-3.5 px-4 rounded-2xl bg-white border border-[#E0DCD3] text-[#2D3A2F] font-bold text-base flex items-center justify-center gap-2 hover:bg-[#EAF1E8] active:scale-[0.98] shadow-xs"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Previous</span>
        </button>

        <button
          onClick={handleNext}
          className="flex-1 py-3.5 px-4 rounded-2xl bg-[#5B825B] text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-[#4c704c] active:scale-[0.98] shadow-xs"
        >
          <span>Next Memory</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

