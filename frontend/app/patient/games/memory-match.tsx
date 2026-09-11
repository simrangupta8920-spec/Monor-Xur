import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Dimensions, Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import {
  Bird,
  Butterfly,
  Cat,
  Dog,
  Fish,
  Flower,
  Heart,
  House,
  Leaf,
  Lightbulb,
  Star,
  Sun,
  Tree,
  type Icon as PhForIcon,
} from "phosphor-react-native";

import { AppButton } from "@/src/components/ui/AppButton";
import { AppHeader } from "@/src/components/ui/AppHeader";
import { evaluateDifficulty } from "@/src/telemetry/difficulty";
import { logDDAShift } from "@/src/telemetry/dda-log";
import { useTelemetry } from "@/src/telemetry/telemetry";
import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

const GAME = "Memory Match";

// Difficulty levels 1–3 drive item count, card scale, and hint frequency.
const LEVELS: Record<number, { label: string; pairs: number; hints: number }> = {
  1: { label: "Easy", pairs: 3, hints: 4 },
  2: { label: "Medium", pairs: 4, hints: 2 },
  3: { label: "Hard", pairs: 6, hints: 1 },
};

const SYMBOLS: PhForIcon[] = [Flower, Sun, Tree, Bird, Butterfly, Cat, Dog, Fish, Star, Heart, House, Leaf];

type CardT = { id: number; symbol: number; flipped: boolean; matched: boolean };

function buildDeck(pairs: number): CardT[] {
  const chosen = Array.from({ length: pairs }, (_, i) => i);
  const cards = [...chosen, ...chosen].map((symbol, id) => ({ id, symbol, flipped: false, matched: false }));
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards.map((c, id) => ({ ...c, id }));
}

export default function MemoryMatch() {
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { trackRoundMetric } = useTelemetry();

  const [level, setLevel] = useState(2); // default level 2 (1–3)
  const [deck, setDeck] = useState<CardT[]>(() => buildDeck(LEVELS[2].pairs));
  const [first, setFirst] = useState<number | null>(null);
  const [lock, setLock] = useState(false);
  const [peek, setPeek] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(LEVELS[2].hints);
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [complete, setComplete] = useState(false);
  const [helper, setHelper] = useState<string | null>(null);

  const roundHistory = useRef<{ success: 0 | 1; latency: number; hesitationCount: number }[]>([]);
  const pairStart = useRef<number>(Date.now());
  const roundStart = useRef<number>(Date.now());
  const consecutive = useRef(0);
  const helperTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cols = LEVELS[level].pairs * 2 <= 6 ? 3 : 4;
  const cardSize = useMemo(() => {
    const width = Dimensions.get("window").width;
    const usable = width - spacing.lg * 2 - spacing.sm * (cols - 1);
    return Math.max(64, Math.floor(usable / cols));
  }, [cols]);

  const symbolColor = useCallback(
    (s: number) => {
      const palette = [
        colors.brandPrimary,
        colors.info,
        colors.warning,
        colors.error,
        colors.success,
        colors.onBrandTertiary,
      ];
      return palette[s % palette.length];
    },
    [colors],
  );

  const startRound = useCallback((lvl: number) => {
    setDeck(buildDeck(LEVELS[lvl].pairs));
    setFirst(null);
    setLock(false);
    setMoves(0);
    setMistakes(0);
    setComplete(false);
    setHintsLeft(LEVELS[lvl].hints);
    setHelper(null);
    roundHistory.current = [];
    consecutive.current = 0;
    roundStart.current = Date.now();
    pairStart.current = Date.now();
    setPeek(true);
    setTimeout(() => setPeek(false), lvl === 1 ? 1600 : 1000);
  }, []);

  useEffect(() => {
    startRound(2);
    return () => {
      if (helperTimer.current) clearTimeout(helperTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showHelper = useCallback((msg: string) => {
    setHelper(msg);
    if (helperTimer.current) clearTimeout(helperTimer.current);
    helperTimer.current = setTimeout(() => setHelper(null), 3800);
  }, []);

  // Feed one guess into telemetry + the DDA engine, adjust level, persist shifts.
  const handleGuess = useCallback(
    (isMatch: boolean, latency: number) => {
      const hesitationCount = latency > 5000 ? 1 : 0;
      const roundData = { success: (isMatch ? 1 : 0) as 0 | 1, latency, hesitationCount };
      roundHistory.current = [...roundHistory.current, roundData];

      trackRoundMetric({
        isCorrect: isMatch,
        responseTime: latency,
        hesitations: hesitationCount,
        incorrectAttempts: isMatch ? 0 : 1,
        game: GAME,
      });

      const windowRounds = roundHistory.current.slice(-5);
      const decision = evaluateDifficulty(windowRounds);
      const errorCount = windowRounds.filter((r) => r.success === 0).length;
      const avgLatency = windowRounds.reduce((a, r) => a + r.latency, 0) / windowRounds.length;
      const hesitations = windowRounds.reduce((a, r) => a + r.hesitationCount, 0);

      setLevel((prev) => {
        let next = prev;
        if (decision.action === "DECREASE_DIFFICULTY" && prev > 1) next = prev - 1;
        else if (decision.action === "INCREASE_DIFFICULTY" && prev < 3) next = prev + 1;

        if (decision.action !== "MAINTAIN") {
          logDDAShift({
            timestamp: Date.now(),
            game: GAME,
            fromLevel: prev,
            toLevel: next,
            action: decision.action,
            markers: { errorCount, avgLatency: Math.round(avgLatency), hesitations },
          });
        }
        return next;
      });

      if (decision.action === "DECREASE_DIFFICULTY") {
        showHelper("Take your time — there's no rush. Let's make the next round gentler.");
      } else if (decision.action === "INCREASE_DIFFICULTY") {
        showHelper("Wonderful! You're doing great — a little more next round.");
      }
    },
    [trackRoundMetric, showHelper],
  );

  const onCard = useCallback(
    (idx: number) => {
      if (lock || complete) return;
      const card = deck[idx];
      if (!card || card.matched || card.flipped) return;

      Haptics.selectionAsync().catch(() => {});
      const flippedDeck = deck.map((c) => (c.id === idx ? { ...c, flipped: true } : c));
      setDeck(flippedDeck);

      if (first === null) {
        setFirst(idx);
        pairStart.current = Date.now();
        return;
      }

      // Second pick resolves the pair.
      setMoves((m) => m + 1);
      const a = flippedDeck[first];
      const b = flippedDeck[idx];
      const isMatch = a.symbol === b.symbol;
      const latency = Date.now() - pairStart.current;

      if (isMatch) {
        consecutive.current = 0;
        const matchedDeck = flippedDeck.map((c) =>
          c.symbol === a.symbol ? { ...c, matched: true, flipped: true } : c,
        );
        setDeck(matchedDeck);
        setFirst(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        handleGuess(true, latency);
        if (matchedDeck.every((c) => c.matched)) {
          setComplete(true);
        }
      } else {
        setMistakes((m) => m + 1);
        consecutive.current += 1;
        setLock(true);
        handleGuess(false, latency);
        if (consecutive.current >= 2) showHelper("Almost! Try to remember where each picture was.");
        setTimeout(() => {
          setDeck((d) => d.map((c) => (c.matched ? c : { ...c, flipped: false })));
          setFirst(null);
          setLock(false);
        }, 950);
      }
    },
    [deck, first, lock, complete, handleGuess, showHelper],
  );

  const useHint = useCallback(() => {
    if (hintsLeft <= 0 || complete) return;
    setHintsLeft((h) => h - 1);
    setPeek(true);
    setTimeout(() => setPeek(false), 1200);
  }, [hintsLeft, complete]);

  const info = LEVELS[level];
  const elapsed = Math.round((Date.now() - roundStart.current) / 1000);

  return (
    <View style={styles.root}>
      <AppHeader title="Memory Match" subtitle="Find the matching pairs" onBack={() => router.back()} />

      <View style={styles.body}>
        {/* Live difficulty badge — updates instantly when the DDA engine shifts level */}
        <View style={styles.statusRow}>
          <View style={styles.badge} testID="difficulty-badge">
            <Text style={styles.badgeLabel}>Level</Text>
            <Text style={styles.badgeValue}>
              {info.label} · {info.pairs} pairs
            </Text>
          </View>
          <Pressable
            onPress={useHint}
            disabled={hintsLeft <= 0}
            style={[styles.hintBtn, hintsLeft <= 0 && styles.hintDisabled]}
            testID="hint-button"
            hitSlop={8}
          >
            <Lightbulb size={22} color={hintsLeft > 0 ? colors.onWarning : colors.muted} weight="fill" />
            <Text style={[styles.hintText, hintsLeft <= 0 && { color: colors.muted }]}>Hint ({hintsLeft})</Text>
          </Pressable>
        </View>

        {helper ? (
          <View style={styles.helper} testID="helper-prompt">
            <Text style={styles.helperText}>{helper}</Text>
          </View>
        ) : null}

        <View style={styles.board}>
          {deck.map((card, idx) => {
            const revealed = card.flipped || card.matched || peek;
            const Symbol = SYMBOLS[card.symbol];
            return (
              <Pressable
                key={card.id}
                onPress={() => onCard(idx)}
                style={({ pressed }) => [
                  styles.card,
                  { width: cardSize, height: cardSize },
                  revealed ? styles.cardUp : styles.cardDown,
                  card.matched && styles.cardMatched,
                  pressed && !revealed && styles.cardPressed,
                ]}
                testID={`card-${idx}`}
              >
                {revealed ? (
                  <Symbol size={Math.floor(cardSize * 0.5)} color={symbolColor(card.symbol)} weight="fill" />
                ) : (
                  <Leaf size={Math.floor(cardSize * 0.34)} color={colors.brand} weight="duotone" />
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Moves: {moves}</Text>
          <Text style={styles.footerText}>Tries missed: {mistakes}</Text>
        </View>
      </View>

      {complete ? (
        <View style={styles.overlay} testID="round-complete">
          <View style={styles.overlayCard}>
            <View style={styles.doneIcon}>
              <Star size={48} color={colors.onWarning} weight="fill" />
            </View>
            <Text style={styles.overlayTitle}>Well done!</Text>
            <Text style={styles.overlayText}>
              You matched all pairs in {moves} moves and {elapsed}s.
            </Text>
            <AppButton label="Play Again" onPress={() => startRound(level)} testID="play-again" />
            <AppButton label="Back to Games" variant="tinted" onPress={() => router.back()} testID="back-to-games" />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  body: { flex: 1, padding: spacing.lg, gap: spacing.md },
  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  badge: {
    backgroundColor: colors.brandWash,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  badgeLabel: { fontFamily: fonts.medium, fontSize: type.sm, color: colors.muted },
  badgeValue: { fontFamily: fonts.extrabold, fontSize: type.lg, color: colors.brandPrimary },
  hintBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.warning,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  hintDisabled: { backgroundColor: colors.surfaceTertiary },
  hintText: { fontFamily: fonts.bold, fontSize: type.base, color: colors.onWarning },
  helper: {
    backgroundColor: colors.brandSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  helperText: { fontFamily: fonts.semibold, fontSize: type.base, color: colors.onBrandSecondary, lineHeight: 24 },
  board: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
    alignContent: "center",
    flex: 1,
  },
  card: {
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  cardDown: { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
  cardUp: { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderStrong },
  cardMatched: { backgroundColor: colors.brandWash, borderColor: colors.brand },
  cardPressed: { transform: [{ scale: 0.97 }], opacity: 0.9 },
  footer: { flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontFamily: fonts.semibold, fontSize: type.base, color: colors.muted },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(45,58,47,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  overlayCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
    alignItems: "center",
    width: "100%",
    maxWidth: 360,
  },
  doneIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.warning,
    alignItems: "center",
    justifyContent: "center",
  },
  overlayTitle: { fontFamily: fonts.extrabold, fontSize: type["2xl"], color: colors.onSurface },
  overlayText: { fontFamily: fonts.regular, fontSize: type.lg, color: colors.muted, textAlign: "center", lineHeight: 28 },
}));
