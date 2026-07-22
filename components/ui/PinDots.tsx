import { StyleSheet, View } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

interface PinDotsProps {
  length: number;
  filled: number;
}

export function PinDots({ length, filled }: PinDotsProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: index < filled ? colors.primary : "transparent",
              borderColor: colors.primary,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginVertical: 24,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
});
