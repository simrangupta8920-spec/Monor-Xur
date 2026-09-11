import { Text, View } from "react-native";
import { Target, Timer, TrendUp, Trophy } from "phosphor-react-native";

import { BarChart } from "@/src/components/ui/BarChart";
import { Card } from "@/src/components/ui/Card";
import { StatCard } from "@/src/components/ui/StatCard";
import { GAME_PROGRESS } from "@/src/data/caregiver";
import { fonts, makeStyles, spacing, type, useTheme } from "@/src/theme";

export function GameProgressView() {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.wrap} testID="game-progress-view">
      <View style={styles.statRow}>
        <StatCard
          label="Games this week"
          value={String(GAME_PROGRESS.gamesThisWeek)}
          tint={colors.tileGames}
          icon={(c, s) => <Trophy size={s} color={c} weight="fill" />}
        />
        <StatCard
          label="Sessions"
          value={String(GAME_PROGRESS.sessions)}
          tint={colors.tileRelaxation}
          icon={(c, s) => <Timer size={s} color={c} weight="fill" />}
        />
      </View>
      <View style={styles.statRow}>
        <StatCard
          label="Avg. accuracy"
          value={`${GAME_PROGRESS.accuracy}%`}
          tint={colors.tileDailyLife}
          icon={(c, s) => <Target size={s} color={c} weight="fill" />}
        />
        <StatCard
          label="Frequency"
          value={GAME_PROGRESS.frequency.split(" ")[0]}
          tint={colors.tileMemories}
          icon={(c, s) => <TrendUp size={s} color={c} weight="fill" />}
        />
      </View>

      <Card>
        <Text style={styles.cardTitle}>Weekly activity</Text>
        <Text style={styles.cardSub}>Game sessions each day</Text>
        <BarChart data={GAME_PROGRESS.weekly} />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Recent games</Text>
        <View style={styles.recent}>
          {GAME_PROGRESS.recent.map((r, i) => (
            <View key={r.game} style={[styles.recentRow, i > 0 && styles.recentDivider]}>
              <Text style={styles.recentGame}>{r.game}</Text>
              <View style={styles.recentRight}>
                <Text style={styles.recentScore}>{r.score}</Text>
                <Text style={styles.recentDate}>{r.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: { gap: spacing.md },
  statRow: { flexDirection: "row", gap: spacing.md },
  cardTitle: { fontFamily: fonts.bold, fontSize: type.lg, color: colors.onSurface },
  cardSub: { fontFamily: fonts.regular, fontSize: type.sm, color: colors.muted, marginBottom: spacing.xs },
  recent: { marginTop: spacing.xs },
  recentRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.sm },
  recentDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
  recentGame: { fontFamily: fonts.semibold, fontSize: type.base, color: colors.onSurface },
  recentRight: { alignItems: "flex-end" },
  recentScore: { fontFamily: fonts.bold, fontSize: type.base, color: colors.brandPrimary },
  recentDate: { fontFamily: fonts.regular, fontSize: type.sm, color: colors.muted },
}));
