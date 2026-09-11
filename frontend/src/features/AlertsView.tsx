import { Text, View } from "react-native";
import { Bell, CalendarCheck, WarningCircle } from "phosphor-react-native";

import { ALERTS, type AlertKind } from "@/src/data/caregiver";
import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

const META: Record<AlertKind, { tint: (c: any) => string; icon: typeof Bell }> = {
  missed_routine: { tint: (c) => c.error, icon: WarningCircle },
  low_engagement: { tint: (c) => c.warning, icon: Bell },
  upcoming_appointment: { tint: (c) => c.info, icon: CalendarCheck },
};

export function AlertsView() {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.list} testID="alerts-view">
      {ALERTS.map((a) => {
        const meta = META[a.kind];
        const Icon = meta.icon;
        const tint = meta.tint(colors);
        return (
          <View key={a.id} style={styles.card} testID={`alert-${a.id}`}>
            <View style={[styles.iconWrap, { backgroundColor: tint }]}>
              <Icon size={24} color={colors.onError} weight="fill" />
            </View>
            <View style={styles.body}>
              <Text style={styles.title}>{a.title}</Text>
              <Text style={styles.desc}>{a.description}</Text>
              <Text style={styles.time}>{a.time}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  list: { gap: spacing.md },
  card: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.bold, fontSize: type.lg, color: colors.onSurface },
  desc: { fontFamily: fonts.regular, fontSize: type.base, color: colors.muted, lineHeight: 24 },
  time: { fontFamily: fonts.medium, fontSize: type.sm, color: colors.muted, marginTop: 2 },
}));
