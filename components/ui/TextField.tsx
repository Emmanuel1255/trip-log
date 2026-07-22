import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function TextField({ label, error, style, secureTextEntry, ...rest }: TextFieldProps) {
  const { colors, radii, typography } = useTheme();
  const [isRevealed, setIsRevealed] = useState(false);
  const isPasswordField = secureTextEntry != null;

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>
          {label}
        </Text>
      ) : null}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isPasswordField ? secureTextEntry && !isRevealed : secureTextEntry}
          style={[
            styles.input,
            typography.body,
            {
              color: colors.textPrimary,
              backgroundColor: colors.surfaceSolid,
              borderColor: error ? colors.alert : colors.hairline,
              borderRadius: radii.card,
              paddingRight: isPasswordField ? 44 : 14,
            },
            style,
          ]}
          {...rest}
        />
        {isPasswordField ? (
          <Pressable
            onPress={() => setIsRevealed((current) => !current)}
            style={styles.toggle}
            hitSlop={8}
          >
            <Feather name={isRevealed ? "eye-off" : "eye"} size={18} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={[typography.caption, { color: colors.alert, marginTop: 4 }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputWrapper: {
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  toggle: {
    position: "absolute",
    right: 14,
    padding: 4,
  },
});
