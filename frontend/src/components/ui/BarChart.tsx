import { Text, View } from "react-native";

import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

type BarChartProps = {
  data: { label: string; value: number }[];
  unit?: string;
};

/** Simple, dependency-free vertical bar chart for game activity. */
export function BarChart({ data, unit = "" }: BarChartProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <View style={styles.wrap}>
      {data.map((d) => {
        const h = 12 + (d.value / max) * 108;
        return (
          <View key={d.label} style={styles.col}>
            <Text style={styles.value}>{d.value > 0 ? `${d.value}${unit}` : ""}</Text>
            <View style={styles.track}>
              <View
                style={[
                  styles.bar,
                  { height: h, backgroundColor: d.value === 0 ? colors.border : colors.brand },
                ]}
              />
            </View>
            <Text style={styles.label}>{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  col: { flex: 1, alignItems: "center", gap: spacing.xs },
  track: { height: 130, justifyContent: "flex-end" },
  bar: { width: 22, borderRadius: radius.sm },
  value: { fontFamily: fonts.semibold, fontSize: 11, color: colors.muted, height: 16 },
  label: { fontFamily: fonts.medium, fontSize: type.sm, color: colors.muted },
}));
