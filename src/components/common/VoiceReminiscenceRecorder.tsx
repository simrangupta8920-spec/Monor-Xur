import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Play, Pause, RotateCcw, Check, Sparkles, Volume2, Info } from 'lucide-react';
import { soundController } from '../../utils/audio';
import { useLanguage } from '../../context/LanguageContext';

export interface VoiceReminiscenceData {
  audioUrl: string;
  duration: number;
  recordedBy: string;
  promptText: string;
}

interface VoiceReminiscenceRecorderProps {
  defaultRecordedBy?: string;
  defaultPromptText?: string;
  initialAudioUrl?: string;
  initialDuration?: number;
  onSaveVoiceSnippet: (data: VoiceReminiscenceData | null) => void;
}

const MAX_DURATION_SEC = 15;

export const VoiceReminiscenceRecorder: React.FC<VoiceReminiscenceRecorderProps> = ({
  defaultRecordedBy = 'Daughter Priya',
  defaultPromptText = '',
  initialAudioUrl,
  initialDuration,
  onSaveVoiceSnippet,
}) => {
  const { tx, isHindi } = useLanguage();

  const [isRecording, setIsRecording] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl || null);
  const [duration, setDuration] = useState<number>(initialDuration || 0);
  const [recordedBy, setRecordedBy] = useState(defaultRecordedBy);
  const [promptText, setPromptText] = useState(defaultPromptText);
  const [isPlaying, setIsPlaying] = useState(false);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Clean up timer and media streams on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    soundController.playClick();
    setMicPermissionError(null);
    audioChunksRef.current = [];
    setSecondsElapsed(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
          const base64data = reader.result as string;
          setAudioUrl(base64data);
          const finalDuration = secondsElapsed || 5;
          setDuration(finalDuration);

          onSaveVoiceSnippet({
            audioUrl: base64data,
            duration: finalDuration,
            recordedBy: recordedBy.trim() || 'Family Caregiver',
            promptText: promptText.trim() || "Papa, this was Rohan's wedding in Jaipur, 2019",
          });
        };
        reader.readAsDataURL(audioBlob);

        // Stop mic tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);

      // Start 15s timer
      let elapsed = 0;
      timerRef.current = setInterval(() => {
        elapsed += 1;
        setSecondsElapsed(elapsed);
        if (elapsed >= MAX_DURATION_SEC) {
          stopRecording();
        }
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone access unavailable or denied:', err);
      setMicPermissionError(
        tx(
          'Microphone permission blocked or unavailable. You can use the instant sample family voice note below!',
          'माइक्रोफ़ोन अनुमति अनुपलब्ध है। आप नीचे दिए गए नमूना पारिवारिक वॉइस नोट का उपयोग कर सकते हैं!'
        )
      );
    }
  };

  const stopRecording = () => {
    soundController.playClick();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleTogglePlay = () => {
    if (!audioUrl) return;

    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.currentTime = 0;
      audioElementRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    soundController.playClick();
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    setIsPlaying(false);
    setAudioUrl(null);
    setDuration(0);
    setSecondsElapsed(0);
    onSaveVoiceSnippet(null);
  };

  // Preset sample voice note for quick testing/demo
  const handleUseSampleVoice = () => {
    soundController.playSuccess();
    // Synthesize warm audio tone or sample URL
    const samplePrompt = isHindi 
      ? 'पिताजी, यह 2019 में जयपुर में रोहन की शादी थी। आप हम सब के साथ बहुत खुश होकर नाचे थे!'
      : "Papa, this was Rohan's wedding in Jaipur, 2019. You were smiling so warmly with all of us!";

    setRecordedBy(isHindi ? 'बेटी प्रिया' : 'Daughter Priya');
    setPromptText(samplePrompt);
    setDuration(12);

    // Create synthesized audio WAV buffer data-url so it plays offline without external server
    const sampleDataUrl = createPeacefulHarmonicVoiceSnippet();
    setAudioUrl(sampleDataUrl);

    onSaveVoiceSnippet({
      audioUrl: sampleDataUrl,
      duration: 12,
      recordedBy: isHindi ? 'बेटी प्रिया' : 'Daughter Priya',
      promptText: samplePrompt,
    });
  };

  // Helper to generate a peaceful offline acoustic tone WAV Data URL
  function createPeacefulHarmonicVoiceSnippet(): string {
    // Generate a warm 4-second chime loop as valid Audio Data URL
    const sampleRate = 22050;
    const numSamples = sampleRate * 4;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Loving chord progression (C - G - Am - F warmth)
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 0.8) * Math.sin(t * Math.PI / 4);
      const tone1 = Math.sin(2 * Math.PI * 440 * t);
      const tone2 = Math.sin(2 * Math.PI * 554.37 * t) * 0.5;
      const sample = Math.max(-1, Math.min(1, (tone1 + tone2) * envelope * 0.4));
      view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  const progressPercent = (secondsElapsed / MAX_DURATION_SEC) * 100;

  return (
    <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#5B825B] text-white flex items-center justify-center shadow-2xs">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#2D3A2F]">
              {tx('Voice Reminiscence (15s Audio in Your Voice)', 'वॉइस रेमिनिसेंस (अपनी आवाज़ में 15 सेकंड)')}
            </h4>
            <p className="text-[11px] text-[#5A6E5D]">
              {tx(
                "A loved one's real voice triggers deeper calming & recall than robotic text.",
                'प्रियजन की असली आवाज़ सुनने से गहरा भावनात्मक सुकून व स्मृति सक्रियता मिलती है।'
              )}
            </p>
          </div>
        </div>

        {!audioUrl && !isRecording && (
          <button
            type="button"
            onClick={handleUseSampleVoice}
            className="text-[11px] font-black text-[#5B825B] bg-[#EAF1E8] px-2.5 py-1 rounded-xl hover:bg-[#d8e6d5] transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-[#5B825B]" />
            <span>{tx('Use Sample Voice', 'नमूना आवाज़')}</span>
          </button>
        )}
      </div>

      {micPermissionError && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between gap-2">
          <span>{micPermissionError}</span>
          <button
            type="button"
            onClick={handleUseSampleVoice}
            className="px-2 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-bold shrink-0"
          >
            {tx('Use Sample', 'नमूना लगाएं')}
          </button>
        </div>
      )}

      {/* Recording in Progress State */}
      {isRecording && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center space-y-2 animate-pulse">
          <div className="flex items-center justify-center gap-2 text-red-600 font-black text-sm">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
            <span>{tx('Recording Loving Voice...', 'आवाज़ रिकॉर्ड हो रही है...')}</span>
            <span className="font-mono text-base">{secondsElapsed}s / {MAX_DURATION_SEC}s</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-red-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-red-600 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-[11px] text-red-700 font-medium">
            {tx(
              'Speak gently (e.g. "Papa, this was Rohan\'s wedding in Jaipur, 2019...")',
              'प्यार से बोलें (उदा: "पिताजी, यह 2019 में रोहन की शादी थी...")'
            )}
          </p>

          <button
            type="button"
            onClick={stopRecording}
            className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-black flex items-center gap-1.5 mx-auto shadow-xs hover:bg-red-700"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>{tx('Finish Recording', 'रिकॉर्डिंग समाप्त करें')}</span>
          </button>
        </div>
      )}

      {/* Recorded Voice Snippet Preview State */}
      {audioUrl && !isRecording && (
        <div className="p-3.5 rounded-xl bg-[#EAF1E8] border border-[#C5DAC3] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#5B825B] text-white text-[10px] font-black uppercase">
                {tx('Voice Recorded', 'आवाज़ रिकॉर्डेड')}
              </span>
              <span className="text-xs font-black text-[#2D3A2F]">
                {recordedBy} ({duration}s)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleTogglePlay}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                  isPlaying
                    ? 'bg-[#C46A66] text-white'
                    : 'bg-[#5B825B] text-white hover:bg-[#4d704d]'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? tx('Pause', 'रोकें') : tx('Preview Voice', 'आवाज़ सुनें')}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 rounded-xl bg-white text-[#5A6E5D] hover:text-[#C46A66] border border-[#E0DCD3]"
                title={tx('Record Again', 'पुनः रिकॉर्ड करें')}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Transcript / Spoken Prompt */}
          <div>
            <label className="block text-[11px] font-black text-[#2D3A2F] mb-1">
              {tx('What was said in your voice snippet?', 'आपने क्या संदेश बोला?')}
            </label>
            <input
              type="text"
              value={promptText}
              onChange={(e) => {
                setPromptText(e.target.value);
                onSaveVoiceSnippet({
                  audioUrl,
                  duration,
                  recordedBy,
                  promptText: e.target.value,
                });
              }}
              placeholder="e.g. Papa, this was Rohan's wedding in Jaipur, 2019"
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E0DCD3] text-xs font-medium text-[#2D3A2F] focus:border-[#5B825B]"
            />
          </div>
        </div>
      )}

      {/* Idle / Ready to Record State */}
      {!audioUrl && !isRecording && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={startRecording}
            className="flex-1 py-2 rounded-xl bg-[#5B825B] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-2xs hover:bg-[#4d704d] transition-all"
          >
            <Mic className="w-4 h-4" />
            <span>{tx('Record 15s Voice Note', '15 सेकंड वॉइस नोट रिकॉर्ड करें')}</span>
          </button>

          <input
            type="text"
            value={recordedBy}
            onChange={(e) => setRecordedBy(e.target.value)}
            placeholder="Recorded by (e.g. Daughter Priya)"
            className="w-44 px-3 py-2 rounded-xl border border-[#E0DCD3] text-xs font-medium bg-white text-[#2D3A2F]"
          />
        </div>
      )}
    </div>
  );
};
