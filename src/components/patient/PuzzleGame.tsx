import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, Shuffle, CheckCircle2, Sparkles, RotateCcw, 
  Eye, EyeOff, Trophy, Volume2, Image as ImageIcon, 
  Upload, Plus, Check, Heart, HelpCircle, Lightbulb, Play,
  Clock, Brain, Sliders, Timer, TrendingUp, TrendingDown
} from 'lucide-react';
import { Memory, DDAMetric } from '../../types';
import { soundController } from '../../utils/audio';
import { analyzePuzzleDifficulty, PuzzleAIAnalysisResult } from '../../services/aiDifficultyService';

interface PuzzleGameProps {
  memories: Memory[];
  onBack: () => void;
  onLogDDAMetric?: (metric: DDAMetric) => void;
}

interface DefaultPuzzleItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  accent: string;
}

export type GridDimension = 2 | 3 | 4;

export function getPieceGeometry(pieceIdx: number, gridSize: GridDimension) {
  const row = Math.floor(pieceIdx / gridSize);
  const col = pieceIdx % gridSize;
  const bgPosX = gridSize > 1 ? (col / (gridSize - 1)) * 100 : 0;
  const bgPosY = gridSize > 1 ? (row / (gridSize - 1)) * 100 : 0;

  let label = `R${row + 1} C${col + 1}`;
  if (gridSize === 2) {
    if (pieceIdx === 0) label = 'Top Left';
    else if (pieceIdx === 1) label = 'Top Right';
    else if (pieceIdx === 2) label = 'Bottom Left';
    else if (pieceIdx === 3) label = 'Bottom Right';
  } else if (gridSize === 3) {
    const rowNames = ['Top', 'Mid', 'Bottom'];
    const colNames = ['Left', 'Center', 'Right'];
    label = `${rowNames[row]} ${colNames[col]}`;
  }

  return {
    row,
    col,
    bgPos: `${bgPosX}% ${bgPosY}%`,
    bgSize: `${gridSize * 100}% ${gridSize * 100}%`,
    label,
  };
}

function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

const DEFAULT_PUZZLES: DefaultPuzzleItem[] = [
  {
    id: 'def-mango',
    title: 'Juicy Ripe Mango',
    category: 'Everyday Fruit',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
    description: 'Fresh golden Alphonso mango, sweet and ripe with green leaves under the warm sunshine.',
    accent: '#FDF0D5',
  },
  {
    id: 'def-peacock',
    title: 'Dancing Indian Peacock',
    category: 'Bird of India',
    image: 'https://images.unsplash.com/photo-1536514498073-50e69d39c6cf?auto=format&fit=crop&w=800&q=80',
    description: 'Glorious iridescent blue and emerald plumage spread gracefully in celebration.',
    accent: '#D4E4E6',
  },
  {
    id: 'def-marigold',
    title: 'Golden Festive Marigolds',
    category: 'Festive Flower',
    image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=800&q=80',
    description: 'Auspicious bright yellow and saffron marigolds woven into festive garlands.',
    accent: '#FDF0D5',
  },
  {
    id: 'def-tea',
    title: 'Assam Tea Garden',
    category: 'Scenic Landscape',
    image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80',
    description: 'Peaceful misty rolling green tea slopes in the morning breeze of Assam.',
    accent: '#EAF1E8',
  },
  {
    id: 'def-sweets',
    title: 'Festive Laddus & Sweets',
    category: 'Traditional Delicacy',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
    description: 'Delicious golden festive sweets garnished with pistachio and saffron threads.',
    accent: '#F0D8D6',
  },
];

// 4 quadrants for the 2x2 puzzle grid
// 0: Top-Left, 1: Top-Right, 2: Bottom-Left, 3: Bottom-Right
const PIECE_COORDINATES: Record<number, { bgPos: string; label: string; row: number; col: number }> = {
  0: { bgPos: '0% 0%', label: 'Top Left', row: 0, col: 0 },
  1: { bgPos: '100% 0%', label: 'Top Right', row: 0, col: 1 },
  2: { bgPos: '0% 100%', label: 'Bottom Left', row: 1, col: 0 },
  3: { bgPos: '100% 100%', label: 'Bottom Right', row: 1, col: 1 },
};

export const PuzzleGame: React.FC<PuzzleGameProps> = ({ memories, onBack, onLogDDAMetric }) => {
  // Available personalized memories (filter for photo memories with valid image)
  const photoMemories = useMemo(() => {
    return memories.filter(
      (m) => (!m.mediaType || m.mediaType === 'photo') && m.image && m.image.trim().length > 0
    );
  }, [memories]);

  // Check if caregiver has uploaded pictures/memories
  const hasCaregiverUploadedMemories = photoMemories.length > 0;

  // RULE:
  // If caregiver has already uploaded some of the pictures,
  // then the first page which opens after clicking the puzzle should be personalized one only.
  // And if the caregiver has not uploaded any of their personal pictures or any of the memory,
  // then on clicking puzzles, default mode should open first.
  const [mode, setMode] = useState<'personalized' | 'default'>(() => {
    return hasCaregiverUploadedMemories ? 'personalized' : 'default';
  });

  // Default puzzles list with support for dynamically added custom images
  const [defaultPuzzles, setDefaultPuzzles] = useState<DefaultPuzzleItem[]>(DEFAULT_PUZZLES);

  // Selected image object
  const [selectedPersonalizedId, setSelectedPersonalizedId] = useState<string>(
    photoMemories[0]?.id || ''
  );
  const [selectedDefaultId, setSelectedDefaultId] = useState<string>(DEFAULT_PUZZLES[0].id);

  // Keep mode in sync if all memories are removed
  useEffect(() => {
    if (!hasCaregiverUploadedMemories && mode === 'personalized') {
      setMode('default');
    }
  }, [hasCaregiverUploadedMemories, mode]);

  // Keep selectedPersonalizedId valid
  useEffect(() => {
    if (photoMemories.length > 0) {
      if (!selectedPersonalizedId || !photoMemories.some((m) => m.id === selectedPersonalizedId)) {
        setSelectedPersonalizedId(photoMemories[0].id);
      }
    } else {
      setSelectedPersonalizedId('');
    }
  }, [photoMemories, selectedPersonalizedId]);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      soundController.stopSpeaking();
    };
  }, []);

  // Derive current puzzle image and meta
  const currentPuzzle = useMemo(() => {
    if (mode === 'personalized') {
      const found = photoMemories.find((m) => m.id === selectedPersonalizedId) || photoMemories[0];
      if (found) {
        return {
          title: found.title,
          subtitle: found.person || found.category,
          image: found.image,
          description: found.description,
        };
      }
    }
    const foundDefault = defaultPuzzles.find((p) => p.id === selectedDefaultId) || defaultPuzzles[0];
    return {
      title: foundDefault.title,
      subtitle: foundDefault.category,
      image: foundDefault.image,
      description: foundDefault.description,
    };
  }, [mode, selectedPersonalizedId, selectedDefaultId, photoMemories, defaultPuzzles]);

  // Grid size: 2 = 2x2 (4 pieces), 3 = 3x3 (9 pieces), 4 = 4x4 (16 pieces)
  const [gridSize, setGridSize] = useState<GridDimension>(2);
  const totalPieces = gridSize * gridSize;

  // Auto-adjustment configuration and history tracking
  const [autoAdjustEnabled, setAutoAdjustEnabled] = useState<boolean>(true);
  const [completionHistory, setCompletionHistory] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('monor_puzzle_completion_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return [25, 30]; // Baseline initial average (~28s)
  });

  // Calculate previous average completion time (seconds)
  const previousAverageSeconds = useMemo(() => {
    if (completionHistory.length === 0) return 30;
    const sum = completionHistory.reduce((acc, t) => acc + t, 0);
    return Math.max(15, Math.round(sum / completionHistory.length));
  }, [completionHistory]);

  // Live timer state
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Auto-adjustment notification banner state
  const [autoAdjustBanner, setAutoAdjustBanner] = useState<{
    show: boolean;
    reason: string;
    fromGrid: number;
    toGrid: number;
    timeTaken: number;
    averageTime: number;
  } | null>(null);

  // Puzzle State:
  // Board has totalPieces slots. Each slot holds a piece index (0..totalPieces-1) or null.
  const [boardSlots, setBoardSlots] = useState<(number | null)[]>(() =>
    Array.from({ length: 4 }, () => null)
  );
  // Tray holds available unplaced pieces (numbers 0..totalPieces-1)
  const [trayPieces, setTrayPieces] = useState<number[]>([1, 3, 0, 2]);

  // Selection state: tapping a piece from tray or board to place or swap
  const [selectedSource, setSelectedSource] = useState<
    { type: 'tray'; pieceIndex: number } | { type: 'board'; slotIndex: number } | null
  >(null);

  // Assistance toggles
  const [showGhostGuide, setShowGhostGuide] = useState<boolean>(true);
  const [showNumberHints, setShowNumberHints] = useState<boolean>(true);
  const [showReferenceModal, setShowReferenceModal] = useState<boolean>(false);

  // Custom Image input states for Default Mode
  const [isAddingCustomImage, setIsAddingCustomImage] = useState<boolean>(false);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [customImageTitle, setCustomImageTitle] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Metrics & Completion
  const [moves, setMoves] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [hasLoggedMetric, setHasLoggedMetric] = useState<boolean>(false);

  // Victory narration state
  const [narrationText, setNarrationText] = useState<string>('');
  const [isSpeakingNarration, setIsSpeakingNarration] = useState<boolean>(false);

  // Speech helper with visual speaking indicator
  const speakVictoryStory = useCallback((textToSpeak: string) => {
    if (!textToSpeak) return;
    setIsSpeakingNarration(true);
    soundController.speak(textToSpeak, () => {
      setIsSpeakingNarration(false);
    });
  }, []);

  // Shuffle pieces helper
  const shufflePieces = useCallback((size: GridDimension) => {
    const total = size * size;
    const arr = Array.from({ length: total }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // Ensure not already in perfect solved order
    const isAlreadySolved = arr.every((val, idx) => val === idx);
    if (isAlreadySolved && arr.length > 1) {
      [arr[0], arr[1]] = [arr[1], arr[0]];
    }
    return arr;
  }, []);

  // Trigger auto-simplification down to 2x2
  const triggerAutoAdjustment = useCallback(
    (
      fromGrid: GridDimension,
      toGrid: GridDimension,
      timeTaken: number,
      avgTime: number,
      triggerType: 'in_game_struggle' | 'round_complete'
    ) => {
      setGridSize(toGrid);
      const newTotal = toGrid * toGrid;
      const shuffled = shufflePieces(toGrid);
      setBoardSlots(Array.from({ length: newTotal }, () => null));
      setTrayPieces(shuffled);
      setSelectedSource(null);
      setIsComplete(false);
      setMoves(0);
      setStartTime(Date.now());
      setElapsedSeconds(0);
      setHasLoggedMetric(false);

      const reason =
        triggerType === 'in_game_struggle'
          ? `You were working thoughtfully for ${timeTaken}s (past your ${avgTime}s average). We automatically simplified the puzzle from ${fromGrid}×${fromGrid} to 2×2 so you can assemble with relaxed ease!`
          : `That puzzle took ${timeTaken}s, which is significantly longer than your ${avgTime}s average. We automatically simplified your next puzzle to 2×2 to keep things joyful and comfortable!`;

      setAutoAdjustBanner({
        show: true,
        reason,
        fromGrid,
        toGrid,
        timeTaken,
        averageTime: avgTime,
      });

      soundController.playChime(620, 0.4);
      soundController.speak('We made the puzzle a bit simpler for you, so you can relax and have fun!');

      if (onLogDDAMetric) {
        onLogDDAMetric({
          timestamp: Date.now(),
          roundNumber: 1,
          difficultyLevel: 1,
          latencyMs: timeTaken * 1000,
          mistakes: Math.max(0, moves - totalPieces),
          moves,
          hintsUsed: showGhostGuide ? 1 : 0,
          adaptiveAction: 'eased',
          aiReasoning: `Auto-simplified puzzle grid from ${fromGrid}x${fromGrid} to ${toGrid}x${toGrid}: time (${timeTaken}s) significantly exceeded previous average (${avgTime}s).`,
          fatigueRisk: 'MODERATE',
        });
      }
    },
    [shufflePieces, onLogDDAMetric, moves, totalPieces, showGhostGuide]
  );

  // Manual select grid size
  const handleSelectGridSize = (newSize: GridDimension) => {
    soundController.playClick();
    setGridSize(newSize);
    const newTotal = newSize * newSize;
    const shuffled = shufflePieces(newSize);
    setBoardSlots(Array.from({ length: newTotal }, () => null));
    setTrayPieces(shuffled);
    setSelectedSource(null);
    setIsComplete(false);
    setNarrationText('');
    setMoves(0);
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setHasLoggedMetric(false);
    setAutoAdjustBanner(null);
  };

  // Reset / Scramble game for the active image
  const handleScramble = () => {
    soundController.stopSpeaking();
    setIsSpeakingNarration(false);
    soundController.playClick();
    const shuffled = shufflePieces(gridSize);
    setBoardSlots(Array.from({ length: totalPieces }, () => null));
    setTrayPieces(shuffled);
    setSelectedSource(null);
    setIsComplete(false);
    setNarrationText('');
    setMoves(0);
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setHasLoggedMetric(false);
  };

  // Auto-Assemble / Solve / Put It Back
  const handlePutItBack = () => {
    soundController.playSuccess();
    setBoardSlots(Array.from({ length: totalPieces }, (_, i) => i));
    setTrayPieces([]);
    setSelectedSource(null);
    setIsComplete(true);
    triggerVictory(moves + 1);
  };

  // On mount or when image or grid size changes, initialize scrambled
  useEffect(() => {
    soundController.stopSpeaking();
    setIsSpeakingNarration(false);
    const shuffled = shufflePieces(gridSize);
    setBoardSlots(Array.from({ length: totalPieces }, () => null));
    setTrayPieces(shuffled);
    setSelectedSource(null);
    setIsComplete(false);
    setNarrationText('');
    setMoves(0);
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setHasLoggedMetric(false);
  }, [currentPuzzle.image, gridSize, shufflePieces, totalPieces]);

  // Live timer & in-round auto-adjustment check
  useEffect(() => {
    if (isComplete) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;

        // In-round auto-adjustment:
        // If current grid is 3x3 or 4x4, autoAdjust is enabled,
        // and elapsed time is significantly longer than previous average (at least 45s and >= 1.8x average)
        if (
          autoAdjustEnabled &&
          gridSize > 2 &&
          next >= Math.max(45, Math.round(previousAverageSeconds * 1.8))
        ) {
          const correctCount = boardSlots.filter((p, i) => p === i).length;
          if (correctCount < Math.ceil(totalPieces * 0.5)) {
            triggerAutoAdjustment(gridSize, 2, next, previousAverageSeconds, 'in_game_struggle');
          }
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isComplete,
    autoAdjustEnabled,
    gridSize,
    previousAverageSeconds,
    boardSlots,
    totalPieces,
    triggerAutoAdjustment,
  ]);

  // Check victory condition whenever boardSlots change
  useEffect(() => {
    const isSolved = 
      boardSlots.length === totalPieces &&
      boardSlots.every((val, idx) => val === idx);

    if (isSolved && !isComplete) {
      setIsComplete(true);
      triggerVictory(moves);
    }
  }, [boardSlots, isComplete, moves, totalPieces]);

  // Multi-cannon celebratory particle and confetti engine
  const triggerCelebratoryParticles = useCallback(() => {
    try {
      const festivalColors = [
        '#5B825B', // Sage Green
        '#E8B25C', // Warm Gold
        '#C46A66', // Rose Pink
        '#7A9CA4', // Dusty Teal
        '#FFD700', // Bright Golden
        '#FF7043', // Vibrant Marigold
        '#66BB6A', // Fresh Leaf Green
      ];

      // 1. Immediate center cannon explosion
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.55, x: 0.5 },
        colors: festivalColors,
        startVelocity: 36,
        scalar: 1.15,
        ticks: 200,
      });

      // 2. Left side cannon after 160ms (angled inward)
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 60,
          origin: { x: 0.08, y: 0.65 },
          colors: festivalColors,
          startVelocity: 42,
          ticks: 220,
        });
      }, 160);

      // 3. Right side cannon after 320ms (angled inward)
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 60,
          origin: { x: 0.92, y: 0.65 },
          colors: festivalColors,
          startVelocity: 42,
          ticks: 220,
        });
      }, 320);

      // 4. Gentle floating golden sparkle shower after 520ms
      setTimeout(() => {
        confetti({
          particleCount: 45,
          spread: 110,
          origin: { y: 0.3, x: 0.5 },
          colors: ['#FFD700', '#FFA500', '#FFFFFF', '#E8B25C'],
          gravity: 0.65,
          scalar: 1.3,
          ticks: 260,
          startVelocity: 24,
        });
      }, 520);

      // 5. Final celebratory burst after 800ms
      setTimeout(() => {
        confetti({
          particleCount: 40,
          spread: 70,
          origin: { y: 0.5, x: 0.5 },
          colors: ['#5B825B', '#E8B25C', '#FFD700'],
          startVelocity: 30,
          scalar: 1.0,
        });
      }, 800);
    } catch {
      // Confetti fallback
    }
  }, []);

  const triggerVictory = (currentMoves: number) => {
    // Launch celebratory confetti & particle sequence
    triggerCelebratoryParticles();

    // Melodic fanfare
    soundController.playSuccess();

    // Track time taken
    const timeTakenSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const newHistory = [...completionHistory, timeTakenSeconds].slice(-10);
    setCompletionHistory(newHistory);
    try {
      localStorage.setItem('monor_puzzle_completion_history', JSON.stringify(newHistory));
    } catch {
      // Ignore storage error
    }

    // Check if completion time was significantly longer than previous average on larger grid (e.g. 4x4 or 3x3)
    const shouldAutoSimplify =
      autoAdjustEnabled &&
      gridSize > 2 &&
      timeTakenSeconds >= Math.round(previousAverageSeconds * 1.6);

    if (shouldAutoSimplify) {
      const fromG = gridSize;
      setGridSize(2);
      setAutoAdjustBanner({
        show: true,
        reason: `Splendid job finishing! Because this puzzle took ${timeTakenSeconds}s (longer than your ${previousAverageSeconds}s average), we've automatically simplified your next puzzle to 2×2 for optimal relaxation!`,
        fromGrid: fromG,
        toGrid: 2,
        timeTaken: timeTakenSeconds,
        averageTime: previousAverageSeconds,
      });
    }

    // RULE:
    // After solving the puzzle successfully in personalized mode, the picture will be completed.
    // The voice will first tell the picture description (whatever uploaded in the memory part, what that picture is about),
    // and then "great work" or "good job" will come.
    const rawDescription = (currentPuzzle.description || currentPuzzle.title).trim();
    const formattedDesc = rawDescription.endsWith('.') ? rawDescription : `${rawDescription}.`;
    const victorySpeech = `${formattedDesc} Great work! Good job!`;
    setNarrationText(victorySpeech);

    // Speak picture description first, then "Great work! Good job!"
    setTimeout(() => {
      speakVictoryStory(victorySpeech);
    }, 550);

    // Log metric
    if (!hasLoggedMetric && onLogDDAMetric) {
      setHasLoggedMetric(true);
      onLogDDAMetric({
        timestamp: Date.now(),
        roundNumber: 1,
        difficultyLevel: gridSize === 2 ? 1 : gridSize === 3 ? 2 : 3,
        latencyMs: timeTakenSeconds * 1000,
        mistakes: Math.max(0, currentMoves - totalPieces),
        moves: currentMoves,
        hintsUsed: showGhostGuide ? 1 : 0,
        adaptiveAction: shouldAutoSimplify ? 'eased' : 'maintained',
        aiReasoning: shouldAutoSimplify
          ? `Auto-simplified puzzle grid from ${gridSize}x${gridSize} to 2x2: time (${timeTakenSeconds}s) significantly exceeded previous average (${previousAverageSeconds}s).`
          : `Player successfully assembled ${currentPuzzle.title} in ${mode} mode (${gridSize}x${gridSize}) in ${timeTakenSeconds}s.`,
        fatigueRisk: shouldAutoSimplify ? 'MODERATE' : 'LOW',
      });
    }
  };

  // Interactions: Selecting / placing pieces
  const handleTrayPieceClick = (pieceIndex: number) => {
    soundController.playClick();
    if (selectedSource && selectedSource.type === 'tray' && selectedSource.pieceIndex === pieceIndex) {
      // Unselect
      setSelectedSource(null);
    } else {
      setSelectedSource({ type: 'tray', pieceIndex });
    }
  };

  const handleBoardSlotClick = (targetSlot: number) => {
    soundController.playClick();

    // Case 1: A tray piece is selected
    if (selectedSource && selectedSource.type === 'tray') {
      const pieceToPlace = selectedSource.pieceIndex;
      const currentPieceInSlot = boardSlots[targetSlot];

      const newSlots = [...boardSlots];
      newSlots[targetSlot] = pieceToPlace;

      let newTray = trayPieces.filter((p) => p !== pieceToPlace);
      if (currentPieceInSlot !== null) {
        newTray.push(currentPieceInSlot);
      }

      setBoardSlots(newSlots);
      setTrayPieces(newTray);
      setSelectedSource(null);
      setMoves((m) => m + 1);

      // Audio feedback if correct
      if (pieceToPlace === targetSlot) {
        soundController.playChime(580, 0.3);
      }
      return;
    }

    // Case 2: A board slot is selected
    if (selectedSource && selectedSource.type === 'board') {
      const sourceSlot = selectedSource.slotIndex;
      if (sourceSlot === targetSlot) {
        // Unselect
        setSelectedSource(null);
        return;
      }

      // Swap the pieces between sourceSlot and targetSlot
      const newSlots = [...boardSlots];
      const temp = newSlots[targetSlot];
      newSlots[targetSlot] = newSlots[sourceSlot];
      newSlots[sourceSlot] = temp;

      setBoardSlots(newSlots);
      setSelectedSource(null);
      setMoves((m) => m + 1);

      if (newSlots[targetSlot] === targetSlot) {
        soundController.playChime(580, 0.3);
      }
      return;
    }

    // Case 3: No source is selected yet, but user clicked an occupied slot
    if (boardSlots[targetSlot] !== null) {
      setSelectedSource({ type: 'board', slotIndex: targetSlot });
    }
  };

  // Remove piece from board back to tray
  const handleReturnToTray = (slotIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const piece = boardSlots[slotIndex];
    if (piece === null) return;
    soundController.playClick();

    const newSlots = [...boardSlots];
    newSlots[slotIndex] = null;
    setBoardSlots(newSlots);
    setTrayPieces((prev) => [...prev, piece]);
    if (selectedSource && selectedSource.type === 'board' && selectedSource.slotIndex === slotIndex) {
      setSelectedSource(null);
    }
  };

  // HTML5 Drag and Drop Handlers for Desktop & Tablets
  const handleDragStart = (e: React.DragEvent, pieceIndex: number, from: 'tray' | 'board', slotIndex?: number) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ pieceIndex, from, slotIndex }));
  };

  const handleDropOnSlot = (e: React.DragEvent, targetSlot: number) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const pieceToPlace = Number(data.pieceIndex);
      const from = data.from;

      if (from === 'tray') {
        const currentInSlot = boardSlots[targetSlot];
        const newSlots = [...boardSlots];
        newSlots[targetSlot] = pieceToPlace;
        let newTray = trayPieces.filter((p) => p !== pieceToPlace);
        if (currentInSlot !== null) {
          newTray.push(currentInSlot);
        }
        setBoardSlots(newSlots);
        setTrayPieces(newTray);
        setMoves((m) => m + 1);
        if (pieceToPlace === targetSlot) soundController.playChime(580, 0.3);
      } else if (from === 'board') {
        const sourceSlot = Number(data.slotIndex);
        if (sourceSlot === targetSlot) return;
        const newSlots = [...boardSlots];
        const temp = newSlots[targetSlot];
        newSlots[targetSlot] = newSlots[sourceSlot];
        newSlots[sourceSlot] = temp;
        setBoardSlots(newSlots);
        setMoves((m) => m + 1);
        if (newSlots[targetSlot] === targetSlot) soundController.playChime(580, 0.3);
      }
      setSelectedSource(null);
    } catch {
      // Ignore parsing error
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Add Custom Image handler (via file upload or URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        const newId = `custom-${Date.now()}`;
        const newPuzzle: DefaultPuzzleItem = {
          id: newId,
          title: customImageTitle.trim() || 'Custom Uploaded Photo',
          category: 'Uploaded Photo',
          image: result,
          description: 'A special photo chosen for your 4-piece jigsaw puzzle adventure.',
          accent: '#EAF1E8',
        };
        setDefaultPuzzles((prev) => [newPuzzle, ...prev]);
        setSelectedDefaultId(newId);
        setIsAddingCustomImage(false);
        setCustomImageUrl('');
        setCustomImageTitle('');
        soundController.playSuccess();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddUrlImage = () => {
    if (!customImageUrl.trim()) return;
    const newId = `custom-${Date.now()}`;
    const newPuzzle: DefaultPuzzleItem = {
      id: newId,
      title: customImageTitle.trim() || 'Custom Added Image',
      category: 'Added Image',
      image: customImageUrl.trim(),
      description: 'Your chosen custom image, sliced into a joyful 4-piece puzzle.',
      accent: '#FDF0D5',
    };
    setDefaultPuzzles((prev) => [newPuzzle, ...prev]);
    setSelectedDefaultId(newId);
    setIsAddingCustomImage(false);
    setCustomImageUrl('');
    setCustomImageTitle('');
    soundController.playSuccess();
  };

  return (
    <div className="p-4 pb-28 max-w-2xl mx-auto space-y-4 animate-fadeIn">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            soundController.playClick();
            onBack();
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-[#E0DCD3] text-[#2D3A2F] font-extrabold text-sm hover:bg-[#F8F6F0] active:scale-95 transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Games</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundController.playClick();
              setShowReferenceModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white border border-[#E0DCD3] text-[#5A6E5D] font-extrabold text-xs hover:bg-[#F8F6F0] active:scale-95 shadow-xs"
            title="Peek at the full picture"
          >
            <Eye className="w-4 h-4 text-[#5B825B]" />
            <span className="hidden sm:inline">Peek Photo</span>
          </button>
          
          <button
            onClick={() => {
              soundController.playClick();
              soundController.speak(`${currentPuzzle.title}. ${currentPuzzle.description}`);
            }}
            className="p-2 rounded-2xl bg-white border border-[#E0DCD3] text-[#5B825B] hover:bg-[#F8F6F0] active:scale-95 shadow-xs"
            title="Read story aloud"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Header & 2 Game Modes */}
      <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FDF0D5] text-[#332610] text-xs font-black uppercase tracking-wider">
                Photo Puzzle
              </span>
              <span className="text-xs font-bold text-[#5B825B] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> {totalPieces} Pieces ({gridSize}×{gridSize})
              </span>
            </div>
            <h2 className="text-2xl font-black text-[#2D3A2F]">Puzzle: Put It Back</h2>
          </div>

          <div className="flex items-center gap-2 sm:self-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8F6F0] border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F]">
              <Clock className="w-3.5 h-3.5 text-[#E8B25C]" />
              <span>⏱️ {formatSeconds(elapsedSeconds)}</span>
              <span className="text-[#8A8070] text-[11px]">(Avg: {previousAverageSeconds}s)</span>
            </div>
            <span className="text-xs font-bold text-[#5A6E5D] px-2">Moves: {moves}</span>
          </div>
        </div>

        {/* 2 Modes Tabs: Personalized vs Default Mode */}
        <div className="grid grid-cols-2 gap-2 bg-[#F8F6F0] p-1.5 rounded-2xl border border-[#EAE6DF]">
          <button
            onClick={() => {
              soundController.playClick();
              if (hasCaregiverUploadedMemories) {
                setMode('personalized');
              } else {
                soundController.speak('No personal photos uploaded yet. You can play Default Mode with Mango and other treasures!');
                setMode('default');
              }
            }}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              mode === 'personalized'
                ? 'bg-[#5B825B] text-white shadow-xs'
                : 'text-[#5A6E5D] hover:text-[#2D3A2F]'
            }`}
          >
            <Heart className={`w-4 h-4 ${mode === 'personalized' ? 'fill-current' : ''}`} />
            <span>Personalized {hasCaregiverUploadedMemories ? `(${photoMemories.length})` : '(0 Photos)'}</span>
          </button>

          <button
            onClick={() => {
              soundController.playClick();
              setMode('default');
            }}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              mode === 'default'
                ? 'bg-[#5B825B] text-white shadow-xs'
                : 'text-[#5A6E5D] hover:text-[#2D3A2F]'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Default Mode (Mango)</span>
          </button>
        </div>

        {/* Grid Sizing & Auto-Adjustment Adaptive Control Bar */}
        <div className="bg-[#F8F6F0] p-3 rounded-2xl border border-[#EAE6DF] space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-[#2D3A2F] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#5B825B]" />
                Grid:
              </span>
              <div className="inline-flex rounded-xl bg-white p-1 border border-[#E0DCD3] shadow-2xs">
                {([2, 3, 4] as GridDimension[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSelectGridSize(size)}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                      gridSize === size
                        ? 'bg-[#5B825B] text-white shadow-xs'
                        : 'text-[#5A6E5D] hover:text-[#2D3A2F]'
                    }`}
                  >
                    {size}×{size} {size === 2 ? '(Gentle · 4)' : size === 3 ? '(Medium · 9)' : '(Challenge · 16)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-Adjustment Toggle & Historical Context */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  soundController.playClick();
                  setAutoAdjustEnabled(!autoAdjustEnabled);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition-all ${
                  autoAdjustEnabled
                    ? 'bg-[#EAF1E8] border-[#5B825B]/30 text-[#5B825B]'
                    : 'bg-white border-[#E0DCD3] text-[#8A8070]'
                }`}
                title="Automatically simplifies grid to 2x2 if a puzzle takes significantly longer than your average"
              >
                <Brain className={`w-3.5 h-3.5 ${autoAdjustEnabled ? 'text-[#5B825B]' : 'text-[#8A8070]'}`} />
                <span>Auto-Adjust: {autoAdjustEnabled ? 'ON' : 'OFF'}</span>
              </button>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-[#E0DCD3] text-[11px] font-bold text-[#5A6E5D]">
                <span>{completionHistory.length} solved</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-[#5A6E5D] leading-tight">
            {autoAdjustEnabled
              ? '✨ AI Auto-Adjustment active: If a puzzle takes significantly longer than your average (~' +
                previousAverageSeconds +
                's), the grid simplifies to 2×2 for a relaxed experience.'
              : 'Auto-adjustment paused. You are in manual grid selection mode.'}
          </p>
        </div>

        {/* Mode Selector Carousels */}
        {mode === 'personalized' ? (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#2D3A2F] uppercase tracking-wide">
                Caregiver Uploaded Memories ({photoMemories.length})
              </span>
              <span className="text-[11px] text-[#5A6E5D]">Tap to choose photo</span>
            </div>

            {photoMemories.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-dashed border-[#D5D0C5] text-center text-xs text-[#5A6E5D]">
                No memories uploaded yet. You can upload memories in Family Caregiver Mode or play Default Mode below!
              </div>
            ) : (
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none pt-1">
                {photoMemories.map((mem) => {
                  const isSelected = selectedPersonalizedId === mem.id;
                  return (
                    <button
                      key={mem.id}
                      onClick={() => {
                        soundController.playClick();
                        setSelectedPersonalizedId(mem.id);
                      }}
                      className={`shrink-0 w-28 rounded-2xl p-2 text-left border transition-all ${
                        isSelected
                          ? 'border-[#5B825B] bg-[#EAF1E8] ring-2 ring-[#5B825B]/40 shadow-xs scale-102'
                          : 'border-[#E0DCD3] bg-white hover:border-[#5B825B]/50'
                      }`}
                    >
                      <div className="w-full aspect-square rounded-xl overflow-hidden mb-1.5 relative">
                        <img
                          src={mem.image}
                          alt={mem.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#5B825B] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-bold text-[#2D3A2F] truncate">{mem.title}</p>
                      <p className="text-[10px] text-[#5A6E5D] truncate">{mem.person || mem.category}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#2D3A2F] uppercase tracking-wide">
                Default Everyday Items & Treasures
              </span>
              <button
                onClick={() => {
                  soundController.playClick();
                  setIsAddingCustomImage(!isAddingCustomImage);
                }}
                className="text-[11px] font-extrabold text-[#5B825B] flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Any Image</span>
              </button>
            </div>

            {/* Custom Image Creator Accordion */}
            {isAddingCustomImage && (
              <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-[#2D3A2F] uppercase tracking-wider">
                    Add Your Own Image to Default Mode
                  </h4>
                  <button
                    onClick={() => setIsAddingCustomImage(false)}
                    className="text-xs text-[#5A6E5D] hover:text-[#2D3A2F]"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Image Title (e.g. Sweet Mango, Garden)"
                    value={customImageTitle}
                    onChange={(e) => setCustomImageTitle(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[#D5D0C5] text-xs focus:outline-hidden focus:border-[#5B825B]"
                  />
                  <input
                    type="url"
                    placeholder="Paste image web URL..."
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[#D5D0C5] text-xs focus:outline-hidden focus:border-[#5B825B]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-white border border-[#D5D0C5] text-xs font-bold text-[#2D3A2F] flex items-center gap-1.5 hover:bg-[#F8F6F0]"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#5B825B]" />
                    <span>Upload from Device</span>
                  </button>

                  {customImageUrl && (
                    <button
                      onClick={handleAddUrlImage}
                      className="px-4 py-2 rounded-xl bg-[#5B825B] text-white text-xs font-extrabold hover:bg-[#4a6d4a]"
                    >
                      Use URL
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Presets row */}
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none pt-1">
              {defaultPuzzles.map((item) => {
                const isSelected = selectedDefaultId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      soundController.playClick();
                      setSelectedDefaultId(item.id);
                    }}
                    className={`shrink-0 w-28 rounded-2xl p-2 text-left border transition-all ${
                      isSelected
                        ? 'border-[#5B825B] bg-[#EAF1E8] ring-2 ring-[#5B825B]/40 shadow-xs scale-102'
                        : 'border-[#E0DCD3] bg-white hover:border-[#5B825B]/50'
                    }`}
                  >
                    <div className="w-full aspect-square rounded-xl overflow-hidden mb-1.5 relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#5B825B] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-[#2D3A2F] truncate">{item.title}</p>
                    <p className="text-[10px] text-[#5A6E5D] truncate">{item.category}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Current Active Picture Header */}
      <div className="bg-white rounded-3xl p-4 border border-[#E0DCD3] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[#5B825B]/30 shrink-0">
            <img
              src={currentPuzzle.image}
              alt={currentPuzzle.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-black text-[#2D3A2F] leading-tight">{currentPuzzle.title}</h3>
              {isComplete && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EAF1E8] text-[#5B825B] text-[11px] font-extrabold">
                  <CheckCircle2 className="w-3 h-3" /> Solved
                </span>
              )}
            </div>
            <p className="text-xs text-[#5A6E5D] line-clamp-1">{currentPuzzle.description}</p>
          </div>
        </div>

        <button
          onClick={() => {
            soundController.playClick();
            setShowGhostGuide(!showGhostGuide);
          }}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
            showGhostGuide
              ? 'bg-[#EAF1E8] border-[#5B825B]/30 text-[#5B825B]'
              : 'bg-white border-[#E0DCD3] text-[#5A6E5D]'
          }`}
          title="Toggle ghost image outline underneath"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ghost Guide</span>
        </button>
      </div>

      {/* Auto-Adjustment Notification Banner (when simplified for comfort) */}
      {autoAdjustBanner?.show && (
        <div className="bg-gradient-to-br from-[#EAF1E8] via-[#E4EFE1] to-[#D5E6D1] rounded-3xl p-4.5 border-2 border-[#5B825B]/30 shadow-md animate-scaleUp space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#5B825B] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#5B825B] bg-white/80 px-2 py-0.5 rounded-full border border-[#5B825B]/20">
                  AI Adaptive Comfort
                </span>
                <h4 className="text-base font-black text-[#2D3A2F] mt-0.5">
                  Puzzle Simplified to 2×2 Grid
                </h4>
              </div>
            </div>
            <button
              onClick={() => setAutoAdjustBanner(null)}
              className="text-xs font-bold text-[#5A6E5D] hover:text-[#2D3A2F] px-2.5 py-1 rounded-lg hover:bg-white/60"
            >
              Dismiss
            </button>
          </div>

          <p className="text-xs text-[#2D3A2F]/90 leading-relaxed font-medium">
            {autoAdjustBanner.reason}
          </p>

          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="px-2.5 py-1 rounded-xl bg-white/90 border border-[#5B825B]/20 text-[11px] font-black text-[#2D3A2F]">
              ⏱️ Time: {autoAdjustBanner.timeTaken}s
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-white/90 border border-[#5B825B]/20 text-[11px] font-black text-[#5A6E5D]">
              📊 Your Average: {autoAdjustBanner.averageTime}s
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-[#5B825B] text-white text-[11px] font-black">
              ✨ Simplified: {autoAdjustBanner.fromGrid}×{autoAdjustBanner.fromGrid} ➔ 2×2
            </span>
            <button
              onClick={() => {
                soundController.playClick();
                handleSelectGridSize(autoAdjustBanner.fromGrid as GridDimension);
              }}
              className="px-2.5 py-1 rounded-xl bg-white border border-[#E0DCD3] hover:bg-[#F8F6F0] text-[11px] font-black text-[#2D3A2F] ml-auto transition-all"
            >
              Try {autoAdjustBanner.fromGrid}×{autoAdjustBanner.fromGrid} again
            </button>
          </div>
        </div>
      )}

      {/* The Dynamic Puzzle Board */}
      <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-[#5A6E5D]">
            Assembly Board ({totalPieces} Slots · {gridSize}×{gridSize})
          </span>
          <span className="text-xs text-[#5A6E5D]">
            {isComplete ? '🎉 Complete!' : 'Tap piece in tray, then tap slot'}
          </span>
        </div>

        {/* Board Frame */}
        <div className={`relative mx-auto w-full ${gridSize === 4 ? 'max-w-[390px]' : 'max-w-[350px]'} aspect-square rounded-3xl overflow-hidden border-4 border-[#2D3A2F]/15 bg-[#F8F6F0] shadow-inner p-1.5`}>
          {/* Ghost Guide Underneath (faint reference guide) */}
          {showGhostGuide && !isComplete && (
            <div
              className="absolute inset-1.5 rounded-2xl pointer-events-none opacity-25"
              style={{
                backgroundImage: `url(${currentPuzzle.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          )}

          {/* If Complete, display unified seamless picture with celebratory particle accents */}
          {isComplete ? (
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl ring-4 ring-[#E8B25C] animate-scaleUp">
              <img
                src={currentPuzzle.image}
                alt={currentPuzzle.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Celebratory badge overlay */}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8B25C] text-[#332610] text-xs font-black shadow-md animate-bounce">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Solved!</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <div className="text-white">
                  <div className="flex items-center gap-1.5 text-[#E8B25C] font-black text-xs uppercase tracking-wider">
                    <Trophy className="w-4 h-4 fill-current" /> Picture Reassembled!
                  </div>
                  <h4 className="text-lg font-black drop-shadow-sm">{currentPuzzle.title}</h4>
                </div>
              </div>
            </div>
          ) : (
            /* Dynamic Grid of slots */
            <div
              className={`grid gap-1.5 w-full h-full relative z-10 ${
                gridSize === 2
                  ? 'grid-cols-2 grid-rows-2'
                  : gridSize === 3
                  ? 'grid-cols-3 grid-rows-3'
                  : 'grid-cols-4 grid-rows-4'
              }`}
            >
              {Array.from({ length: totalPieces }, (_, i) => i).map((slotIdx) => {
                const pieceIdx = boardSlots[slotIdx];
                const isOccupied = pieceIdx !== null;
                const isSelected = selectedSource?.type === 'board' && selectedSource.slotIndex === slotIdx;
                const isCorrect = pieceIdx === slotIdx;
                const slotGeom = getPieceGeometry(slotIdx, gridSize);
                const pieceGeom = pieceIdx !== null ? getPieceGeometry(pieceIdx, gridSize) : null;

                return (
                  <div
                    key={slotIdx}
                    onClick={() => handleBoardSlotClick(slotIdx)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnSlot(e, slotIdx)}
                    className={`relative rounded-2xl overflow-hidden flex items-center justify-center transition-all cursor-pointer select-none ${
                      isOccupied
                        ? 'border-2 border-white shadow-xs'
                        : 'border-2 border-dashed border-[#C5BFB2] bg-white/40 hover:bg-white/70'
                    } ${
                      isSelected
                        ? 'ring-4 ring-[#E8B25C] shadow-md scale-98'
                        : ''
                    }`}
                  >
                    {isOccupied && pieceGeom ? (
                      <div
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, pieceIdx, 'board', slotIdx)}
                        className="w-full h-full relative group"
                        style={{
                          backgroundImage: `url(${currentPuzzle.image})`,
                          backgroundSize: pieceGeom.bgSize,
                          backgroundPosition: pieceGeom.bgPos,
                        }}
                      >
                        {/* Number hint */}
                        {showNumberHints && (
                          <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] font-black flex items-center justify-center backdrop-blur-xs">
                            {pieceIdx + 1}
                          </div>
                        )}

                        {/* Correct indicator */}
                        {isCorrect && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#5B825B] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}

                        {/* Return to tray button */}
                        <button
                          onClick={(e) => handleReturnToTray(slotIdx, e)}
                          className="absolute bottom-1 right-1 px-1 py-0.5 rounded-md bg-black/65 hover:bg-black text-[9px] text-white font-bold backdrop-blur-xs opacity-80 hover:opacity-100 transition-all"
                          title="Remove from slot"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-center p-1 text-[#8A8070]">
                        <div className="w-6 h-6 mx-auto rounded-full bg-white/70 flex items-center justify-center text-[11px] font-black text-[#5A6E5D] mb-0.5">
                          {slotIdx + 1}
                        </div>
                        <span className="text-[9px] font-bold block leading-tight truncate">
                          {slotGeom.label}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Controls: Scramble & Put It Back */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            onClick={handleScramble}
            className="py-3 px-4 rounded-2xl bg-[#F8F6F0] hover:bg-[#EFECE3] border border-[#E0DCD3] text-[#2D3A2F] font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs"
          >
            <Shuffle className="w-4 h-4 text-[#E8B25C]" />
            <span>Scramble Puzzle</span>
          </button>

          <button
            onClick={handlePutItBack}
            className="py-3 px-4 rounded-2xl bg-[#5B825B] hover:bg-[#4a6d4a] text-white font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs"
          >
            <Sparkles className="w-4 h-4 fill-current text-[#E8B25C]" />
            <span>Put It Back (Solve)</span>
          </button>
        </div>
      </div>

      {/* Piece Tray (Waiting Unplaced Pieces) */}
      {!isComplete && (
        <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#2D3A2F]">
              Piece Tray ({trayPieces.length} of {totalPieces} available)
            </span>
            <span className="text-[11px] text-[#5A6E5D]">Tap to select, then tap slot above</span>
          </div>

          {trayPieces.length === 0 ? (
            <div className="p-4 rounded-2xl bg-[#EAF1E8] text-[#5B825B] text-center text-xs font-black">
              All {totalPieces} pieces are placed on the board! Check if they are in the right position.
            </div>
          ) : (
            <div
              className={`grid gap-2.5 ${
                gridSize === 2
                  ? 'grid-cols-4'
                  : gridSize === 3
                  ? 'grid-cols-3 sm:grid-cols-5'
                  : 'grid-cols-4 sm:grid-cols-8'
              }`}
            >
              {trayPieces.map((pieceIdx) => {
                const isSelected = selectedSource?.type === 'tray' && selectedSource.pieceIndex === pieceIdx;
                const geom = getPieceGeometry(pieceIdx, gridSize);

                return (
                  <button
                    key={pieceIdx}
                    onClick={() => handleTrayPieceClick(pieceIdx)}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, pieceIdx, 'tray')}
                    className={`aspect-square rounded-2xl overflow-hidden relative border-2 transition-all cursor-pointer shadow-xs active:scale-95 ${
                      isSelected
                        ? 'border-[#5B825B] ring-4 ring-[#5B825B]/40 scale-105 shadow-md'
                        : 'border-[#E0DCD3] hover:border-[#5B825B]/60'
                    }`}
                  >
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url(${currentPuzzle.image})`,
                        backgroundSize: geom.bgSize,
                        backgroundPosition: geom.bgPos,
                      }}
                    />
                    {showNumberHints && (
                      <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] font-black flex items-center justify-center backdrop-blur-xs">
                        {pieceIdx + 1}
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#5B825B]/15 border-2 border-[#5B825B] rounded-2xl flex items-center justify-center">
                        <span className="px-1.5 py-0.5 rounded-md bg-[#5B825B] text-white text-[9px] font-black">
                          Selected
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Completion Banner */}
      {isComplete && (
        <div className="bg-gradient-to-br from-[#EAF1E8] to-[#DCEAD2] rounded-3xl p-6 border border-[#5B825B]/30 shadow-xs space-y-4 animate-scaleUp text-center">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-[#5B825B] text-white flex items-center justify-center shadow-md">
            <Trophy className="w-8 h-8 fill-current text-[#E8B25C]" />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#5B825B]">
              Splendid Accomplishment!
            </span>
            <h3 className="text-2xl font-black text-[#2D3A2F] mt-1">
              You Solved the {currentPuzzle.title}!
            </h3>
            <p className="text-sm text-[#2D3A2F]/80 mt-1 max-w-md mx-auto">
              All {totalPieces} pieces fit together into a beautiful memory. Your mind is sharp, observant, and joyful.
            </p>
          </div>

          {/* Picture Story Voice Narration Box */}
          {narrationText && (
            <div className="bg-white/95 rounded-2xl p-4 border border-[#5B825B]/25 shadow-xs text-left space-y-2 max-w-lg mx-auto">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#5B825B] flex items-center gap-1.5">
                  <Volume2 className={`w-4 h-4 ${isSpeakingNarration ? 'animate-pulse text-[#E8B25C]' : ''}`} />
                  <span>{mode === 'personalized' ? 'Memory Story Voice' : 'Picture Story Voice'}</span>
                </span>
                <button
                  onClick={() => {
                    soundController.playClick();
                    speakVictoryStory(narrationText);
                  }}
                  className="text-xs font-black text-[#5B825B] hover:text-[#4a6d4a] flex items-center gap-1.5 bg-[#EAF1E8] px-3 py-1.5 rounded-xl active:scale-95 transition-all shadow-2xs"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isSpeakingNarration ? 'Speaking...' : 'Listen Again'}</span>
                </button>
              </div>
              <p className="text-sm font-medium text-[#2D3A2F] leading-relaxed italic bg-[#F8F6F0] p-3 rounded-xl border border-[#EAE6DF]">
                "{narrationText}"
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              onClick={() => {
                soundController.playClick();
                triggerCelebratoryParticles();
              }}
              className="py-3 px-4 rounded-2xl bg-[#FDF0D5] border border-[#E8B25C]/50 text-[#332610] font-black text-xs sm:text-sm flex items-center gap-1.5 hover:bg-[#fae6b8] active:scale-95 shadow-xs transition-all"
              title="Launch celebratory confetti shower"
            >
              <Sparkles className="w-4 h-4 text-[#E8B25C] fill-current" />
              <span>Celebrate Again 🎉</span>
            </button>

            <button
              onClick={handleScramble}
              className="py-3 px-4 rounded-2xl bg-white border border-[#5B825B]/30 text-[#2D3A2F] font-black text-xs sm:text-sm flex items-center gap-1.5 hover:bg-[#F8F6F0] active:scale-95 shadow-xs transition-all"
            >
              <RotateCcw className="w-4 h-4 text-[#5B825B]" />
              <span>Scramble Again</span>
            </button>

            <button
              onClick={() => {
                soundController.playClick();
                // Pick next image
                if (mode === 'personalized') {
                  const currIdx = photoMemories.findIndex((m) => m.id === selectedPersonalizedId);
                  const nextIdx = (currIdx + 1) % photoMemories.length;
                  setSelectedPersonalizedId(photoMemories[nextIdx].id);
                } else {
                  const currIdx = defaultPuzzles.findIndex((p) => p.id === selectedDefaultId);
                  const nextIdx = (currIdx + 1) % defaultPuzzles.length;
                  setSelectedDefaultId(defaultPuzzles[nextIdx].id);
                }
              }}
              className="py-3 px-5 rounded-2xl bg-[#5B825B] text-white font-black text-xs sm:text-sm flex items-center gap-1.5 hover:bg-[#4a6d4a] active:scale-95 shadow-xs transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Next Picture</span>
            </button>
          </div>
        </div>
      )}

      {/* Reference Modal: Peek at full picture */}
      {showReferenceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden border border-[#E0DCD3] shadow-2xl animate-scaleUp">
            <div className="p-4 border-b border-[#EAE6DF] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-[#5B825B] tracking-wider">
                  Full Reference Picture
                </span>
                <h4 className="text-lg font-black text-[#2D3A2F]">{currentPuzzle.title}</h4>
              </div>
              <button
                onClick={() => setShowReferenceModal(false)}
                className="w-8 h-8 rounded-full bg-[#F8F6F0] text-[#2D3A2F] font-black flex items-center justify-center hover:bg-[#EAE6DF]"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="w-full aspect-square rounded-2xl overflow-hidden border border-[#E0DCD3] shadow-xs">
                <img
                  src={currentPuzzle.image}
                  alt={currentPuzzle.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="bg-[#F8F6F0] p-3.5 rounded-2xl border border-[#EAE6DF]">
                <p className="text-xs text-[#2D3A2F] font-medium leading-relaxed">
                  {currentPuzzle.description}
                </p>
              </div>

              <button
                onClick={() => setShowReferenceModal(false)}
                className="w-full py-3 rounded-2xl bg-[#5B825B] text-white font-black text-sm shadow-xs hover:bg-[#4a6d4a]"
              >
                Back to Puzzle Board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
