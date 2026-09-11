import { useState } from "react";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MEMORIES, MEMORY_CATEGORIES, memoriesByCategory } from "@/src/data/memories";
import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

const CHIPS = ["All", ...MEMORY_CATEGORIES];

export default function PatientMemories() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const [category, setCategory] = useState("All");

  const data = memoriesByCategory(category);

  return (
    <View style={styles.root} testID="patient-memories-screen">
      {/* Sticky header + chip row */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={styles.title}>Your Memories</Text>
        <Text style={styles.subtitle}>Tap a memory to look closer</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={styles.chipScroller}
        >
          {CHIPS.map((c) => {
            const active = c === category;
            return (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                style={[styles.chip, active && styles.chipActive]}
                testID={`memory-chip-${c}`}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={data}
        keyExtractor={(m) => m.id}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.md }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            onPress={() =>
              router.push({ pathname: "/patient/memory-viewer", params: { id: item.id, category } } as any)
            }
            testID={`memory-card-${item.id}`}
          >
            <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" transition={200} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              {item.person ? (
                <Text style={styles.cardPerson} numberOfLines={1}>
                  {item.person}
                </Text>
              ) : null}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: spacing.xs,
  },
  title: { fontFamily: fonts.extrabold, fontSize: type["2xl"], color: colors.onSurface },
  subtitle: { fontFamily: fonts.regular, fontSize: type.base, color: colors.muted },
  chipScroller: { marginTop: spacing.sm, marginHorizontal: -spacing.lg },
  chipRow: { gap: spacing.sm, paddingHorizontal: spacing.lg, height: 56, alignItems: "center" },
  chip: {
    flexShrink: 0,
    height: 40,
    justifyContent: "center",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 2,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.brandWash, borderColor: colors.brandPrimary },
  chipText: { fontFamily: fonts.semibold, fontSize: type.base, color: colors.onSurfaceTertiary },
  chipTextActive: { color: colors.brandPrimary },
  card: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  image: { width: "100%", height: 140, backgroundColor: colors.brandWash },
  cardBody: { padding: spacing.sm },
  cardTitle: { fontFamily: fonts.bold, fontSize: type.base, color: colors.onSurface },
  cardPerson: { fontFamily: fonts.regular, fontSize: type.sm, color: colors.muted },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
}));
