import { View } from "react-native";

import { AppHeader } from "@/src/components/ui/AppHeader";
import { Screen } from "@/src/components/ui/Screen";
import { AlertsView } from "@/src/features/AlertsView";
import { RoleGuard, Role } from "@/src/auth/rbac";
import { makeStyles, spacing } from "@/src/theme";

export default function AshaAlerts() {
  const styles = useStyles();
  return (
    <RoleGuard role={Role.ASHA_WORKER} permission="alerts">
      <View style={styles.root}>
        <AppHeader title="Alerts" subtitle="Care-related notifications" />
        <Screen scroll contentGap={spacing.lg} testID="asha-alerts-screen">
          <AlertsView />
        </Screen>
      </View>
    </RoleGuard>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
}));
