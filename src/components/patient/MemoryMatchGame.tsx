import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Flower2, Sun, Trees, Bird, Cat, Fish, Star, Heart, Lightbulb, RotateCcw, ArrowLeft, Trophy, Sparkles, Brain, Info, Check, ShieldAlert, Zap
} from 'lucide-react';
import { soundController } from '../../utils/audio';
import { DDAMetric, AIAnalysisResult } from '../../types';
import { analyzePlayerDifficulty } from '../../services/aiDifficultyService';

interface MemoryMatchGameProps {
  onBack: () => void;
  onLogDDAMetric: (metric: DDAMetric) => void;
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

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({ onBack, onLogDDAMetric }) => {
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

  // AI-driven automatic difficulty downshift when player struggles
  const handleAIAutoShiftToEasy = useCallback(
    async (currentMistakes: number, currentConsecutiveMistakes: number, currentMoves: number, matchedCount: number) => {
      if (isShiftPending.current || level <= 1) return;
      isShiftPending.current = true;
      setIsAnalyzing(true);

      const elapsedSec = Math.round((Date.now() - roundStartTime.current) / 1000);

      try {
        const aiResult = await analyzePlayerDifficulty({
          playerName: 'Anita',
          currentLevel: level,
          moves: currentMoves,
          mistakes: currentMistakes,
          consecutiveMistakes: currentConsecutiveMistakes,
          matchedPairs: matchedCount,
          totalPairs: LEVEL_CONFIG[level].pairs,
          elapsedSeconds: elapsedSec,
          triggerEvent: 'mistake',
        });

        setLatestAIResult(aiResult);

        // If the AI model decides player is not able to handle this difficulty
        if (aiResult.triggerAutoShift || aiResult.action === 'EASE_DIFFICULTY') {
          soundController.playChime(396, 0.7); // Gentle relaxing frequency
          const fromLvl = level;
          const targetLvl = 1; // Auto shift to Easy

          setAutoShiftBanner({
            show: true,
            reason: aiResult.reasoning,
            encouragement: aiResult.encouragement,
            fromLevel: fromLvl,
            toLevel: targetLvl,
            modelSource: aiResult.modelSource,
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

          // Shift difficulty level to Easy after a brief visual cue
          setTimeout(() => {
            setLevel(targetLvl);
            isShiftPending.current = false;
          }, 600);
        } else {
          isShiftPending.current = false;
        }
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
        const matchedPairsCount = updatedDeck.filter((c) => c.matched).length / 2;
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

        // Trigger AI analysis if player is struggling (3+ consecutive wrong or 4+ total wrong on Medium/Hard)
        if (level > 1 && (nextConsecutive >= 3 || (nextMistakes >= 4 && currentMatched <= 1))) {
          handleAIAutoShiftToEasy(nextMistakes, nextConsecutive, nextMoves, currentMatched);
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
    setIsAnalyzing(true);

    try {
      // AI Comprehensive Round Assessment
      const aiResult = await analyzePlayerDifficulty({
        playerName: 'Anita',
        currentLevel: level,
        moves: finalMoves,
        mistakes: finalMistakes,
        consecutiveMistakes: 0,
        matchedPairs: LEVEL_CONFIG[level].pairs,
        totalPairs: LEVEL_CONFIG[level].pairs,
        elapsedSeconds: Math.round(durationMs / 1000),
        triggerEvent: 'round_complete',
      });

      setLatestAIResult(aiResult);
      setHelperMessage(aiResult.encouragement || "Excellent memory workout! Well done Anita.");

      const adaptiveAction = 
        aiResult.action === 'INCREASE_DIFFICULTY' ? 'increased' :
        aiResult.action === 'EASE_DIFFICULTY' ? 'eased' : 'maintained';

      onLogDDAMetric({
        timestamp: Date.now(),
        roundNumber: roundNumber.current++,
        difficultyLevel: level,
        latencyMs: durationMs,
        mistakes: finalMistakes,
        moves: finalMoves,
        hintsUsed: LEVEL_CONFIG[level].hints - hintsLeft,
        adaptiveAction,
        aiReasoning: aiResult.reasoning,
        aiModel: aiResult.modelSource,
        fatigueRisk: aiResult.fatigueRisk,
      });
    } catch {
      setHelperMessage("Excellent memory workout! Well done Anita.");
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
    <div className="p-4 pb-24 space-y-4 animate-fadeIn">
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
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-[#2D3A2F]">AI Adaptive Engine</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#5B825B] bg-white/90 px-2 py-0.5 rounded-full border border-[#5B825B]/20">
                <Sparkles className="w-2.5 h-2.5 text-[#E8B25C]" />
                {isAnalyzing ? 'Analyzing Input...' : 'Active Monitoring'}
              </span>
            </div>
            <p className="text-[11px] text-[#5A6E5D] font-medium leading-tight">
              {consecutiveMistakes >= 2
                ? `Tracking ${consecutiveMistakes} wrong attempts • Ready to ease difficulty`
                : isAnalyzing
                ? 'Evaluating cognitive response & error velocity...'
                : `Tracking accuracy in real-time. Auto-shifts to Easy if struggling.`}
            </p>
          </div>
        </div>

        {isAnalyzing && (
          <div className="w-5 h-5 border-2 border-[#5B825B] border-t-transparent rounded-full animate-spin shrink-0" />
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
                <h4 className="font-black text-sm text-[#2D3A2F]">AI Comfort Shift: Easy Level Activated</h4>
                <p className="text-[11px] font-bold text-[#332610]">
                  Shifted from Level {autoShiftBanner.fromLevel} → Easy (3 Pairs)
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
            <span className="font-bold text-[#5B825B]">Board Re-calibrated for Maximum Comfort</span>
          </div>
        </div>
      )}

      {/* Game info bar */}
      <div className="bg-white rounded-3xl p-4 border border-[#E0DCD3] shadow-xs flex items-center justify-between">
        <div className="flex gap-4 text-xs font-extrabold text-[#5A6E5D]">
          <div>
            <span className="block text-[#2D3A2F] text-base font-black">{moves}</span>
            <span>Moves</span>
          </div>
          <div>
            <span className={`block text-base font-black ${mistakes >= 3 ? 'text-[#C46A66]' : 'text-[#2D3A2F]'}`}>
              {mistakes}
            </span>
            <span>Mistakes</span>
          </div>
          <div>
            <span className="block text-[#5B825B] text-base font-black">
              {deck.filter((c) => c.matched).length / 2}/{LEVEL_CONFIG[level].pairs}
            </span>
            <span>Matches</span>
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
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
                  The AI model monitors player card selections, tracking how many wrong attempts and mismatches occur sequentially.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] space-y-1.5">
                <span className="font-black text-[#E8B25C] flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> 2. Cognitive Strain Detection
                </span>
                <p className="text-[#5A6E5D]">
                  If 3 consecutive mismatches occur or mistakes spike above threshold on Medium or Hard levels, the model diagnoses that the difficulty is too demanding.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] space-y-1.5">
                <span className="font-black text-[#5B825B] flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> 3. Automatic Shift to Easy Level
                </span>
                <p className="text-[#5A6E5D]">
                  The model immediately downshifts the game to <strong>Easy (3 Pairs)</strong> with soothing encouragement and 4 hints, ensuring zero frustration and sustained cognitive warmth.
                </p>
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
