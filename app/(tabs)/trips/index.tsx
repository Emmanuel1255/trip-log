import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function TripsScreen() {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.title, { color: colors.textPrimary }]}>Trips</Text>
      <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 24 }]}>
        All Trip Logs
      </Text>
      <View style={styles.empty}>
        <Feather name="clipboard" size={40} color={colors.textSecondary} />
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: 12, textAlign: "center" }]}>
          Trip logging arrives in Milestone 2. Use the + button once it&rsquo;s wired up.
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
