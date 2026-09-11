import { View } from "react-native";

import { AppHeader } from "@/src/components/ui/AppHeader";
import { Screen } from "@/src/components/ui/Screen";
import { AlertsView } from "@/src/features/AlertsView";
import { RoleGuard, Role } from "@/src/auth/rbac";
import { makeStyles, spacing } from "@/src/theme";

export default function FamilyAlerts() {
  const styles = useStyles();
  return (
    <RoleGuard role={Role.FAMILY_CAREGIVER} permission="alerts">
      <View style={styles.root}>
        <AppHeader title="Alerts" subtitle="Things that may need attention" />
        <Screen scroll contentGap={spacing.lg} testID="family-alerts-screen">
          <AlertsView />
        </Screen>
      </View>
    </RoleGuard>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
}));
