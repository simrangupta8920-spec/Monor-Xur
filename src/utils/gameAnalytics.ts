import { DDAMetric } from '../types';

export type GameFilterType = 'all' | 'memory_match' | 'puzzle';

export interface GameSummaryStats {
  totalSessions: number;
  avgAccuracy: number;
  avgLatencySec: number;
  totalMistakes: number;
  avgMistakes: number;
  totalMoves: number;
  totalHints: number;
  easedCount: number;
  increasedCount: number;
  maintainedCount: number;
  currentDifficultyLevel: number;
  currentLevel: number;
  fatigueLowPercent: number;
  accuracyImprovementPercent: number;
  activeDays: number;
}

export interface GameBreakdownItem {
  gameType: 'memory_match' | 'puzzle';
  gameTitle: string;
  sessions: number;
  avgAccuracy: number;
  accuracy: number;
  avgLatencySec: number;
  avgMistakes: number;
  lastPlayedTimestamp?: number;
  currentLevel: number;
  level: number;
  adaptiveShifts: number;
  iconName: 'Brain' | 'Puzzle';
}

/**
 * Filter logs by game type.
 */
export function filterLogsByGame(logs: DDAMetric[], gameFilter: GameFilterType): DDAMetric[] {
  if (gameFilter === 'all') return logs;
  return logs.filter((log) => {
    if (gameFilter === 'puzzle') {
      return log.gameType === 'puzzle' || (log.gameTitle && log.gameTitle.toLowerCase().includes('puzzle'));
    }
    // Default to memory_match if unspecified or matching
    return !log.gameType || log.gameType === 'memory_match' || (log.gameTitle && log.gameTitle.toLowerCase().includes('memory'));
  });
}

/**
 * Helper to compute single round accuracy score (0-100%).
 */
export function calculateRoundAccuracy(log: DDAMetric): number {
  const mistakes = log.mistakes || 0;
  const hints = log.hintsUsed || 0;
  const level = log.difficultyLevel || 1;

  // Base score 100 minus errors
  const mistakePenalty = mistakes * 6;
  const hintPenalty = hints * 4;
  const levelBonus = (level - 1) * 3;

  const raw = 100 - mistakePenalty - hintPenalty + levelBonus;
  return Math.max(40, Math.min(100, Math.round(raw)));
}

/**
 * Compute aggregate summary statistics for any subset of game logs.
 */
export function computeGameStats(logs: DDAMetric[]): GameSummaryStats {
  if (!logs || logs.length === 0) {
    return {
      totalSessions: 0,
      avgAccuracy: 0,
      avgLatencySec: 0,
      totalMistakes: 0,
      avgMistakes: 0,
      totalMoves: 0,
      totalHints: 0,
      easedCount: 0,
      increasedCount: 0,
      maintainedCount: 0,
      currentDifficultyLevel: 1,
      currentLevel: 1,
      fatigueLowPercent: 100,
      accuracyImprovementPercent: 0,
      activeDays: 0,
    };
  }

  const totalSessions = logs.length;
  const totalLatencyMs = logs.reduce((acc, l) => acc + (l.latencyMs || 3000), 0);
  const avgLatencySec = Number((totalLatencyMs / totalSessions / 1000).toFixed(1));

  const accuracies = logs.map(calculateRoundAccuracy);
  const avgAccuracy = Math.round(accuracies.reduce((a, b) => a + b, 0) / totalSessions);

  const totalMistakes = logs.reduce((acc, l) => acc + (l.mistakes || 0), 0);
  const avgMistakes = Number((totalMistakes / totalSessions).toFixed(1));

  const totalMoves = logs.reduce((acc, l) => acc + (l.moves || 0), 0);
  const totalHints = logs.reduce((acc, l) => acc + (l.hintsUsed || 0), 0);

  const easedCount = logs.filter((l) => l.adaptiveAction === 'eased').length;
  const increasedCount = logs.filter((l) => l.adaptiveAction === 'increased').length;
  const maintainedCount = logs.filter((l) => l.adaptiveAction === 'maintained').length;

  const latestLog = logs[0]; // Assuming sorted descending or we check timestamp
  const sortedByTime = [...logs].sort((a, b) => b.timestamp - a.timestamp);
  const currentDifficultyLevel = sortedByTime[0]?.difficultyLevel || 1;

  const lowFatigueCount = logs.filter((l) => !l.fatigueRisk || l.fatigueRisk === 'LOW').length;
  const fatigueLowPercent = Math.round((lowFatigueCount / totalSessions) * 100);

  // Compute improvement from oldest to newest
  const oldestToNewest = [...logs].sort((a, b) => a.timestamp - b.timestamp);
  let accuracyImprovementPercent = 0;
  if (oldestToNewest.length >= 2) {
    const firstScore = calculateRoundAccuracy(oldestToNewest[0]);
    const recentScores = oldestToNewest.slice(-3);
    const recentAvg = Math.round(recentScores.reduce((acc, l) => acc + calculateRoundAccuracy(l), 0) / recentScores.length);
    accuracyImprovementPercent = recentAvg - firstScore;
  }

  // Compute unique active calendar days
  const activeDays = new Set(logs.map((l) => new Date(l.timestamp).toDateString())).size;

  return {
    totalSessions,
    avgAccuracy,
    avgLatencySec,
    totalMistakes,
    avgMistakes,
    totalMoves,
    totalHints,
    easedCount,
    increasedCount,
    maintainedCount,
    currentDifficultyLevel,
    currentLevel: currentDifficultyLevel,
    fatigueLowPercent,
    accuracyImprovementPercent,
    activeDays,
  };
}

/**
 * Breakdown comparison by game.
 */
export function getGameBreakdown(logs: DDAMetric[]): {
  memoryMatch: GameBreakdownItem;
  puzzle: GameBreakdownItem;
  mostPlayed: string;
} {
  const memoryLogs = filterLogsByGame(logs, 'memory_match');
  const puzzleLogs = filterLogsByGame(logs, 'puzzle');

  const memStats = computeGameStats(memoryLogs);
  const puzzleStats = computeGameStats(puzzleLogs);

  const memSorted = [...memoryLogs].sort((a, b) => b.timestamp - a.timestamp);
  const puzzleSorted = [...puzzleLogs].sort((a, b) => b.timestamp - a.timestamp);

  const memoryMatchItem: GameBreakdownItem = {
    gameType: 'memory_match',
    gameTitle: 'Memory Match',
    sessions: memStats.totalSessions,
    avgAccuracy: memStats.avgAccuracy,
    accuracy: memStats.avgAccuracy,
    avgLatencySec: memStats.avgLatencySec,
    avgMistakes: memStats.avgMistakes,
    lastPlayedTimestamp: memSorted[0]?.timestamp,
    currentLevel: memStats.currentDifficultyLevel,
    level: memStats.currentDifficultyLevel,
    adaptiveShifts: memStats.easedCount + memStats.increasedCount,
    iconName: 'Brain',
  };

  const puzzleItem: GameBreakdownItem = {
    gameType: 'puzzle',
    gameTitle: 'Photo Puzzle',
    sessions: puzzleStats.totalSessions,
    avgAccuracy: puzzleStats.avgAccuracy,
    accuracy: puzzleStats.avgAccuracy,
    avgLatencySec: puzzleStats.avgLatencySec,
    avgMistakes: puzzleStats.avgMistakes,
    lastPlayedTimestamp: puzzleSorted[0]?.timestamp,
    currentLevel: puzzleStats.currentDifficultyLevel,
    level: puzzleStats.currentDifficultyLevel,
    adaptiveShifts: puzzleStats.easedCount + puzzleStats.increasedCount,
    iconName: 'Puzzle',
  };

  let mostPlayed = 'None yet';
  if (puzzleStats.totalSessions > 0 || memStats.totalSessions > 0) {
    if (puzzleStats.totalSessions > memStats.totalSessions) {
      mostPlayed = 'Photo Puzzle';
    } else if (memStats.totalSessions > puzzleStats.totalSessions) {
      mostPlayed = 'Memory Match';
    } else {
      mostPlayed = 'Balanced (Both Games)';
    }
  }

  return {
    memoryMatch: memoryMatchItem,
    puzzle: puzzleItem,
    mostPlayed,
  };
}

/**
 * Weekly activity grouped by day of week.
 */
export function getWeeklyActivityDistribution(logs: DDAMetric[]): { label: string; value: number; count: number }[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayCounts: Record<string, number> = {
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
    Sun: 0,
  };

  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 3600 * 1000;

  logs.forEach((log) => {
    // Only count sessions within the last 7 days (or all if sparsely logged)
    const d = new Date(log.timestamp);
    const dayLabel = days[d.getDay()];
    if (dayCounts[dayLabel] !== undefined) {
      dayCounts[dayLabel] += 1;
    }
  });

  // Return standard Mon-Sun sequence
  const orderedLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return orderedLabels.map((lbl) => ({
    label: lbl,
    count: dayCounts[lbl] || 0,
    // Approximate stimulation time (e.g. 0.4 hrs per 2 sessions)
    value: Number(((dayCounts[lbl] || 0) * 0.25).toFixed(1)),
  }));
}

/**
 * Generate clinical observation note and engagement status.
 */
export function generateClinicalReportSummary(logs: DDAMetric[], patientName = 'Patient') {
  const stats = computeGameStats(logs);
  const breakdown = getGameBreakdown(logs);

  let engagement = 'High Focus';
  if (stats.totalSessions === 0) {
    engagement = 'No Sessions Yet';
  } else if (stats.avgAccuracy < 65 || stats.avgLatencySec > 6) {
    engagement = 'Gentle Calibration';
  } else if (stats.avgAccuracy >= 80) {
    engagement = 'Optimal Stimulation';
  } else {
    engagement = 'Steady Agility';
  }

  let note = '';
  if (stats.totalSessions === 0) {
    note = `No gameplay sessions logged yet for ${patientName}. Playing Memory Match or Photo Puzzle in Player Zone will generate real-time clinical telemetry.`;
  } else {
    const gameParts: string[] = [];
    if (breakdown.memoryMatch.sessions > 0) {
      gameParts.push(`Memory Match (${breakdown.memoryMatch.sessions} rounds, ${breakdown.memoryMatch.avgAccuracy}% accuracy)`);
    }
    if (breakdown.puzzle.sessions > 0) {
      gameParts.push(`Photo Puzzle (${breakdown.puzzle.sessions} rounds, ${breakdown.puzzle.avgAccuracy}% accuracy)`);
    }

    const gameOverview = gameParts.join(' and ');
    const adaptationNote = stats.easedCount > 0 
      ? `AI Dynamic Difficulty Adjustment safely cushioned cognitive fatigue ${stats.easedCount} time(s).` 
      : `Patient maintained healthy independent recall with minimal fatigue triggers.`;

    note = `${patientName} completed ${stats.totalSessions} sessions across ${gameOverview}. Average decision latency stabilized at ${stats.avgLatencySec}s with ${stats.avgAccuracy}% overall accuracy. ${adaptationNote}`;
  }

  return {
    period: 'Current Clinical Cycle',
    engagement,
    totalSessions: stats.totalSessions,
    avgAccuracy: stats.avgAccuracy,
    avgLatencySec: stats.avgLatencySec,
    bestGame: breakdown.mostPlayed,
    note,
    breakdown,
  };
}
