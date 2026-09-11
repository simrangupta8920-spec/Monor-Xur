import { View } from "react-native";

import { AppHeader } from "@/src/components/ui/AppHeader";
import { Screen } from "@/src/components/ui/Screen";
import { EmergencyContactsView } from "@/src/features/EmergencyContactsView";
import { RoleGuard, Role } from "@/src/auth/rbac";
import { useRouter } from "expo-router";
import { makeStyles, spacing } from "@/src/theme";

export default function FamilyEmergencyContacts() {
  const router = useRouter();
  const styles = useStyles();
  return (
    <RoleGuard role={Role.FAMILY_CAREGIVER} permission="emergency_contacts">
      <View style={styles.root}>
        <AppHeader title="Emergency Contacts" subtitle="Tap Call to reach them" onBack={() => router.back()} />
        <Screen scroll contentGap={spacing.lg} testID="family-emergency-screen">
          <EmergencyContactsView />
        </Screen>
      </View>
    </RoleGuard>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
}));
