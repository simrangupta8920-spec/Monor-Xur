import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Lazy initialization for Gemini client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

interface DifficultyAnalysisRequest {
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

interface DifficultyAnalysisResponse {
  action: 'EASE_DIFFICULTY' | 'MAINTAIN' | 'INCREASE_DIFFICULTY';
  recommendedLevel: number;
  triggerAutoShift: boolean;
  reasoning: string;
  encouragement: string;
  fatigueRisk: 'LOW' | 'MODERATE' | 'HIGH';
  modelSource: 'gemini-3.8-flash' | 'adaptive-ml-heuristic';
  timestamp: number;
}

// Cognitive ML Adaptive Rule Engine (Fallback & Local ML Evaluator)
function evaluateLocalMLHeuristic(data: DifficultyAnalysisRequest): DifficultyAnalysisResponse {
  const { currentLevel, moves, mistakes, consecutiveMistakes, matchedPairs, totalPairs, elapsedSeconds, consecutiveWins = 0 } = data;
  const playerName = data.playerName || 'Anita';
  const errorRate = moves > 0 ? mistakes / moves : 0;

  // RULE 1: UPGRADE BY 1 LEVEL ON 5-GAME WIN STREAK
  // If player consecutively wins 5 games in Easy mode -> upgrade to Medium mode (Level 2).
  // If player consecutively wins 5 games in Medium mode -> upgrade to Hard mode (Level 3).
  if (consecutiveWins >= 5 && currentLevel < 3) {
    const targetLevel = currentLevel + 1;
    const targetName = targetLevel === 2 ? 'Medium (4 Pairs)' : 'Hard (6 Pairs)';
    return {
      action: 'INCREASE_DIFFICULTY',
      recommendedLevel: targetLevel,
      triggerAutoShift: true,
      reasoning: `Player achieved ${consecutiveWins} consecutive wins at Level ${currentLevel}. Upgrading 1 level to ${targetName} to stimulate cognitive reserve.`,
      encouragement: `Splendid job, ${playerName}! 5 wins in a row! You've unlocked ${targetName} for a fresh spark.`,
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
    const targetLevel = currentLevel - 1; // Strictly 1 step below!
    const targetName = targetLevel === 2 ? 'Medium (4 Pairs)' : 'Easy (3 Pairs)';
    const mistakeLimit = currentLevel === 3 ? 10 : 5;

    return {
      action: 'EASE_DIFFICULTY',
      recommendedLevel: targetLevel,
      triggerAutoShift: true,
      reasoning: `Player reached difficulty threshold on Level ${currentLevel} (${mistakes}/${mistakeLimit} mistakes, ${consecutiveMistakes} consecutive wrong). Auto-shifting 1 step down to ${targetName} to eliminate stress and preserve joy.`,
      encouragement: currentLevel === 3
        ? `You're doing wonderfully, ${playerName}! Let's step down to a 4-pair Medium board so you can relax, take your time, and enjoy matching.`
        : `You're doing wonderfully, ${playerName}! Let's step down to a gentle 3-pair Easy board so you can relax, take your time, and have fun.`,
      fatigueRisk: consecutiveMistakes >= 4 || mistakes >= mistakeLimit ? 'HIGH' : 'MODERATE',
      modelSource: 'adaptive-ml-heuristic',
      timestamp: Date.now(),
    };
  }

  // Smooth play with high accuracy
  const isExcelling = mistakes <= 1 && matchedPairs === totalPairs && elapsedSeconds < 25 && currentLevel < 3 && consecutiveWins >= 4;
  if (isExcelling) {
    return {
      action: 'INCREASE_DIFFICULTY',
      recommendedLevel: currentLevel + 1,
      triggerAutoShift: true,
      reasoning: `Player achieved ${matchedPairs} matches with only ${mistakes} mistake and high win streak. Cognitive recall is sharp.`,
      encouragement: `Spectacular focus, ${playerName}! Ready for the next level!`,
      fatigueRisk: 'LOW',
      modelSource: 'adaptive-ml-heuristic',
      timestamp: Date.now(),
    };
  }

  return {
    action: 'MAINTAIN',
    recommendedLevel: currentLevel,
    triggerAutoShift: false,
    reasoning: `Performance is well-balanced at Level ${currentLevel}. Streak: ${consecutiveWins}/5 towards next level. Error rate is manageable (${Math.round(errorRate * 100)}%).`,
    encouragement: `Steady pace, ${playerName}! Take your time and enjoy every card.`,
    fatigueRisk: 'LOW',
    modelSource: 'adaptive-ml-heuristic',
    timestamp: Date.now(),
  };
}

const PUZZLE_DESIGNATED_TIMES: Record<2 | 3 | 4, number> = {
  2: 25,  // Easy mode (2×2): 25 seconds
  3: 45,  // Medium mode (3×3): 40 to 45 seconds
  4: 120, // Tough round (4×4): 120 seconds
};

interface PuzzleDifficultyRequest {
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

interface PuzzleDifficultyResponse {
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

function evaluateLocalPuzzleMLHeuristic(data: PuzzleDifficultyRequest): PuzzleDifficultyResponse {
  const { currentGrid, timeTaken, previousAverageSeconds, triggerEvent } = data;
  const playerName = data.playerName || 'Anita';
  const designatedTime = data.designatedAverageSeconds || PUZZLE_DESIGNATED_TIMES[currentGrid] || 25;
  const consecutiveSolves = data.consecutiveSolves || 0;
  const delta = timeTaken - designatedTime;

  const gridNames: Record<number, string> = {
    2: 'Easy (2×2)',
    3: 'Medium (3×3)',
    4: 'Tough (4×4)',
  };

  // 1. Degrade rule:
  // Patient is taking 25 seconds MORE than designated average time:
  // Easy: 25s + 25s = 50s. Medium: 45s + 25s = 70s. Tough: 120s + 25s = 145s.
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
        reasoning: `Patient took ${timeTaken}s on Easy (2×2), exceeding designated ${designatedTime}s + 25s threshold (${degradeThreshold}s). Already on gentlest level; maintaining with soothing comfort.`,
        encouragement: `Take all the time you need, ${playerName}. We will keep the puzzle nice and gentle.`,
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

  // 2. Upgrade rule:
  // Patient solved the puzzle easily within designated time, 3 times consecutively!
  const solvedEasily = timeTaken <= designatedTime + 5;
  const hasThreeConsecutive = solvedEasily && consecutiveSolves >= 3;

  if (hasThreeConsecutive) {
    if (currentGrid < 4) {
      const nextGrid = (currentGrid + 1) as 3 | 4;
      return {
        action: 'INCREASE_DIFFICULTY',
        currentGrid,
        recommendedGrid: nextGrid,
        triggerAutoShift: true,
        reasoning: `Patient solved 3 consecutive puzzles easily on ${gridNames[currentGrid]} within the designated average time (${timeTaken}s vs ${designatedTime}s standard). Upgraded difficulty 1 step to ${gridNames[nextGrid]}.`,
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

  // 3. Stable balance / progression
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ 
      status: "ok", 
      app: "Monor Xur", 
      aiAvailable: !!process.env.GEMINI_API_KEY 
    });
  });

  // AI Cognitive Difficulty Analysis Endpoint
  app.post("/api/ai/analyze-difficulty", async (req, res) => {
    try {
      const data: DifficultyAnalysisRequest = req.body;
      const ai = getAIClient();

      if (!ai) {
        // Run ML Heuristic analyzer
        const heuristicResult = evaluateLocalMLHeuristic(data);
        return res.json(heuristicResult);
      }

      // Format prompt for Gemini 3.8 Flash
      const prompt = `You are the adaptive cognitive companion for Monor Xur, a mindful memory application for older adults with mild cognitive impairment.
Player Profile: ${data.playerName || 'Anita Sharma'}, 68 years old.
Current Game State:
- Difficulty Level: ${data.currentLevel} (1=Easy [3 pairs], 2=Medium [4 pairs], 3=Hard [6 pairs])
- Total Moves: ${data.moves}
- Total Mistakes (Mismatches): ${data.mistakes}
- Consecutive Mistakes: ${data.consecutiveMistakes}
- Matched Pairs So Far: ${data.matchedPairs} of ${data.totalPairs}
- Elapsed Time: ${data.elapsedSeconds} seconds
- Trigger Event: ${data.triggerEvent || 'in_game_play'}
- Consecutive Wins Streak at Current Level: ${data.consecutiveWins || 0}

Objective:
Evaluate if difficulty should shift down by 1 step, shift up by 1 step, or be maintained.

STRICT CLINICAL DDA RULES:
1. DEGRADE STRICTLY BY 1 STEP BELOW (Never jump straight from Hard to Easy):
   - On Hard (Level 3): If mistakes >= 10 OR consecutive mistakes >= 4 (or 3 consecutive if 0 pairs matched), recommend 'EASE_DIFFICULTY' with recommendedLevel: 2 (Medium 4-pairs) and triggerAutoShift: true.
   - On Medium (Level 2): If mistakes >= 5 OR consecutive mistakes >= 3, recommend 'EASE_DIFFICULTY' with recommendedLevel: 1 (Easy 3-pairs) and triggerAutoShift: true.
   - On Easy (Level 1): Do not ease below level 1; recommend 'MAINTAIN'.
2. UPGRADE BY 1 STEP ON 5 CONSECUTIVE WINS:
   - If Consecutive Wins Streak >= 5:
     * On Easy (Level 1): Recommend 'INCREASE_DIFFICULTY' to Level 2 (Medium 4-pairs), recommendedLevel: 2, triggerAutoShift: true.
     * On Medium (Level 2): Recommend 'INCREASE_DIFFICULTY' to Level 3 (Hard 6-pairs), recommendedLevel: 3, triggerAutoShift: true.
     * On Hard (Level 3): Peak level; celebrate mastery, recommend 'MAINTAIN'.
3. STABILITY:
   - If neither degradation threshold nor 5-win streak is reached, recommend 'MAINTAIN'.
4. TONE & DIGNITY:
   - Warm, respectful, non-patronizing tone for Anita.
   - NEVER use words like "dementia", "failure", or "struggling". Frame difficulty easing as a relaxing, gentle choice.

Return structured JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              action: { 
                type: Type.STRING, 
                description: "Must be 'EASE_DIFFICULTY', 'MAINTAIN', or 'INCREASE_DIFFICULTY'" 
              },
              recommendedLevel: { 
                type: Type.INTEGER, 
                description: "Target level 1, 2, or 3" 
              },
              triggerAutoShift: { 
                type: Type.BOOLEAN, 
                description: "True if the game should immediately shift to the easier level right now" 
              },
              reasoning: { 
                type: Type.STRING, 
                description: "Clinical & cognitive explanation for caregiver telemetry log" 
              },
              encouragement: { 
                type: Type.STRING, 
                description: "Warm, empowering spoken message for Anita" 
              },
              fatigueRisk: { 
                type: Type.STRING, 
                description: "'LOW', 'MODERATE', or 'HIGH'" 
              },
            },
            required: ["action", "recommendedLevel", "triggerAutoShift", "reasoning", "encouragement", "fatigueRisk"],
          },
        },
      });

      const responseText = response.text || "{}";
      const parsed = JSON.parse(responseText);

      const result: DifficultyAnalysisResponse = {
        action: parsed.action || 'MAINTAIN',
        recommendedLevel: parsed.recommendedLevel || data.currentLevel,
        triggerAutoShift: Boolean(parsed.triggerAutoShift),
        reasoning: parsed.reasoning || "Adaptive cognitive balance maintained.",
        encouragement: parsed.encouragement || "Keep playing at your own comfortable pace!",
        fatigueRisk: parsed.fatigueRisk || "LOW",
        modelSource: 'gemini-3.8-flash',
        timestamp: Date.now(),
      };

      return res.json(result);
    } catch (err) {
      console.warn("Gemini API call fell back to local ML heuristic:", err);
      const fallbackResult = evaluateLocalMLHeuristic(req.body);
      return res.json(fallbackResult);
    }
  });

  // AI Puzzle Difficulty Analysis Endpoint
  app.post("/api/ai/analyze-puzzle-difficulty", async (req, res) => {
    const data = req.body;
    const currentGrid: 2 | 3 | 4 = (data.currentGrid === 3 ? 3 : data.currentGrid === 4 ? 4 : 2);
    const timeTaken = Number(data.timeTaken) || 25;
    const designatedAverageSeconds = Number(data.designatedAverageSeconds) || PUZZLE_DESIGNATED_TIMES[currentGrid] || 25;
    const previousAverageSeconds = Number(data.previousAverageSeconds) || designatedAverageSeconds;
    const consecutiveSolves = Number(data.consecutiveSolves) || 0;
    const delta = timeTaken - designatedAverageSeconds;
    const playerName = data.playerName || 'Anita';

    const gridNames: Record<number, string> = {
      2: 'Easy (2×2)',
      3: 'Medium (3×3)',
      4: 'Tough (4×4)',
    };

    const ai = getAIClient();
    if (!ai) {
      const fallbackResult = evaluateLocalPuzzleMLHeuristic({
        playerName,
        currentGrid,
        timeTaken,
        previousAverageSeconds,
        designatedAverageSeconds,
        consecutiveSolves,
        recentTimes: data.recentTimes,
        moves: data.moves,
        piecesPlaced: data.piecesPlaced,
        totalPieces: data.totalPieces,
        triggerEvent: data.triggerEvent || 'round_complete',
      });
      return res.json(fallbackResult);
    }

    try {
      const degradeThreshold = designatedAverageSeconds + 25;
      const prompt = `You are the adaptive cognitive AI companion for Monor Xur, analyzing photo puzzle performance for an older adult with mild cognitive impairment.
Player: ${playerName}, 68 years old.

Game State:
- Current Puzzle Grid: ${currentGrid}x${currentGrid} (${gridNames[currentGrid]})
- Current Attempt Time: ${timeTaken} seconds
- Designated Average Baseline Time for ${gridNames[currentGrid]}: ${designatedAverageSeconds} seconds (Standard: Easy 2x2 = 25s, Medium 3x3 = 40-45s, Tough 4x4 = 120s)
- Degrade Threshold: > ${degradeThreshold} seconds (${designatedAverageSeconds}s + 25s)
- Consecutive Easy Solves at Current Level: ${consecutiveSolves} (Upgrade triggers at 3 consecutive solves within designated time)
- Trigger Event: ${data.triggerEvent || 'round_complete'}
- Moves Count: ${data.moves ?? 'N/A'}
- Correctly Placed Pieces: ${data.piecesPlaced ?? 'all'} / ${data.totalPieces ?? currentGrid * currentGrid}

Objective Rules:
1. Degrade Level (EASE_DIFFICULTY):
   If the player is not able to solve it within the designated average time and takes 25 seconds MORE than designated baseline (timeTaken > ${degradeThreshold}s), or struggle detected:
   - If on Tough (4x4), degrade 1 step to Medium (3x3).
   - If on Medium (3x3), degrade 1 step to Easy (2x2).
   - If on Easy (2x2), maintain Easy (2x2) with calming, gentle warmth.
   - Action: 'EASE_DIFFICULTY', recommendedGrid: 1 step lower, triggerAutoShift: true.

2. Upgrade Level (INCREASE_DIFFICULTY):
   If the player easily solves the puzzle consecutively 3 times within designated average time (consecutiveSolves >= 3 and timeTaken <= ${designatedAverageSeconds + 5}s):
   - If on Easy (2x2), upgrade 1 step to Medium (3x3).
   - If on Medium (3x3), upgrade 1 step to Tough (4x4).
   - If on Tough (4x4), maintain Tough (4x4) with high praise.
   - Action: 'INCREASE_DIFFICULTY', recommendedGrid: 1 step higher, triggerAutoShift: true.

3. Stable Progress (MAINTAIN):
   If timeTaken is within the comfortable range and consecutiveSolves < 3, maintain current grid level.
   - Action: 'MAINTAIN', recommendedGrid: ${currentGrid}, triggerAutoShift: false.

4. Voice Tone:
   Warm, dignified, encouraging. Never patronize or mention dementia, slowness, or failure. Frame adjustments as relaxing and comfortable.

Return structured JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              action: {
                type: Type.STRING,
                description: "Must be 'EASE_DIFFICULTY', 'MAINTAIN', or 'INCREASE_DIFFICULTY'",
              },
              recommendedGrid: {
                type: Type.INTEGER,
                description: "Target grid size: 2, 3, or 4",
              },
              triggerAutoShift: {
                type: Type.BOOLEAN,
                description: "True if difficulty should step up or down immediately",
              },
              reasoning: {
                type: Type.STRING,
                description: "Clinical reasoning citing completion time vs designated baseline",
              },
              encouragement: {
                type: Type.STRING,
                description: "Warm spoken message for Anita explaining the adaptation",
              },
              fatigueRisk: {
                type: Type.STRING,
                description: "'LOW', 'MODERATE', or 'HIGH'",
              },
            },
            required: ["action", "recommendedGrid", "triggerAutoShift", "reasoning", "encouragement", "fatigueRisk"],
          },
        },
      });

      const responseText = response.text || "{}";
      const parsed = JSON.parse(responseText);

      let targetGrid: 2 | 3 | 4 = currentGrid;
      if (parsed.recommendedGrid === 2 || parsed.recommendedGrid === 3 || parsed.recommendedGrid === 4) {
        targetGrid = parsed.recommendedGrid;
      }

      const result: PuzzleDifficultyResponse = {
        action: (parsed.action as any) || 'MAINTAIN',
        currentGrid,
        recommendedGrid: targetGrid,
        triggerAutoShift: Boolean(parsed.triggerAutoShift),
        reasoning: parsed.reasoning || `AI evaluated time (${timeTaken}s) vs designated baseline (${designatedAverageSeconds}s).`,
        encouragement: parsed.encouragement || `Keep having fun at your comfortable pace, ${playerName}!`,
        fatigueRisk: parsed.fatigueRisk || 'LOW',
        modelSource: 'gemini-3.8-flash',
        timestamp: Date.now(),
        timeTaken,
        averageTime: previousAverageSeconds,
        designatedTime: designatedAverageSeconds,
        consecutiveSolves,
        deltaSeconds: delta,
      };

      return res.json(result);
    } catch (err) {
      console.warn("Gemini puzzle analysis fell back to local ML heuristic:", err);
      const fallbackResult = evaluateLocalPuzzleMLHeuristic({
        playerName,
        currentGrid,
        timeTaken,
        previousAverageSeconds,
        designatedAverageSeconds,
        consecutiveSolves,
        recentTimes: data.recentTimes,
        moves: data.moves,
        piecesPlaced: data.piecesPlaced,
        totalPieces: data.totalPieces,
        triggerEvent: data.triggerEvent || 'round_complete',
      });
      return res.json(fallbackResult);
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
