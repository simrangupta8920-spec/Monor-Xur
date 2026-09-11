import { ActivityIndicator, Pressable, Text, View, type ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";

import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

type Variant = "primary" | "secondary" | "tinted" | "ghost";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: (color: string, size: number) => React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  testID?: string;
};

export function AppButton({
  label,
  onPress,
  variant = "primary",
  icon,
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  testID,
}: AppButtonProps) {
  const styles = useStyles();
  const { colors } = useTheme();

  const bg: Record<Variant, string> = {
    primary: colors.brandPrimary,
    secondary: colors.brandSecondary,
    tinted: colors.brandWash,
    ghost: "transparent",
  };
  const fg: Record<Variant, string> = {
    primary: colors.onBrandPrimary,
    secondary: colors.onBrandSecondary,
    tinted: colors.onBrandWash,
    ghost: colors.brandPrimary,
  };

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={handlePress}
      disabled={disabled || loading}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg[variant] },
        variant === "ghost" && styles.ghost,
        fullWidth && { alignSelf: "stretch" },
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg[variant]} />
      ) : (
        <View style={styles.content}>
          {icon ? icon(fg[variant], 24) : null}
          <Text style={[styles.label, { color: fg[variant] }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  base: {
    minHeight: 62,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  ghost: {
    borderWidth: 2,
    borderColor: colors.borderStrong,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: type.lg,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
}));
