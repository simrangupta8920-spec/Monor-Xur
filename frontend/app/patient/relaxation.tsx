import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { MusicNotes, Wind } from "phosphor-react-native";

import { PatientTopBar } from "@/src/components/ui/PatientTopBar";
import { Screen } from "@/src/components/ui/Screen";
import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

export default function Relaxation() {
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      <PatientTopBar title="Relaxation" onHome={() => router.navigate("/patient/home")} />
      <Screen scroll edges={{ bottom: true }} contentGap={spacing.lg} testID="relaxation-screen">
        <View style={styles.intro}>
          <Text style={styles.title}>Relax &amp; Breathe</Text>
          <Text style={styles.subtitle}>Take a quiet moment for yourself.</Text>
        </View>

        <Pressable
          testID="relax-music"
          onPress={() => router.push("/patient/relaxation-music")}
          style={({ pressed }) => [styles.option, { backgroundColor: colors.tileRelaxation }, pressed && styles.pressed]}
        >
          <View style={styles.optionIcon}>
            <MusicNotes size={44} color={colors.brandPrimary} weight="fill" />
          </View>
          <Text style={styles.optionTitle}>Music &amp; Sounds</Text>
          <Text style={styles.optionDesc}>Calming music and soothing sounds</Text>
        </Pressable>

        <Pressable
          testID="relax-breathing"
          onPress={() => router.push("/patient/relaxation-breathing")}
          style={({ pressed }) => [styles.option, { backgroundColor: colors.tileDailyLife }, pressed && styles.pressed]}
        >
          <View style={styles.optionIcon}>
            <Wind size={44} color={colors.brandPrimary} weight="fill" />
          </View>
          <Text style={styles.optionTitle}>Breathing Exercise</Text>
          <Text style={styles.optionDesc}>Slow breathing to help you relax</Text>
        </Pressable>
      </Screen>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  intro: { gap: spacing.xs },
  title: { fontFamily: fonts.extrabold, fontSize: type["2xl"], color: colors.onSurface },
  subtitle: { fontFamily: fonts.regular, fontSize: type.lg, color: colors.muted, lineHeight: 28 },
  option: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
    minHeight: 180,
    justifyContent: "center",
  },
  optionIcon: {
    width: 84,
    height: 84,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTitle: { fontFamily: fonts.extrabold, fontSize: type.xl, color: colors.onSurface, marginTop: spacing.xs },
  optionDesc: { fontFamily: fonts.medium, fontSize: type.base, color: colors.muted },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
}));
