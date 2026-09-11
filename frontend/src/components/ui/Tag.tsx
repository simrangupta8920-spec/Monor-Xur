import { Text, View } from "react-native";

import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

export function Tag({ label, tint }: { label: string; tint?: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={[styles.tag, { backgroundColor: tint ?? colors.brandWash }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  tag: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: "flex-start",
  },
  text: { fontFamily: fonts.semibold, fontSize: type.sm, color: colors.onSurface },
}));
