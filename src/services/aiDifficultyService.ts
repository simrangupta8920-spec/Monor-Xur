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
  consecutiveWins?: number;
}

export const MEMORY_LEVEL_THRESHOLDS: Record<number, { name: string; pairs: number; degradeMistakes: number; consecutiveDegrade: number; winStreakToUpgrade: number }> = {
  1: { name: 'Easy (3 Pairs)', pairs: 3, degradeMistakes: Infinity, consecutiveDegrade: Infinity, winStreakToUpgrade: 5 },
  2: { name: 'Medium (4 Pairs)', pairs: 4, degradeMistakes: 5, consecutiveDegrade: 3, winStreakToUpgrade: 5 },
  3: { name: 'Hard (6 Pairs)', pairs: 6, degradeMistakes: 10, consecutiveDegrade: 4, winStreakToUpgrade: Infinity },
};

/**
 * Local ML rule engine fallback when offline or server unreachable.
 */
function localMLFallback(input: GameTelemetryInput): AIAnalysisResult {
  const { currentLevel, mistakes, consecutiveMistakes, moves, matchedPairs, totalPairs, elapsedSeconds, consecutiveWins = 0 } = input;
  const playerName = input.playerName || 'Anita';
  const errorRate = moves > 0 ? mistakes / moves : 0;

  // RULE 1: UPGRADE BY 1 LEVEL ON 5 CONSECUTIVE WINS
  // After 5 streaks in Easy mode (Level 1) -> upgrade to Medium (Level 2).
  // After 5 streaks in Medium mode (Level 2) -> upgrade to Hard (Level 3).
  if (consecutiveWins >= 5 && currentLevel < 3) {
    const targetLevel = currentLevel + 1;
    const targetName = MEMORY_LEVEL_THRESHOLDS[targetLevel]?.name || `Level ${targetLevel}`;
    return {
      action: 'INCREASE_DIFFICULTY',
      recommendedLevel: targetLevel,
      triggerAutoShift: true,
      reasoning: `Player achieved a streak of ${consecutiveWins} consecutive wins at Level ${currentLevel}. Upgrading 1 level to ${targetName} to stimulate cognitive reserve.`,
      encouragement: `Splendid job, ${playerName}! 5 wins in a row! You're ready for ${targetName} for a fresh spark.`,
      fatigueRisk: 'LOW',
      modelSource: 'adaptive-ml-heuristic',
      timestamp: Date.now(),
    };
  }

  // RULE 2: DEGRADE STRICTLY BY 1 STEP BELOW (Never jump straight to Easy from Hard)
  // On Hard (Level 3): Degrades to Medium (Level 2) if mistakes >= 10 OR consecutive mistakes >= 4
  // On Medium (Level 2): Degrades to Easy (Level 1) if mistakes >= 5 OR consecutive mistakes >= 3
  const isHardStruggle = currentLevel === 3 && (mistakes >= 10 || consecutiveMistakes >= 4 || (consecutiveMistakes >= 3 && matchedPairs === 0));
  const isMediumStruggle = currentLevel === 2 && (mistakes >= 5 || consecutiveMistakes >= 3);

  if ((isHardStruggle || isMediumStruggle) && currentLevel > 1) {
    const targetLevel = currentLevel - 1; // Strictly one step below!
    const targetName = MEMORY_LEVEL_THRESHOLDS[targetLevel]?.name || `Level ${targetLevel}`;
    const mistakeLimit = currentLevel === 3 ? 10 : 5;

    return {
      action: 'EASE_DIFFICULTY',
      recommendedLevel: targetLevel,
      triggerAutoShift: true,
      reasoning: `AI Model detected difficulty threshold reached on Level ${currentLevel} (${mistakes}/${mistakeLimit} mistakes, ${consecutiveMistakes} consecutive wrong). Auto-shifting 1 step down to ${targetName} to eliminate stress and preserve joy.`,
      encouragement: currentLevel === 3
        ? `You're doing wonderfully, ${playerName}! Let's step down to a 4-pair Medium board so you can relax, take your time, and enjoy matching.`
        : `You're doing wonderfully, ${playerName}! Let's step down to a gentle 3-pair Easy board so you can relax, take your time, and have fun.`,
      fatigueRisk: consecutiveMistakes >= 4 || mistakes >= mistakeLimit ? 'HIGH' : 'MODERATE',
      modelSource: 'adaptive-ml-heuristic',
      timestamp: Date.now(),
    };
  }

  // Quick round completion with sharp clarity
  if (mistakes <= 1 && matchedPairs === totalPairs && elapsedSeconds < 25 && currentLevel < 3 && consecutiveWins >= 4) {
    return {
      action: 'INCREASE_DIFFICULTY',
      recommendedLevel: currentLevel + 1,
      triggerAutoShift: true,
      reasoning: `Player mastered round with only ${mistakes} mistake and high win streak. Agile recall verified.`,
      encouragement: `Outstanding focus, ${playerName}! Ready for the next tier!`,
      fatigueRisk: 'LOW',
      modelSource: 'adaptive-ml-heuristic',
      timestamp: Date.now(),
    };
  }

  return {
    action: 'MAINTAIN',
    recommendedLevel: currentLevel,
    triggerAutoShift: false,
    reasoning: `Game difficulty is appropriately calibrated for current engagement level (${consecutiveWins}/5 win streak towards next level).`,
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

export const PUZZLE_DESIGNATED_TIMES: Record<2 | 3 | 4, number> = {
  2: 25,  // Easy mode (2×2): 25 seconds
  3: 45,  // Medium mode (3×3): 40 to 45 seconds
  4: 120, // Tough round (4×4): 120 seconds
};

export interface PuzzleTelemetryInput {
  playerName?: string;
  currentGrid: 2 | 3 | 4;
  timeTaken: number;
  previousAverageSeconds: number;
  designatedAverageSeconds?: number;
  consecutiveSolves?: number;
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
  designatedTime: number;
  consecutiveSolves: number;
  deltaSeconds: number;
}

function localPuzzleMLFallback(input: PuzzleTelemetryInput): PuzzleAIAnalysisResult {
  const { currentGrid, timeTaken, previousAverageSeconds, triggerEvent } = input;
  const playerName = input.playerName || 'Anita';
  const designatedTime = input.designatedAverageSeconds || PUZZLE_DESIGNATED_TIMES[currentGrid] || 25;
  const consecutiveSolves = input.consecutiveSolves || 0;
  const delta = timeTaken - designatedTime;

  const gridNames: Record<number, string> = {
    2: 'Easy (2×2)',
    3: 'Medium (3×3)',
    4: 'Tough (4×4)',
  };

  // 1. Degrade Condition:
  // Patient is taking 25 seconds MORE than the designated average time:
  // - Easy (2×2): designated 25s + 25s = 50s
  // - Medium (3×3): designated 45s + 25s = 70s
  // - Tough (4×4): designated 120s + 25s = 145s
  // Or in-game struggle triggered when exceeding designated + 25s
  const degradeThreshold = designatedTime + 25;
  const shouldDegrade = timeTaken > degradeThreshold || triggerEvent === 'in_game_struggle';

  if (shouldDegrade) {
    if (currentGrid > 2) {
      const nextGrid = (currentGrid - 1) as 2 | 3;
      return {
        action: 'EASE_DIFFICULTY',
        currentGrid,
        recommendedGrid: nextGrid,
        triggerAutoShift: true,
        reasoning: `Patient took ${timeTaken}s on ${gridNames[currentGrid]} (exceeding designated baseline of ${designatedTime}s by ${timeTaken - designatedTime}s, past the +25s comfort threshold of ${degradeThreshold}s). Degraded difficulty 1 step to ${gridNames[nextGrid]} for relaxed, stress-free play.`,
        encouragement: `You're doing wonderfully, ${playerName}! We've eased the puzzle to ${gridNames[nextGrid]} so you can relax, take your time, and enjoy every piece.`,
        fatigueRisk: timeTaken >= degradeThreshold + 20 ? 'HIGH' : 'MODERATE',
        modelSource: 'adaptive-ml-heuristic',
        timestamp: Date.now(),
        timeTaken,
        averageTime: previousAverageSeconds,
        designatedTime,
        consecutiveSolves: 0,
        deltaSeconds: delta,
      };
    } else {
      return {
        action: 'MAINTAIN',
        currentGrid: 2,
        recommendedGrid: 2,
        triggerAutoShift: false,
        reasoning: `Patient took ${timeTaken}s on Easy (2×2), which exceeds designated ${designatedTime}s + 25s threshold (${degradeThreshold}s). Already at the gentlest level (2×2); maintaining with ghost guides and reassuring support.`,
        encouragement: `Take all the time you need, ${playerName}. You are in a safe, peaceful space with plenty of time for every piece.`,
        fatigueRisk: 'MODERATE',
        modelSource: 'adaptive-ml-heuristic',
        timestamp: Date.now(),
        timeTaken,
        averageTime: previousAverageSeconds,
        designatedTime,
        consecutiveSolves: 0,
        deltaSeconds: delta,
      };
    }
  }

  // 2. Upgrade Condition:
  // Solved easily within designated average time, 3 times consecutively!
  const solvedEasily = timeTaken <= designatedTime + 5; // within designated time
  const hasThreeConsecutive = solvedEasily && consecutiveSolves >= 3;

  if (hasThreeConsecutive) {
    if (currentGrid < 4) {
      const nextGrid = (currentGrid + 1) as 3 | 4;
      return {
        action: 'INCREASE_DIFFICULTY',
        currentGrid,
        recommendedGrid: nextGrid,
        triggerAutoShift: true,
        reasoning: `Player achieved 3 consecutive successful solves on ${gridNames[currentGrid]} within the designated average time (${timeTaken}s vs ${designatedTime}s standard). Upgraded difficulty 1 step to ${gridNames[nextGrid]}.`,
        encouragement: `Outstanding focus, ${playerName}! You've solved 3 puzzles in a row with such swiftness. Let's try ${gridNames[nextGrid]} together!`,
        fatigueRisk: 'LOW',
        modelSource: 'adaptive-ml-heuristic',
        timestamp: Date.now(),
        timeTaken,
        averageTime: previousAverageSeconds,
        designatedTime,
        consecutiveSolves,
        deltaSeconds: delta,
      };
    } else {
      return {
        action: 'MAINTAIN',
        currentGrid: 4,
        recommendedGrid: 4,
        triggerAutoShift: false,
        reasoning: `Masterful performance: 3+ consecutive solves on Tough (4×4) within designated time (${timeTaken}s vs ${designatedTime}s standard). Already at peak challenge level.`,
        encouragement: `Magnificent mastery, ${playerName}! You've conquered our highest puzzle challenge consecutively with flying colors!`,
        fatigueRisk: 'LOW',
        modelSource: 'adaptive-ml-heuristic',
        timestamp: Date.now(),
        timeTaken,
        averageTime: previousAverageSeconds,
        designatedTime,
        consecutiveSolves,
        deltaSeconds: delta,
      };
    }
  }

  // 3. Maintained: Stable progress (e.g. solve 1/3 or 2/3 towards upgrade, or within normal buffer)
  const remainingForUpgrade = Math.max(0, 3 - consecutiveSolves);
  const streakMessage = solvedEasily && currentGrid < 4
    ? ` That's ${consecutiveSolves}/3 consecutive quick solves towards ${gridNames[currentGrid + 1]}!`
    : '';

  return {
    action: 'MAINTAIN',
    currentGrid,
    recommendedGrid: currentGrid,
    triggerAutoShift: false,
    reasoning: `Completed in ${timeTaken}s (designated baseline: ${designatedTime}s). Consecutive quick solves: ${consecutiveSolves}/3. Maintaining ${gridNames[currentGrid]}.`,
    encouragement: `Lovely work, ${playerName}! You finished in ${timeTaken} seconds.${streakMessage}`,
    fatigueRisk: 'LOW',
    modelSource: 'adaptive-ml-heuristic',
    timestamp: Date.now(),
    timeTaken,
    averageTime: previousAverageSeconds,
    designatedTime,
    consecutiveSolves,
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

