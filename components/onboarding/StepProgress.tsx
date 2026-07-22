import { StyleSheet, View } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

interface StepProgressProps {
  step: number;
  totalSteps: number;
}

export function StepProgress({ step, totalSteps }: StepProgressProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            { backgroundColor: index <= step ? colors.primary : colors.hairline },
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
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
