import { Pressable, Text, View } from "react-native";
import { CaretRight } from "phosphor-react-native";

import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

type FeatureRowProps = {
  title: string;
  subtitle?: string;
  icon: (color: string, size: number) => React.ReactNode;
  tint?: string;
  onPress?: () => void;
  testID?: string;
};

export function FeatureRow({ title, subtitle, icon, tint, onPress, testID }: FeatureRowProps) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, { backgroundColor: tint ?? colors.brandWash }]}>
        {icon(colors.brandPrimary, 26)}
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onPress ? <CaretRight size={22} color={colors.muted} weight="bold" /> : null}
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 76,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: type.lg,
    color: colors.onSurface,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: type.sm,
    color: colors.muted,
    marginTop: 2,
  },
}));
