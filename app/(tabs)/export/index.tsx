import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function ExportScreen() {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.title, { color: colors.textPrimary }]}>Export</Text>
      <View style={styles.empty}>
        <Feather name="share" size={40} color={colors.textSecondary} />
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: 12, textAlign: "center" }]}>
          PDF/CSV export arrives in Milestone 3.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  empty: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 32,
  },
});
