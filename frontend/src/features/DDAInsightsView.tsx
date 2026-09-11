import { Text, View } from "react-native";
import { format } from "date-fns";
import { ArrowDown, ArrowUp } from "phosphor-react-native";

import { Card } from "@/src/components/ui/Card";
import { useDDALogs } from "@/src/telemetry/dda-log";
import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

/**
 * Caregiver-facing view of the adaptive-difficulty (DDA) shifts and the
 * cognitive-stress markers that triggered them. Reads from local storage.
 */
export function DDAInsightsView() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { logs, loading } = useDDALogs();

  const recent = [...logs].reverse().slice(0, 8);
  const eased = logs.filter((l) => l.action === "DECREASE_DIFFICULTY").length;
  const stepped = logs.filter((l) => l.action === "INCREASE_DIFFICULTY").length;

  return (
    <View style={styles.wrap} testID="dda-insights-view">
      <Card>
        <Text style={styles.title}>Adaptive difficulty</Text>
        <Text style={styles.sub}>How the games gently adjusted to keep engagement comfortable.</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{stepped}</Text>
            <Text style={styles.summaryLabel}>Stepped up</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{eased}</Text>
            <Text style={styles.summaryLabel}>Eased off</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{logs.length}</Text>
            <Text style={styles.summaryLabel}>Total shifts</Text>
          </View>
        </View>
      </Card>

      {loading ? null : recent.length === 0 ? (
        <Card tint={colors.brandWash}>
          <Text style={styles.empty}>No adaptive changes yet. They appear here once games are played.</Text>
        </Card>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {recent.map((l, i) => {
            const down = l.action === "DECREASE_DIFFICULTY";
            return (
              <View key={`${l.timestamp}-${i}`} style={styles.row} testID={`dda-row-${i}`}>
                <View style={[styles.icon, { backgroundColor: down ? colors.tileMemories : colors.tileDailyLife }]}>
                  {down ? (
                    <ArrowDown size={22} color={colors.error} weight="bold" />
                  ) : (
                    <ArrowUp size={22} color={colors.success} weight="bold" />
                  )}
                </View>
                <View style={styles.body}>
                  <Text style={styles.rowTitle}>
                    {l.game} · {down ? "Made easier" : "Made harder"}
                  </Text>
                  <Text style={styles.rowMeta}>
                    Level {l.fromLevel} → {l.toLevel} · {format(new Date(l.timestamp), "d MMM, h:mm a")}
                  </Text>
                  <Text style={styles.markers}>
                    Misses {l.markers.errorCount} · Avg speed {(l.markers.avgLatency / 1000).toFixed(1)}s · Hesitations{" "}
                    {l.markers.hesitations}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: { gap: spacing.md },
  title: { fontFamily: fonts.bold, fontSize: type.lg, color: colors.onSurface },
  sub: { fontFamily: fonts.regular, fontSize: type.sm, color: colors.muted, marginTop: 2, marginBottom: spacing.md, lineHeight: 20 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryItem: { alignItems: "center", flex: 1 },
  summaryValue: { fontFamily: fonts.extrabold, fontSize: type.xl, color: colors.brandPrimary },
  summaryLabel: { fontFamily: fonts.medium, fontSize: type.sm, color: colors.muted },
  empty: { fontFamily: fonts.medium, fontSize: type.base, color: colors.muted, lineHeight: 24 },
  row: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: { width: 46, height: 46, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  body: { flex: 1 },
  rowTitle: { fontFamily: fonts.bold, fontSize: type.base, color: colors.onSurface },
  rowMeta: { fontFamily: fonts.regular, fontSize: type.sm, color: colors.muted, marginTop: 2 },
  markers: { fontFamily: fonts.medium, fontSize: type.sm, color: colors.onSurfaceTertiary, marginTop: spacing.xs },
}));
