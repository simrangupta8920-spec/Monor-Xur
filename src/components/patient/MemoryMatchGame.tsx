import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Flower2, Sun, Trees, Bird, Cat, Fish, Star, Heart, Lightbulb, 
  RotateCcw, ArrowLeft, Trophy, Sparkles, Check, Hand 
} from 'lucide-react';
import { soundController } from '../../utils/audio';
import { DDAMetric, AIAnalysisResult, Memory } from '../../types';
import { analyzePlayerDifficulty } from '../../services/aiDifficultyService';
import { useLanguage } from '../../context/LanguageContext';
import { SpeakButton } from '../common/SpeakButton';
import { EasyModeGuide } from './EasyModeGuide';

interface MemoryMatchGameProps {
  onBack: () => void;
  onLogDDAMetric: (metric: DDAMetric) => void;
  playerName?: string;
  mode?: 'default' | 'personalized';
  memories?: Memory[];
}

interface CardItem {
  id: number;
  symbolIndex: number;
  flipped: boolean;
  matched: boolean;
}

// Concrete, real-world unmistakable symbols with high-contrast distinct colors & dual text labels
const SYMBOL_ICONS = [
  { icon: Flower2, nameEn: 'Flower', nameHi: 'फूल', nameAs: 'ফুল', color: '#E11D48', bg: '#FFF1F2', border: '#E11D48' },
  { icon: Sun, nameEn: 'Sun', nameHi: 'सूरज', nameAs: 'সূৰ্য', color: '#D97706', bg: '#FEF3C7', border: '#D97706' },
  { icon: Trees, nameEn: 'Tree', nameHi: 'पेड़', nameAs: 'গছ', color: '#15803D', bg: '#DCFCE7', border: '#15803D' },
  { icon: Bird, nameEn: 'Bird', nameHi: 'चिड़िया', nameAs: 'চৰাই', color: '#0284C7', bg: '#E0F2FE', border: '#0284C7' },
  { icon: Cat, nameEn: 'Cat', nameHi: 'बिल्ली', nameAs: 'মেকুৰী', color: '#EA580C', bg: '#FFEDD5', border: '#EA580C' },
  { icon: Fish, nameEn: 'Fish', nameHi: 'मछली', nameAs: 'মাছ', color: '#0F766E', bg: '#CCFBF1', border: '#0F766E' },
  { icon: Star, nameEn: 'Star', nameHi: 'तारा', nameAs: 'তৰা', color: '#CA8A04', bg: '#FEF9C3', border: '#CA8A04' },
  { icon: Heart, nameEn: 'Heart', nameHi: 'दिल', nameAs: 'হৃদয়', color: '#BE123C', bg: '#FFE4E6', border: '#BE123C' },
];

const LEVEL_CONFIG: Record<number, { labelEn: string; labelHi: string; labelAs: string; pairs: number; hints: number }> = {
  1: { labelEn: 'Easy (3 Pairs)', labelHi: 'सरल (3 जोड़े)', labelAs: 'সহজ (৩টা জোৰা)', pairs: 3, hints: 4 },
  2: { labelEn: 'Medium (4 Pairs)', labelHi: 'मध्यम (4 जोड़े)', labelAs: 'मध्यम (4 जोड़े)', pairs: 4, hints: 3 },
  3: { labelEn: 'Hard (6 Pairs)', labelHi: 'बड़ा (6 जोड़े)', labelAs: 'ডাঙৰ (৬টা জোৰা)', pairs: 6, hints: 2 },
};

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({ 
  onBack, 
  onLogDDAMetric, 
  playerName = 'Player',
  mode = 'default',
  memories = []
}) => {
  const { t, tx, isHindi } = useLanguage();

  const photoMemories = React.useMemo(() => {
    return (memories || []).filter(
      (m) => (!m.mediaType || m.mediaType === 'photo') && m.image && m.image.trim().length > 0
    );
  }, [memories]);

  const [level, setLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('monor_memory_level');
      const val = saved ? parseInt(saved, 10) : 2;
      return val >= 1 && val <= 3 ? val : 2;
    } catch {
      return 2;
    }
  });

  const [deck, setDeck] = useState<CardItem[]>([]);
  const [firstCardIndex, setFirstCardIndex] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(LEVEL_CONFIG[2].hints);
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [consecutiveMistakes, setConsecutiveMistakes] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [warmAffirmation, setWarmAffirmation] = useState<string>('');

  // Consecutive wins streak tracked in background for DDA progression
  const [streaks, setStreaks] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem('monor_memory_streaks_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) {
          return {
            1: Math.max(0, Number(parsed[1]) || 0),
            2: Math.max(0, Number(parsed[2]) || 0),
            3: Math.max(0, Number(parsed[3]) || 0),
          };
        }
      }
      return { 1: 0, 2: 0, 3: 0 };
    } catch {
      return { 1: 0, 2: 0, 3: 0 };
    }
  });

  // Performance tracking for Caregiver & ASHA DDA telemetry (kept fully intact in background)
  const roundStartTime = useRef<number>(Date.now());
  const roundNumber = useRef<number>(1);
  const isShiftPending = useRef<boolean>(false);
  const isCompleteRef = useRef<boolean>(false);
  const lastClickTimeRef = useRef<number>(0);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('monor_memory_level', String(level));
      localStorage.setItem('monor_memory_streaks_v2', JSON.stringify(streaks));
    } catch {
      // ignore
    }
  }, [level, streaks]);

  // Automatically tell the player how to play whenever the game comes to Easy Mode (Level 1)
  const prevLevelRef = useRef<number | null>(null);

  useEffect(() => {
    if (level === 1 && !isComplete) {
      const isFirstLoad = prevLevelRef.current === null;
      const isTransitionToEasy = prevLevelRef.current !== null && prevLevelRef.current !== 1;

      if (isFirstLoad || isTransitionToEasy) {
        const speechTimer = setTimeout(() => {
          soundController.speakBilingual(
            isTransitionToEasy
              ? 'We have adjusted to Easy Mode with 3 friendly pairs. Tap any card on the table to turn it over, then tap a second card to find its matching twin. Take your time, no rush.'
              : 'Welcome to Easy Mode with 3 friendly pairs. Tap any card on the table to turn it over, then tap a second card to find its matching twin.',
            isTransitionToEasy
              ? 'हमने खेल को 3 जोड़ियों वाले सरल मोड में बदल दिया है। किसी भी कार्ड पर टैप करें, फिर दूसरा कार्ड टैप करके जोड़ी मिलाएं। आराम से खेलें।'
              : '3 जोड़ियों वाला सरल मोड तैयार है। किसी कार्ड पर टैप करके चित्र देखें, फिर दूसरा कार्ड टैप करके जोड़ी मिलाएं।',
            undefined,
            isTransitionToEasy
              ? 'আমি ৩টা জোৰাৰ সৈতে সহজ মোডলৈ সলনি কৰিছোঁ। প্ৰথমে এখন কাৰ্ডত টিপি লুটিয়াক, তাৰ পিছত দ্বিতীয় কাৰ্ডত টিপি জোৰা মিলাওক। কোনো খৰখেদা নকৰিব।'
              : '৩টা জোৰাৰ সৈতে সহজ মোড সাজু। প্ৰথমে এখন কাৰ্ডত টিপি লুটিয়াক, তাৰ পিছত দ্বিতীয় কাৰ্ডত টিপি জোৰা মিলাওক।'
          );
        }, 600);

        prevLevelRef.current = level;
        return () => clearTimeout(speechTimer);
      }
    }
    prevLevelRef.current = level;
  }, [level, isComplete]);

  const initDeck = useCallback((lvl: number, resetComplete = true) => {
    const config = LEVEL_CONFIG[lvl] || LEVEL_CONFIG[2];
    const pairsCount = config.pairs;
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
    setHintsLeft(config.hints);
    setMoves(0);
    setMistakes(0);
    setConsecutiveMistakes(0);
    if (resetComplete) {
      setIsComplete(false);
      isCompleteRef.current = false;
    }
    setWarmAffirmation('');
    isShiftPending.current = false;
    roundStartTime.current = Date.now();
  }, []);

  useEffect(() => {
    if (!isCompleteRef.current) {
      initDeck(level, true);
    }
  }, [level, initDeck]);

  // Background AI/DDA adjustment without stressful technical banners on screen
  const handleAIDifficultyDownshift = useCallback(
    async (currentMistakes: number, currentConsecutiveMistakes: number, currentMoves: number, matchedCount: number) => {
      if (isShiftPending.current || level <= 1) return;
      isShiftPending.current = true;

      const fromLvl = level;
      const targetLvl = Math.max(1, fromLvl - 1);
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

        // Reset win streak on level degrade
        setStreaks((prev) => ({ ...prev, [fromLvl]: 0, [targetLvl]: 0 }));
        soundController.playChime(440, 0.5);

        // Show gentle, comforting affirmation explaining how to play if shifted to Easy Mode
        if (targetLvl === 1) {
          setWarmAffirmation(
            tx(
              'Easy Mode active: Tap any card to flip it, then tap another to find its match.',
              'सरल मोड सक्रिय: किसी भी कार्ड पर टैप करें, फिर दूसरा कार्ड टैप करके जोड़ी मिलाएं।',
              'সহজ মোড সক্ৰিয়: কাৰ্ডত টিপি লুটিয়াক আৰু আনখন কাৰ্ডত টিপি জোৰা মিলাওক।'
            )
          );
        } else {
          setWarmAffirmation(
            tx(
              'You are doing wonderfully. Let’s enjoy a gentler set of cards.',
              'आप बहुत सुंदर खेल रहे हैं। आइए कुछ आसान कार्ड मिलाते हैं।',
              'আপুনি বৰ সুন্দৰকৈ খেলিছে। আহক আৰু কিছুমান সহজ কাৰ্ড মিলাওঁ।'
            )
          );
        }

        // Log telemetry for Caregivers
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
          gameType: 'memory_match',
          gameTitle: 'Memory Match',
        });

        // Quietly switch to gentle level
        setLevel(targetLvl);
        initDeck(targetLvl, false);
      } catch {
        // Fallback
        setLevel(targetLvl);
        initDeck(targetLvl, false);
      }
    },
    [level, playerName, hintsLeft, onLogDDAMetric, initDeck, tx]
  );

  const handleCardClick = (index: number) => {
    // Motor tremor protection: debounce rapid multi-taps within 320ms
    const now = Date.now();
    if (now - lastClickTimeRef.current < 320) return;
    lastClickTimeRef.current = now;

    if (isLocked || deck[index].flipped || deck[index].matched) return;

    soundController.playClick();

    const updatedDeck = [...deck];
    updatedDeck[index].flipped = true;
    setDeck(updatedDeck);

    if (firstCardIndex === null) {
      // First card flipped
      setFirstCardIndex(index);
    } else {
      // Second card flipped
      const nextMoves = moves + 1;
      setMoves(nextMoves);

      const firstSymbol = updatedDeck[firstCardIndex].symbolIndex;
      const secondSymbol = updatedDeck[index].symbolIndex;

      if (firstSymbol === secondSymbol) {
        // SUCCESS MATCH!
        soundController.playChime(528, 0.8);
        updatedDeck[firstCardIndex].matched = true;
        updatedDeck[index].matched = true;
        setDeck(updatedDeck);
        setFirstCardIndex(null);
        setConsecutiveMistakes(0);

        // Check if all matched
        const allMatched = updatedDeck.every((c) => c.matched);
        if (allMatched) {
          handleGameWon(nextMoves, mistakes);
        }
      } else {
        // Mismatch
        setIsLocked(true);
        const nextMistakes = mistakes + 1;
        const nextConsecutive = consecutiveMistakes + 1;
        setMistakes(nextMistakes);
        setConsecutiveMistakes(nextConsecutive);

        const currentMatched = updatedDeck.filter((c) => c.matched).length / 2;
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

    const unmatched = deck.filter((c) => !c.matched);
    if (unmatched.length < 2) return;

    const targetSymbol = unmatched[0].symbolIndex;
    const pairIndices = deck
      .map((c, idx) => (c.symbolIndex === targetSymbol && !c.matched ? idx : -1))
      .filter((idx) => idx !== -1);

    if (pairIndices.length === 2) {
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
      }, 1300);
    }
  };

  const handleGameWon = (finalMoves: number, finalMistakes: number) => {
    setIsComplete(true);
    isCompleteRef.current = true;
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
    const currentLvl = level;
    const currentStreak = streaks[currentLvl] || 0;
    const nextStreak = currentStreak + 1;
    const willLevelUp = nextStreak >= 5 && currentLvl < 3;
    const nextLvl = willLevelUp ? currentLvl + 1 : currentLvl;

    if (willLevelUp) {
      setStreaks((prev) => ({ ...prev, [currentLvl]: 0, [nextLvl]: 0 }));
      setLevel(nextLvl);
    } else {
      setStreaks((prev) => ({ ...prev, [currentLvl]: nextStreak }));
    }

    // Log complete telemetry for Caregivers
    onLogDDAMetric({
      timestamp: Date.now(),
      roundNumber: roundNumber.current++,
      difficultyLevel: currentLvl,
      latencyMs: durationMs,
      mistakes: finalMistakes,
      moves: finalMoves,
      hintsUsed: (LEVEL_CONFIG[currentLvl]?.hints || 2) - hintsLeft,
      adaptiveAction: willLevelUp ? 'increased' : 'maintained',
      aiReasoning: willLevelUp
        ? `Player mastered Level ${currentLvl} with 5 victories. Upgraded to Level ${nextLvl}.`
        : 'Player completed round smoothly.',
      fatigueRisk: 'LOW',
      gameType: 'memory_match',
      gameTitle: 'Memory Match',
    });
  };

  const matchedPairsCount = deck.filter((c) => c.matched).length / 2;
  const totalPairsCount = LEVEL_CONFIG[level]?.pairs || 4;

  return (
    <div className="p-4 pb-24 space-y-4 animate-fadeIn relative">
      {/* Top bar with back button, gentle level pills, and audio prompt */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-[#E0DCD3] font-black text-sm text-[#2D3A2F] hover:bg-[#EAF1E8] active:scale-95 shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back')}</span>
          </button>
          <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 border ${
            mode === 'personalized' && photoMemories.length > 0
              ? 'bg-[#FDF0D5] text-[#8C4E0B] border-[#F4DCB4]'
              : 'bg-[#EAF1E8] text-[#5B825B] border-[#5B825B]/20'
          }`}>
            {mode === 'personalized' && photoMemories.length > 0 ? (
              <>
                <Heart className="w-3 h-3 fill-current" />
                <span>{tx('Personalized', 'पारिवारिक', 'ব্যক্তিগত')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-[#E8B25C]" />
                <span>{tx('Default', 'डिफ़ॉल्ट', 'ডিফল্ট')}</span>
              </>
            )}
          </span>
        </div>

        {/* Level toggle with warm, simple labels */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-white p-1 rounded-2xl border border-[#E0DCD3] shadow-xs">
            {[1, 2, 3].map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  soundController.playClick();
                  setLevel(lvl);
                  initDeck(lvl, true);
                  if (lvl === 1) {
                    soundController.speakBilingual(
                      'Easy Mode selected with 3 friendly pairs. Tap any card on the table to start and find its twin.',
                      'सरल मोड चुना गया। 3 जोड़ियां। किसी भी कार्ड पर टैप करके खेलना शुरू करें।',
                      undefined,
                      'সহজ মোড বাছনি কৰা হ’ল। ৩টা জোৰা। মেজৰ যিকোনো এখন কাৰ্ডত টিপি খেল আৰম্ভ কৰক।'
                    );
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  level === lvl 
                    ? 'bg-[#5B825B] text-white shadow-xs' 
                    : 'text-[#5A6E5D] hover:text-[#2D3A2F]'
                }`}
              >
                {lvl === 1 ? tx('Easy', 'सरल', 'সহজ') : lvl === 2 ? tx('Medium', 'मध्यम', 'মধ্যম') : tx('Full', 'बड़ा', 'ডাঙৰ')}
              </button>
            ))}
          </div>

          <SpeakButton
            textEn="Memory matching game. Tap any two cards to find matching pairs of flowers, sun, birds, and animals. Take your time, no rush."
            textHi="जोड़े मिलाने का खेल। दो कार्ड पर टैप करें और एक जैसे चित्र ढूंढें। कोई जल्दी नहीं है, आराम से खेलें।"
            textAs="জোৰা মিলোৱা খেল। ফুল, সূৰ্য, চৰাই আৰু জীৱ-জন্তুৰ মিলা জোৰা বিচাৰিবলৈ যিকোনো দুখন কাৰ্ডত টিপক। কোনো খৰখেদা নকৰাকৈ আৰামেৰে খেলক।"
            size="md"
          />
        </div>
      </div>

      {/* Warm, Soothing Affirmation Header Banner (Zero Clinical Jargon) */}
      <div className="bg-gradient-to-r from-[#EAF1E8] via-[#F4FAF2] to-[#E5EFE2] rounded-3xl p-4 border-2 border-[#5B825B]/30 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#5B825B] text-white flex items-center justify-center shadow-xs shrink-0">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#2D3A2F] leading-tight">
              {tx('Take Your Time & Enjoy', 'आराम से खेलें • हर जोड़ी एक जीत है', 'ধীৰে-সুস্থে খেলি আনন্দ লওক')}
            </h3>
            <p className="text-xs text-[#5A6E5D] font-semibold mt-0.5">
              {warmAffirmation || tx('Every pair found brings peace and happiness.', 'हर मिलते-जुलते चित्र की खोज मन को शांति देती है।', 'প্ৰতিটো মিলা জোৰাই মনলৈ শান্তি আৰু আনন্দ আনে।')}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-[#5B825B] text-xs font-black border border-[#5B825B]/30 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E8B25C]" />
            {tx(`Pairs: ${matchedPairsCount} / ${totalPairsCount}`, `जोड़े मिले: ${matchedPairsCount} / ${totalPairsCount}`, `জোৰা মিলিল: ${matchedPairsCount} / ${totalPairsCount}`)}
          </span>
        </div>
      </div>

      {/* Easy Mode Step-by-Step Guidance Banner */}
      {level === 1 && !isComplete && (
        <EasyModeGuide game="memory" isEasyMode={true} defaultExpanded={true} />
      )}

      {/* Dynamic step instruction bar when in Easy Mode */}
      {level === 1 && !isComplete && (
        <div className="bg-[#FAF8F3] border-2 border-[#5B825B]/40 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-2 shadow-2xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#5B825B] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
              {firstCardIndex === null ? '1' : '2'}
            </div>
            <div>
              <span className="text-xs sm:text-sm font-black text-[#2D3A2F] flex items-center gap-1.5">
                <Hand className="w-3.5 h-3.5 text-[#5B825B]" />
                {firstCardIndex === null
                  ? tx('Step 1: Tap any card on table to turn it over!', 'चरण 1: किसी भी कार्ड पर टैप करके चित्र देखें!', 'পদক্ষেপ ১: মেজৰ যিকোনো এখন কাৰ্ডত টিপি লুটিয়াক!')
                  : tx('Step 2: Now tap a second card to find the matching pair!', 'चरण 2: अब दूसरा कार्ड टैप करके जोड़ी ढूंढें!', 'পদক্ষেপ ২: এতিয়া দ্বিতীয় কাৰ্ডত টিপি জোৰা বিচাৰক!')}
              </span>
              <span className="text-[11px] text-[#5A6E5D] block">
                {firstCardIndex === null
                  ? tx('Choose any picture that catches your eye.', 'अपनी पसंद का कोई भी कार्ड चुनें।', 'আপোনাৰ পছন্দৰ যিকোনো এখন কাৰ্ড বাছক।')
                  : tx('Try to remember where its twin is hiding.', 'याद रखें कि उसका साथी कार्ड कहाँ था।', 'মনত পেলাওক তাৰ আনখন কাৰ্ড ক’ত আছিল।')}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-black text-[#5B825B] bg-[#EAF1E8] px-2.5 py-1 rounded-full border border-[#5B825B]/20 shrink-0">
            {tx('Easy Mode', 'सरल मोड', 'সহজ মোড')}
          </span>
        </div>
      )}

      {/* Control bar: Hints and Restart */}
      <div className="bg-white rounded-3xl p-3.5 px-4 border border-[#E0DCD3] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-[#5A6E5D]">
            {tx('Match matching pictures together', 'एक जैसे चित्रों को मिलाएँ', 'একে ধৰণৰ ছবিবোৰ একেলগে মিলাওক')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUseHint}
            disabled={hintsLeft <= 0 || isLocked || isComplete}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black shadow-xs transition-all cursor-pointer ${
              hintsLeft > 0 && !isComplete
                ? 'bg-[#FDF0D5] text-[#332610] border-2 border-[#eadbbf] hover:bg-[#fae8c1] active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-[#E8B25C]" />
            <span>{tx('Hint', 'संकेत', 'ইংগিত')} ({hintsLeft})</span>
          </button>

          <button
            onClick={() => {
              soundController.playClick();
              initDeck(level, true);
            }}
            className="p-2.5 rounded-2xl bg-white border border-[#E0DCD3] text-[#5A6E5D] hover:bg-[#EAF1E8] shadow-xs active:scale-95 cursor-pointer"
            title={tx('Start Over', 'पुनः प्रारंभ करें', 'আকৌ আৰম্ভ কৰক')}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ITEM F: HIGH-CONTRAST TACTILE CARDS WITH DUAL IDENTIFIERS */}
      <div
        className={`grid gap-3.5 max-w-md mx-auto ${
          LEVEL_CONFIG[level].pairs === 3 ? 'grid-cols-3' : 'grid-cols-4'
        }`}
      >
        {deck.map((card, idx) => {
          const isPersonalizedCard = mode === 'personalized' && photoMemories.length > 0 && card.symbolIndex < photoMemories.length;
          const personalMem = isPersonalizedCard ? photoMemories[card.symbolIndex] : null;
          const sym = SYMBOL_ICONS[card.symbolIndex % SYMBOL_ICONS.length];
          const IconComp = sym.icon;
          const isRevealed = card.flipped || card.matched;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(idx)}
              disabled={isRevealed || isLocked}
              aria-label={
                isRevealed 
                  ? (personalMem ? `${personalMem.title} Card` : `${sym.nameEn} Card`)
                  : `Hidden Card ${idx + 1}`
              }
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-200 select-none cursor-pointer active:scale-95 relative overflow-hidden ${
                card.matched
                  ? 'bg-[#EAF1E8] border-[3.5px] border-[#5B825B] text-[#5B825B] shadow-inner'
                  : card.flipped
                  ? 'bg-white border-[3.5px] shadow-lg ring-4 ring-[#5B825B]/25 scale-[1.03]'
                  : 'bg-[#FAF7F0] border-[3.5px] border-[#D6CFBF] hover:border-[#5B825B] shadow-sm hover:shadow-md'
              }`}
              style={{
                borderColor: card.flipped 
                  ? (personalMem ? '#E8B25C' : sym.border) 
                  : card.matched ? '#5B825B' : undefined,
              }}
            >
              {isRevealed ? (
                <div className="flex flex-col items-center justify-center p-1 w-full h-full">
                  {personalMem ? (
                    <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl overflow-hidden shadow-xs border border-white shrink-0 bg-white">
                      <img 
                        src={personalMem.image} 
                        alt={personalMem.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: sym.bg }}
                    >
                      <IconComp
                        className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.5]"
                        style={{ color: sym.color }}
                      />
                    </div>
                  )}

                  {/* Dual Identifier: Clear bold high-contrast text label */}
                  <span
                    className="mt-1 text-[10px] sm:text-xs font-black tracking-tight line-clamp-1 text-center px-1 max-w-full"
                    style={{ color: card.matched ? '#5B825B' : personalMem ? '#332610' : sym.color }}
                  >
                    {personalMem ? (personalMem.person || personalMem.title) : tx(sym.nameEn, sym.nameHi, sym.nameAs)}
                  </span>

                  {card.matched && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#5B825B] text-white flex items-center justify-center shadow-2xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              ) : (
                /* Face-down inviting tactile surface */
                <div className="flex flex-col items-center justify-center p-2 text-[#8C8474]">
                  <div className="w-9 h-9 rounded-full bg-[#EDE8DC] flex items-center justify-center shadow-inner">
                    <Flower2 className="w-5 h-5 text-[#B5AC9A]" />
                  </div>
                  <span className="text-[10px] font-black text-[#A39987] mt-1">
                    {tx('Tap', 'टैप', 'টিপক')}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Warm Celebration Banner on Completion (Warm, zero-clinical-stress) */}
      {isComplete && (
        <div className="bg-[#EAF1E8] border-2 border-[#5B825B] rounded-3xl p-6 text-center space-y-4 shadow-lg animate-bounce-short">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#5B825B] text-white flex items-center justify-center shadow-md">
            <Trophy className="w-9 h-9 text-[#FDF0D5]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-[#2D3A2F]">
              {tx('Very Well Done!', 'बहुत सुंदर! शाबाश!', 'বৰ ভাল কাম কৰিলে! শাবাছ!')}
            </h3>
            <p className="text-sm font-bold text-[#5B825B] max-w-sm mx-auto">
              {tx(
                'You matched all pairs peacefully. A gentle victory for the mind!',
                'आपने सभी जोड़े बहुत शांति और सुंदरता से मिला लिए।',
                'আপুনি শান্তভাৱে সকলো জোৰা মিলালে। মনৰ এক প্ৰশান্তিময় আনন্দ!'
              )}
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                soundController.playClick();
                initDeck(level, true);
              }}
              className="px-6 py-3.5 rounded-2xl bg-[#5B825B] text-white font-black text-sm shadow-xs hover:bg-[#4d704d] active:scale-95 cursor-pointer"
            >
              {tx('Play Once More', 'फिर से खेलें', 'আকৌ খেলক')}
            </button>
            <button
              onClick={onBack}
              className="px-5 py-3.5 rounded-2xl bg-white border border-[#E0DCD3] text-[#2D3A2F] font-bold text-sm hover:bg-gray-50 active:scale-95 cursor-pointer"
            >
              {t('back')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
