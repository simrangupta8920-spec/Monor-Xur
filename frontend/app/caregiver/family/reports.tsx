import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { AppHeader } from "@/src/components/ui/AppHeader";
import { BarChart } from "@/src/components/ui/BarChart";
import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { StatCard } from "@/src/components/ui/StatCard";
import { RoleGuard, Role } from "@/src/auth/rbac";
import { DISCLAIMER, REPORTS } from "@/src/data/caregiver";
import { CalendarCheck, Target, Timer, TrendUp } from "phosphor-react-native";
import { fonts, makeStyles, spacing, type, useTheme } from "@/src/theme";

export default function FamilyReports() {
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <RoleGuard role={Role.FAMILY_CAREGIVER} permission="reports">
      <View style={styles.root}>
        <AppHeader title="Reports" subtitle="Game performance & cognitive activity" onBack={() => router.back()} />
        <Screen scroll contentGap={spacing.lg} testID="family-reports-screen">
          <View style={styles.statRow}>
            <StatCard
              label="Total sessions"
              value={String(REPORTS.totalSessions)}
              tint={colors.tileGames}
              icon={(c, s) => <Timer size={s} color={c} weight="fill" />}
            />
            <StatCard
              label="Games completed"
              value={String(REPORTS.gamesCompleted)}
              tint={colors.tileRelaxation}
              icon={(c, s) => <CalendarCheck size={s} color={c} weight="fill" />}
            />
          </View>
          <View style={styles.statRow}>
            <StatCard
              label="Average accuracy"
              value={`${REPORTS.avgAccuracy}%`}
              tint={colors.tileDailyLife}
              icon={(c, s) => <Target size={s} color={c} weight="fill" />}
            />
            <StatCard
              label="Activity frequency"
              value={REPORTS.frequency.split(" ")[0]}
              tint={colors.tileMemories}
              icon={(c, s) => <TrendUp size={s} color={c} weight="fill" />}
            />
          </View>

          <Card>
            <Text style={styles.cardTitle}>Daily activity</Text>
            <Text style={styles.cardSub}>Sessions per day this week</Text>
            <BarChart data={REPORTS.daily} />
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Weekly activity</Text>
            <Text style={styles.cardSub}>Sessions per week</Text>
            <BarChart data={REPORTS.weekly} />
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Monthly activity</Text>
            <Text style={styles.cardSub}>Sessions per month</Text>
            <BarChart data={REPORTS.monthly} />
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Performance trend</Text>
            <Text style={styles.cardSub}>Accuracy over recent weeks</Text>
            <BarChart data={REPORTS.trend} unit="%" />
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Recent games</Text>
            <View style={{ marginTop: spacing.xs }}>
              {REPORTS.recent.map((r, i) => (
                <View key={r.game} style={[styles.recentRow, i > 0 && styles.divider]}>
                  <Text style={styles.recentGame}>{r.game}</Text>
                  <View style={styles.recentRight}>
                    <Text style={styles.recentScore}>{r.score}</Text>
                    <Text style={styles.recentDate}>{r.date}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>

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
  recentRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.sm },
  divider: { borderTopWidth: 1, borderTopColor: colors.divider },
  recentGame: { fontFamily: fonts.semibold, fontSize: type.base, color: colors.onSurface },
  recentRight: { alignItems: "flex-end" },
  recentScore: { fontFamily: fonts.bold, fontSize: type.base, color: colors.brandPrimary },
  recentDate: { fontFamily: fonts.regular, fontSize: type.sm, color: colors.muted },
  disclaimer: { fontFamily: fonts.regular, fontSize: type.sm, color: colors.muted, fontStyle: "italic", lineHeight: 20 },
}));
