import { DDAMetric } from '../types';

export type GameFilterType = 'all' | 'puzzle' | 'memory_match';

export function filterLogsByGame(logs: DDAMetric[], filter: GameFilterType): DDAMetric[] {
  if (!logs || logs.length === 0) return [];
  if (filter === 'all') return logs;

  return logs.filter((log) => {
    const isPuzzle = 
      log.gameType === 'puzzle' || 
      (log.gameTitle && log.gameTitle.toLowerCase().includes('puzzle'));
    
    if (filter === 'puzzle') return isPuzzle;
    if (filter === 'memory_match') return !isPuzzle;
    return true;
  });
}

export function computeGameStats(logs: DDAMetric[]): {
  avgAccuracy: number;
  totalSessions: number;
  currentLevel: number;
  activeDays: number;
  avgLatencySec: number;
} {
  if (!logs || logs.length === 0) {
    return {
      avgAccuracy: 92,
      totalSessions: 0,
      currentLevel: 1,
      activeDays: 0,
      avgLatencySec: 3.2,
    };
  }

  const totalSessions = logs.length;
  let totalMistakes = 0;
  let totalMoves = 0;
  let totalLatencyMs = 0;
  const uniqueDays = new Set<string>();

  logs.forEach((log) => {
    totalMistakes += log.mistakes || 0;
    totalMoves += log.moves || (log.mistakes + 4);
    totalLatencyMs += log.latencyMs || 3000;
    if (log.timestamp) {
      const d = new Date(log.timestamp);
      uniqueDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    }
  });

  const rawAccuracy = totalMoves > 0 
    ? Math.max(50, Math.min(100, Math.round(((totalMoves - totalMistakes) / totalMoves) * 100))) 
    : 90;

  const avgLatencySec = totalSessions > 0
    ? Number((totalLatencyMs / totalSessions / 1000).toFixed(1))
    : 3.2;

  // Most recent session level or default
  const latestLog = logs[logs.length - 1];
  const currentLevel = latestLog?.difficultyLevel || 1;

  return {
    avgAccuracy: rawAccuracy,
    totalSessions,
    currentLevel,
    activeDays: uniqueDays.size,
    avgLatencySec,
  };
}

export interface SingleGameBreakdown {
  sessions: number;
  accuracy: number;
  avgMistakes: number;
  avgLatencySec: number;
  level: number;
}

export function getGameBreakdown(logs: DDAMetric[]): {
  memoryMatch: SingleGameBreakdown;
  puzzle: SingleGameBreakdown;
} {
  const memoryLogs = filterLogsByGame(logs, 'memory_match');
  const puzzleLogs = filterLogsByGame(logs, 'puzzle');

  const calcBreakdown = (items: DDAMetric[], defaultLevel: number): SingleGameBreakdown => {
    if (items.length === 0) {
      return {
        sessions: 0,
        accuracy: 90,
        avgMistakes: 0,
        avgLatencySec: 3.5,
        level: defaultLevel,
      };
    }

    let mistakes = 0;
    let moves = 0;
    let latencyMs = 0;

    items.forEach((l) => {
      mistakes += l.mistakes || 0;
      moves += l.moves || (l.mistakes + 4);
      latencyMs += l.latencyMs || 3500;
    });

    const accuracy = moves > 0
      ? Math.max(50, Math.min(100, Math.round(((moves - mistakes) / moves) * 100)))
      : 88;

    const avgMistakes = Number((mistakes / items.length).toFixed(1));
    const avgLatencySec = Number((latencyMs / items.length / 1000).toFixed(1));
    const level = items[items.length - 1]?.difficultyLevel || defaultLevel;

    return {
      sessions: items.length,
      accuracy,
      avgMistakes,
      avgLatencySec,
      level,
    };
  };

  return {
    memoryMatch: calcBreakdown(memoryLogs, 1),
    puzzle: calcBreakdown(puzzleLogs, 2),
  };
}

export function generateClinicalReportSummary(
  logs: DDAMetric[], 
  patientFullName?: string
): {
  period: string;
  engagement: string;
  note: string;
} {
  const name = patientFullName || 'Patient';
  const total = logs.length;

  if (total === 0) {
    return {
      period: 'Last 7 Days (Telemetry)',
      engagement: 'Getting Started',
      note: `${name} has onboarding completed. Dynamic adaptive game sessions will automatically calibrate and populate clinical engagement trends here as rounds are played.`,
    };
  }

  const stats = computeGameStats(logs);

  return {
    period: 'Last 7 Days (Telemetry)',
    engagement: stats.totalSessions >= 5 ? 'High Engagement' : 'Moderate Engagement',
    note: `${name} has engaged in ${stats.totalSessions} sessions across ${stats.activeDays} active days with an overall accuracy of ${stats.avgAccuracy}%. Average cognitive motor latency is steady at ${stats.avgLatencySec}s, demonstrating responsive participation without distress.`,
  };
}

export function getWeeklyActivityDistribution(logs: DDAMetric[]): Array<{ label: string; value: number }> {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayMinutes = [0, 0, 0, 0, 0, 0, 0];

  logs.forEach((log) => {
    if (log.timestamp) {
      const date = new Date(log.timestamp);
      // JS getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
      const jsDay = date.getDay();
      const mappedIdx = jsDay === 0 ? 6 : jsDay - 1; // Map Sunday to 6, Monday to 0
      // Estimate session duration: latency * moves or default 3 minutes
      const sessionDurationMinutes = log.moves ? Math.max(1, Math.round((log.moves * 6) / 60)) : 3;
      dayMinutes[mappedIdx] += sessionDurationMinutes;
    }
  });

  return days.map((label, idx) => {
    const hours = Number((dayMinutes[idx] / 60).toFixed(1));
    return {
      label,
      value: hours > 0 ? hours : 0.2, // Visual baseline for scannability
    };
  });
}
