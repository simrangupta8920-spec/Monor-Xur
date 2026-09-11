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
  const { currentLevel, moves, mistakes, consecutiveMistakes, matchedPairs, totalPairs, elapsedSeconds } = data;
  const playerName = data.playerName || 'Anita';

  // Calculate mistake velocity and frustration index
  const errorRate = moves > 0 ? mistakes / moves : 0;
  const isHighStruggle = 
    consecutiveMistakes >= 3 || 
    (mistakes >= 4 && matchedPairs <= 1 && elapsedSeconds > 25) ||
    (mistakes >= 5 && currentLevel > 1);

  if (isHighStruggle && currentLevel > 1) {
    return {
      action: 'EASE_DIFFICULTY',
      recommendedLevel: Math.max(1, currentLevel - 1),
      triggerAutoShift: true,
      reasoning: `AI Model observed ${consecutiveMistakes} consecutive mismatches and high error rate (${Math.round(errorRate * 100)}%). Shifting to Level ${Math.max(1, currentLevel - 1)} (Easy) to ensure comfort and eliminate frustration.`,
      encouragement: `You're doing wonderful, ${playerName}! Let's switch to a gentle 3-pair board so you can enjoy matching at an easy pace.`,
      fatigueRisk: consecutiveMistakes >= 4 ? 'HIGH' : 'MODERATE',
      modelSource: 'adaptive-ml-heuristic',
      timestamp: Date.now(),
    };
  }

  // Smooth play with high accuracy
  const isExcelling = mistakes <= 1 && matchedPairs === totalPairs && elapsedSeconds < 25 && currentLevel < 3;
  if (isExcelling) {
    return {
      action: 'INCREASE_DIFFICULTY',
      recommendedLevel: Math.min(3, currentLevel + 1),
      triggerAutoShift: false,
      reasoning: `Player achieved ${matchedPairs} matches with only ${mistakes} mistake in ${elapsedSeconds}s. High cognitive clarity detected.`,
      encouragement: `Spectacular focus, ${playerName}! Your memory recall was quick and clear.`,
      fatigueRisk: 'LOW',
      modelSource: 'adaptive-ml-heuristic',
      timestamp: Date.now(),
    };
  }

  return {
    action: 'MAINTAIN',
    recommendedLevel: currentLevel,
    triggerAutoShift: false,
    reasoning: `Performance is well-balanced at Level ${currentLevel}. Error rate is manageable (${Math.round(errorRate * 100)}%) with ${matchedPairs}/${totalPairs} pairs completed.`,
    encouragement: `Steady pace, ${playerName}! Take your time and enjoy every card.`,
    fatigueRisk: 'LOW',
    modelSource: 'adaptive-ml-heuristic',
    timestamp: Date.now(),
  };
}

interface PuzzleDifficultyRequest {
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
  deltaSeconds: number;
}

function evaluateLocalPuzzleMLHeuristic(data: PuzzleDifficultyRequest): PuzzleDifficultyResponse {
  const { currentGrid, timeTaken, previousAverageSeconds, triggerEvent } = data;
  const playerName = data.playerName || 'Anita';
  const delta = timeTaken - previousAverageSeconds;
  const gridNames: Record<number, string> = {
    2: 'Gentle (2×2)',
    3: 'Medium (3×3)',
    4: 'Challenge (4×4)',
  };

  // 1. In-game struggle detected: took significantly longer while still assembling
  if (triggerEvent === 'in_game_struggle' && currentGrid > 2) {
    const nextGrid = (currentGrid - 1) as 2 | 3;
    return {
      action: 'EASE_DIFFICULTY',
      currentGrid,
      recommendedGrid: nextGrid,
      triggerAutoShift: true,
      reasoning: `AI Model detected in-game struggle (${timeTaken}s elapsed, well beyond baseline average of ${previousAverageSeconds}s). Downshifting 1 step from ${gridNames[currentGrid]} to ${gridNames[nextGrid]} for cognitive ease.`,
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
  // e.g. baseline is 30s, and taking 65s, 70s, 80s or >= 1.7x average, or delta >= 20s
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
  // e.g. baseline was 30s, now down by 10s or 15s to 20s or faster
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

Objective:
Evaluate if the player is struggling, experiencing cognitive fatigue, or getting too many wrong answers.
Rules:
1. If consecutive mistakes >= 3 OR total mistakes > 3 at level 2 or 3, recommend 'EASE_DIFFICULTY' to level 1 (Easy), set triggerAutoShift to true, and provide warm, non-stigmatizing encouragement.
2. If the player is finishing quickly with <= 1 mistake, you may recommend 'INCREASE_DIFFICULTY' (or 'MAINTAIN' if already comfortable).
3. If performance is stable, recommend 'MAINTAIN'.
4. Do NOT patronize or make the player feel inadequate. Never use the word "dementia" or "failure". Frame difficulty reduction as a relaxing, peaceful choice.

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
    const timeTaken = Number(data.timeTaken) || 30;
    const previousAverageSeconds = Math.max(10, Number(data.previousAverageSeconds) || 30);
    const delta = timeTaken - previousAverageSeconds;
    const playerName = data.playerName || 'Anita';

    const gridNames: Record<number, string> = {
      2: 'Gentle (2×2)',
      3: 'Medium (3×3)',
      4: 'Challenge (4×4)',
    };

    const ai = getAIClient();
    if (!ai) {
      const fallbackResult = evaluateLocalPuzzleMLHeuristic({
        playerName,
        currentGrid,
        timeTaken,
        previousAverageSeconds,
        recentTimes: data.recentTimes,
        moves: data.moves,
        piecesPlaced: data.piecesPlaced,
        totalPieces: data.totalPieces,
        triggerEvent: data.triggerEvent || 'round_complete',
      });
      return res.json(fallbackResult);
    }

    try {
      const prompt = `You are the adaptive cognitive AI companion for Monor Xur, analyzing photo puzzle performance for an older adult with mild cognitive impairment.
Player: ${playerName}, 68 years old.

Game State:
- Current Puzzle Grid: ${currentGrid}x${currentGrid} (${gridNames[currentGrid]})
- Current Attempt Time: ${timeTaken} seconds
- Previous Baseline Average Time: ${previousAverageSeconds} seconds
- Time Difference: ${delta} seconds (${delta > 0 ? `slower by ${delta}s` : `faster by ${Math.abs(delta)}s`})
- Recent Times History: ${JSON.stringify(data.recentTimes || [])}
- Trigger Event: ${data.triggerEvent || 'round_complete'}
- Moves Count: ${data.moves ?? 'N/A'}
- Correctly Placed Pieces: ${data.piecesPlaced ?? 'all'} / ${data.totalPieces ?? currentGrid * currentGrid}

Objective:
Evaluate whether to degrade difficulty by 1 step, increase difficulty by 1 step, or maintain based on time trends:
1. Time Increasing Significantly (Degrade 1 step):
   If time is taking much longer than average (e.g. baseline is 30s and taking 65s, 70s, 80s or >= 1.7x average, or struggle detected):
   - If on Challenge (4x4), degrade 1 step to Medium (3x3).
   - If on Medium (3x3), degrade 1 step to Gentle (2x2).
   - If on Gentle (2x2), maintain Gentle (2x2) with calming warmth.
   - Action: 'EASE_DIFFICULTY', recommendedGrid: 1 step lower, triggerAutoShift: true.
2. Time Decreasing Significantly (Increase 1 step):
   If time is decreasing significantly over attempts (e.g. earlier average was 30s and down by 10s-15s to 20s or less):
   - If on Gentle (2x2), advance 1 step to Medium (3x3).
   - If on Medium (3x3), advance 1 step to Challenge (4x4).
   - If on Challenge (4x4), maintain Challenge (4x4) with high praise.
   - Action: 'INCREASE_DIFFICULTY', recommendedGrid: 1 step higher, triggerAutoShift: true.
3. Stable Time (Maintain):
   If time is within normal variance of baseline, maintain current grid.
4. Voice:
   Warm, dignified, encouraging. Never patronize or mention dementia or slowness.

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
                description: "Clinical reasoning citing specific completion time vs average time for telemetry",
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

      const result = {
        action: parsed.action || 'MAINTAIN',
        currentGrid,
        recommendedGrid: targetGrid,
        triggerAutoShift: Boolean(parsed.triggerAutoShift),
        reasoning: parsed.reasoning || `AI evaluated time (${timeTaken}s) vs average (${previousAverageSeconds}s).`,
        encouragement: parsed.encouragement || `Keep having fun at your comfortable pace, ${playerName}!`,
        fatigueRisk: parsed.fatigueRisk || 'LOW',
        modelSource: 'gemini-3.8-flash',
        timestamp: Date.now(),
        timeTaken,
        averageTime: previousAverageSeconds,
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
      server: { middlewareMode: true },
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
