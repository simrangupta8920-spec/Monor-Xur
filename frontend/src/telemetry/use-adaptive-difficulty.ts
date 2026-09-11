// Bridges the telemetry stream into the adaptive-difficulty engine.
//
//   const { level, recompute } = useAdaptiveDifficulty("Memory Match");
//   // ...after a batch of rounds:
//   const decision = recompute(); // updates `level`, returns the decision

import { useCallback, useState } from "react";

import { applyModifier, evaluateDifficulty, MAX_LEVEL, MIN_LEVEL, type DifficultyDecision } from "./difficulty";
import { useTelemetry } from "./telemetry";

export function useAdaptiveDifficulty(game?: string, initialLevel = 1, windowSize = 5) {
  const { rounds } = useTelemetry();
  const [level, setLevel] = useState(Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, initialLevel)));

  const recompute = useCallback((): DifficultyDecision => {
    const relevant = (game ? rounds.filter((r) => r.game === game) : rounds).slice(-windowSize);
    const decision = evaluateDifficulty(relevant);
    setLevel((l) => applyModifier(l, decision.modifier));
    return decision;
  }, [rounds, game, windowSize]);

  return { level, recompute, min: MIN_LEVEL, max: MAX_LEVEL };
}
