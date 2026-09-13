import { AIAnalysisResult } from '../types';

export interface DifficultyAnalysisRequest {
  playerName?: string;
  currentLevel: number;
  moves: number;
  mistakes: number;
  consecutiveMistakes: number;
  matchedPairs: number;
  totalPairs: number;
  elapsedSeconds: number;
  triggerEvent?: 'mistake' | 'round_complete' | 'timeout' | 'in_game_play';
  consecutiveWins?: number;
}

export type GridDimension = 2 | 3 | 4;

export const PUZZLE_DESIGNATED_TIMES: Record<GridDimension, number> = {
  2: 25,  // Easy mode (2×2): 25 seconds
  3: 45,  // Medium mode (3×3): 40 to 45 seconds
  4: 120, // Tough round (4×4): 120 seconds
};

export interface PuzzleAIAnalysisResult {
  action: 'EASE_DIFFICULTY' | 'MAINTAIN' | 'INCREASE_DIFFICULTY';
  currentGrid: GridDimension;
  recommendedGrid: GridDimension;
  triggerAutoShift: boolean;
  reasoning: string;
  encouragement: string;
  fatigueRisk: 'LOW' | 'MODERATE' | 'HIGH';
  modelSource: 'gemini-3.8-flash' | 'adaptive-ml-heuristic';
  timestamp: number;
  timeTaken: number;
  averageTime: number;
  designatedTime: number;
  consecutiveSolves: number;
  deltaSeconds: number;
}

export interface PuzzleDifficultyRequest {
  playerName?: string;
  currentGrid: GridDimension;
  timeTaken: number;
  previousAverageSeconds?: number;
  designatedAverageSeconds?: number;
  consecutiveSolves?: number;
  recentTimes?: number[];
  moves?: number;
  piecesPlaced?: number;
  totalPieces?: number;
  triggerEvent?: 'round_complete' | 'timeout' | 'give_up' | 'in_game_checkpoint' | 'in_game_struggle' | string;
}

function evaluateLocalMemoryHeuristic(data: DifficultyAnalysisRequest): AIAnalysisResult {
  const current = data.currentLevel;
  let action: 'EASE_DIFFICULTY' | 'MAINTAIN' | 'INCREASE_DIFFICULTY' = 'MAINTAIN';
  let recommendedLevel = current;
  let triggerAutoShift = false;
  let reasoning = 'Current performance is steady within normal parameters.';
  let encouragement = 'You are doing wonderful, take your time and enjoy!';
  let fatigueRisk: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';

  if (current === 3 && (data.mistakes >= 10 || data.consecutiveMistakes >= 4)) {
    action = 'EASE_DIFFICULTY';
    recommendedLevel = 2;
    triggerAutoShift = true;
    reasoning = 'High mistake count observed on Hard tier. Stepping down 1 level to Medium to sustain calm.';
    encouragement = 'Let’s enjoy a gentler set of cards together.';
    fatigueRisk = 'HIGH';
  } else if (current === 2 && (data.mistakes >= 5 || data.consecutiveMistakes >= 3)) {
    action = 'EASE_DIFFICULTY';
    recommendedLevel = 1;
    triggerAutoShift = true;
    reasoning = 'Multiple mismatches detected on Medium tier. Stepping down 1 level to Easy.';
    encouragement = 'You are doing great! Let’s relax with an easier round.';
    fatigueRisk = 'MODERATE';
  } else if ((data.consecutiveWins || 0) >= 5) {
    if (current === 1) {
      action = 'INCREASE_DIFFICULTY';
      recommendedLevel = 2;
      triggerAutoShift = true;
      reasoning = '5 consecutive solves achieved on Easy. Gently advancing 1 step to Medium tier.';
      encouragement = 'Magnificent focus! Ready for a light step forward.';
    } else if (current === 2) {
      action = 'INCREASE_DIFFICULTY';
      recommendedLevel = 3;
      triggerAutoShift = true;
      reasoning = '5 consecutive solves achieved on Medium. Stepping up 1 step to Hard tier.';
      encouragement = 'Outstanding performance! You are mastering this beautifully.';
    }
  }

  return {
    action,
    recommendedLevel,
    triggerAutoShift,
    reasoning,
    encouragement,
    fatigueRisk,
    modelSource: 'adaptive-ml-heuristic',
    timestamp: Date.now(),
  };
}

function evaluateLocalPuzzleHeuristic(data: PuzzleDifficultyRequest): PuzzleAIAnalysisResult {
  const currentGrid = data.currentGrid;
  const timeTaken = data.timeTaken;
  const designated = data.designatedAverageSeconds || PUZZLE_DESIGNATED_TIMES[currentGrid];
  const delta = timeTaken - designated;
  const solves = data.consecutiveSolves || 0;

  let action: 'EASE_DIFFICULTY' | 'MAINTAIN' | 'INCREASE_DIFFICULTY' = 'MAINTAIN';
  let recommendedGrid: GridDimension = currentGrid;
  let triggerAutoShift = false;
  let reasoning = 'Puzzle completion time matches expected baseline range.';
  let encouragement = 'Lovely work assembling the picture piece by piece!';
  let fatigueRisk: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';

  // Degrade threshold: > designated + 25s
  if (delta > 25) {
    if (currentGrid === 4) {
      action = 'EASE_DIFFICULTY';
      recommendedGrid = 3;
      triggerAutoShift = true;
      reasoning = `Time taken (${timeTaken}s) exceeded Tough baseline (${designated}s + 25s threshold). Easing 1 level to 3×3.`;
      encouragement = 'You did a wonderful job! Let’s try a picture with fewer pieces next.';
      fatigueRisk = 'HIGH';
    } else if (currentGrid === 3) {
      action = 'EASE_DIFFICULTY';
      recommendedGrid = 2;
      triggerAutoShift = true;
      reasoning = `Time taken (${timeTaken}s) exceeded Medium baseline (${designated}s + 25s threshold). Easing 1 level to 2×2.`;
      encouragement = 'Beautiful effort! A simpler layout will feel serene and comforting.';
      fatigueRisk = 'MODERATE';
    }
  } else if (solves >= 3 && delta <= 0) {
    if (currentGrid === 2) {
      action = 'INCREASE_DIFFICULTY';
      recommendedGrid = 3;
      triggerAutoShift = true;
      reasoning = `3 consecutive fast completions on Easy (2×2). Advancing 1 step to 3×3 Medium.`;
      encouragement = 'You are completing these pictures so swiftly and gracefully!';
    } else if (currentGrid === 3) {
      action = 'INCREASE_DIFFICULTY';
      recommendedGrid = 4;
      triggerAutoShift = true;
      reasoning = `3 consecutive fast completions on Medium (3×3). Advancing 1 step to 4×4 Tough.`;
      encouragement = 'Impressive sharpness! Stepping up to our grand 4×4 picture.';
    }
  }

  return {
    action,
    currentGrid,
    recommendedGrid,
    triggerAutoShift,
    reasoning,
    encouragement,
    fatigueRisk,
    modelSource: 'adaptive-ml-heuristic',
    timestamp: Date.now(),
    timeTaken,
    averageTime: designated,
    designatedTime: designated,
    consecutiveSolves: solves,
    deltaSeconds: delta,
  };
}

export async function analyzePlayerDifficulty(req: DifficultyAnalysisRequest): Promise<AIAnalysisResult> {
  try {
    const res = await fetch('/api/ai/analyze-difficulty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) {
      return evaluateLocalMemoryHeuristic(req);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Difficulty API call fallback to heuristic:', err);
    return evaluateLocalMemoryHeuristic(req);
  }
}

export async function analyzePuzzleDifficulty(req: PuzzleDifficultyRequest): Promise<PuzzleAIAnalysisResult> {
  try {
    const res = await fetch('/api/ai/analyze-puzzle-difficulty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) {
      return evaluateLocalPuzzleHeuristic(req);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Puzzle difficulty API call fallback to heuristic:', err);
    return evaluateLocalPuzzleHeuristic(req);
  }
}
