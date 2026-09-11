import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { House } from "phosphor-react-native";

import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

type PatientTopBarProps = {
  title: string;
  onHome: () => void;
};

/**
 * Oversized, elderly-friendly top bar for patient sub-screens.
 * Big "Home" button + large title.
 */
export function PatientTopBar({ title, onHome }: PatientTopBarProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={[styles.bar, { paddingTop: insets.top + spacing.sm }]}>
      <Pressable onPress={onHome} style={styles.homeBtn} hitSlop={10} testID="patient-home-button">
        <House size={28} color={colors.onBrandPrimary} weight="fill" />
        <Text style={styles.homeText}>Home</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  bar: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: spacing.md,
  },
  homeBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 52,
  },
  homeText: {
    fontFamily: fonts.bold,
    fontSize: type.base,
    color: colors.onBrandPrimary,
  },
  title: {
    fontFamily: fonts.extrabold,
    fontSize: type["2xl"],
    color: colors.onSurface,
  },
}));
