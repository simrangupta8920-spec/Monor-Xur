import { useState } from "react";
import { useRouter } from "expo-router";
import { Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Info, SpeakerHigh, Stethoscope, TextAa } from "phosphor-react-native";

import { AppButton } from "@/src/components/ui/AppButton";
import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

export default function PatientSettings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();

  const [biggerText, setBiggerText] = useState(false);
  const [readAloud, setReadAloud] = useState(true);

  return (
    <Screen scroll edges={{ top: true, bottom: false }} contentGap={spacing.lg} testID="patient-settings-screen">
      <View style={{ paddingTop: insets.top > 0 ? 0 : spacing.sm }}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Make the app comfortable for you</Text>
      </View>

      <Card>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={styles.iconWrap}>
              <TextAa size={26} color={colors.brandPrimary} weight="fill" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Bigger Text</Text>
              <Text style={styles.rowDesc}>Larger words everywhere</Text>
            </View>
          </View>
          <Switch
            value={biggerText}
            onValueChange={setBiggerText}
            trackColor={{ true: colors.brand, false: colors.border }}
            thumbColor={colors.surfaceSecondary}
            testID="setting-bigger-text"
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={styles.iconWrap}>
              <SpeakerHigh size={26} color={colors.brandPrimary} weight="fill" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Read Aloud</Text>
              <Text style={styles.rowDesc}>Hear text spoken to you</Text>
            </View>
          </View>
          <Switch
            value={readAloud}
            onValueChange={setReadAloud}
            trackColor={{ true: colors.brand, false: colors.border }}
            thumbColor={colors.surfaceSecondary}
            testID="setting-read-aloud"
          />
        </View>
      </Card>

      <AppButton
        label="Caregiver Mode"
        variant="tinted"
        onPress={() => router.push("/caregiver-select")}
        testID="settings-caregiver"
        icon={(c, s) => <Stethoscope size={s} color={c} weight="bold" />}
      />

      <Card tint={colors.brandWash}>
        <View style={styles.aboutRow}>
          <Info size={24} color={colors.brandPrimary} weight="fill" />
          <Text style={styles.aboutTitle}>About Monor Xur</Text>
        </View>
        <Text style={styles.aboutText}>
          A warm companion for memories, games and calm moments. Made with care for you and your family.
        </Text>
      </Card>
    </Screen>
  );
}

const useStyles = makeStyles((colors) => ({
  title: { fontFamily: fonts.extrabold, fontSize: type["2xl"], color: colors.onSurface },
  subtitle: { fontFamily: fonts.regular, fontSize: type.lg, color: colors.muted },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.xs },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md, flex: 1 },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brandWash,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1 },
  rowTitle: { fontFamily: fonts.bold, fontSize: type.lg, color: colors.onSurface },
  rowDesc: { fontFamily: fonts.regular, fontSize: type.base, color: colors.muted },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md },
  aboutRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs },
  aboutTitle: { fontFamily: fonts.bold, fontSize: type.lg, color: colors.onSurface },
  aboutText: { fontFamily: fonts.regular, fontSize: type.base, color: colors.muted, lineHeight: 26 },
}));
