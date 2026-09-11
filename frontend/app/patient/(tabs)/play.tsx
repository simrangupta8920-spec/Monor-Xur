import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Brain, Cards, Hash, MagnifyingGlass, TextAa } from "phosphor-react-native";

import { FeatureRow } from "@/src/components/ui/FeatureRow";
import { Screen } from "@/src/components/ui/Screen";
import { useToast } from "@/src/components/ui/toast";
import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

const HERO = "https://images.unsplash.com/photo-1730804518415-75297e8d2a41?crop=entropy&cs=srgb&fm=jpg&w=900&q=80";

const GAMES = [
  { title: "Memory Match", subtitle: "Find the matching pairs", icon: Brain, route: "/patient/games/memory-match" },
  { title: "Picture Pairs", subtitle: "Match the pictures", icon: Cards, route: null },
  { title: "Word Recall", subtitle: "Remember the words", icon: TextAa, route: null },
  { title: "Number Fun", subtitle: "Simple number games", icon: Hash, route: null },
  { title: "Spot the Difference", subtitle: "Find what changed", icon: MagnifyingGlass, route: null },
];

export default function PatientPlay() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const toast = useToast();

  return (
    <Screen scroll edges={{ top: true, bottom: false }} contentGap={spacing.md} testID="patient-play-screen">
      <View style={{ paddingTop: insets.top > 0 ? 0 : spacing.sm }}>
        <Text style={styles.title}>Games</Text>
        <Text style={styles.subtitle}>Fun games for your mind</Text>
      </View>
      <Image source={{ uri: HERO }} style={styles.hero} contentFit="cover" transition={300} />
      {GAMES.map((g) => (
        <FeatureRow
          key={g.title}
          title={g.title}
          subtitle={g.subtitle}
          tint={colors.tileGames}
          icon={(c, size) => <g.icon size={size} color={c} weight="fill" />}
          onPress={() => (g.route ? router.push(g.route as any) : toast("This game is coming soon", "info"))}
          testID={`game-${g.title}`}
        />
      ))}
    </Screen>
  );
}

const useStyles = makeStyles((colors) => ({
  title: { fontFamily: fonts.extrabold, fontSize: type["2xl"], color: colors.onSurface },
  subtitle: { fontFamily: fonts.regular, fontSize: type.lg, color: colors.muted },
  hero: { width: "100%", height: 160, borderRadius: radius.lg, backgroundColor: colors.brandWash },
}));
