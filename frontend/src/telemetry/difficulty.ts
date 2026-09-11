// Local rule-based adaptive-difficulty engine for Monor Xur.
//
// Pure & dependency-free so it can be unit-tested and later swapped for an
// on-device ONNX/TFLite model without touching callers. It reads recent
// gameplay telemetry (success + latency, optional hesitations) and decides
// whether to make the next round easier, harder, or keep it the same.
//
// The heuristic is intentionally gentle for older adults: it lowers difficulty
// quickly when the player struggles and only nudges it up on clean, fast play.

export type RoundSample = {
  success: 0 | 1;
  latency: number; // response time in ms
  hesitationCount?: number;
};

export type DifficultyAction = "DECREASE_DIFFICULTY" | "INCREASE_DIFFICULTY" | "MAINTAIN";

export type DifficultyDecision = {
  action: DifficultyAction;
  modifier: -1 | 0 | 1;
};

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 5;

// Tunable thresholds (kept here so a model can later replace the rules).
export const THRESHOLDS = {
  errorsToDecrease: 2, // >= this many wrong rounds → ease off
  slowLatencyMs: 8000, // avg response slower than this → ease off
  fastLatencyMs: 3000, // avg response faster than this (and no errors) → step up
  hesitationsToDecrease: 6, // lots of hesitation across the window → ease off
};

/**
 * Evaluate cognitive load over the most recent rounds and return a difficulty
 * adjustment. Empty input is safe and returns MAINTAIN.
 */
export function evaluateDifficulty(recentRounds: RoundSample[]): DifficultyDecision {
  if (!recentRounds || recentRounds.length === 0) {
    return { action: "MAINTAIN", modifier: 0 };
  }

  const errorCount = recentRounds.filter((r) => r.success === 0).length;
  const avgLatency =
    recentRounds.reduce((acc, r) => acc + r.latency, 0) / recentRounds.length;
  const hesitations = recentRounds.reduce((acc, r) => acc + (r.hesitationCount ?? 0), 0);

  if (
    errorCount >= THRESHOLDS.errorsToDecrease ||
    avgLatency > THRESHOLDS.slowLatencyMs ||
    hesitations >= THRESHOLDS.hesitationsToDecrease
  ) {
    return { action: "DECREASE_DIFFICULTY", modifier: -1 };
  }

  if (errorCount === 0 && avgLatency < THRESHOLDS.fastLatencyMs) {
    return { action: "INCREASE_DIFFICULTY", modifier: 1 };
  }

  return { action: "MAINTAIN", modifier: 0 };
}

/** Apply a decision's modifier to a level, clamped to [min, max]. */
export function applyModifier(
  level: number,
  modifier: number,
  min: number = MIN_LEVEL,
  max: number = MAX_LEVEL,
): number {
  return Math.min(max, Math.max(min, level + modifier));
}
