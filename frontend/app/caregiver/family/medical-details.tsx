import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { AppHeader } from "@/src/components/ui/AppHeader";
import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { Tag } from "@/src/components/ui/Tag";
import { RoleGuard, Role } from "@/src/auth/rbac";
import { MEDICAL } from "@/src/data/caregiver";
import { fonts, makeStyles, spacing, type, useTheme } from "@/src/theme";

export default function MedicalDetails() {
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <RoleGuard role={Role.FAMILY_CAREGIVER} permission="medical_details">
      <View style={styles.root}>
        <AppHeader title="Medical Details" subtitle="Care concerns & consultations" onBack={() => router.back()} />
        <Screen scroll contentGap={spacing.lg} testID="family-medical-screen">
          <View>
            <Text style={styles.sectionLabel}>Major care concerns</Text>
            <View style={styles.tags}>
              {MEDICAL.concerns.map((c) => (
                <Tag key={c} label={c} tint={colors.tileMemories} />
              ))}
            </View>
          </View>

          <View>
            <Text style={styles.sectionLabel}>Doctor consultations</Text>
            <View style={{ gap: spacing.md }}>
              {MEDICAL.consultations.map((c, i) => (
                <Card key={i}>
                  <Text style={styles.doctor}>{c.doctor}</Text>
                  <Text style={styles.specialty}>
                    {c.specialty} · {c.date}
                  </Text>
                  <Text style={styles.notes}>{c.notes}</Text>
                </Card>
              ))}
            </View>
          </View>

          <View>
            <Text style={styles.sectionLabel}>Current care information</Text>
            <Card tint={colors.brandWash}>
              <Text style={styles.careInfo}>{MEDICAL.careInfo}</Text>
            </Card>
          </View>
        </Screen>
      </View>
    </RoleGuard>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  sectionLabel: { fontFamily: fonts.bold, fontSize: type.lg, color: colors.onSurface, marginBottom: spacing.sm },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  doctor: { fontFamily: fonts.bold, fontSize: type.lg, color: colors.onSurface },
  specialty: { fontFamily: fonts.medium, fontSize: type.base, color: colors.brandPrimary, marginTop: 2 },
  notes: { fontFamily: fonts.regular, fontSize: type.base, color: colors.muted, marginTop: spacing.xs, lineHeight: 24 },
  careInfo: { fontFamily: fonts.medium, fontSize: type.base, color: colors.onSurface, lineHeight: 26 },
}));
