import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, Heart, TrendingDown, TrendingUp, X, RotateCcw } from 'lucide-react';
import { soundController } from '../../utils/audio';

export interface DifficultyToastProps {
  show: boolean;
  gameTitle: string;
  action: 'EASE_DIFFICULTY' | 'INCREASE_DIFFICULTY' | 'MAINTAIN';
  previousLevelName: string;
  newLevelName: string;
  encouragement: string;
  reason?: string;
  timeTaken?: number;
  averageTime?: number;
  durationMs?: number;
  onUndo?: () => void;
  onDismiss: () => void;
}

export const DifficultyToast: React.FC<DifficultyToastProps> = ({
  show,
  gameTitle,
  action,
  previousLevelName,
  newLevelName,
  encouragement,
  reason,
  timeTaken,
  averageTime,
  durationMs = 7000,
  onUndo,
  onDismiss,
}) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const elapsedRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!show) {
      setProgress(100);
      elapsedRef.current = 0;
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
      return;
    }

    // Play subtle reassuring notification sound on appear
    try {
      if (action === 'EASE_DIFFICULTY') {
        soundController.playChime(396, 0.7); // Gentle grounding frequency
      } else {
        soundController.playChime(528, 0.6); // Uplifting 528Hz frequency
      }
    } catch {
      // Audio autoplay guard
    }

    startTimeRef.current = Date.now() - elapsedRef.current;

    const tick = () => {
      if (isPaused) {
        timerRef.current = requestAnimationFrame(tick);
        return;
      }

      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      elapsedRef.current = elapsed;
      const remainingPct = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setProgress(remainingPct);

      if (elapsed >= durationMs) {
        onDismiss();
      } else {
        timerRef.current = requestAnimationFrame(tick);
      }
    };

    timerRef.current = requestAnimationFrame(tick);

    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [show, durationMs, onDismiss, isPaused, action]);

  if (!show) return null;

  const isEase = action === 'EASE_DIFFICULTY';

  return (
    <aside
      role="status"
      aria-live="polite"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        startTimeRef.current = Date.now() - elapsedRef.current;
        setIsPaused(false);
      }}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => {
        startTimeRef.current = Date.now() - elapsedRef.current;
        setIsPaused(false);
      }}
      className={`fixed top-3 sm:top-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg pointer-events-auto rounded-3xl border-2 shadow-xl backdrop-blur-md transition-all duration-300 animate-toast-in overflow-hidden ${
        isEase
          ? 'bg-[#FFFDF8]/95 border-[#E8B25C]/50 shadow-[#E8B25C]/10 text-[#332610]'
          : 'bg-[#F9FCF8]/95 border-[#5B825B]/45 shadow-[#5B825B]/10 text-[#243B24]'
      }`}
    >
      <div className="p-4 sm:p-4.5 space-y-2.5">
        {/* Top bar: Badge & Dismiss */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                isEase
                  ? 'bg-[#FDF0D5] border-[#E8B25C]/40 text-[#5C3F0A]'
                  : 'bg-[#EAF1E8] border-[#5B825B]/40 text-[#284828]'
              }`}
            >
              {isEase ? (
                <>
                  <Heart className="w-3 h-3 text-[#C46A66] fill-[#C46A66]/30" />
                  <span>Gentle Comfort Pace</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-[#E8B25C]" />
                  <span>Wonderful Focus</span>
                </>
              )}
            </span>

            <span className="text-[11px] font-bold text-[#6B7E6D]">
              {gameTitle}
            </span>
          </div>

          <button
            onClick={() => {
              soundController.playClick();
              onDismiss();
            }}
            className="w-7 h-7 rounded-full bg-white/80 hover:bg-white text-[#5A6E5D] hover:text-[#2D3A2F] flex items-center justify-center transition-colors border border-black/5 shrink-0"
            title="Dismiss notification"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Main Encouragement Message */}
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs mt-0.5 ${
              isEase ? 'bg-[#E8B25C]' : 'bg-[#5B825B]'
            }`}
          >
            {isEase ? (
              <TrendingDown className="w-5 h-5" />
            ) : (
              <TrendingUp className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-black text-[#2D3A2F] leading-snug">
              {isEase ? 'We adjusted the board for your comfort' : 'Your memory is shining today!'}
            </h4>
            <p className="text-xs text-[#2D3A2F]/90 font-semibold leading-relaxed mt-0.5">
              "{encouragement}"
            </p>
          </div>
        </div>

        {/* Shift details & Undo Action */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-black/5 text-xs flex-wrap">
          <div className="flex items-center gap-1.5 font-black text-[11px]">
            <span className="px-2 py-0.5 rounded-lg bg-white/90 border border-black/10 text-[#5A6E5D]">
              {previousLevelName}
            </span>
            <span className="text-[#8A8070]">➔</span>
            <span
              className={`px-2 py-0.5 rounded-lg font-black border ${
                isEase
                  ? 'bg-[#FDF0D5] border-[#E8B25C]/50 text-[#332610]'
                  : 'bg-[#EAF1E8] border-[#5B825B]/50 text-[#1E3B1E]'
              }`}
            >
              {newLevelName}
            </span>

            {timeTaken !== undefined && averageTime !== undefined && (
              <span className="text-[10px] text-[#8A8070] font-medium hidden sm:inline ml-1">
                ({timeTaken}s vs {averageTime}s avg)
              </span>
            )}
          </div>

          {onUndo && (
            <button
              onClick={() => {
                soundController.playClick();
                onUndo();
                onDismiss();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white hover:bg-[#F8F6F0] border border-black/10 text-[11px] font-bold text-[#2D3A2F] transition-all shadow-2xs hover:scale-105 active:scale-95"
            >
              <RotateCcw className="w-3 h-3 text-[#5A6E5D]" />
              <span>Undo & Keep {previousLevelName}</span>
            </button>
          )}
        </div>
      </div>

      {/* Subtle Auto-Dismiss Depleting Progress Bar */}
      <div className="h-1 w-full bg-black/5 overflow-hidden">
        <div
          className={`h-full transition-all ease-linear ${
            isEase ? 'bg-[#E8B25C]' : 'bg-[#5B825B]'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </aside>
  );
};
