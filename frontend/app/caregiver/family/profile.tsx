import { Image } from "expo-image";
import { Text, View } from "react-native";

import { AppHeader } from "@/src/components/ui/AppHeader";
import { Card } from "@/src/components/ui/Card";
import { InfoRow } from "@/src/components/ui/InfoRow";
import { Screen } from "@/src/components/ui/Screen";
import { RoleGuard, Role } from "@/src/auth/rbac";
import { PATIENT, PERSONAL_DETAILS } from "@/src/data/caregiver";
import { fonts, makeStyles, radius, spacing, type } from "@/src/theme";

export default function PatientProfile() {
  const styles = useStyles();
  return (
    <RoleGuard role={Role.FAMILY_CAREGIVER} permission="patient_profile">
      <View style={styles.root}>
        <AppHeader title="Patient Profile" subtitle="Personal details & basic information" />
        <Screen scroll contentGap={spacing.lg} testID="family-profile-screen">
          <Card>
            <View style={styles.top}>
              <Image source={{ uri: PATIENT.avatar }} style={styles.avatar} contentFit="cover" transition={200} />
              <View style={styles.topText}>
                <Text style={styles.name}>{PATIENT.fullName}</Text>
                <Text style={styles.meta}>
                  {PATIENT.gender} · {PATIENT.age} yrs
                </Text>
                <Text style={styles.region}>{PATIENT.region}</Text>
              </View>
            </View>
            <Text style={styles.about}>{PATIENT.about}</Text>
          </Card>

          <Text style={styles.sectionLabel}>Personal Details</Text>
          <Card>
            {PERSONAL_DETAILS.map((d) => (
              <InfoRow key={d.label} label={d.label} value={d.value} />
            ))}
          </Card>
        </Screen>
      </View>
    </RoleGuard>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  top: { flexDirection: "row", gap: spacing.md, alignItems: "center" },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.brandWash },
  topText: { flex: 1 },
  name: { fontFamily: fonts.extrabold, fontSize: type.xl, color: colors.onSurface },
  meta: { fontFamily: fonts.semibold, fontSize: type.base, color: colors.brandPrimary },
  region: { fontFamily: fonts.regular, fontSize: type.base, color: colors.muted },
  about: { fontFamily: fonts.regular, fontSize: type.base, color: colors.muted, lineHeight: 26, marginTop: spacing.md },
  sectionLabel: { fontFamily: fonts.bold, fontSize: type.lg, color: colors.onSurface },
}));
