import { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, CaretLeft, CaretRight, SpeakerHigh } from "phosphor-react-native";

import { useToast } from "@/src/components/ui/toast";
import { memoriesByCategory } from "@/src/data/memories";
import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

export default function MemoryViewer() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const toast = useToast();
  const { id, category } = useLocalSearchParams<{ id: string; category: string }>();

  const list = useMemo(() => memoriesByCategory(category), [category]);
  const startIndex = Math.max(0, list.findIndex((m) => m.id === id));
  const [index, setIndex] = useState(startIndex);

  const memory = list[index] ?? list[0];
  if (!memory) return null;

  const atStart = index === 0;
  const atEnd = index === list.length - 1;

  return (
    <View style={styles.root} testID="memory-viewer-screen">
      <View style={[styles.top, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12} testID="memory-viewer-back">
          <ArrowLeft size={26} color={colors.onSurface} weight="bold" />
        </Pressable>
        <Text style={styles.counter}>
          {index + 1} of {list.length}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.content}>
        <Image source={{ uri: memory.image }} style={styles.image} contentFit="cover" transition={300} />
        <Text style={styles.title}>{memory.title}</Text>
        {memory.person ? <Text style={styles.person}>{memory.person}</Text> : null}
        <Text style={styles.description}>{memory.description}</Text>

        <Pressable onPress={() => toast("Read aloud coming soon", "info")} style={styles.audioBtn} testID="memory-audio">
          <SpeakerHigh size={24} color={colors.brandPrimary} weight="fill" />
          <Text style={styles.audioText}>Play description</Text>
        </Pressable>
      </View>

      <View style={[styles.nav, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Pressable
          onPress={() => !atStart && setIndex((i) => i - 1)}
          disabled={atStart}
          style={[styles.navBtn, atStart && styles.navDisabled]}
          testID="memory-prev"
        >
          <CaretLeft size={26} color={atStart ? colors.muted : colors.onBrandSecondary} weight="bold" />
          <Text style={[styles.navText, atStart && styles.navTextDisabled]}>Previous</Text>
        </Pressable>
        <Pressable
          onPress={() => !atEnd && setIndex((i) => i + 1)}
          disabled={atEnd}
          style={[styles.navBtn, styles.navBtnPrimary, atEnd && styles.navDisabled]}
          testID="memory-next"
        >
          <Text style={[styles.navTextPrimary, atEnd && styles.navTextDisabled]}>Next</Text>
          <CaretRight size={26} color={atEnd ? colors.muted : colors.onBrandPrimary} weight="bold" />
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  counter: { fontFamily: fonts.semibold, fontSize: type.base, color: colors.muted },
  content: { flex: 1, paddingHorizontal: spacing.lg, gap: spacing.md },
  image: { width: "100%", height: 320, borderRadius: radius.lg, backgroundColor: colors.brandWash },
  title: { fontFamily: fonts.extrabold, fontSize: type["2xl"], color: colors.onSurface },
  person: { fontFamily: fonts.semibold, fontSize: type.lg, color: colors.brandPrimary },
  description: { fontFamily: fonts.regular, fontSize: type.lg, color: colors.muted, lineHeight: 30 },
  audioBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    alignSelf: "flex-start",
    backgroundColor: colors.brandWash,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 52,
  },
  audioText: { fontFamily: fonts.bold, fontSize: type.base, color: colors.brandPrimary },
  nav: { flexDirection: "row", gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  navBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.brandSecondary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    minHeight: 62,
  },
  navBtnPrimary: { backgroundColor: colors.brandPrimary },
  navDisabled: { opacity: 0.45 },
  navText: { fontFamily: fonts.bold, fontSize: type.lg, color: colors.onBrandSecondary },
  navTextPrimary: { fontFamily: fonts.bold, fontSize: type.lg, color: colors.onBrandPrimary },
  navTextDisabled: { color: colors.muted },
}));
