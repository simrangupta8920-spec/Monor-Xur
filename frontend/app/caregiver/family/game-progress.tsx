import { useRouter } from "expo-router";
import { View } from "react-native";

import { AppHeader } from "@/src/components/ui/AppHeader";
import { Screen } from "@/src/components/ui/Screen";
import { DDAInsightsView } from "@/src/features/DDAInsightsView";
import { GameProgressView } from "@/src/features/GameProgressView";
import { RoleGuard, Role } from "@/src/auth/rbac";
import { makeStyles, spacing } from "@/src/theme";

export default function FamilyGameProgress() {
  const router = useRouter();
  const styles = useStyles();
  return (
    <RoleGuard role={Role.FAMILY_CAREGIVER} permission="game_progress">
      <View style={styles.root}>
        <AppHeader title="Game Progress" subtitle="Cognitive activity & engagement" onBack={() => router.back()} />
        <Screen scroll contentGap={spacing.lg} testID="family-game-progress-screen">
          <GameProgressView />
          <DDAInsightsView />
        </Screen>
      </View>
    </RoleGuard>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
}));
