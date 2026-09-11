import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { Coffee, ForkKnife, Pill, PhoneCall, Sun, PersonSimpleWalk } from "phosphor-react-native";

import { FeatureRow } from "@/src/components/ui/FeatureRow";
import { PatientTopBar } from "@/src/components/ui/PatientTopBar";
import { Screen } from "@/src/components/ui/Screen";
import { useToast } from "@/src/components/ui/toast";
import { fonts, makeStyles, spacing, type, useTheme } from "@/src/theme";

const ROUTINE = [
  { title: "Morning walk", subtitle: "7:30 AM", icon: PersonSimpleWalk },
  { title: "Breakfast", subtitle: "8:30 AM", icon: Coffee },
  { title: "Morning medicine", subtitle: "9:00 AM", icon: Pill },
  { title: "Lunch", subtitle: "1:00 PM", icon: ForkKnife },
  { title: "Call family", subtitle: "5:00 PM", icon: PhoneCall },
  { title: "Evening medicine", subtitle: "8:00 PM", icon: Sun },
];

export default function DailyLife() {
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const toast = useToast();

  return (
    <View style={styles.root}>
      <PatientTopBar title="Daily Life" onHome={() => router.navigate("/patient/home")} />
      <Screen scroll contentGap={spacing.md} testID="daily-life-screen">
        <Text style={styles.lead}>Your gentle plan for today.</Text>
        {ROUTINE.map((r) => (
          <FeatureRow
            key={r.title}
            title={r.title}
            subtitle={r.subtitle}
            tint={colors.tileDailyLife}
            icon={(c, size) => <r.icon size={size} color={c} weight="fill" />}
            onPress={() => toast("Reminders coming soon", "info")}
            testID={`routine-${r.title}`}
          />
        ))}
      </Screen>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  lead: { fontFamily: fonts.medium, fontSize: type.lg, color: colors.muted, marginBottom: spacing.xs },
}));
