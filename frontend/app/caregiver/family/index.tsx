import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Bell,
  CalendarBlank,
  ChartBar,
  FirstAidKit,
  Heartbeat,
  IdentificationCard,
  Images,
  PhoneCall,
  PuzzlePiece,
  SignOut,
  UserCircle,
} from "phosphor-react-native";

import { StatCard } from "@/src/components/ui/StatCard";
import { useCaregiverAuth } from "@/src/auth/caregiver-auth";
import { GAME_PROGRESS, PATIENT } from "@/src/data/caregiver";
import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

const SECTIONS = [
  { key: "profile", label: "Patient Profile", icon: UserCircle, path: "/caregiver/family/profile" },
  { key: "personal", label: "Personal Details", icon: IdentificationCard, path: "/caregiver/family/profile" },
  { key: "medical", label: "Medical Details", icon: FirstAidKit, path: "/caregiver/family/medical-details" },
  { key: "memories", label: "Memories", icon: Images, path: "/caregiver/family/memories" },
  { key: "games", label: "Game Progress", icon: PuzzlePiece, path: "/caregiver/family/game-progress" },
  { key: "reports", label: "Reports", icon: ChartBar, path: "/caregiver/family/reports" },
  { key: "calendar", label: "Calendar", icon: CalendarBlank, path: "/caregiver/family/calendar" },
  { key: "emergency", label: "Emergency Contacts", icon: PhoneCall, path: "/caregiver/family/emergency-contacts" },
  { key: "alerts", label: "Alerts", icon: Bell, path: "/caregiver/family/alerts" },
] as const;

export default function FamilyDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const { lock } = useCaregiverAuth();

  const exit = () => {
    lock("family");
    router.replace("/caregiver-select");
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerRow}>
          <Image source={{ uri: PATIENT.avatar }} style={styles.avatar} contentFit="cover" transition={200} />
          <View style={styles.headerText}>
            <Text style={styles.brand}>Monor Xur</Text>
            <Text style={styles.role}>Family Caregiver</Text>
            <Text style={styles.patient}>{PATIENT.name}</Text>
          </View>
          <Pressable onPress={exit} style={styles.exitBtn} hitSlop={10} testID="family-exit">
            <SignOut size={24} color={colors.onSurface} weight="bold" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl, gap: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statRow}>
          <StatCard
            label="Sessions this week"
            value={String(GAME_PROGRESS.sessions)}
            tint={colors.tileGames}
            icon={(c, s) => <PuzzlePiece size={s} color={c} weight="fill" />}
          />
          <StatCard
            label="Avg. accuracy"
            value={`${GAME_PROGRESS.accuracy}%`}
            tint={colors.tileRelaxation}
            icon={(c, s) => <Heartbeat size={s} color={c} weight="fill" />}
          />
        </View>

        <Text style={styles.sectionLabel}>Care sections</Text>
        <View style={styles.grid}>
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <Pressable
                key={s.key}
                onPress={() => router.push(s.path as any)}
                style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
                testID={`family-section-${s.key}`}
              >
                <View style={styles.tileIcon}>
                  <Icon size={30} color={colors.brandPrimary} weight="fill" />
                </View>
                <Text style={styles.tileLabel}>{s.label}</Text>
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
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.brandWash },
  headerText: { flex: 1 },
  brand: { fontFamily: fonts.bold, fontSize: type.sm, color: colors.muted },
  role: { fontFamily: fonts.semibold, fontSize: type.base, color: colors.brandPrimary },
  patient: { fontFamily: fonts.extrabold, fontSize: type.xl, color: colors.onSurface },
  exitBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statRow: { flexDirection: "row", gap: spacing.md },
  sectionLabel: { fontFamily: fonts.bold, fontSize: type.lg, color: colors.onSurface },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  tile: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    minHeight: 120,
    justifyContent: "center",
  },
  tileIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.brandWash,
    alignItems: "center",
    justifyContent: "center",
  },
  tileLabel: { fontFamily: fonts.bold, fontSize: type.base, color: colors.onSurface },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
}));
