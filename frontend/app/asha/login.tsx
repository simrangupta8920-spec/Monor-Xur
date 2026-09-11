import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import * as Haptics from "expo-haptics";
import { ArrowLeft, Stethoscope } from "phosphor-react-native";

import { AppButton } from "@/src/components/ui/AppButton";
import { TextField } from "@/src/components/ui/TextField";
import { useCaregiverAuth } from "@/src/auth/caregiver-auth";
import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

export default function AshaLogin() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const { loginAsha } = useCaregiverAuth();

  const [ashaId, setAshaId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (!ashaId.trim() || !password) {
      setError("Please enter your ASHA ID and password.");
      return;
    }
    const ok = loginAsha(ashaId, password);
    if (ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.replace("/caregiver/asha");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setError("Incorrect ASHA ID or password.");
    }
  };

  return (
    <View style={styles.root}>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.sm,
          paddingBottom: insets.bottom + spacing.xl,
          paddingHorizontal: spacing.lg,
          gap: spacing.lg,
        }}
        bottomOffset={24}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12} testID="asha-login-back">
          <ArrowLeft size={26} color={colors.onSurface} weight="bold" />
        </Pressable>

        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Stethoscope size={34} color={colors.brandPrimary} weight="fill" />
          </View>
          <Text style={styles.title}>ASHA / Health Worker</Text>
          <Text style={styles.subtitle}>Sign in to view care information</Text>
        </View>

        <View style={styles.form}>
          <TextField
            label="ASHA ID"
            value={ashaId}
            onChangeText={(v) => {
              setError("");
              setAshaId(v);
            }}
            placeholder="e.g. ASHA001"
            autoCapitalize="characters"
            testID="asha-id-input"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={(v) => {
              setError("");
              setPassword(v);
            }}
            placeholder="Enter your password"
            secure
            testID="asha-password-input"
          />
          {error ? (
            <Text style={styles.error} testID="asha-login-error">
              {error}
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <AppButton label="Login" onPress={submit} testID="asha-login-submit" />
          <AppButton label="Back" variant="ghost" onPress={() => router.back()} testID="asha-login-back-btn" />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
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
    backgroundColor: colors.tileGames,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  title: { fontFamily: fonts.extrabold, fontSize: type.xl, color: colors.onSurface, textAlign: "center" },
  subtitle: { fontFamily: fonts.regular, fontSize: type.base, color: colors.muted },
  form: { gap: spacing.md },
  error: { fontFamily: fonts.medium, fontSize: type.base, color: colors.error },
  actions: { gap: spacing.md, marginTop: spacing.sm },
}));
