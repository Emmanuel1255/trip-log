import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { DATE_FORMAT } from "@/lib/utils/date";

interface DateTimeFieldProps {
  label?: string;
  value: Date | null;
  mode: "date" | "time";
  onChange: (date: Date) => void;
  placeholder?: string;
  error?: string;
}

export function DateTimeField({
  label,
  value,
  mode,
  onChange,
  placeholder = "Select...",
  error,
}: DateTimeFieldProps) {
  const { colors, radii, typography } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const displayValue = value ? format(value, mode === "date" ? DATE_FORMAT : "hh:mm a") : null;

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>
          {label}
        </Text>
      ) : null}
      <Pressable
        onPress={() => setIsOpen(true)}
        style={[
          styles.field,
          {
            backgroundColor: colors.surfaceSolid,
            borderColor: error ? colors.alert : colors.hairline,
            borderRadius: radii.card,
          },
        ]}
      >
        <Text style={{ color: displayValue ? colors.textPrimary : colors.textSecondary }}>
          {displayValue ?? placeholder}
        </Text>
        <Feather name={mode === "date" ? "calendar" : "clock"} size={18} color={colors.textSecondary} />
      </Pressable>
      {error ? (
        <Text style={[typography.caption, { color: colors.alert, marginTop: 4 }]}>{error}</Text>
      ) : null}

      {isOpen ? (
        <DateTimePicker
          value={value ?? new Date()}
          mode={mode}
          display={Platform.OS === "ios" ? (mode === "date" ? "inline" : "spinner") : "default"}
          onChange={(_event, date) => {
            setIsOpen(Platform.OS === "ios");
            if (date) onChange(date);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
