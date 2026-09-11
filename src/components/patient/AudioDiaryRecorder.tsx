import React, { useState, useEffect, useRef } from 'react';
import { Memory, MemoryCategory } from '../../types';
import { Mic, MicOff, Square, Play, Pause, RotateCcw, Check, X, Sparkles, Volume2, Calendar, User, Tag } from 'lucide-react';
import { soundController } from '../../utils/audio';
import { useLanguage } from '../../context/LanguageContext';

interface AudioDiaryRecorderProps {
  patientName?: string;
  onSave: (memory: Memory) => void;
  onClose: () => void;
}

// Calming artistic theme illustrations for audio memories
const DIARY_THEMES = [
  {
    id: 'garden',
    name: 'Serene Garden',
    hindiName: 'शांत बगीचा',
    url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80',
    color: 'from-emerald-500/30 to-teal-700/30',
  },
  {
    id: 'sunset',
    name: 'Warm Sunset',
    hindiName: 'सुंदर सूर्यास्त',
    url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&auto=format&fit=crop&q=80',
    color: 'from-amber-500/30 to-rose-700/30',
  },
  {
    id: 'hearth',
    name: 'Cozy Memories',
    hindiName: 'सुखद यादें',
    url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
    color: 'from-orange-500/30 to-amber-800/30',
  },
  {
    id: 'sky',
    name: 'Calm River',
    hindiName: 'शांत नदी',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    color: 'from-sky-500/30 to-blue-700/30',
  },
];

export const AudioDiaryRecorder: React.FC<AudioDiaryRecorderProps> = ({
  patientName = 'Friend',
  onSave,
  onClose,
}) => {
  const { t, isHindi } = useLanguage();

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);

  // Audio Playback of recorded voice
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Diary metadata fields
  const [title, setTitle] = useState('');
  const [person, setPerson] = useState(patientName);
  const [category, setCategory] = useState<MemoryCategory>('Voice Diary');
  const [selectedTheme, setSelectedTheme] = useState(DIARY_THEMES[0]);

  // References for browser APIs
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef(false);

  // Detect SpeechRecognition support on mount
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = isHindi ? 'hi-IN' : 'en-US';

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTranscripts = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscripts += item[0].transcript + ' ';
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (finalTranscripts) {
          setTranscript((prev) => {
            const updated = (prev ? prev + ' ' : '') + finalTranscripts.trim();
            // Automatically propose a title if still empty
            if (!title) {
              const previewWords = updated.split(' ').slice(0, 5).join(' ');
              setTitle(previewWords.charAt(0).toUpperCase() + previewWords.slice(1));
            }
            return updated;
          });
        }
        setInterimText(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // If the user hasn't pressed stop manually, restart continuous listening
        if (!isManuallyStoppedRef.current && isListening) {
          try {
            recognition.start();
          } catch {
            // ignore if already started
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Failed to initialize SpeechRecognition:', err);
      setSpeechSupported(false);
    }

    return () => {
      isManuallyStoppedRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [isHindi]);

  // Timer handling
  useEffect(() => {
    if (isListening) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isListening]);

  // Start recording speech & audio
  const handleStartRecording = async () => {
    soundController.playClick();
    isManuallyStoppedRef.current = false;
    setInterimText('');

    // 1. Start SpeechRecognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('SpeechRecognition already running or failed:', err);
      }
    } else {
      setIsListening(true);
    }

    // 2. Start MediaRecorder for actual voice capture if available
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (audioBlob.size > 0) {
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
          }
          // Stop audio tracks
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
      }
    } catch (micErr) {
      console.warn('Microphone audio recording not available:', micErr);
    }
  };

  // Stop recording
  const handleStopRecording = () => {
    soundController.playSuccess();
    isManuallyStoppedRef.current = true;
    setIsListening(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
  };

  // Reset recording
  const handleResetRecording = () => {
    soundController.playClick();
    isManuallyStoppedRef.current = true;
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    setTranscript('');
    setInterimText('');
    setRecordingTime(0);
    setAudioUrl(null);
  };

  // Audio Playback controls
  const togglePlayRecordedAudio = () => {
    soundController.playClick();
    if (!audioPlayerRef.current && audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlayingAudio(false);
      audioPlayerRef.current = audio;
    }

    if (audioPlayerRef.current) {
      if (isPlayingAudio) {
        audioPlayerRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioPlayerRef.current.play();
        setIsPlayingAudio(true);
      }
    } else if (transcript) {
      // Fallback: Speak transcript with text-to-speech if media recorder was unavailable
      if (isPlayingAudio) {
        soundController.stopSpeaking();
        setIsPlayingAudio(false);
      } else {
        setIsPlayingAudio(true);
        soundController.speak(transcript, () => setIsPlayingAudio(false));
      }
    }
  };

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Save diary as a new memory entry
  const handleSaveMemory = () => {
    const finalDescription = transcript.trim() || 'Spoken voice reflection.';
    const finalTitle = title.trim() || `Voice Reflection (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;

    const newMemory: Memory = {
      id: `mem_audio_${Date.now()}`,
      title: finalTitle,
      person: person.trim() || patientName,
      category,
      image: selectedTheme.url,
      mediaType: 'audio',
      audioUrl: audioUrl || undefined,
      description: finalDescription,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      isVoiceDiary: true,
      createdAt: new Date().toISOString(),
    };

    soundController.playSuccess();
    onSave(newMemory);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#FDFBF7] rounded-3xl max-w-lg w-full border border-[#E0DCD3] shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-white px-5 py-4 border-b border-[#E0DCD3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF1E8] text-[#5B825B] flex items-center justify-center shadow-xs">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#2D3A2F] leading-tight">
                {t('recordMemory')}
              </h3>
              <p className="text-xs text-[#5A6E5D]">
                {isHindi ? 'खुलकर बोलें—आपकी बातें एक सुरक्षित याद बन जाएंगी' : 'Speak freely—your words become a saved memory'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundController.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-[#F0EDE6] hover:bg-[#e4dfd7] text-[#5A6E5D] flex items-center justify-center transition-colors"
            title={t('cancel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Main Recording Station */}
          <div className="bg-white rounded-2xl p-5 border border-[#E0DCD3] shadow-xs text-center space-y-4">
            {/* Big Mic Circle Button */}
            <div className="relative inline-block mx-auto">
              {isListening && (
                <div className="absolute -inset-3 rounded-full bg-[#5B825B]/20 animate-ping" />
              )}
              <button
                type="button"
                onClick={isListening ? handleStopRecording : handleStartRecording}
                className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1 transition-all shadow-md active:scale-95 ${
                  isListening
                    ? 'bg-[#C46A66] text-white hover:bg-[#b05854] ring-4 ring-[#C46A66]/30 animate-pulse'
                    : 'bg-[#5B825B] text-white hover:bg-[#4E704E] ring-4 ring-[#5B825B]/20'
                }`}
              >
                {isListening ? (
                  <>
                    <Square className="w-8 h-8 fill-current" />
                    <span className="text-[11px] font-black tracking-wide uppercase">
                      {isHindi ? 'रोकें' : 'Stop'}
                    </span>
                  </>
                ) : (
                  <>
                    <Mic className="w-9 h-9" />
                    <span className="text-[11px] font-black tracking-wide uppercase">
                      {isHindi ? 'बोलें' : 'Speak'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Status & Timer */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F2EB] text-xs font-extrabold text-[#2D3A2F]">
                <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-ping' : 'bg-[#5B825B]'}`} />
                <span>
                  {isListening 
                    ? (isHindi ? 'आपकी आवाज़ सुन रहे हैं...' : 'Listening to your voice...') 
                    : transcript 
                    ? (isHindi ? 'आवाज़ रिकॉर्ड हो गई' : 'Voice recorded') 
                    : (isHindi ? 'रिकॉर्ड करने के लिए तैयार' : 'Ready to record')}
                </span>
                <span className="text-[#5A6E5D] font-mono">({formatTime(recordingTime)})</span>
              </div>
              <p className="text-xs text-[#5A6E5D]">
                {isListening 
                  ? (isHindi ? 'अपने दिन, किसी प्रिय याद या मन की बात बताएं।' : 'Talk about your day, a favorite memory, or thoughts.') 
                  : (isHindi ? 'बोलना शुरू करने के लिए माइक दबाएं।' : 'Tap the microphone to begin talking.')}
              </p>
            </div>

            {/* Audio Preview playback if stopped and audio or transcript exists */}
            {!isListening && (transcript || audioUrl) && (
              <div className="flex items-center justify-center gap-2 pt-1 border-t border-[#F0EDE6]">
                <button
                  type="button"
                  onClick={togglePlayRecordedAudio}
                  className="px-4 py-2 rounded-xl bg-[#EAF1E8] text-[#5B825B] font-extrabold text-xs flex items-center gap-1.5 hover:bg-[#d9e9d6] transition-colors active:scale-95 shadow-2xs"
                >
                  {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlayingAudio ? (isHindi ? 'रोकें' : 'Pause Voice') : (isHindi ? 'आवाज़ सुनें' : 'Listen Back')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetRecording}
                  className="px-3 py-2 rounded-xl bg-[#F5F2EB] text-[#5A6E5D] font-bold text-xs flex items-center gap-1 hover:bg-[#e8e4dc] transition-colors"
                  title={isHindi ? 'मिटाएं' : 'Re-record'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'मिटाएं व फिर बोलें' : 'Clear & Retry'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Speech-to-Text Live Transcript Box */}
          <div className="bg-white rounded-2xl p-4 border border-[#E0DCD3] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#5B825B] tracking-wide flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {isHindi ? 'लिखी जा रही आवाज़' : 'Live Spoken Transcript'}
              </span>
              <span className="text-[11px] font-semibold text-[#8C9E8E]">
                {transcript ? `${transcript.split(' ').filter(Boolean).length} ${isHindi ? 'शब्द' : 'words'}` : (isHindi ? 'स्पष्ट बोलें' : 'Speak clearly')}
              </span>
            </div>

            <div className="min-h-[90px] max-h-[140px] overflow-y-auto p-3 rounded-xl bg-[#FAF8F5] border border-[#EBE7DF] text-sm text-[#2D3A2F] leading-relaxed">
              {transcript ? (
                <>
                  <span>{transcript}</span>
                  {interimText && (
                    <span className="text-[#8C9E8E] italic"> {interimText}...</span>
                  )}
                </>
              ) : interimText ? (
                <span className="text-[#8C9E8E] italic">{interimText}...</span>
              ) : (
                <span className="text-xs text-[#8C9E8E] italic block py-4 text-center">
                  {isHindi ? '"मुझे याद आ रहा था जब हम सब बगीचे में गए थे और पक्षी गा रहे थे..."' : '"I was remembering when we visited the river park and the birds were singing..."'}
                </span>
              )}
            </div>

            {/* Optional manual editing */}
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={isHindi ? 'या यहाँ लिखकर बदलें...' : 'Or type/edit your spoken reflection here...'}
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl border border-[#E0DCD3] bg-white text-[#2D3A2F] focus:outline-none focus:ring-2 focus:ring-[#5B825B]/40 resize-none"
            />
          </div>

          {/* Memory Details Setup */}
          <div className="bg-white rounded-2xl p-4 border border-[#E0DCD3] shadow-xs space-y-3">
            <span className="text-xs font-black uppercase text-[#5A6E5D] tracking-wide block">
              {isHindi ? 'याद का विवरण' : 'Memory Card Details'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#5A6E5D] block mb-1">
                  {isHindi ? 'शीर्षक' : 'Title of this Entry'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isHindi ? 'उदा. दोपहर की सैर' : 'e.g. Afternoon Garden Walk'}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-[#E0DCD3] bg-[#FAF8F5] text-[#2D3A2F] focus:outline-none focus:ring-2 focus:ring-[#5B825B]/40"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#5A6E5D] block mb-1">
                  {isHindi ? 'व्यक्ति / वक्ता' : 'Person / Author'}
                </label>
                <input
                  type="text"
                  value={person}
                  onChange={(e) => setPerson(e.target.value)}
                  placeholder={isHindi ? 'उदा. दादी, राहुल' : 'e.g. Grandma, Rahul'}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-[#E0DCD3] bg-[#FAF8F5] text-[#2D3A2F] focus:outline-none focus:ring-2 focus:ring-[#5B825B]/40"
                />
              </div>
            </div>

            {/* Category selection */}
            <div>
              <label className="text-[11px] font-bold text-[#5A6E5D] block mb-1">
                {isHindi ? 'श्रेणी' : 'Category'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(['Voice Diary', 'Special Moments', 'Family', 'Places', 'People'] as MemoryCategory[]).map((cat) => {
                  let label: string = cat;
                  if (isHindi) {
                    if (cat === 'Voice Diary') label = 'आवाज़ डायरी';
                    if (cat === 'Special Moments') label = 'ख़ास पल';
                    if (cat === 'Family') label = 'परिवार';
                    if (cat === 'Places') label = 'स्थान';
                    if (cat === 'People') label = 'अपने लोग';
                  }
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        soundController.playClick();
                        setCategory(cat);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        category === cat
                          ? 'bg-[#5B825B] text-white shadow-2xs'
                          : 'bg-[#F5F2EB] text-[#5A6E5D] hover:bg-[#e8e4dc]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Backdrop Theme selector */}
            <div>
              <label className="text-[11px] font-bold text-[#5A6E5D] block mb-1">
                {isHindi ? 'थीम तस्वीर' : 'Card Artwork Theme'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {DIARY_THEMES.map((theme) => {
                  const isSelected = selectedTheme.id === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        soundController.playClick();
                        setSelectedTheme(theme);
                      }}
                      className={`relative rounded-xl overflow-hidden aspect-4/3 border-2 transition-all group ${
                        isSelected ? 'border-[#5B825B] scale-105 shadow-xs' : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={theme.url} alt={theme.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-end p-1">
                        <span className="text-[9px] font-black text-white leading-tight truncate">
                          {isHindi ? theme.hindiName : theme.name}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#5B825B] text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {!speechSupported && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
              {isHindi ? 'सूचना: इस ब्राउज़र में माइक व टाइपिंग का उपयोग करके आवाज़ सहेजी जा रही है।' : 'Note: Speech recognition is using manual input & microphone audio capture in this browser environment.'}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-white px-5 py-4 border-t border-[#E0DCD3] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundController.playClick();
              onClose();
            }}
            className="px-4 py-2.5 rounded-2xl bg-[#F5F2EB] text-[#5A6E5D] font-bold text-xs hover:bg-[#e8e4dc] transition-colors"
          >
            {t('cancel')}
          </button>

          <button
            type="button"
            disabled={!transcript && !audioUrl}
            onClick={handleSaveMemory}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 ${
              transcript || audioUrl
                ? 'bg-[#5B825B] text-white hover:bg-[#4E704E] cursor-pointer'
                : 'bg-[#E0DCD3] text-[#8C9E8E] cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{isHindi ? 'यादों में सहेजें' : 'Save to Memories'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
