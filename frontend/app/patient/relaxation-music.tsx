import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import { CloudRain, MusicNotes, Waveform, Wind } from "phosphor-react-native";

import { FeatureRow } from "@/src/components/ui/FeatureRow";
import { PatientTopBar } from "@/src/components/ui/PatientTopBar";
import { Screen } from "@/src/components/ui/Screen";
import { useToast } from "@/src/components/ui/toast";
import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

const HERO = "https://images.unsplash.com/photo-1522075782449-e45a34f1ddfb?crop=entropy&cs=srgb&fm=jpg&w=900&q=80";

const SOUNDS = [
  { title: "Gentle Piano", subtitle: "Soft, slow melodies", icon: MusicNotes },
  { title: "Rain Sounds", subtitle: "Calming rainfall", icon: CloudRain },
  { title: "Ocean Waves", subtitle: "Slow, rolling waves", icon: Waveform },
  { title: "Forest Breeze", subtitle: "Leaves and soft wind", icon: Wind },
];

export default function RelaxationMusic() {
  const router = useRouter();
  const toast = useToast();
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      <PatientTopBar title="Music & Sounds" onHome={() => router.navigate("/patient/home")} />
      <Screen scroll contentGap={spacing.md} testID="relaxation-music-screen">
        <Image source={{ uri: HERO }} style={styles.hero} contentFit="cover" transition={300} />
        <Text style={styles.lead}>Pick a sound and let yourself unwind.</Text>
        {SOUNDS.map((s) => (
          <FeatureRow
            key={s.title}
            title={s.title}
            subtitle={s.subtitle}
            tint={colors.tileRelaxation}
            icon={(c, size) => <s.icon size={size} color={c} weight="fill" />}
            onPress={() => toast("Playing sounds coming soon", "info")}
            testID={`sound-${s.title}`}
          />
        ))}
      </Screen>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  hero: { width: "100%", height: 170, borderRadius: radius.lg, backgroundColor: colors.brandWash },
  lead: { fontFamily: fonts.medium, fontSize: type.lg, color: colors.muted, marginVertical: spacing.xs },
}));
