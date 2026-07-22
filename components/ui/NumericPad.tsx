import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme/ThemeProvider";

interface NumericPadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onBiometric?: () => void;
  showBiometric?: boolean;
}

const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
];

export function NumericPad({ onDigit, onBackspace, onBiometric, showBiometric }: NumericPadProps) {
  const { colors } = useTheme();

  const handleDigit = (digit: string) => {
    Haptics.selectionAsync();
    onDigit(digit);
  };

  const handleBackspace = () => {
    Haptics.selectionAsync();
    onBackspace();
  };

  const handleBiometric = () => {
    Haptics.selectionAsync();
    onBiometric?.();
  };

  return (
    <View style={styles.grid}>
      {KEYS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((digit) => (
            <Pressable
              key={digit}
              onPress={() => handleDigit(digit)}
              style={[styles.key, { backgroundColor: colors.surfaceSolid }]}
            >
              <Text style={[styles.keyLabel, { color: colors.textPrimary }]}>{digit}</Text>
            </Pressable>
          ))}
        </View>
      ))}
      <View style={styles.row}>
        <Pressable
          onPress={handleBiometric}
          disabled={!showBiometric}
          style={[styles.key, { backgroundColor: showBiometric ? colors.surfaceSolid : "transparent" }]}
        >
          {showBiometric ? <Feather name="lock" size={22} color={colors.primary} /> : null}
        </Pressable>
        <Pressable
          onPress={() => handleDigit("0")}
          style={[styles.key, { backgroundColor: colors.surfaceSolid }]}
        >
          <Text style={[styles.keyLabel, { color: colors.textPrimary }]}>0</Text>
        </Pressable>
        <Pressable onPress={handleBackspace} style={[styles.key, { backgroundColor: colors.surfaceSolid }]}>
          <Feather name="delete" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  key: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  keyLabel: {
    fontSize: 24,
    fontWeight: "600",
  },
});
