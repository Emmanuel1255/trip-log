import { Feather } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { StepProgress } from "@/components/onboarding/StepProgress";
import { setBiometricEnabled } from "@/lib/auth/appLock";
import { useTheme } from "@/lib/theme/ThemeProvider";

const FEATURES = [
  { icon: "zap" as const, title: "Quick Access", body: "Unlock in a tap" },
  { icon: "shield" as const, title: "More Secure", body: "Your data stays protected" },
  { icon: "wifi-off" as const, title: "Works Offline", body: "Biometric unlock works without internet" },
];

export default function EnableBiometricsScreen() {
  const { colors, typography, radii } = useTheme();
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setAvailable(hasHardware && isEnrolled);
    })();
  }, []);

  const goNext = () => router.replace("/(onboarding)/first-run-setup");

  const handleEnable = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Confirm biometric unlock",
    });
    if (result.success) {
      await setBiometricEnabled(true);
    }
    goNext();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StepProgress step={3} totalSteps={8} />
      <Feather name="smartphone" size={48} color={colors.primary} style={styles.icon} />
      <Text style={[typography.title, { color: colors.textPrimary, textAlign: "center" }]}>
        Enable Biometrics
      </Text>
      <Text
        style={[typography.body, { color: colors.textSecondary, textAlign: "center", marginTop: 4 }]}
      >
        Use your fingerprint or face to unlock
      </Text>

      <View style={styles.features}>
        {FEATURES.map((feature) => (
          <View key={feature.title} style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: colors.lightAccent, borderRadius: radii.card }]}>
              <Feather name={feature.icon} size={18} color={colors.deepAccent} />
            </View>
            <View style={styles.featureText}>
              <Text style={[typography.body, { color: colors.textPrimary, fontWeight: "600" }]}>
                {feature.title}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>{feature.body}</Text>
            </View>
          </View>
        ))}
      </View>

      {available ? (
        <Button label="Enable Biometrics" onPress={handleEnable} />
      ) : (
        <Button label="Continue" onPress={goNext} />
      )}
      <Pressable onPress={goNext} style={styles.notNow}>
        <Text style={[typography.body, { color: colors.primary }]}>Not Now</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  icon: {
    alignSelf: "center",
    marginBottom: 16,
  },
  features: {
    marginVertical: 32,
    gap: 20,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
  },
  notNow: {
    alignItems: "center",
    marginTop: 16,
  },
});
