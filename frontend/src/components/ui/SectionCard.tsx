import { Text, View } from "react-native";

import { fonts, makeStyles, radius, spacing, type } from "@/src/theme";

type SectionCardProps = {
  title?: string;
  body: string;
  tint?: string;
  testID?: string;
};

export function SectionCard({ title, body, tint, testID }: SectionCardProps) {
  const styles = useStyles();
  return (
    <View style={[styles.card, tint ? { backgroundColor: tint } : null]} testID={testID}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.brandWash,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: type.lg,
    color: colors.onSurface,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: type.base,
    lineHeight: 26,
    color: colors.muted,
  },
}));
