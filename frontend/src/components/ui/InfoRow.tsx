import { Text, View } from "react-native";

import { fonts, makeStyles, spacing, type } from "@/src/theme";

export function InfoRow({ label, value }: { label: string; value: string }) {
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  label: { fontFamily: fonts.medium, fontSize: type.base, color: colors.muted },
  value: { fontFamily: fonts.bold, fontSize: type.base, color: colors.onSurface, flexShrink: 1, textAlign: "right" },
}));
