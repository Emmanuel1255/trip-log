import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

interface SegmentedControlProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const { colors, radii } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.hairline, borderRadius: radii.card },
      ]}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.segment,
              {
                backgroundColor: selected ? colors.primary : "transparent",
                borderRadius: radii.card - 2,
              },
            ]}
          >
            <Text
              style={{
                color: selected ? "#fff" : colors.textSecondary,
                fontWeight: "600",
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
});
