import { Linking, Pressable, Text, View } from "react-native";
import { Phone } from "phosphor-react-native";

import { EMERGENCY_CONTACTS } from "@/src/data/caregiver";
import { useToast } from "@/src/components/ui/toast";
import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

export function EmergencyContactsView() {
  const styles = useStyles();
  const { colors } = useTheme();
  const toast = useToast();

  const call = (phone: string) => {
    const url = `tel:${phone.replace(/\s+/g, "")}`;
    Linking.openURL(url).catch(() => toast("Calling is not available on this device", "info"));
  };

  return (
    <View style={styles.list} testID="emergency-contacts-view">
      {EMERGENCY_CONTACTS.map((c) => (
        <View key={c.id} style={styles.card} testID={`contact-${c.id}`}>
          <View style={styles.info}>
            <Text style={styles.name}>{c.name}</Text>
            <Text style={styles.rel}>{c.relationship}</Text>
            <Text style={styles.phone}>{c.phone}</Text>
          </View>
          <Pressable
            onPress={() => call(c.phone)}
            style={({ pressed }) => [styles.callBtn, pressed && styles.pressed]}
            testID={`call-${c.id}`}
            hitSlop={8}
          >
            <Phone size={26} color={colors.onSuccess} weight="fill" />
            <Text style={styles.callText}>Call</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  list: { gap: spacing.md },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  info: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.bold, fontSize: type.lg, color: colors.onSurface },
  rel: { fontFamily: fonts.medium, fontSize: type.base, color: colors.muted },
  phone: { fontFamily: fonts.regular, fontSize: type.base, color: colors.onSurfaceSecondary, marginTop: 2 },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.success,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 56,
  },
  callText: { fontFamily: fonts.bold, fontSize: type.base, color: colors.onSuccess },
  pressed: { opacity: 0.9, transform: [{ scale: 0.97 }] },
}));
