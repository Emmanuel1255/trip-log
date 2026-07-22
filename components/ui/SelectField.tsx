import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label?: string;
  placeholder?: string;
  value: string | null;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
  emptyMessage?: string;
  disabled?: boolean;
}

export function SelectField({
  label,
  placeholder = "Select...",
  value,
  options,
  onChange,
  error,
  emptyMessage = "Nothing to select yet.",
  disabled,
}: SelectFieldProps) {
  const { colors, radii, typography } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>
          {label}
        </Text>
      ) : null}
      <Pressable
        onPress={() => !disabled && setIsOpen(true)}
        style={[
          styles.field,
          {
            backgroundColor: colors.surfaceSolid,
            borderColor: error ? colors.alert : colors.hairline,
            borderRadius: radii.card,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        <Text
          style={[typography.body, { color: selected ? colors.textPrimary : colors.textSecondary }]}
          numberOfLines={1}
        >
          {selected ? selected.label : placeholder}
        </Text>
        {disabled ? (
          <Feather name="lock" size={16} color={colors.textSecondary} />
        ) : (
          <Feather name="chevron-down" size={18} color={colors.textSecondary} />
        )}
      </Pressable>
      {error ? (
        <Text style={[typography.caption, { color: colors.alert, marginTop: 4 }]}>{error}</Text>
      ) : null}

      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.surfaceSolid, borderTopLeftRadius: radii.glass, borderTopRightRadius: radii.glass }]}
          >
            {label ? (
              <Text style={[typography.title, { color: colors.textPrimary, marginBottom: 12 }]}>
                {label}
              </Text>
            ) : null}
            {options.length === 0 ? (
              <Text style={[typography.body, { color: colors.textSecondary, textAlign: "center", padding: 24 }]}>
                {emptyMessage}
              </Text>
            ) : (
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                style={styles.list}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      onChange(item.value);
                      setIsOpen(false);
                    }}
                    style={[styles.option, { borderBottomColor: colors.hairline }]}
                  >
                    <Text
                      style={[
                        typography.body,
                        { color: item.value === value ? colors.primary : colors.textPrimary },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.value === value ? (
                      <Feather name="check" size={18} color={colors.primary} />
                    ) : null}
                  </Pressable>
                )}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "70%",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  list: {
    flexGrow: 0,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
});
