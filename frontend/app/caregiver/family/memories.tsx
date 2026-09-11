import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { Plus } from "phosphor-react-native";

import { AppButton } from "@/src/components/ui/AppButton";
import { AppHeader } from "@/src/components/ui/AppHeader";
import { Screen } from "@/src/components/ui/Screen";
import { useToast } from "@/src/components/ui/toast";
import { RoleGuard, Role } from "@/src/auth/rbac";
import { MEMORIES } from "@/src/data/memories";
import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

export default function FamilyMemories() {
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const toast = useToast();

  return (
    <RoleGuard role={Role.FAMILY_CAREGIVER} permission="memories_manage">
      <View style={styles.root}>
        <AppHeader title="Memories" subtitle="View & manage Anita's memories" onBack={() => router.back()} />
        <Screen scroll contentGap={spacing.lg} testID="family-memories-screen">
          <AppButton
            label="Add Memory"
            onPress={() => toast("Add memory coming soon", "info")}
            testID="add-memory"
            icon={(c, s) => <Plus size={s} color={c} weight="bold" />}
          />
          <View style={styles.grid}>
            {MEMORIES.map((m) => (
              <Pressable
                key={m.id}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                onPress={() =>
                  router.push({ pathname: "/patient/memory-viewer", params: { id: m.id, category: "All" } } as any)
                }
                testID={`family-memory-${m.id}`}
              >
                <Image source={{ uri: m.image }} style={styles.image} contentFit="cover" transition={200} />
                <View style={styles.cardBody}>
                  <Text style={styles.title} numberOfLines={1}>
                    {m.title}
                  </Text>
                  <Text style={styles.cat}>{m.category}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </Screen>
      </View>
    </RoleGuard>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  card: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  image: { width: "100%", height: 120, backgroundColor: colors.brandWash },
  cardBody: { padding: spacing.sm },
  title: { fontFamily: fonts.bold, fontSize: type.base, color: colors.onSurface },
  cat: { fontFamily: fonts.medium, fontSize: type.sm, color: colors.muted },
  pressed: { opacity: 0.9 },
}));
