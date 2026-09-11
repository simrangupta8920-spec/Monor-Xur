import { Text, View } from "react-native";

import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

type StatCardProps = {
  label: string;
  value: string;
  icon: (color: string, size: number) => React.ReactNode;
  tint?: string;
  testID?: string;
};

export function StatCard({ label, value, icon, tint, testID }: StatCardProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={[styles.card, tint ? { backgroundColor: tint } : null]} testID={testID}>
      <View style={styles.iconWrap}>{icon(colors.brandPrimary, 24)}</View>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    minHeight: 120,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  value: {
    fontFamily: fonts.extrabold,
    fontSize: type.xl,
    color: colors.onSurface,
    marginTop: spacing.xs,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: type.sm,
    color: colors.muted,
  },
}));
