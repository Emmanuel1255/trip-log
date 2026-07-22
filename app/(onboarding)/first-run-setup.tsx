import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { StepProgress } from "@/components/onboarding/StepProgress";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function FirstRunSetupScreen() {
  const { colors, typography, radii } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StepProgress step={4} totalSteps={8} />
      <View style={[styles.iconWrap, { backgroundColor: colors.lightAccent, borderRadius: radii.glass }]}>
        <Feather name="clipboard" size={40} color={colors.deepAccent} />
      </View>
      <Text style={[typography.title, { color: colors.textPrimary, textAlign: "center" }]}>
        Let&rsquo;s get you started
      </Text>
      <Text
        style={[typography.body, { color: colors.textSecondary, textAlign: "center", marginTop: 8 }]}
      >
        To log trips, you need at least one vehicle and one driver. We&rsquo;ll help you set them up.
      </Text>

      <View style={styles.actions}>
        <Button
          label="Add Your First Vehicle"
          onPress={() => router.push("/(onboarding)/add-first-vehicle")}
        />
        <Pressable onPress={() => router.replace("/(tabs)")} style={styles.skip}>
          <Text style={[typography.body, { color: colors.primary }]}>Skip for now</Text>
        </Pressable>
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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  actions: {
    marginTop: 32,
  },
  skip: {
    alignItems: "center",
    marginTop: 16,
  },
});
