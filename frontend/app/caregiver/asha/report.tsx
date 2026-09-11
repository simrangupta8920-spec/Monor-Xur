import { Text, View } from "react-native";
import { Target, Timer, TrendUp } from "phosphor-react-native";

import { AppHeader } from "@/src/components/ui/AppHeader";
import { BarChart } from "@/src/components/ui/BarChart";
import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { StatCard } from "@/src/components/ui/StatCard";
import { AlertsView } from "@/src/features/AlertsView";
import { RoleGuard, Role } from "@/src/auth/rbac";
import { DISCLAIMER, REPORTS } from "@/src/data/caregiver";
import { fonts, makeStyles, spacing, type, useTheme } from "@/src/theme";

export default function AshaReport() {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <RoleGuard role={Role.ASHA_WORKER} permission="reports">
      <View style={styles.root}>
        <AppHeader title="Cognitive Activity" subtitle="Engagement & activity report" />
        <Screen scroll contentGap={spacing.lg} testID="asha-report-screen">
          <View style={styles.statRow}>
            <StatCard
              label="Game engagement"
              value={`${REPORTS.gamesCompleted} games`}
              tint={colors.tileGames}
              icon={(c, s) => <TrendUp size={s} color={c} weight="fill" />}
            />
            <StatCard
              label="Session frequency"
              value={REPORTS.frequency.split(" ")[0]}
              tint={colors.tileRelaxation}
              icon={(c, s) => <Timer size={s} color={c} weight="fill" />}
            />
          </View>
          <View style={styles.statRow}>
            <StatCard
              label="Total sessions"
              value={String(REPORTS.totalSessions)}
              tint={colors.tileDailyLife}
              icon={(c, s) => <Timer size={s} color={c} weight="fill" />}
            />
            <StatCard
              label="Overall accuracy"
              value={`${REPORTS.avgAccuracy}%`}
              tint={colors.tileMemories}
              icon={(c, s) => <Target size={s} color={c} weight="fill" />}
            />
          </View>

          <Card>
            <Text style={styles.cardTitle}>Overall activity</Text>
            <Text style={styles.cardSub}>Sessions per day this week</Text>
            <BarChart data={REPORTS.daily} />
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Performance trend</Text>
            <Text style={styles.cardSub}>Accuracy over recent weeks</Text>
            <BarChart data={REPORTS.trend} unit="%" />
          </Card>

          <Text style={styles.sectionLabel}>Care-related alerts</Text>
          <AlertsView />

          <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
        </Screen>
      </View>
    </RoleGuard>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  statRow: { flexDirection: "row", gap: spacing.md },
  cardTitle: { fontFamily: fonts.bold, fontSize: type.lg, color: colors.onSurface },
  cardSub: { fontFamily: fonts.regular, fontSize: type.sm, color: colors.muted, marginBottom: spacing.xs },
  sectionLabel: { fontFamily: fonts.bold, fontSize: type.lg, color: colors.onSurface },
  disclaimer: { fontFamily: fonts.regular, fontSize: type.sm, color: colors.muted, fontStyle: "italic", lineHeight: 20 },
}));
