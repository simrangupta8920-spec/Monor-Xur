import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Flower2, Sun, Trees, Bird, Cat, Fish, Star, Heart, Lightbulb, RotateCcw, ArrowLeft, Trophy, Sparkles, Brain, Info, Check, ShieldAlert, Zap, TrendingUp, TrendingDown
} from 'lucide-react';
import { soundController } from '../../utils/audio';
import { DDAMetric, AIAnalysisResult } from '../../types';
import { analyzePlayerDifficulty } from '../../services/aiDifficultyService';
import { DifficultyToast, DifficultyToastProps } from '../common/DifficultyToast';

interface MemoryMatchGameProps {
  onBack: () => void;
  onLogDDAMetric: (metric: DDAMetric) => void;
  playerName?: string;
}

interface CardItem {
  id: number;
  symbolIndex: number;
  flipped: boolean;
  matched: boolean;
}

const SYMBOL_ICONS = [
  { icon: Flower2, name: 'Flower', color: '#5B825B' },
  { icon: Sun, name: 'Sun', color: '#E8B25C' },
  { icon: Trees, name: 'Tree', color: '#6B8E6B' },
  { icon: Bird, name: 'Bird', color: '#7A9CA4' },
  { icon: Cat, name: 'Cat', color: '#C46A66' },
  { icon: Fish, name: 'Fish', color: '#5A6E5D' },
  { icon: Star, name: 'Star', color: '#E8B25C' },
  { icon: Heart, name: 'Heart', color: '#C46A66' },
];

const LEVEL_CONFIG: Record<number, { label: string; pairs: number; hints: number }> = {
  1: { label: 'Easy (3 Pairs)', pairs: 3, hints: 4 },
  2: { label: 'Medium (4 Pairs)', pairs: 4, hints: 2 },
  3: { label: 'Hard (6 Pairs)', pairs: 6, hints: 1 },
};

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({ onBack, onLogDDAMetric, playerName = 'Player' }) => {
  const [level, setLevel] = useState<number>(2);
  const [deck, setDeck] = useState<CardItem[]>([]);
  const [firstCardIndex, setFirstCardIndex] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(LEVEL_CONFIG[2].hints);
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [consecutiveMistakes, setConsecutiveMistakes] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [helperMessage, setHelperMessage] = useState<string | null>(null);

  // Consecutive wins streak for current level (5 consecutive wins -> upgrade 1 step)
  const [consecutiveWins, setConsecutiveWins] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('monor_memory_consecutive_wins');
      return saved ? Math.max(0, parseInt(saved, 10) || 0) : 0;
    } catch {
      return 0;
    }
  });

  // Keep localStorage in sync with consecutive wins
  useEffect(() => {
    try {
      localStorage.setItem('monor_memory_consecutive_wins', String(consecutiveWins));
    } catch {
      // ignore
    }
  }, [consecutiveWins]);

  // AI / ML Adaptation States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [latestAIResult, setLatestAIResult] = useState<AIAnalysisResult | null>(null);
  const [autoShiftBanner, setAutoShiftBanner] = useState<{
    show: boolean;
    reason: string;
    encouragement: string;
    fromLevel: number;
    toLevel: number;
    modelSource: string;
  } | null>(null);
  const [difficultyToast, setDifficultyToast] = useState<DifficultyToastProps | null>(null);
  const [showAIInfoModal, setShowAIInfoModal] = useState(false);

  // Performance tracking for DDA
  const roundStartTime = useRef<number>(Date.now());
  const roundNumber = useRef<number>(1);
  const isShiftPending = useRef<boolean>(false);

  const initDeck = useCallback((lvl: number) => {
    const pairsCount = LEVEL_CONFIG[lvl].pairs;
    const selectedSymbols = Array.from({ length: pairsCount }, (_, i) => i);
    const rawDeck = [...selectedSymbols, ...selectedSymbols];

    // Shuffle deck
    for (let i = rawDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rawDeck[i], rawDeck[j]] = [rawDeck[j], rawDeck[i]];
    }

    const newDeck: CardItem[] = rawDeck.map((symbolIndex, id) => ({
      id,
      symbolIndex,
      flipped: false,
      matched: false,
    }));

    setDeck(newDeck);
    setFirstCardIndex(null);
    setIsLocked(false);
    setHintsLeft(LEVEL_CONFIG[lvl].hints);
    setMoves(0);
    setMistakes(0);
    setConsecutiveMistakes(0);
    setIsComplete(false);
    setHelperMessage(null);
    isShiftPending.current = false;
    roundStartTime.current = Date.now();
  }, []);

  useEffect(() => {
    initDeck(level);
  }, [level, initDeck]);

  // AI-driven automatic difficulty downshift when player struggles:
  // Strictly shifts 1 level down: Hard (3) -> Medium (2), Medium (2) -> Easy (1)
  const handleAIDifficultyDownshift = useCallback(
    async (currentMistakes: number, currentConsecutiveMistakes: number, currentMoves: number, matchedCount: number) => {
      if (isShiftPending.current || level <= 1) return;
      isShiftPending.current = true;
      setIsAnalyzing(true);

      const fromLvl = level;
      const targetLvl = Math.max(1, fromLvl - 1); // Strictly 1 level below!
      const elapsedSec = Math.round((Date.now() - roundStartTime.current) / 1000);

      try {
        const aiResult = await analyzePlayerDifficulty({
          playerName: playerName || 'Player',
          currentLevel: fromLvl,
          moves: currentMoves,
          mistakes: currentMistakes,
          consecutiveMistakes: currentConsecutiveMistakes,
          matchedPairs: matchedCount,
          totalPairs: LEVEL_CONFIG[fromLvl].pairs,
          elapsedSeconds: elapsedSec,
          triggerEvent: 'mistake',
          consecutiveWins: 0,
        });

        setLatestAIResult(aiResult);

        // Reset win streak on level degrade
        setConsecutiveWins(0);

        soundController.playChime(396, 0.7); // Gentle relaxing frequency

        setAutoShiftBanner({
          show: true,
          reason: aiResult.reasoning,
          encouragement: aiResult.encouragement,
          fromLevel: fromLvl,
          toLevel: targetLvl,
          modelSource: aiResult.modelSource,
        });

        // Trigger subtle notification toast with encouraging language
        setDifficultyToast({
          show: true,
          gameTitle: 'Memory Match',
          action: 'EASE_DIFFICULTY',
          previousLevelName: LEVEL_CONFIG[fromLvl]?.label || `Level ${fromLvl}`,
          newLevelName: LEVEL_CONFIG[targetLvl]?.label || `Level ${targetLvl}`,
          encouragement: aiResult.encouragement || (fromLvl === 3 
            ? `You're doing wonderfully, ${playerName}! We've made the cards a bit gentler with 4 pairs so you can relax, take your time, and enjoy matching.`
            : `You're doing wonderfully, ${playerName}! We've switched to a gentle 3-pair board so you can relax, take your time, and have fun.`),
          reason: aiResult.reasoning,
          onUndo: () => {
            setLevel(fromLvl);
            setDifficultyToast(null);
          },
          onDismiss: () => setDifficultyToast(null),
        });

        // Log AI intervention metric for Caregiver & ASHA telemetry
        onLogDDAMetric({
          timestamp: Date.now(),
          roundNumber: roundNumber.current++,
          difficultyLevel: fromLvl,
          latencyMs: Date.now() - roundStartTime.current,
          mistakes: currentMistakes,
          moves: currentMoves,
          hintsUsed: LEVEL_CONFIG[fromLvl].hints - hintsLeft,
          adaptiveAction: 'eased',
          aiReasoning: aiResult.reasoning,
          aiModel: aiResult.modelSource,
          fatigueRisk: aiResult.fatigueRisk,
        });

        // Shift difficulty level down 1 step after a brief visual cue
        setTimeout(() => {
          setLevel(targetLvl);
          isShiftPending.current = false;
        }, 600);
      } catch (e) {
        console.error('AI difficulty check error:', e);
        isShiftPending.current = false;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [level, hintsLeft, onLogDDAMetric]
  );

  const handleCardClick = (index: number) => {
    if (isLocked) return;
    const card = deck[index];
    if (card.flipped || card.matched) return;

    soundController.playClick();

    // Flip card
    const updatedDeck = [...deck];
    updatedDeck[index] = { ...card, flipped: true };
    setDeck(updatedDeck);

    if (firstCardIndex === null) {
      // First card chosen
      setFirstCardIndex(index);
    } else {
      // Second card chosen
      const nextMoves = moves + 1;
      setMoves(nextMoves);
      const firstCard = deck[firstCardIndex];

      if (firstCard.symbolIndex === card.symbolIndex) {
        // MATCH!
        soundController.playChime(528, 0.9);
        updatedDeck[firstCardIndex].matched = true;
        updatedDeck[index].matched = true;
        setDeck(updatedDeck);
        setFirstCardIndex(null);
        setConsecutiveMistakes(0); // Reset consecutive mistake streak on success

        // Check if all matched
        const allMatched = updatedDeck.every((c) => c.matched);
        if (allMatched) {
          handleGameWon(nextMoves, mistakes);
        }
      } else {
        // MISMATCH / WRONG GUESS
        setIsLocked(true);
        const nextMistakes = mistakes + 1;
        const nextConsecutive = consecutiveMistakes + 1;
        setMistakes(nextMistakes);
        setConsecutiveMistakes(nextConsecutive);

        const currentMatched = updatedDeck.filter((c) => c.matched).length / 2;

        // User degradation thresholds:
        // - In Medium mode (level 2): degrades to Easy if 5 mistakes (or 3 consecutive)
        // - In Hard mode (level 3): degrades to Medium if 10 mistakes (or 4 consecutive, or 3 if 0 matches)
        const isStruggling =
          (level === 2 && (nextMistakes >= 5 || nextConsecutive >= 3)) ||
          (level === 3 && (nextMistakes >= 10 || nextConsecutive >= 4 || (nextConsecutive >= 3 && currentMatched === 0)));

        if (level > 1 && isStruggling) {
          handleAIDifficultyDownshift(nextMistakes, nextConsecutive, nextMoves, currentMatched);
        }

        setTimeout(() => {
          setDeck((currentDeck) =>
            currentDeck.map((c, i) =>
              i === firstCardIndex || i === index ? { ...c, flipped: false } : c
            )
          );
          setFirstCardIndex(null);
          setIsLocked(false);
        }, 950);
      }
    }
  };

  const handleUseHint = () => {
    if (hintsLeft <= 0 || isLocked || isComplete) return;
    soundController.playClick();
    setHintsLeft((h) => h - 1);

    // Find first unmatched pair
    const unmatched = deck.filter((c) => !c.matched);
    if (unmatched.length < 2) return;

    const targetSymbol = unmatched[0].symbolIndex;
    const pairIndices = deck
      .map((c, idx) => (c.symbolIndex === targetSymbol && !c.matched ? idx : -1))
      .filter((idx) => idx !== -1);

    if (pairIndices.length === 2) {
      // Flash the pair
      setIsLocked(true);
      setDeck((prev) =>
        prev.map((c, idx) =>
          pairIndices.includes(idx) ? { ...c, flipped: true } : c
        )
      );

      setTimeout(() => {
        setDeck((prev) =>
          prev.map((c, idx) =>
            pairIndices.includes(idx) && !c.matched ? { ...c, flipped: false } : c
          )
        );
        setIsLocked(false);
      }, 1200);
    }
  };

  const handleGameWon = async (finalMoves: number, finalMistakes: number) => {
    setIsComplete(true);
    soundController.playSuccess();

    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#5B825B', '#E8B25C', '#C46A66', '#7A9CA4'],
      });
    } catch {
      // Ignore
    }

    const durationMs = Date.now() - roundStartTime.current;
    const nextStreak = consecutiveWins + 1;
    setConsecutiveWins(nextStreak);
    setIsAnalyzing(true);

    try {
      // AI Comprehensive Round Assessment
      const aiResult = await analyzePlayerDifficulty({
        playerName: playerName || 'Player',
        currentLevel: level,
        moves: finalMoves,
        mistakes: finalMistakes,
        consecutiveMistakes: 0,
        matchedPairs: LEVEL_CONFIG[level].pairs,
        totalPairs: LEVEL_CONFIG[level].pairs,
        elapsedSeconds: Math.round(durationMs / 1000),
        triggerEvent: 'round_complete',
        consecutiveWins: nextStreak,
      });

      setLatestAIResult(aiResult);

      // RULE: After 5 streaks in Easy mode -> upgrade to Medium (1 level up).
      // After 5 streaks in Medium mode -> upgrade to Hard (1 level up).
      if (nextStreak >= 5 && level < 3) {
        const nextLvl = level + 1;
        setConsecutiveWins(0); // Reset streak upon tier upgrade
        soundController.playChime(660, 1.0); // Triumphant chime

        setDifficultyToast({
          show: true,
          gameTitle: 'Memory Match',
          action: 'INCREASE_DIFFICULTY',
          previousLevelName: LEVEL_CONFIG[level]?.label || `Level ${level}`,
          newLevelName: LEVEL_CONFIG[nextLvl]?.label || `Level ${nextLvl}`,
          encouragement: level === 1
            ? `Splendid 5-game streak, ${playerName}! You've mastered Easy mode and stepped up to Medium (4 Pairs) for a fresh spark!`
            : `Sensational 5-game streak, ${playerName}! You've mastered Medium mode and stepped up to Hard (6 Pairs)!`,
          reason: `5 consecutive victories achieved at ${LEVEL_CONFIG[level]?.label}. Upgraded by 1 level.`,
          onUndo: () => setLevel(level),
          onDismiss: () => setDifficultyToast(null),
        });

        setHelperMessage(
          level === 1
            ? "5 consecutive wins! You've stepped up to Medium Level (4 Pairs)!"
            : "5 consecutive wins! You've stepped up to Hard Level (6 Pairs)!"
        );

        // Auto transition to next level after celebration
        setTimeout(() => {
          setLevel(nextLvl);
        }, 1200);

        onLogDDAMetric({
          timestamp: Date.now(),
          roundNumber: roundNumber.current++,
          difficultyLevel: level,
          latencyMs: durationMs,
          mistakes: finalMistakes,
          moves: finalMoves,
          hintsUsed: LEVEL_CONFIG[level].hints - hintsLeft,
          adaptiveAction: 'increased',
          aiReasoning: `Player reached 5 consecutive wins. Upgraded difficulty 1 level from ${LEVEL_CONFIG[level]?.label} to ${LEVEL_CONFIG[nextLvl]?.label}.`,
          aiModel: aiResult.modelSource,
          fatigueRisk: 'LOW',
        });
      } else {
        setHelperMessage(
          aiResult.encouragement ||
            (level === 3
              ? `Magnificent memory workout on Hard mode! Win streak: ${nextStreak}.`
              : `Excellent memory workout! Win streak: ${nextStreak}/5 towards ${LEVEL_CONFIG[level + 1]?.label}!`)
        );

        onLogDDAMetric({
          timestamp: Date.now(),
          roundNumber: roundNumber.current++,
          difficultyLevel: level,
          latencyMs: durationMs,
          mistakes: finalMistakes,
          moves: finalMoves,
          hintsUsed: LEVEL_CONFIG[level].hints - hintsLeft,
          adaptiveAction: 'maintained',
          aiReasoning: aiResult.reasoning,
          aiModel: aiResult.modelSource,
          fatigueRisk: aiResult.fatigueRisk,
        });
      }
    } catch {
      setHelperMessage(`Excellent memory workout! Well done ${playerName}.`);
      onLogDDAMetric({
        timestamp: Date.now(),
        roundNumber: roundNumber.current++,
        difficultyLevel: level,
        latencyMs: durationMs,
        mistakes: finalMistakes,
        moves: finalMoves,
        hintsUsed: LEVEL_CONFIG[level].hints - hintsLeft,
        adaptiveAction: 'maintained',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-4 pb-24 space-y-4 animate-fadeIn relative">
      {/* Subtle AI Difficulty Adjustment Toast Notification */}
      {difficultyToast && (
        <DifficultyToast
          {...difficultyToast}
          onDismiss={() => setDifficultyToast(null)}
        />
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-[#E0DCD3] font-bold text-sm text-[#2D3A2F] hover:bg-[#EAF1E8] active:scale-95 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Games Hub</span>
        </button>

        {/* Level toggle pills with AI indicator */}
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1 bg-white p-1 rounded-2xl border border-[#E0DCD3] shadow-2xs">
            {[1, 2, 3].map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  soundController.playClick();
                  setLevel(lvl);
                  setConsecutiveWins(0);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all ${
                  level === lvl ? 'bg-[#5B825B] text-white shadow-xs' : 'text-[#5A6E5D] hover:text-[#2D3A2F]'
                }`}
              >
                {lvl === 1 ? 'Easy' : lvl === 2 ? 'Medium' : 'Hard'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAIInfoModal(true)}
            className="p-2 rounded-2xl bg-white border border-[#E0DCD3] text-[#5B825B] hover:bg-[#EAF1E8] shadow-2xs"
            title="How AI Model Adapts Difficulty"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Real-time Cognitive Coach Status Banner */}
      <div className="bg-gradient-to-r from-[#EAF1E8] via-[#F2F7F0] to-[#E5EFE2] rounded-3xl p-3 px-4 border border-[#5B825B]/30 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#5B825B] text-white flex items-center justify-center shadow-2xs shrink-0">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black text-[#2D3A2F]">AI Adaptive Engine</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#5B825B] bg-white/90 px-2 py-0.5 rounded-full border border-[#5B825B]/20">
                <Sparkles className="w-2.5 h-2.5 text-[#E8B25C]" />
                {isAnalyzing ? 'Analyzing Input...' : 'Active Monitoring'}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#2D3A2F] bg-white px-2 py-0.5 rounded-full border border-[#E0DCD3]">
                🔥 Streak: {consecutiveWins}{level < 3 ? '/5 wins to upgrade' : ' (Hard Mastery)'}
              </span>
            </div>
            <p className="text-[11px] text-[#5A6E5D] font-medium leading-tight pt-0.5">
              {consecutiveMistakes >= 2
                ? `Tracking ${consecutiveMistakes} wrong attempts • ${level === 2 ? '5 mistakes or 3 consecutive auto-shifts to Easy' : level === 3 ? '10 mistakes or 4 consecutive auto-shifts to Medium' : 'Gentle assistance active'}`
                : isAnalyzing
                ? 'Evaluating cognitive response & error velocity...'
                : level === 1
                ? 'Easy Mode (3 Pairs) • Win 5 consecutive games to step up to Medium'
                : level === 2
                ? 'Medium Mode (4 Pairs) • Win 5 consecutive games to step up to Hard • 5 mistakes degrades 1 step to Easy'
                : 'Hard Mode (6 Pairs) • Peak Level • 10 mistakes degrades 1 step to Medium'}
            </p>
          </div>
        </div>

        {isAnalyzing && (
          <div className="w-5 h-5 border-2 border-[#5B825B] border-t-transparent rounded-full animate-spin shrink-0 ml-2" />
        )}
      </div>

      {/* Automatic Shift Notification Alert */}
      {autoShiftBanner && autoShiftBanner.show && (
        <div className="bg-gradient-to-br from-[#FDF0D5] to-[#F7E5BD] border-2 border-[#E8B25C] rounded-3xl p-4 shadow-md animate-scaleUp space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-[#332610]">
              <div className="w-7 h-7 rounded-xl bg-[#E8B25C] text-white flex items-center justify-center font-black">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-black text-sm text-[#2D3A2F]">
                  AI Dynamic Adjustment: {LEVEL_CONFIG[autoShiftBanner.toLevel]?.label} Activated
                </h4>
                <p className="text-[11px] font-bold text-[#332610]">
                  Shifted 1 step: {LEVEL_CONFIG[autoShiftBanner.fromLevel]?.label} → {LEVEL_CONFIG[autoShiftBanner.toLevel]?.label}
                </p>
              </div>
            </div>
            <button
              onClick={() => setAutoShiftBanner(null)}
              className="text-xs font-black text-[#332610] hover:text-black bg-white/60 px-2 py-0.5 rounded-lg"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs text-[#332610] font-semibold bg-white/60 p-2.5 rounded-2xl border border-[#e5cf9c]">
            "{autoShiftBanner.encouragement}"
          </p>
          <div className="text-[10px] text-[#332610]/80 flex items-center justify-between pt-1">
            <span>Model: {autoShiftBanner.modelSource === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Adaptive ML Heuristic'}</span>
            <span className="font-bold text-[#5B825B]">Board Re-calibrated (1-Step Downshift)</span>
          </div>
        </div>
      )}

      {/* Game info bar */}
      <div className="bg-white rounded-3xl p-4 border border-[#E0DCD3] shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-4 text-xs font-extrabold text-[#5A6E5D] items-center">
          <div>
            <span className="block text-[#2D3A2F] text-base font-black">{moves}</span>
            <span>Moves</span>
          </div>
          <div>
            <span className={`block text-base font-black ${mistakes >= (level === 3 ? 8 : level === 2 ? 4 : 99) ? 'text-[#C46A66]' : 'text-[#2D3A2F]'}`}>
              {mistakes}{level === 2 ? '/5' : level === 3 ? '/10' : ''}
            </span>
            <span>Mistakes {level === 2 ? '(Degrades at 5)' : level === 3 ? '(Degrades at 10)' : ''}</span>
          </div>
          <div>
            <span className="block text-[#5B825B] text-base font-black">
              {deck.filter((c) => c.matched).length / 2}/{LEVEL_CONFIG[level].pairs}
            </span>
            <span>Matches</span>
          </div>
          {/* Win Streak Indicator */}
          <div className="hidden sm:block pl-2 border-l border-[#E0DCD3]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#EAF1E8] border border-[#5B825B]/30 text-[#5B825B] text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-[#E8B25C]" />
              <span>Streak: {consecutiveWins}{level < 3 ? '/5 to Level Up' : ' (Hard Mastery)'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUseHint}
            disabled={hintsLeft <= 0 || isLocked || isComplete}
            className={`flex items-center gap-1 px-3.5 py-2 rounded-2xl text-xs font-black shadow-xs transition-all ${
              hintsLeft > 0 && !isComplete
                ? 'bg-[#FDF0D5] text-[#332610] border border-[#eadbbf] hover:bg-[#fae8c1] active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-[#E8B25C]" />
            <span>Hint ({hintsLeft})</span>
          </button>

          <button
            onClick={() => {
              soundController.playClick();
              initDeck(level);
            }}
            className="p-2 rounded-2xl bg-white border border-[#E0DCD3] text-[#5A6E5D] hover:bg-[#EAF1E8] shadow-2xs active:scale-95"
            title="Restart round"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Grid */}
      <div
        className={`grid gap-3.5 max-w-sm mx-auto ${
          LEVEL_CONFIG[level].pairs === 3
            ? 'grid-cols-3'
            : 'grid-cols-4'
        }`}
      >
        {deck.map((card, idx) => {
          const sym = SYMBOL_ICONS[card.symbolIndex];
          const IconComp = sym.icon;
          const isRevealed = card.flipped || card.matched;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(idx)}
              disabled={isRevealed || isLocked}
              aria-label={`Card ${idx + 1}`}
              className={`aspect-square rounded-2xl border-2 flex items-center justify-center transition-all duration-300 shadow-xs select-none active:scale-95 ${
                card.matched
                  ? 'bg-[#EAF1E8] border-[#5B825B] text-[#5B825B] scale-95 opacity-90'
                  : card.flipped
                  ? 'bg-white border-[#5B825B] shadow-md ring-2 ring-[#5B825B]/20'
                  : 'bg-[#FDFBF7] border-[#E0DCD3] hover:border-[#87A987] hover:bg-[#F0D8D6]/30'
              }`}
            >
              {isRevealed ? (
                <div className="flex flex-col items-center">
                  <IconComp className="w-9 h-9" style={{ color: sym.color }} />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#E0DCD3]/50 flex items-center justify-center text-xs font-black text-[#5A6E5D]">
                  ?
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Game complete banner */}
      {isComplete && (
        <div className="bg-[#EAF1E8] border-2 border-[#5B825B] rounded-3xl p-5 text-center space-y-3 shadow-md animate-bounce-short">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#5B825B] text-white flex items-center justify-center shadow-md">
            <Trophy className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-[#2D3A2F]">All Matched!</h3>
          <p className="text-sm font-semibold text-[#2D3A2F]/90 max-w-xs mx-auto">
            {helperMessage}
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#5B825B]/30 text-xs font-black text-[#5B825B]">
            <Sparkles className="w-4 h-4 text-[#E8B25C]" />
            <span>Consecutive Wins: {consecutiveWins}{level < 3 ? '/5 to Level Up' : ' (Hard Mastery)'}</span>
          </div>

          {latestAIResult && (
            <div className="bg-white/90 p-3 rounded-2xl border border-[#5B825B]/30 text-xs text-left max-w-xs mx-auto space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-[#5B825B] uppercase text-[10px]">AI Cognitive Feedback</span>
                <span className="text-[10px] font-bold text-gray-500">{latestAIResult.modelSource}</span>
              </div>
              <p className="text-[11px] text-[#2D3A2F] font-medium">{latestAIResult.reasoning}</p>
            </div>
          )}

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                soundController.playClick();
                initDeck(level);
              }}
              className="px-6 py-3 rounded-2xl bg-[#5B825B] text-white font-black text-sm shadow-xs hover:bg-[#4d704d] active:scale-95"
            >
              Play Again
            </button>
            <button
              onClick={onBack}
              className="px-5 py-3 rounded-2xl bg-white border border-[#E0DCD3] text-[#2D3A2F] font-bold text-sm hover:bg-gray-50 active:scale-95"
            >
              Back to Hub
            </button>
          </div>
        </div>
      )}

      {/* Modal: How the AI Model Works */}
      {showAIInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#5B825B] text-white flex items-center justify-center shadow-xs">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#2D3A2F]">AI Dynamic Difficulty Model</h3>
                  <p className="text-xs text-[#5A6E5D]">Powered by Gemini 3.8 Flash & Adaptive ML</p>
                </div>
              </div>
              <button
                onClick={() => setShowAIInfoModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-sm flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#2D3A2F] leading-relaxed">
              <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] space-y-1.5">
                <span className="font-black text-[#5B825B] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 1. Real-time Response & Mistake Tracking
                </span>
                <p className="text-[#5A6E5D]">
                  The AI model monitors player card selections, tracking mistakes, wrong attempts, and error velocity in real-time.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] space-y-1.5">
                <span className="font-black text-[#C46A66] flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> 2. 1-Step Cognitive Strain Downshift
                </span>
                <p className="text-[#5A6E5D]">
                  If the player experiences difficulty, the system <strong>strictly auto-shifts 1 step below</strong> (never jumps directly to Easy from Hard):
                </p>
                <ul className="list-disc pl-5 text-[#5A6E5D] space-y-0.5">
                  <li><strong>Hard Mode (Level 3):</strong> Degrades 1 step to Medium after <strong>10 mistakes</strong> (or 4 consecutive wrong).</li>
                  <li><strong>Medium Mode (Level 2):</strong> Degrades 1 step to Easy after <strong>5 mistakes</strong> (or 3 consecutive wrong).</li>
                </ul>
              </div>

              <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] space-y-1.5">
                <span className="font-black text-[#5B825B] flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> 3. 5-Win Streak Level Upgrade
                </span>
                <p className="text-[#5A6E5D]">
                  After <strong>5 consecutive wins</strong>, difficulty advances 1 level up:
                </p>
                <ul className="list-disc pl-5 text-[#5A6E5D] space-y-0.5">
                  <li><strong>Easy Mode (3 Pairs):</strong> 5 consecutive wins upgrades to Medium (4 Pairs).</li>
                  <li><strong>Medium Mode (4 Pairs):</strong> 5 consecutive wins upgrades to Hard (6 Pairs).</li>
                </ul>
              </div>

              {/* Interactive Caregiver / Clinician Test Simulator */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#F4F8F3] to-[#EAF1E8] border border-[#5B825B]/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#2D3A2F] flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-[#E8B25C]" />
                    Caregiver / Clinician Test Simulator
                  </span>
                  <span className="text-[10px] font-bold text-[#5B825B] bg-white px-2 py-0.5 rounded-full border border-[#5B825B]/30">
                    Live: Level {level} • {consecutiveWins}/5 Wins
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setShowAIInfoModal(false);
                      if (level <= 1) {
                        // Switch to Medium first to test degradation to Easy
                        setLevel(2);
                        setTimeout(() => {
                          handleAIDifficultyDownshift(5, 3, 7, 0);
                        }, 150);
                      } else {
                        const simMistakes = level === 3 ? 10 : 5;
                        const simConsecutive = level === 3 ? 4 : 3;
                        handleAIDifficultyDownshift(simMistakes, simConsecutive, simMistakes + 2, 0);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-white border border-[#C46A66]/40 text-[#C46A66] font-black text-[11px] hover:bg-[#FDF0D5] transition-all text-center flex items-center justify-center gap-1 shadow-2xs active:scale-95"
                  >
                    <TrendingDown className="w-3.5 h-3.5 text-[#C46A66]" />
                    <span>Simulate Mistake Limit (Degrade 1 Step)</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowAIInfoModal(false);
                      const currentLvl = level >= 3 ? 1 : level;
                      const nextLvl = currentLvl + 1;
                      setLevel(currentLvl);
                      setConsecutiveWins(5);

                      soundController.playChime(660, 1.0);
                      setDifficultyToast({
                        show: true,
                        gameTitle: 'Memory Match',
                        action: 'INCREASE_DIFFICULTY',
                        previousLevelName: LEVEL_CONFIG[currentLvl]?.label || `Level ${currentLvl}`,
                        newLevelName: LEVEL_CONFIG[nextLvl]?.label || `Level ${nextLvl}`,
                        encouragement: currentLvl === 1
                          ? `Splendid 5-game streak, ${playerName}! You've mastered Easy mode and stepped up to Medium (4 Pairs) for a fresh spark!`
                          : `Sensational 5-game streak, ${playerName}! You've mastered Medium mode and stepped up to Hard (6 Pairs)!`,
                        reason: `5 consecutive victories achieved at ${LEVEL_CONFIG[currentLvl]?.label}. Upgraded 1 level.`,
                        onUndo: () => setLevel(currentLvl),
                        onDismiss: () => setDifficultyToast(null),
                      });

                      setTimeout(() => {
                        setLevel(nextLvl);
                        setConsecutiveWins(0);
                      }, 1000);
                    }}
                    className="p-2.5 rounded-xl bg-white border border-[#5B825B]/40 text-[#5B825B] font-black text-[11px] hover:bg-[#EAF1E8] transition-all text-center flex items-center justify-center gap-1 shadow-2xs active:scale-95"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-[#5B825B]" />
                    <span>Simulate 5th Win (Upgrade 1 Step)</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#5B825B]/20">
                  <button
                    onClick={() => {
                      setShowAIInfoModal(false);
                      setDifficultyToast({
                        show: true,
                        gameTitle: 'Memory Match',
                        action: 'EASE_DIFFICULTY',
                        previousLevelName: 'Hard (6 Pairs)',
                        newLevelName: 'Medium (4 Pairs)',
                        encouragement: `You're doing wonderfully, ${playerName}! We've made the cards a little gentler so you can relax, take your time, and enjoy matching.`,
                        reason: "Player reached 10 mistakes on Hard mode. Auto-shifting 1 step down to Medium mode.",
                        onUndo: () => setLevel(3),
                        onDismiss: () => setDifficultyToast(null),
                      });
                    }}
                    className="p-2 rounded-xl bg-[#FDF0D5] border border-[#E8B25C]/60 text-[#332610] font-black text-[10px] hover:bg-[#fce6b8] transition-all text-center flex items-center justify-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-[#E8B25C]" />
                    <span>Preview Eased Toast</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowAIInfoModal(false);
                      setDifficultyToast({
                        show: true,
                        gameTitle: 'Memory Match',
                        action: 'INCREASE_DIFFICULTY',
                        previousLevelName: 'Easy (3 Pairs)',
                        newLevelName: 'Medium (4 Pairs)',
                        encouragement: `Splendid focus, ${playerName}! 5 wins in a row! We've stepped up the cards for a fun fresh spark.`,
                        reason: "5 consecutive wins achieved. Upgrading 1 level to Medium.",
                        onUndo: () => setLevel(1),
                        onDismiss: () => setDifficultyToast(null),
                      });
                    }}
                    className="p-2 rounded-xl bg-[#EAF1E8] border border-[#5B825B]/60 text-[#1E3B1E] font-black text-[10px] hover:bg-[#d8e8d5] transition-all text-center flex items-center justify-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-[#5B825B]" />
                    <span>Preview Advance Toast</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAIInfoModal(false)}
              className="w-full py-3 rounded-2xl bg-[#5B825B] text-white font-black text-sm shadow-xs hover:bg-[#4d704d]"
            >
              Got it, continue playing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
