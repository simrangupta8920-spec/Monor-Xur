import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CalendarBlank, Phone, SignOut, WarningCircle } from "phosphor-react-native";

import { Card } from "@/src/components/ui/Card";
import { Tag } from "@/src/components/ui/Tag";
import { useToast } from "@/src/components/ui/toast";
import { GameProgressView } from "@/src/features/GameProgressView";
import { useCaregiverAuth } from "@/src/auth/caregiver-auth";
import { APPOINTMENTS, EMERGENCY_CONTACTS, PATIENT } from "@/src/data/caregiver";
import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

export default function AshaDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const { lock } = useCaregiverAuth();
  const toast = useToast();

  const primary = EMERGENCY_CONTACTS[0];

  const exit = () => {
    lock("asha");
    router.replace("/caregiver-select");
  };

  const call = () => {
    Linking.openURL(`tel:${primary.phone.replace(/\s+/g, "")}`).catch(() =>
      toast("Calling is not available on this device", "info"),
    );
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.brand}>Monor Xur</Text>
            <Text style={styles.role}>ASHA Worker</Text>
            <Text style={styles.patient}>{PATIENT.name}</Text>
          </View>
          <Pressable onPress={exit} style={styles.exitBtn} hitSlop={10} testID="asha-exit">
            <SignOut size={24} color={colors.onSurface} weight="bold" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl, gap: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        <Card testID="asha-patient-card">
          <View style={styles.patientTop}>
            <Image source={{ uri: PATIENT.avatar }} style={styles.avatar} contentFit="cover" transition={200} />
            <View style={styles.patientInfo}>
              <Text style={styles.name}>{PATIENT.name}</Text>
              <Text style={styles.meta}>
                {PATIENT.gender} · Age {PATIENT.age}
              </Text>
            </View>
          </View>
        </Card>

        <View>
          <Text style={styles.sectionLabel}>Major care issue</Text>
          <Card tint={colors.tileMemories} style={styles.issueCard}>
            <WarningCircle size={28} color={colors.error} weight="fill" />
            <Text style={styles.issueText}>{PATIENT.majorCareIssue}</Text>
          </Card>
        </View>

        <Text style={styles.sectionLabel}>Game progress</Text>
        <GameProgressView />

        <Text style={styles.sectionLabel}>Appointments</Text>
        <View style={{ gap: spacing.sm }}>
          {APPOINTMENTS.map((a) => (
            <View key={a.id} style={styles.apptRow} testID={`asha-appt-${a.id}`}>
              <View style={styles.apptIcon}>
                <CalendarBlank size={22} color={colors.brandPrimary} weight="fill" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.apptTitle}>{a.title}</Text>
                <Text style={styles.apptMeta}>
                  {a.when} · {a.where}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Emergency contact</Text>
        <Card>
          <Text style={styles.contactName}>{primary.name}</Text>
          <Text style={styles.contactRel}>{primary.relationship}</Text>
          <Pressable onPress={call} style={({ pressed }) => [styles.callBtn, pressed && styles.pressed]} testID="asha-call">
            <Phone size={26} color={colors.onSuccess} weight="fill" />
            <Text style={styles.callText}>Call {primary.phone}</Text>
          </Pressable>
        </Card>
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
  patientTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.brandWash },
  patientInfo: { flex: 1 },
  name: { fontFamily: fonts.extrabold, fontSize: type.xl, color: colors.onSurface },
  meta: { fontFamily: fonts.medium, fontSize: type.base, color: colors.muted },
  sectionLabel: { fontFamily: fonts.bold, fontSize: type.lg, color: colors.onSurface },
  issueCard: { flexDirection: "row", alignItems: "center", gap: spacing.md, borderWidth: 0 },
  issueText: { flex: 1, fontFamily: fonts.bold, fontSize: type.base, color: colors.onSurface },
  apptRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  apptIcon: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.brandWash, alignItems: "center", justifyContent: "center" },
  apptTitle: { fontFamily: fonts.bold, fontSize: type.base, color: colors.onSurface },
  apptMeta: { fontFamily: fonts.regular, fontSize: type.sm, color: colors.muted, marginTop: 2 },
  contactName: { fontFamily: fonts.bold, fontSize: type.lg, color: colors.onSurface },
  contactRel: { fontFamily: fonts.medium, fontSize: type.base, color: colors.muted, marginBottom: spacing.md },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.success,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    minHeight: 62,
  },
  callText: { fontFamily: fonts.bold, fontSize: type.lg, color: colors.onSuccess },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
}));
