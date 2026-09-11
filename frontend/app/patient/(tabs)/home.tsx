import { useMemo } from "react";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { format } from "date-fns";
import { House, Images, Leaf, Play, PuzzlePiece, Stethoscope } from "phosphor-react-native";

import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

const PATIENT_NAME = "Anita";

export default function PatientHome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();

  const today = useMemo(() => format(new Date(), "EEEE, d MMMM"), []);

  const tiles = [
    {
      key: "memories",
      title: "Memories",
      desc: "People, places & special moments",
      icon: Images,
      bg: colors.tileMemories,
      onPress: () => router.navigate("/patient/memories"),
    },
    {
      key: "games",
      title: "Games",
      desc: "Fun games for your mind",
      icon: PuzzlePiece,
      bg: colors.tileGames,
      onPress: () => router.navigate("/patient/play"),
    },
    {
      key: "relaxation",
      title: "Relaxation",
      desc: "Music & breathing",
      icon: Leaf,
      bg: colors.tileRelaxation,
      onPress: () => router.push("/patient/relaxation"),
    },
    {
      key: "daily-life",
      title: "Daily Life",
      desc: "Everyday activities & routines",
      icon: House,
      bg: colors.tileDailyLife,
      onPress: () => router.push("/patient/daily-life"),
    },
  ];

  return (
    <View style={styles.root} testID="patient-home-screen">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingBottom: spacing.xl,
          paddingHorizontal: spacing.lg,
          gap: spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <View style={styles.logoMark}>
              <Leaf size={22} color={colors.onBrandPrimary} weight="fill" />
            </View>
            <Text style={styles.brand}>Monor Xur</Text>
          </View>
          <Pressable onPress={() => router.push("/caregiver-select")} style={styles.caregiverBtn} hitSlop={8} testID="home-caregiver-button">
            <Stethoscope size={20} color={colors.onBrandSecondary} weight="bold" />
            <Text style={styles.caregiverText}>Caregiver</Text>
          </Pressable>
        </View>

        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{PATIENT_NAME[0]}</Text>
          </View>
          <View>
            <Text style={styles.hello}>Hello, {PATIENT_NAME}</Text>
            <Text style={styles.date}>{today}</Text>
          </View>
        </View>

        {/* Hero card */}
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Play &amp; Remember</Text>
            <Text style={styles.heroSubtitle}>Small moments. Big memories.</Text>
          </View>
          <Pressable
            onPress={() => router.navigate("/patient/play")}
            style={({ pressed }) => [styles.playBtn, pressed && styles.pressed]}
            testID="home-play-button"
          >
            <Play size={30} color={colors.onBrandPrimary} weight="fill" />
            <Text style={styles.playText}>PLAY</Text>
          </Pressable>
        </View>

        {/* Four main cards */}
        <View style={styles.grid}>
          {tiles.map((t) => {
            const Icon = t.icon;
            return (
              <Pressable
                key={t.key}
                onPress={t.onPress}
                style={({ pressed }) => [styles.tile, { backgroundColor: t.bg }, pressed && styles.pressed]}
                testID={`home-tile-${t.key}`}
              >
                <View style={styles.tileIcon}>
                  <Icon size={38} color={colors.brandPrimary} weight="fill" />
                </View>
                <Text style={styles.tileTitle}>{t.title}</Text>
                <Text style={styles.tileDesc} numberOfLines={2}>
                  {t.desc}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: { fontFamily: fonts.extrabold, fontSize: type.lg, color: colors.onSurface },
  caregiverBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.brandSecondary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  caregiverText: { fontFamily: fonts.bold, fontSize: type.base, color: colors.onBrandSecondary },
  identity: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: fonts.extrabold, fontSize: type.xl, color: colors.onBrand },
  hello: { fontFamily: fonts.extrabold, fontSize: type["2xl"], color: colors.onSurface },
  date: { fontFamily: fonts.medium, fontSize: type.base, color: colors.muted },
  hero: {
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  heroText: { gap: spacing.xs },
  heroTitle: { fontFamily: fonts.extrabold, fontSize: type["2xl"], color: colors.onBrandPrimary },
  heroSubtitle: { fontFamily: fonts.medium, fontSize: type.lg, color: colors.onBrandPrimary, opacity: 0.9 },
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    minHeight: 64,
  },
  playText: { fontFamily: fonts.extrabold, fontSize: type.xl, color: colors.onBrandPrimary, letterSpacing: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  tile: {
    flexBasis: "47%",
    flexGrow: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    minHeight: 168,
  },
  tileIcon: {
    width: 68,
    height: 68,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  tileTitle: { fontFamily: fonts.extrabold, fontSize: type.xl, color: colors.onSurface, marginTop: spacing.xs },
  tileDesc: { fontFamily: fonts.medium, fontSize: type.sm, color: colors.onSurface, opacity: 0.75, lineHeight: 20 },
  pressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
}));
