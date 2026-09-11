import { useState } from "react";
import { Pressable, Text, TextInput, View, type KeyboardTypeOptions } from "react-native";
import { Eye, EyeSlash } from "phosphor-react-native";

import { fonts, makeStyles, radius, spacing, type, useTheme } from "@/src/theme";

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secure?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  testID?: string;
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secure = false,
  keyboardType = "default",
  autoCapitalize = "none",
  testID,
}: TextFieldProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [hidden, setHidden] = useState(secure);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, focused && styles.fieldFocused]}>
        <TextInput
          testID={testID}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={12} testID={`${testID}-toggle`}>
            {hidden ? (
              <EyeSlash size={24} color={colors.muted} />
            ) : (
              <Eye size={24} color={colors.brandPrimary} />
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  group: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: type.base,
    color: colors.onSurface,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    minHeight: 60,
  },
  fieldFocused: {
    borderColor: colors.brandPrimary,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: type.base,
    color: colors.onSurface,
    paddingVertical: spacing.md,
  },
}));
