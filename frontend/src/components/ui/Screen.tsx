import { type ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { makeStyles, spacing } from "@/src/theme";

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: { top?: boolean; bottom?: boolean };
  testID?: string;
  contentGap?: number;
};

/**
 * Full-bleed warm background. Content positioned with safe-area insets.
 * Never uses SafeAreaView. Pass edges to control which insets to pad.
 */
export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = { top: true, bottom: true },
  contentGap,
  testID,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();

  const pad = {
    paddingTop: edges.top ? insets.top : 0,
    paddingBottom: edges.bottom ? insets.bottom + spacing.lg : spacing.lg,
    paddingHorizontal: padded ? spacing.lg : 0,
  };

  if (scroll) {
    return (
      <View style={styles.root} testID={testID}>
        <ScrollView
          style={styles.root}
          contentContainerStyle={[
            { paddingTop: pad.paddingTop, paddingBottom: pad.paddingBottom, paddingHorizontal: pad.paddingHorizontal },
            contentGap != null && { gap: contentGap },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.root, pad, contentGap != null && { gap: contentGap }]} testID={testID}>
      {children}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
}));
