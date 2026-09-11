import { Pressable, View, type ViewStyle } from "react-native";

import { makeStyles, radius, spacing } from "@/src/theme";

type CardProps = {
  children: React.ReactNode;
  onPress?: () => void;
  tint?: string;
  style?: ViewStyle;
  testID?: string;
};

export function Card({ children, onPress, tint, style, testID }: CardProps) {
  const styles = useStyles();
  const content = (
    <View style={[styles.card, tint ? { backgroundColor: tint } : null, style]}>{children}</View>
  );

  if (onPress) {
    return (
      <Pressable
        testID={testID}
        accessibilityRole="button"
        onPress={onPress}
        hitSlop={6}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }
  return (
    <View testID={testID} style={styles.wrapper}>
      {content}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  wrapper: {},
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#4A5A48",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
}));
