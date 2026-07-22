import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { StepProgress } from "@/components/onboarding/StepProgress";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function SetupCompleteScreen() {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StepProgress step={7} totalSteps={8} />
      <View style={[styles.iconWrap, { backgroundColor: `${colors.success}22` }]}>
        <Feather name="check" size={40} color={colors.success} />
      </View>
      <Text style={[typography.title, { color: colors.textPrimary, textAlign: "center" }]}>
        You&rsquo;re All Set!
      </Text>
      <Text
        style={[typography.body, { color: colors.textSecondary, textAlign: "center", marginTop: 8 }]}
      >
        Your vehicle and driver have been added successfully. You can change or add more anytime
        from the app.
      </Text>

      <View style={styles.actions}>
        <Button label="Go to Home" onPress={() => router.replace("/(tabs)")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconWrap: {
    alignSelf: "center",
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  actions: {
    marginTop: 32,
  },
});
