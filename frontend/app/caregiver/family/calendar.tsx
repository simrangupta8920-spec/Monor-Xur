import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { format } from "date-fns";
import { CalendarBlank, CalendarHeart, Clock, HeartStraight, Plus, Stethoscope, X } from "phosphor-react-native";

import { AppButton } from "@/src/components/ui/AppButton";
import { AppHeader } from "@/src/components/ui/AppHeader";
import { Screen } from "@/src/components/ui/Screen";
import { TextField } from "@/src/components/ui/TextField";
import { RoleGuard, Role } from "@/src/auth/rbac";
import { CALENDAR_EVENTS, type CalEventType } from "@/src/data/caregiver";
import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

const TYPE_META: Record<CalEventType, { label: string; icon: any }> = {
  appointment: { label: "Appointment", icon: CalendarBlank },
  routine: { label: "Routine", icon: Clock },
  event: { label: "Event", icon: CalendarHeart },
  doctor: { label: "Doctor", icon: Stethoscope },
  family: { label: "Family", icon: HeartStraight },
};

const TYPE_ORDER: CalEventType[] = ["routine", "doctor", "appointment", "family", "event"];

export default function FamilyCalendar() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();

  const [events, setEvents] = useState(CALENDAR_EVENTS);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState<CalEventType>("routine");

  const today = useMemo(() => format(new Date(), "EEEE, d MMMM"), []);

  const grouped = useMemo(() => {
    const map: Record<string, typeof events> = {};
    for (const e of events) {
      (map[e.date] ??= []).push(e);
    }
    return map;
  }, [events]);

  const tintFor = (t: CalEventType) =>
    ({
      appointment: colors.tileRelaxation,
      routine: colors.tileGames,
      event: colors.tileMemories,
      doctor: colors.brandSecondary,
      family: colors.tileDailyLife,
    })[t];

  const save = () => {
    if (!title.trim()) return;
    setEvents((prev) => [
      ...prev,
      { id: `n${Date.now()}`, title: title.trim(), type, time: time.trim() || "All day", date: "Today" },
    ]);
    setTitle("");
    setTime("");
    setType("routine");
    setShowAdd(false);
  };

  return (
    <RoleGuard role={Role.FAMILY_CAREGIVER} permission="calendar">
      <View style={styles.root}>
        <AppHeader
          title="Calendar"
          subtitle={today}
          right={
            <Pressable onPress={() => setShowAdd(true)} style={styles.addBtn} hitSlop={10} testID="calendar-add">
              <Plus size={22} color={colors.onBrandPrimary} weight="bold" />
            </Pressable>
          }
        />
        <Screen scroll contentGap={spacing.lg} testID="family-calendar-screen">
          {Object.keys(grouped).map((date) => (
            <View key={date} style={{ gap: spacing.sm }}>
              <Text style={styles.dateLabel}>{date}</Text>
              {grouped[date].map((e) => {
                const meta = TYPE_META[e.type];
                const Icon = meta.icon;
                return (
                  <View key={e.id} style={styles.eventRow} testID={`event-${e.id}`}>
                    <View style={[styles.eventIcon, { backgroundColor: tintFor(e.type) }]}>
                      <Icon size={22} color={colors.brandPrimary} weight="fill" />
                    </View>
                    <View style={styles.eventBody}>
                      <Text style={styles.eventTitle}>{e.title}</Text>
                      <Text style={styles.eventMeta}>
                        {meta.label} · {e.time}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </Screen>

        <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Add Event</Text>
                <Pressable onPress={() => setShowAdd(false)} hitSlop={12} testID="calendar-add-close">
                  <X size={26} color={colors.onSurface} weight="bold" />
                </Pressable>
              </View>
              <KeyboardAwareScrollView
                contentContainerStyle={{ gap: spacing.md, paddingTop: spacing.sm }}
                bottomOffset={20}
                showsVerticalScrollIndicator={false}
              >
                <TextField label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Doctor visit" autoCapitalize="sentences" testID="event-title-input" />
                <TextField label="Time" value={time} onChangeText={setTime} placeholder="e.g. 10:00 AM" autoCapitalize="none" testID="event-time-input" />
                <Text style={styles.fieldLabel}>Type</Text>
                <View style={styles.chips}>
                  {TYPE_ORDER.map((t) => (
                    <Pressable
                      key={t}
                      onPress={() => setType(t)}
                      style={[styles.chip, type === t && styles.chipActive]}
                      testID={`event-type-${t}`}
                    >
                      <Text style={[styles.chipText, type === t && styles.chipTextActive]}>{TYPE_META[t].label}</Text>
                    </Pressable>
                  ))}
                </View>
                <AppButton label="Save Event" onPress={save} disabled={!title.trim()} testID="event-save" />
              </KeyboardAwareScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </RoleGuard>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandPrimary,
  },
  dateLabel: { fontFamily: fonts.bold, fontSize: type.lg, color: colors.onSurface },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventIcon: { width: 46, height: 46, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  eventBody: { flex: 1 },
  eventTitle: { fontFamily: fonts.bold, fontSize: type.base, color: colors.onSurface },
  eventMeta: { fontFamily: fonts.regular, fontSize: type.sm, color: colors.muted, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(45,58,47,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: "85%",
  },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sheetTitle: { fontFamily: fonts.extrabold, fontSize: type.xl, color: colors.onSurface },
  fieldLabel: { fontFamily: fonts.semibold, fontSize: type.base, color: colors.onSurface },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 2,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.brandWash, borderColor: colors.brandPrimary },
  chipText: { fontFamily: fonts.semibold, fontSize: type.sm, color: colors.onSurfaceTertiary },
  chipTextActive: { color: colors.brandPrimary },
}));
