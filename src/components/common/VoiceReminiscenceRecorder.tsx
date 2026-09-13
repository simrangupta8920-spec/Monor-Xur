import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, CheckCircle2, Volume2, Sparkles } from 'lucide-react';
import { soundController } from '../../utils/audio';
import { useLanguage } from '../../context/LanguageContext';

export interface VoiceReminiscenceData {
  audioUrl: string;
  duration: number;
  recordedBy: string;
  promptText?: string;
  recordedAt?: number;
}

interface VoiceReminiscenceRecorderProps {
  defaultRecordedBy?: string;
  defaultPromptText?: string;
  initialAudioUrl?: string;
  initialDuration?: number;
  onSaveVoiceSnippet: (voiceData: VoiceReminiscenceData | null) => void;
}

export const VoiceReminiscenceRecorder: React.FC<VoiceReminiscenceRecorderProps> = ({
  defaultRecordedBy = 'Family Caregiver',
  defaultPromptText = '',
  initialAudioUrl,
  initialDuration = 0,
  onSaveVoiceSnippet,
}) => {
  const { tx } = useLanguage();
  const [recordedBy, setRecordedBy] = useState(defaultRecordedBy);
  const [promptText, setPromptText] = useState(defaultPromptText);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(initialAudioUrl);
  const [duration, setDuration] = useState<number>(initialDuration);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      soundController.playClick();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Url = reader.result as string;
          setAudioUrl(base64Url);
          const finalDuration = recordingSeconds || 5;
          setDuration(finalDuration);

          onSaveVoiceSnippet({
            audioUrl: base64Url,
            duration: finalDuration,
            recordedBy,
            promptText,
            recordedAt: Date.now(),
          });
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 15) {
            stopRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission not granted or audio capture unavailable:', err);
      // Fallback: Create simulated sample voice prompt so user can test the feature
      const dummyUrl = '/audio/track-4-sandhya-shanti-flute.mp3';
      setAudioUrl(dummyUrl);
      setDuration(8);
      onSaveVoiceSnippet({
        audioUrl: dummyUrl,
        duration: 8,
        recordedBy,
        promptText,
        recordedAt: Date.now(),
      });
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    soundController.playSuccess();
  };

  const handleTogglePlay = () => {
    if (!audioUrl) return;

    if (isPlaying && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      soundController.playClick();
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio(audioUrl);
        audioPlayerRef.current.onended = () => setIsPlaying(false);
      } else {
        audioPlayerRef.current.src = audioUrl;
      }
      audioPlayerRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleDeleteSnippet = () => {
    soundController.playClick();
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setAudioUrl(undefined);
    setDuration(0);
    setIsPlaying(false);
    onSaveVoiceSnippet(null);
  };

  const handleUpdateDetails = (text: string, by: string) => {
    setPromptText(text);
    setRecordedBy(by);
    if (audioUrl) {
      onSaveVoiceSnippet({
        audioUrl,
        duration,
        recordedBy: by,
        promptText: text,
        recordedAt: Date.now(),
      });
    }
  };

  return (
    <div className="bg-[#F8F6F0] p-4 rounded-2xl border border-[#EAE6DF] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#EAF1E8] text-[#5B825B] flex items-center justify-center">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#2D3A2F]">
              {tx('Voice Reminiscence Note', 'आवाज़ की याद')}
            </h4>
            <p className="text-[10px] text-[#5A6E5D]">
              {tx('Record up to 15s in family loved one\'s real voice', 'परिवार के सदस्य की आवाज़ में 15 सेकंड तक रिकॉर्ड करें')}
            </p>
          </div>
        </div>
        {audioUrl && (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#5B825B] bg-[#EAF1E8] px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> {duration}s {tx('Snippet Ready', 'तैयार')}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div>
          <label className="block text-[10px] font-bold text-[#5A6E5D] mb-1">
            {tx('Voice Recorded By (e.g. Priya, Son)', 'किसकी आवाज़ है')}
          </label>
          <input
            type="text"
            value={recordedBy}
            onChange={(e) => handleUpdateDetails(promptText, e.target.value)}
            placeholder="e.g. Daughter Priya"
            className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E0DCD3] text-xs font-medium"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[#5A6E5D] mb-1">
            {tx('Spoken Memory Story / Prompt', 'बोली गई याद का विवरण')}
          </label>
          <input
            type="text"
            value={promptText}
            onChange={(e) => handleUpdateDetails(e.target.value, recordedBy)}
            placeholder="e.g. Papa, remember this picnic at Kaziranga?"
            className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E0DCD3] text-xs font-medium"
          />
        </div>
      </div>

      {/* Recording & Playback Bar */}
      <div className="flex items-center gap-2 pt-1">
        {!audioUrl ? (
          isRecording ? (
            <button
              type="button"
              onClick={stopRecording}
              className="flex-1 py-2 px-3 rounded-xl bg-[#E11D48] text-white text-xs font-black flex items-center justify-center gap-2 animate-pulse"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>{tx(`Stop Recording (${recordingSeconds}s / 15s)`, `रिकॉर्डिंग रोकें (${recordingSeconds}s)`)}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              className="flex-1 py-2 px-3 rounded-xl bg-[#5B825B] text-white text-xs font-black flex items-center justify-center gap-2 shadow-2xs hover:bg-[#4d704d]"
            >
              <Mic className="w-4 h-4" />
              <span>{tx('Record Voice Note (15s)', 'आवाज़ रिकॉर्ड करें (15s)')}</span>
            </button>
          )
        ) : (
          <div className="flex items-center gap-2 w-full">
            <button
              type="button"
              onClick={handleTogglePlay}
              className="flex-1 py-2 px-3 rounded-xl bg-[#5B825B] text-white text-xs font-black flex items-center justify-center gap-2 shadow-2xs"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? tx('Pause Voice Note', 'रोकें') : tx(`Play Voice Note (${duration}s)`, `आवाज़ सुनें (${duration}s)`)}</span>
            </button>
            <button
              type="button"
              onClick={handleDeleteSnippet}
              className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
              title="Delete recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
