import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { CheckCircle, Circle } from "phosphor-react-native";

import { AppHeader } from "@/src/components/ui/AppHeader";
import { Screen } from "@/src/components/ui/Screen";
import { RoleGuard, Role } from "@/src/auth/rbac";
import { CARE_TASKS } from "@/src/data/caregiver";
import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

export default function AshaTasks() {
  const styles = useStyles();
  const { colors } = useTheme();
  const [tasks, setTasks] = useState(CARE_TASKS);

  const toggle = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  return (
    <RoleGuard role={Role.ASHA_WORKER} permission="care_tasks">
      <View style={styles.root}>
        <AppHeader title="Care Tasks" subtitle="Tap to mark as done" />
        <Screen scroll contentGap={spacing.md} testID="asha-tasks-screen">
          {tasks.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => toggle(t.id)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              testID={`task-${t.id}`}
            >
              {t.done ? (
                <CheckCircle size={32} color={colors.success} weight="fill" />
              ) : (
                <Circle size={32} color={colors.muted} weight="regular" />
              )}
              <Text style={[styles.label, t.done && styles.done]}>{t.title}</Text>
            </Pressable>
          ))}
        </Screen>
      </View>
    </RoleGuard>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 72,
  },
  label: { flex: 1, fontFamily: fonts.semibold, fontSize: type.lg, color: colors.onSurface },
  done: { textDecorationLine: "line-through", color: colors.muted },
  pressed: { opacity: 0.9 },
}));
