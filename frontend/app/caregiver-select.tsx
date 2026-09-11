import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, CaretRight, Stethoscope, UsersThree } from "phosphor-react-native";

import { AppButton } from "@/src/components/ui/AppButton";
import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

export default function CaregiverSelect() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.lg }]}>
      <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12} testID="caregiver-select-back">
        <ArrowLeft size={26} color={colors.onSurface} weight="bold" />
      </Pressable>

      <View style={styles.intro}>
        <Text style={styles.title}>Caregiver Mode</Text>
        <Text style={styles.subtitle}>Choose how you support Anita</Text>
      </View>

      <View style={styles.options}>
        <Pressable
          testID="select-family-caregiver"
          onPress={() => router.push("/family/login")}
          style={({ pressed }) => [styles.card, { backgroundColor: colors.brandSecondary }, pressed && styles.pressed]}
        >
          <View style={styles.cardTop}>
            <View style={styles.iconWrap}>
              <UsersThree size={34} color={colors.brandPrimary} weight="fill" />
            </View>
            <CaretRight size={24} color={colors.onBrandSecondary} weight="bold" />
          </View>
          <Text style={styles.cardTitle}>Family Caregiver</Text>
          <Text style={styles.cardDesc}>Manage and view Anita&apos;s personal care, memories and progress.</Text>
        </Pressable>

        <Pressable
          testID="select-asha-worker"
          onPress={() => router.push("/asha/login")}
          style={({ pressed }) => [styles.card, { backgroundColor: colors.tileGames }, pressed && styles.pressed]}
        >
          <View style={styles.cardTop}>
            <View style={styles.iconWrap}>
              <Stethoscope size={34} color={colors.brandPrimary} weight="fill" />
            </View>
            <CaretRight size={24} color={colors.onSurfaceTertiary} weight="bold" />
          </View>
          <Text style={styles.cardTitle}>ASHA / Health Worker</Text>
          <Text style={styles.cardDesc}>Monitor care activities, progress and important patient information.</Text>
        </Pressable>
      </View>

      <AppButton
        label="Back to Patient Mode"
        variant="ghost"
        onPress={() => router.navigate("/patient/home")}
        testID="back-to-patient"
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface, paddingHorizontal: spacing.lg, gap: spacing.lg },
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
  intro: { gap: spacing.xs },
  title: { fontFamily: fonts.extrabold, fontSize: type["2xl"], color: colors.onSurface },
  subtitle: { fontFamily: fonts.regular, fontSize: type.lg, color: colors.muted },
  options: { flex: 1, gap: spacing.lg, justifyContent: "center" },
  card: { borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontFamily: fonts.extrabold, fontSize: type.xl, color: colors.onSurface },
  cardDesc: { fontFamily: fonts.medium, fontSize: type.base, color: colors.onSurfaceSecondary, opacity: 0.8, lineHeight: 24 },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
}));
