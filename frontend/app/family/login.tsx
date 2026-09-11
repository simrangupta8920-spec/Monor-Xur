import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { ArrowLeft, Backspace, LockKey, UsersThree } from "phosphor-react-native";

import { AppButton } from "@/src/components/ui/AppButton";
import { useCaregiverAuth } from "@/src/auth/caregiver-auth";
import { PIN_LENGTH } from "@/src/config/caregiver";
import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export default function FamilyLogin() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const { unlockFamily } = useCaregiverAuth();

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const press = (k: string) => {
    if (pin.length >= PIN_LENGTH) return;
    Haptics.selectionAsync().catch(() => {});
    setError("");
    setPin((p) => p + k);
  };

  const backspace = () => {
    setError("");
    setPin((p) => p.slice(0, -1));
  };

  const submit = () => {
    if (pin.length !== PIN_LENGTH) {
      setError("Please enter your full PIN.");
      return;
    }
    const ok = unlockFamily(pin);
    if (ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.replace("/caregiver/family");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setError("That PIN doesn't seem right. Please try again.");
      setPin("");
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.lg }]}>
      <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12} testID="family-login-back">
        <ArrowLeft size={26} color={colors.onSurface} weight="bold" />
      </Pressable>

      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <UsersThree size={34} color={colors.brandPrimary} weight="fill" />
        </View>
        <Text style={styles.title}>Family Caregiver</Text>
        <Text style={styles.subtitle}>Enter your PIN to continue</Text>
      </View>

      <View style={styles.dots} testID="pin-dots">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i < pin.length ? { backgroundColor: colors.brandPrimary } : null]}
          />
        ))}
      </View>

      <Text style={styles.error} testID="family-login-error">
        {error}
      </Text>

      <View style={styles.pad}>
        {KEYS.map((k) => (
          <Pressable
            key={k}
            onPress={() => press(k)}
            style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
            testID={`pin-key-${k}`}
          >
            <Text style={styles.keyText}>{k}</Text>
          </Pressable>
        ))}
        <View style={styles.key} />
        <Pressable onPress={() => press("0")} style={({ pressed }) => [styles.key, pressed && styles.keyPressed]} testID="pin-key-0">
          <Text style={styles.keyText}>0</Text>
        </Pressable>
        <Pressable onPress={backspace} style={({ pressed }) => [styles.key, pressed && styles.keyPressed]} testID="pin-backspace">
          <Backspace size={30} color={colors.onSurface} weight="bold" />
        </Pressable>
      </View>

      <AppButton
        label="Unlock"
        onPress={submit}
        disabled={pin.length !== PIN_LENGTH}
        testID="family-login-unlock"
        icon={(c, s) => <LockKey size={s} color={c} weight="fill" />}
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface, paddingHorizontal: spacing.lg, gap: spacing.md },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: { alignItems: "center", gap: spacing.xs, marginTop: spacing.sm },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.brandSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  title: { fontFamily: fonts.extrabold, fontSize: type.xl, color: colors.onSurface },
  subtitle: { fontFamily: fonts.regular, fontSize: type.base, color: colors.muted },
  dots: { flexDirection: "row", justifyContent: "center", gap: spacing.md, marginTop: spacing.md },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 2,
    borderColor: colors.borderStrong,
  },
  error: { fontFamily: fonts.medium, fontSize: type.base, color: colors.error, textAlign: "center", minHeight: 24 },
  pad: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.md,
    alignSelf: "center",
    maxWidth: 320,
  },
  key: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  keyPressed: { backgroundColor: colors.brandWash, transform: [{ scale: 0.97 }] },
  keyText: { fontFamily: fonts.bold, fontSize: type["2xl"], color: colors.onSurface },
}));
