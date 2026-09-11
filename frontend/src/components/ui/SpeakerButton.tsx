import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SpeakerHigh, SpeakerSimpleSlash } from "phosphor-react-native";

import { useReadAloud } from "@/src/audio/read-aloud";
import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

type SpeakerButtonProps = {
  text: string;
  soundKey: string;
  label?: string;
  testID?: string;
};

/** Warm read-aloud button. Tapping speaks the text; tapping again stops. */
export function SpeakerButton({ text, soundKey, label = "Play description", testID }: SpeakerButtonProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { speak, stop, activeKey, loadingKey } = useReadAloud();

  const speaking = activeKey === soundKey;
  const loading = loadingKey === soundKey;

  const onPress = () => {
    if (speaking) stop();
    else speak(text, soundKey);
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, speaking && styles.btnActive, pressed && styles.pressed]}
      testID={testID ?? "speaker-button"}
      hitSlop={8}
    >
      {loading ? (
        <ActivityIndicator color={colors.brandPrimary} />
      ) : speaking ? (
        <SpeakerSimpleSlash size={24} color={colors.onBrandPrimary} weight="fill" />
      ) : (
        <SpeakerHigh size={24} color={colors.brandPrimary} weight="fill" />
      )}
      <Text style={[styles.text, speaking && styles.textActive]}>
        {loading ? "Loading…" : speaking ? "Stop" : label}
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    alignSelf: "flex-start",
    backgroundColor: colors.brandWash,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 52,
  },
  btnActive: { backgroundColor: colors.brandPrimary },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  text: { fontFamily: fonts.bold, fontSize: type.base, color: colors.brandPrimary },
  textActive: { color: colors.onBrandPrimary },
}));
