import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { ArrowLeft, Pause, Play, Stop } from "phosphor-react-native";

import { AppButton } from "@/src/components/ui/AppButton";
import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

// Configurable breathing cycle (milliseconds).
const INHALE_MS = 4000;
const HOLD_MS = 2000;
const EXHALE_MS = 6000;
const TOTAL_CYCLES = 4;

const MIN_SCALE = 0.55;
const MAX_SCALE = 1;

type Phase = "inhale" | "hold" | "exhale";
type Status = "idle" | "running" | "paused" | "done";

const PHASE_LABEL: Record<Phase, string> = {
  inhale: "INHALE",
  hold: "HOLD",
  exhale: "EXHALE",
};

export default function BreathingExercise() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();

  const scale = useSharedValue(MIN_SCALE);
  const [status, setStatus] = useState<Status>("idle");
  const [phase, setPhase] = useState<Phase>("inhale");
  const [cycle, setCycle] = useState(0);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleRef = useRef(0);
  const phaseRef = useRef<Phase>("inhale");

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const runPhase = useCallback(
    (p: Phase) => {
      phaseRef.current = p;
      setPhase(p);
      Haptics.selectionAsync().catch(() => {});

      if (p === "inhale") {
        scale.value = withTiming(MAX_SCALE, { duration: INHALE_MS, easing: Easing.inOut(Easing.ease) });
        timer.current = setTimeout(() => runPhase("hold"), INHALE_MS);
      } else if (p === "hold") {
        timer.current = setTimeout(() => runPhase("exhale"), HOLD_MS);
      } else {
        scale.value = withTiming(MIN_SCALE, { duration: EXHALE_MS, easing: Easing.inOut(Easing.ease) });
        timer.current = setTimeout(() => {
          const next = cycleRef.current + 1;
          cycleRef.current = next;
          setCycle(next);
          if (next >= TOTAL_CYCLES) {
            finish();
          } else {
            runPhase("inhale");
          }
        }, EXHALE_MS);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const start = useCallback(() => {
    clearTimer();
    cycleRef.current = 0;
    setCycle(0);
    setStatus("running");
    runPhase("inhale");
  }, [clearTimer, runPhase]);

  const pause = useCallback(() => {
    clearTimer();
    cancelAnimation(scale);
    setStatus("paused");
  }, [clearTimer, scale]);

  const resume = useCallback(() => {
    setStatus("running");
    runPhase(phaseRef.current);
  }, [runPhase]);

  const stop = useCallback(() => {
    clearTimer();
    cancelAnimation(scale);
    scale.value = withTiming(MIN_SCALE, { duration: 500 });
    cycleRef.current = 0;
    setCycle(0);
    setStatus("idle");
    setPhase("inhale");
  }, [clearTimer, scale]);

  const finish = useCallback(() => {
    clearTimer();
    cancelAnimation(scale);
    scale.value = withTiming((MIN_SCALE + MAX_SCALE) / 2, { duration: 800, easing: Easing.out(Easing.ease) });
    setStatus("done");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const circleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.root}>
      <LinearGradient colors={[colors.brandSecondary, colors.surface]} style={styles.gradient}>
        <View style={[styles.top, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12} testID="breathing-back">
            <ArrowLeft size={26} color={colors.onSurface} weight="bold" />
          </Pressable>
          <Text style={styles.title}>Let&apos;s Breathe</Text>
          <View style={styles.backBtn} />
        </View>

        {status === "done" ? (
          <View style={styles.center} testID="breathing-done">
            <View style={styles.doneCircle}>
              <Text style={styles.doneEmoji}>✓</Text>
            </View>
            <Text style={styles.doneTitle}>Well done</Text>
            <Text style={styles.doneText}>You took a peaceful moment for yourself.</Text>
          </View>
        ) : (
          <View style={styles.center}>
            <View style={styles.circleWrap}>
              <Animated.View style={[styles.circleOuter, circleStyle]}>
                <View style={styles.circleInner}>
                  <Text style={styles.phaseText} testID="breathing-phase">
                    {status === "idle" ? "READY" : PHASE_LABEL[phase]}
                  </Text>
                </View>
              </Animated.View>
            </View>
            <Text style={styles.hint}>
              {status === "idle"
                ? "Follow the circle. Breathe slowly."
                : `Breath ${Math.min(cycle + 1, TOTAL_CYCLES)} of ${TOTAL_CYCLES}`}
            </Text>
          </View>
        )}

        <View style={[styles.controls, { paddingBottom: insets.bottom + spacing.lg }]}>
          {status === "idle" ? (
            <AppButton
              label="Start"
              onPress={start}
              testID="breathing-start"
              icon={(c, s) => <Play size={s} color={c} weight="fill" />}
            />
          ) : null}

          {status === "running" ? (
            <View style={styles.rowControls}>
              <AppButton
                label="Pause"
                variant="secondary"
                onPress={pause}
                testID="breathing-pause"
                icon={(c, s) => <Pause size={s} color={c} weight="fill" />}
              />
              <AppButton
                label="Stop"
                variant="ghost"
                onPress={stop}
                testID="breathing-stop"
                icon={(c, s) => <Stop size={s} color={c} weight="fill" />}
              />
            </View>
          ) : null}

          {status === "paused" ? (
            <View style={styles.rowControls}>
              <AppButton
                label="Resume"
                onPress={resume}
                testID="breathing-resume"
                icon={(c, s) => <Play size={s} color={c} weight="fill" />}
              />
              <AppButton
                label="Stop"
                variant="ghost"
                onPress={stop}
                testID="breathing-stop"
                icon={(c, s) => <Stop size={s} color={c} weight="fill" />}
              />
            </View>
          ) : null}

          {status === "done" ? (
            <View style={styles.doneControls}>
              <AppButton label="Try Again" onPress={start} testID="breathing-again" />
              <AppButton
                label="Back to Relaxation"
                variant="tinted"
                onPress={() => router.back()}
                testID="breathing-back-relax"
              />
            </View>
          ) : null}
        </View>
      </LinearGradient>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  gradient: { flex: 1 },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSecondary,
  },
  title: { fontFamily: fonts.extrabold, fontSize: type.xl, color: colors.onSurface },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.xl },
  circleWrap: { width: 300, height: 300, alignItems: "center", justifyContent: "center" },
  circleOuter: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.brandPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
  circleInner: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  phaseText: { fontFamily: fonts.extrabold, fontSize: type.xl, color: colors.onBrandPrimary, letterSpacing: 1 },
  hint: { fontFamily: fonts.medium, fontSize: type.lg, color: colors.muted, textAlign: "center" },
  controls: { paddingHorizontal: spacing.lg, gap: spacing.md },
  rowControls: { flexDirection: "row", gap: spacing.md },
  doneControls: { gap: spacing.md },
  doneCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  doneEmoji: { fontFamily: fonts.extrabold, fontSize: 64, color: colors.onSuccess },
  doneTitle: { fontFamily: fonts.extrabold, fontSize: type["2xl"], color: colors.onSurface },
  doneText: {
    fontFamily: fonts.regular,
    fontSize: type.lg,
    color: colors.muted,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
    lineHeight: 28,
  },
}));
