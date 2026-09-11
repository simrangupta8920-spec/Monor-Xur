import { AIAnalysisResult } from '../types';

export interface GameTelemetryInput {
  playerName?: string;
  currentLevel: number;
  moves: number;
  mistakes: number;
  consecutiveMistakes: number;
  matchedPairs: number;
  totalPairs: number;
  elapsedSeconds: number;
  triggerEvent?: 'mistake' | 'round_complete' | 'periodic_check';
}

/**
 * Local ML rule engine fallback when offline or server unreachable.
 */
function localMLFallback(input: GameTelemetryInput): AIAnalysisResult {
  const { currentLevel, mistakes, consecutiveMistakes, moves, matchedPairs, totalPairs, elapsedSeconds } = input;
  const playerName = input.playerName || 'Anita';
  const errorRate = moves > 0 ? mistakes / moves : 0;

  // If struggling: consecutive mistakes >= 3 OR total mistakes >= 4 with low matches on Medium/Hard
  if ((consecutiveMistakes >= 3 || (mistakes >= 4 && matchedPairs <= 1 && elapsedSeconds > 25)) && currentLevel > 1) {
    const targetLevel = 1; // Shift to Easy level directly
    return {
      action: 'EASE_DIFFICULTY',
      recommendedLevel: targetLevel,
      triggerAutoShift: true,
      reasoning: `AI Model detected ${consecutiveMistakes} consecutive wrong attempts (error rate ${Math.round(errorRate * 100)}%). Adjusting to Easy Level (3 pairs) to prevent cognitive strain and encourage relaxation.`,
      encouragement: `You're doing wonderful, ${playerName}! Let's switch to an easier 3-pair match so you can relax and have fun.`,
      fatigueRisk: consecutiveMistakes >= 4 ? 'HIGH' : 'MODERATE',
      modelSource: 'adaptive-ml-heuristic',
      timestamp: Date.now(),
    };
  }

  // If completing very fast with <= 1 mistake
  if (mistakes <= 1 && matchedPairs === totalPairs && elapsedSeconds < 25 && currentLevel < 3) {
    return {
      action: 'INCREASE_DIFFICULTY',
      recommendedLevel: Math.min(3, currentLevel + 1),
      triggerAutoShift: false,
      reasoning: `Player mastered current round with only ${mistakes} mistake. Cognitive agility is sharp.`,
      encouragement: `Outstanding focus, ${playerName}! You're ready for more memory cards!`,
      fatigueRisk: 'LOW',
      modelSource: 'adaptive-ml-heuristic',
      timestamp: Date.now(),
    };
  }

  return {
    action: 'MAINTAIN',
    recommendedLevel: currentLevel,
    triggerAutoShift: false,
    reasoning: `Game difficulty is appropriately calibrated for current engagement level.`,
    encouragement: `Keep up the great rhythm, ${playerName}!`,
    fatigueRisk: 'LOW',
    modelSource: 'adaptive-ml-heuristic',
    timestamp: Date.now(),
  };
}

/**
 * Request AI/ML model analysis from the server API, falling back gracefully to local ML engine.
 */
export async function analyzePlayerDifficulty(input: GameTelemetryInput): Promise<AIAnalysisResult> {
  try {
    const response = await fetch('/api/ai/analyze-difficulty', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      return localMLFallback(input);
    }

    const data: AIAnalysisResult = await response.json();
    return data;
  } catch {
    return localMLFallback(input);
  }
}

export interface PuzzleTelemetryInput {
  playerName?: string;
  currentGrid: 2 | 3 | 4;
  timeTaken: number;
  previousAverageSeconds: number;
  recentTimes?: number[];
  moves?: number;
  piecesPlaced?: number;
  totalPieces?: number;
  triggerEvent: 'round_complete' | 'in_game_struggle' | 'periodic_check';
}

export interface PuzzleAIAnalysisResult {
  action: 'EASE_DIFFICULTY' | 'MAINTAIN' | 'INCREASE_DIFFICULTY';
  currentGrid: 2 | 3 | 4;
  recommendedGrid: 2 | 3 | 4;
  triggerAutoShift: boolean;
  reasoning: string;
  encouragement: string;
  fatigueRisk: 'LOW' | 'MODERATE' | 'HIGH';
  modelSource: 'gemini-3.8-flash' | 'adaptive-ml-heuristic';
  timestamp: number;
  timeTaken: number;
  averageTime: number;
  deltaSeconds: number;
}

function localPuzzleMLFallback(input: PuzzleTelemetryInput): PuzzleAIAnalysisResult {
  const { currentGrid, timeTaken, previousAverageSeconds, triggerEvent } = input;
  const playerName = input.playerName || 'Anita';
  const delta = timeTaken - previousAverageSeconds;
  const gridNames: Record<number, string> = {
    2: 'Gentle (2×2)',
    3: 'Medium (3×3)',
    4: 'Challenge (4×4)',
  };

  // 1. In-game struggle detected
  if (triggerEvent === 'in_game_struggle' && currentGrid > 2) {
    const nextGrid = (currentGrid - 1) as 2 | 3;
    return {
      action: 'EASE_DIFFICULTY',
      currentGrid,
      recommendedGrid: nextGrid,
      triggerAutoShift: true,
      reasoning: `AI Model detected in-game struggle (${timeTaken}s elapsed, well beyond baseline average of ${previousAverageSeconds}s). Downshifting 1 step from ${gridNames[currentGrid]} to ${gridNames[nextGrid]} for cognitive comfort.`,
      encouragement: `You're doing great, ${playerName}! Let's switch to ${gridNames[nextGrid]} so you can relax and finish with joy.`,
      fatigueRisk: timeTaken >= previousAverageSeconds * 2.2 ? 'HIGH' : 'MODERATE',
      modelSource: 'adaptive-ml-heuristic',
      timestamp: Date.now(),
      timeTaken,
      averageTime: previousAverageSeconds,
      deltaSeconds: delta,
    };
  }

  // 2. Round Complete: Time took significantly more than average
  const isSignificantlySlower =
    timeTaken >= Math.max(48, previousAverageSeconds + 20) ||
    timeTaken >= Math.round(previousAverageSeconds * 1.65) ||
    (previousAverageSeconds <= 35 && timeTaken >= 65);

  if (isSignificantlySlower && currentGrid > 2) {
    const nextGrid = (currentGrid - 1) as 2 | 3;
    return {
      action: 'EASE_DIFFICULTY',
      currentGrid,
      recommendedGrid: nextGrid,
      triggerAutoShift: true,
      reasoning: `AI Model analyzed completion time: took ${timeTaken}s, which is significantly longer than previous average of ${previousAverageSeconds}s (+${delta}s). Easing difficulty 1 step from ${gridNames[currentGrid]} to ${gridNames[nextGrid]} for comfortable recall.`,
      encouragement: `Wonderful job completing the puzzle, ${playerName}! For our next puzzle, we'll relax with ${gridNames[nextGrid]}.`,
      fatigueRisk: delta >= 35 ? 'HIGH' : 'MODERATE',
      modelSource: 'adaptive-ml-heuristic',
      timestamp: Date.now(),
      timeTaken,
      averageTime: previousAverageSeconds,
      deltaSeconds: delta,
    };
  }

  // 3. Round Complete: Average time is decreasing significantly
  const isSignificantlyFaster =
    (delta <= -10 || (timeTaken <= 20 && previousAverageSeconds >= 28) || (timeTaken <= 35 && currentGrid === 3 && previousAverageSeconds >= 50)) &&
    timeTaken < previousAverageSeconds;

  if (isSignificantlyFaster && currentGrid < 4) {
    const nextGrid = (currentGrid + 1) as 3 | 4;
    return {
      action: 'INCREASE_DIFFICULTY',
      currentGrid,
      recommendedGrid: nextGrid,
      triggerAutoShift: true,
      reasoning: `AI Model observed sharp cognitive speedup! Solved in ${timeTaken}s (down ${Math.abs(delta)}s from previous average of ${previousAverageSeconds}s). Advancing difficulty 1 step from ${gridNames[currentGrid]} to ${gridNames[nextGrid]}.`,
      encouragement: `Remarkable focus and agility, ${playerName}! Your recall is very quick today, so let's step up to ${gridNames[nextGrid]}!`,
      fatigueRisk: 'LOW',
      modelSource: 'adaptive-ml-heuristic',
      timestamp: Date.now(),
      timeTaken,
      averageTime: previousAverageSeconds,
      deltaSeconds: delta,
    };
  }

  // 4. Stable balance
  return {
    action: 'MAINTAIN',
    currentGrid,
    recommendedGrid: currentGrid,
    triggerAutoShift: false,
    reasoning: `Completion time (${timeTaken}s) is harmoniously aligned with baseline average (${previousAverageSeconds}s). Maintaining current grid ${gridNames[currentGrid]}.`,
    encouragement: `Lovely work, ${playerName}! You're maintaining a steady, enjoyable rhythm.`,
    fatigueRisk: 'LOW',
    modelSource: 'adaptive-ml-heuristic',
    timestamp: Date.now(),
    timeTaken,
    averageTime: previousAverageSeconds,
    deltaSeconds: delta,
  };
}

/**
 * Request AI puzzle difficulty analysis from Gemini 3.8 Flash server endpoint,
 * falling back gracefully to local ML engine.
 */
export async function analyzePuzzleDifficulty(input: PuzzleTelemetryInput): Promise<PuzzleAIAnalysisResult> {
  try {
    const response = await fetch('/api/ai/analyze-puzzle-difficulty', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      return localPuzzleMLFallback(input);
    }

    const data: PuzzleAIAnalysisResult = await response.json();
    return data;
  } catch {
    return localPuzzleMLFallback(input);
  }
}

