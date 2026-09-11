import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { HeartStraight, Leaf, PuzzlePiece, Stethoscope } from "phosphor-react-native";

import { AppButton } from "@/src/components/ui/AppButton";
import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

const HERO = "https://images.unsplash.com/photo-1656166071419-e4914f4e2d52?crop=entropy&cs=srgb&fm=jpg&w=900&q=80";

export default function RoleSelection() {
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <Screen scroll testID="role-selection-screen" contentGap={spacing.lg}>
      <View style={styles.brandRow}>
        <View style={styles.logoMark}>
          <Leaf size={26} color={colors.onBrandPrimary} weight="fill" />
        </View>
        <Text style={styles.brand}>Monor Xur</Text>
      </View>

      <Image source={{ uri: HERO }} style={styles.hero} contentFit="cover" transition={300} />

      <View style={styles.intro}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>A warm place for memories, games and calm moments.</Text>
      </View>

      <Card
        tint={colors.brandSecondary}
        onPress={() => router.push("/patient/home")}
        testID="role-patient"
        style={styles.roleCard}
      >
        <View style={styles.roleInner}>
          <View style={[styles.roleIcon, { backgroundColor: colors.surfaceSecondary }]}>
            <HeartStraight size={34} color={colors.brandPrimary} weight="fill" />
          </View>
          <View style={styles.roleText}>
            <Text style={styles.roleTitle}>I am the Patient</Text>
            <Text style={styles.roleDesc}>Open my memories & games</Text>
          </View>
        </View>
      </Card>

      <Text style={styles.sectionLabel}>For family & health workers</Text>

      <AppButton
        label="Caregiver Mode"
        variant="tinted"
        onPress={() => router.push("/caregiver-select")}
        testID="role-caregiver"
        icon={(c, s) => <Stethoscope size={s} color={c} weight="bold" />}
      />

      <View style={styles.footerRow}>
        <PuzzlePiece size={18} color={colors.muted} />
        <Text style={styles.footerText}>Simple. Warm. Made for you.</Text>
      </View>
    </Screen>
  );
}

const useStyles = makeStyles((colors) => ({
  brandRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  logoMark: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: { fontFamily: fonts.extrabold, fontSize: type.xl, color: colors.onSurface },
  hero: { width: "100%", height: 200, borderRadius: radius.lg, backgroundColor: colors.brandWash },
  intro: { gap: spacing.xs },
  title: { fontFamily: fonts.extrabold, fontSize: type["2xl"], color: colors.onSurface },
  subtitle: { fontFamily: fonts.regular, fontSize: type.base, color: colors.muted, lineHeight: 26 },
  roleCard: { padding: spacing.lg },
  roleInner: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  roleIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  roleText: { flex: 1 },
  roleTitle: { fontFamily: fonts.extrabold, fontSize: type.xl, color: colors.onBrandSecondary },
  roleDesc: { fontFamily: fonts.medium, fontSize: type.base, color: colors.onBrandSecondary, opacity: 0.8 },
  sectionLabel: { fontFamily: fonts.semibold, fontSize: type.sm, color: colors.muted, marginTop: spacing.xs },
  footerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, marginTop: spacing.sm },
  footerText: { fontFamily: fonts.medium, fontSize: type.sm, color: colors.muted },
}));
