// Gameplay telemetry tracker for Monor Xur.
//
// Records per-round performance metrics (response time / latency, incorrect
// attempts, hesitation count, success) so game screens can report engagement
// and the caregiver/ASHA Reports can consume real session data.
//
// Two ways to use it from a game screen:
//
//   const { trackRoundMetric, startRound } = useTelemetry();
//
//   // 1) Manual — you already have the numbers:
//   trackRoundMetric({ isCorrect: true, responseTime: 1840, hesitations: 2, game: "Memory Match" });
//
//   // 2) Guided — let the tracker time the round for you:
//   const round = startRound("Memory Match");
//   round.markHesitation();          // call whenever the player pauses/second-guesses
//   round.markIncorrect();           // call on each wrong tap
//   round.finish(true);              // call once when the round ends (isCorrect)
//
// Every completed round is appended to `rounds`, logged to the console
// (for verification), and persisted to device storage.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

import { storage } from "@/src/utils/storage";

const TELEMETRY_KEY = "monor_xur_telemetry_rounds";
const MAX_STORED = 500;

export type RoundMetric = {
  timestamp: number;
  success: 0 | 1;
  latency: number; // response time in ms
  hesitationCount: number;
  incorrectAttempts: number;
  game: string;
};

/** Pure builder — mirrors the requested collector shape. */
export function createRoundMetric(
  isCorrect: boolean,
  responseTime: number,
  hesitations: number,
  incorrectAttempts = 0,
  game = "unknown",
): RoundMetric {
  return {
    timestamp: Date.now(),
    success: isCorrect ? 1 : 0,
    latency: Math.max(0, Math.round(responseTime)),
    hesitationCount: Math.max(0, hesitations),
    incorrectAttempts: Math.max(0, incorrectAttempts),
    game,
  };
}

export type TelemetrySummary = {
  totalRounds: number;
  accuracy: number; // 0-100
  avgLatency: number; // ms
  totalHesitations: number;
  totalIncorrect: number;
};

export type RoundController = {
  markHesitation: () => void;
  markIncorrect: () => void;
  finish: (isCorrect: boolean) => RoundMetric;
};

type TrackArgs = {
  isCorrect: boolean;
  responseTime: number;
  hesitations?: number;
  incorrectAttempts?: number;
  game?: string;
};

type TelemetryValue = {
  rounds: RoundMetric[];
  summary: TelemetrySummary;
  trackRoundMetric: (args: TrackArgs) => RoundMetric;
  startRound: (game?: string) => RoundController;
  clear: () => Promise<void>;
};

const TelemetryContext = createContext<TelemetryValue | null>(null);

function summarize(rounds: RoundMetric[]): TelemetrySummary {
  const totalRounds = rounds.length;
  if (totalRounds === 0) {
    return { totalRounds: 0, accuracy: 0, avgLatency: 0, totalHesitations: 0, totalIncorrect: 0 };
  }
  const successes = rounds.reduce((n, r) => n + r.success, 0);
  const latency = rounds.reduce((n, r) => n + r.latency, 0);
  const hesitations = rounds.reduce((n, r) => n + r.hesitationCount, 0);
  const incorrect = rounds.reduce((n, r) => n + r.incorrectAttempts, 0);
  return {
    totalRounds,
    accuracy: Math.round((successes / totalRounds) * 100),
    avgLatency: Math.round(latency / totalRounds),
    totalHesitations: hesitations,
    totalIncorrect: incorrect,
  };
}

export function TelemetryProvider({ children }: PropsWithChildren) {
  const [rounds, setRounds] = useState<RoundMetric[]>([]);
  const roundsRef = useRef<RoundMetric[]>([]);

  useEffect(() => {
    (async () => {
      const saved = await storage.getItem<RoundMetric[] | null>(TELEMETRY_KEY, null);
      if (Array.isArray(saved)) {
        roundsRef.current = saved;
        setRounds(saved);
      }
    })();
  }, []);

  const append = useCallback((metric: RoundMetric) => {
    const next = [...roundsRef.current, metric].slice(-MAX_STORED);
    roundsRef.current = next;
    setRounds(next);
    // Verification: confirm metrics append correctly at the end of each round.
    console.log("[telemetry] round recorded:", metric);
    storage.setItem(TELEMETRY_KEY, next as any);
    return metric;
  }, []);

  const trackRoundMetric = useCallback(
    ({ isCorrect, responseTime, hesitations = 0, incorrectAttempts = 0, game = "unknown" }: TrackArgs) =>
      append(createRoundMetric(isCorrect, responseTime, hesitations, incorrectAttempts, game)),
    [append],
  );

  const startRound = useCallback(
    (game = "unknown"): RoundController => {
      const startedAt = Date.now();
      let hesitations = 0;
      let incorrect = 0;
      let finished = false;
      return {
        markHesitation: () => {
          hesitations += 1;
        },
        markIncorrect: () => {
          incorrect += 1;
        },
        finish: (isCorrect: boolean) => {
          if (finished) {
            return roundsRef.current[roundsRef.current.length - 1];
          }
          finished = true;
          return append(createRoundMetric(isCorrect, Date.now() - startedAt, hesitations, incorrect, game));
        },
      };
    },
    [append],
  );

  const clear = useCallback(async () => {
    roundsRef.current = [];
    setRounds([]);
    await storage.removeItem(TELEMETRY_KEY);
  }, []);

  const summary = useMemo(() => summarize(rounds), [rounds]);

  const value = useMemo(
    () => ({ rounds, summary, trackRoundMetric, startRound, clear }),
    [rounds, summary, trackRoundMetric, startRound, clear],
  );

  return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>;
}

export function useTelemetry() {
  const ctx = useContext(TelemetryContext);
  if (!ctx) throw new Error("useTelemetry must be used within TelemetryProvider");
  return ctx;
}
