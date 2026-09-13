import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ArrowLeft, CheckCircle2, Wind } from 'lucide-react';
import { soundController } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../context/LanguageContext';

interface BreathingExerciseProps {
  onBack: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale';
type Status = 'idle' | 'running' | 'paused' | 'done';

const INHALE_MS = 4000;
const HOLD_MS = 2000;
const EXHALE_MS = 6000;
const TOTAL_CYCLES = 4;

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({ onBack }) => {
  const { t, isHindi } = useLanguage();
  const [status, setStatus] = useState<Status>('idle');
  const [phase, setPhase] = useState<Phase>('inhale');
  const [cycle, setCycle] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleRef = useRef(0);
  const phaseRef = useRef<Phase>('inhale');

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const runPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);

    if (p === 'inhale') {
      soundController.playChime(432, 1.5);
      if (cycleRef.current === 0) {
        soundController.speakBilingual('Breathe in', 'सांस अंदर लें');
      }
      timerRef.current = setTimeout(() => runPhase('hold'), INHALE_MS);
    } else if (p === 'hold') {
      soundController.playChime(528, 1.0);
      if (cycleRef.current === 0) {
        soundController.speakBilingual('Hold', 'रोकें');
      }
      timerRef.current = setTimeout(() => runPhase('exhale'), HOLD_MS);
    } else {
      soundController.playChime(396, 2.0);
      if (cycleRef.current === 0) {
        soundController.speakBilingual('Breathe out slowly', 'धीरे-धीरे सांस छोड़ें');
      }
      timerRef.current = setTimeout(() => {
        const next = cycleRef.current + 1;
        cycleRef.current = next;
        setCycle(next);
        if (next >= TOTAL_CYCLES) {
          finish();
        } else {
          runPhase('inhale');
        }
      }, EXHALE_MS);
    }
  };

  const start = () => {
    clearTimer();
    cycleRef.current = 0;
    setCycle(0);
    setStatus('running');
    runPhase('inhale');
  };

  const pause = () => {
    clearTimer();
    setStatus('paused');
  };

  const resume = () => {
    setStatus('running');
    runPhase(phaseRef.current);
  };

  const stop = () => {
    clearTimer();
    setStatus('idle');
    setCycle(0);
    cycleRef.current = 0;
  };

  const finish = () => {
    clearTimer();
    setStatus('done');
    soundController.playSuccess();
    soundController.speakBilingual('You completed your breathing session. Well done.', 'आपका श्वास अभ्यास पूरा हुआ। बहुत खूब।');
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#7A9CA4', '#5B825B', '#D4E4E6'],
      });
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    return () => {
      clearTimer();
      soundController.stopSpeaking();
    };
  }, []);

  // Circle animation style
  const getCircleScaleClass = () => {
    if (status !== 'running' && status !== 'paused') return 'scale-75';
    if (phase === 'inhale') return 'scale-105 duration-[4000ms]';
    if (phase === 'hold') return 'scale-105 duration-[2000ms]';
    return 'scale-70 duration-[6000ms]';
  };

  return (
    <div className="p-4 pb-24 space-y-5 animate-fadeIn text-center">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            clearTimer();
            soundController.stopSpeaking();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-[#E0DCD3] font-bold text-sm text-[#2D3A2F] hover:bg-[#EAF1E8]"
          aria-label={t('goBack')}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('relaxationTitle')}</span>
        </button>
        <span className="text-xs font-extrabold text-[#5A6E5D]">
          {isHindi
            ? `चक्र ${Math.min(cycle + 1, TOTAL_CYCLES)} / ${TOTAL_CYCLES}`
            : `Cycle ${Math.min(cycle + 1, TOTAL_CYCLES)} of ${TOTAL_CYCLES}`}
        </span>
      </div>

      <div>
        <h2 className="text-2xl font-black text-[#2D3A2F]">{t('breathingTitle')}</h2>
        <p className="text-sm text-[#5A6E5D]">{t('breathingSub')}</p>
      </div>

      {/* Visual Expanding Circle Area */}
      <div className="relative h-72 flex items-center justify-center overflow-hidden my-4">
        {/* Outer gentle decorative ring */}
        <div className="absolute w-64 h-64 rounded-full border-2 border-dashed border-[#87A987]/30 animate-spin-slow" />

        {/* Breathing animated circle */}
        <div
          className={`w-52 h-52 rounded-full bg-gradient-to-br from-[#D4E4E6] via-[#bdd3d6] to-[#87A987] flex flex-col items-center justify-center shadow-lg transition-transform ease-in-out ${getCircleScaleClass()}`}
        >
          <Wind className="w-10 h-10 text-[#1C2A2D]/70 mb-1" />
          <span className="text-2xl font-black tracking-widest text-[#1C2A2D] uppercase">
            {status === 'idle'
              ? isHindi ? 'तैयार' : 'Ready'
              : status === 'done'
              ? isHindi ? 'शांत' : 'Peaceful'
              : phase === 'inhale'
              ? t('breatheIn')
              : phase === 'hold'
              ? t('hold')
              : t('breatheOut')}
          </span>
          <span className="text-xs font-bold text-[#1C2A2D]/80 mt-1">
            {status === 'running'
              ? phase === 'inhale'
                ? isHindi ? 'धीरे से सांस लें (4s)' : 'Gently breathe in (4s)'
                : phase === 'hold'
                ? isHindi ? 'शांत रहें (2s)' : 'Gently pause (2s)'
                : isHindi ? 'धीरे-धीरे सांस छोड़ें (6s)' : 'Slowly breathe out (6s)'
              : isHindi ? 'नीचे शुरू दबाएं' : 'Tap start below'}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-3">
        {status === 'idle' && (
          <button
            onClick={start}
            className="px-8 py-4 rounded-2xl bg-[#5B825B] text-white font-black text-lg flex items-center gap-2 shadow-md hover:bg-[#4d704d] active:scale-95 transition-all"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>{t('startBreathing')}</span>
          </button>
        )}

        {status === 'running' && (
          <>
            <button
              onClick={pause}
              className="px-6 py-3.5 rounded-2xl bg-white border border-[#E0DCD3] font-bold text-base text-[#2D3A2F] flex items-center gap-2 hover:bg-gray-50 active:scale-95"
            >
              <Pause className="w-5 h-5" />
              <span>{t('pauseBreathing')}</span>
            </button>
            <button
              onClick={stop}
              className="px-6 py-3.5 rounded-2xl bg-[#F0D8D6] text-[#3D2423] font-bold text-base flex items-center gap-2 hover:bg-[#ebd0ce] active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              <span>{isHindi ? 'रोकें' : 'Stop'}</span>
            </button>
          </>
        )}

        {status === 'paused' && (
          <>
            <button
              onClick={resume}
              className="px-6 py-3.5 rounded-2xl bg-[#5B825B] text-white font-bold text-base flex items-center gap-2 hover:bg-[#4d704d] active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{t('resumeBreathing')}</span>
            </button>
            <button
              onClick={stop}
              className="px-6 py-3.5 rounded-2xl bg-white border border-[#E0DCD3] text-[#2D3A2F] font-bold text-base hover:bg-gray-50 active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              <span>{isHindi ? 'रीसेट' : 'Reset'}</span>
            </button>
          </>
        )}

        {status === 'done' && (
          <div className="space-y-3">
            <p className="text-base font-extrabold text-[#5B825B] flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-5 h-5" /> {isHindi ? 'आपने अपना शांत श्वास सत्र पूरा कर लिया!' : 'You completed your mindful breathing session!'}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={start}
                className="px-6 py-3 rounded-2xl bg-[#5B825B] text-white font-black text-sm hover:bg-[#4d704d]"
              >
                {isHindi ? 'सत्र दोहराएं' : 'Repeat Session'}
              </button>
              <button
                onClick={() => {
                  clearTimer();
                  soundController.stopSpeaking();
                  onBack();
                }}
                className="px-6 py-3 rounded-2xl bg-white border border-[#E0DCD3] text-[#2D3A2F] font-bold text-sm hover:bg-gray-50"
              >
                {isHindi ? 'समाप्त' : 'Finish'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
