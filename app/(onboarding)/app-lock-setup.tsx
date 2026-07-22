import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NumericPad } from "@/components/ui/NumericPad";
import { PinDots } from "@/components/ui/PinDots";
import { StepProgress } from "@/components/onboarding/StepProgress";
import { setupPin } from "@/lib/auth/appLock";
import { useTheme } from "@/lib/theme/ThemeProvider";

const PIN_LENGTH = 6;

export default function AppLockSetupScreen() {
  const { colors, typography } = useTheme();
  const [phase, setPhase] = useState<"create" | "confirm">("create");
  const [firstPin, setFirstPin] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleDigit = async (digit: string) => {
    const next = (pin + digit).slice(0, PIN_LENGTH);
    setPin(next);
    setError(null);

    if (next.length === PIN_LENGTH) {
      if (phase === "create") {
        setFirstPin(next);
        setPin("");
        setPhase("confirm");
        return;
      }

      if (next === firstPin) {
        await setupPin(next);
        router.replace("/(onboarding)/enable-biometrics");
      } else {
        setError("PINs don't match. Try again.");
        setPin("");
        setFirstPin("");
        setPhase("create");
      }
    }
  };

  const handleBackspace = () => setPin((current) => current.slice(0, -1));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StepProgress step={2} totalSteps={8} />
      <Feather name="lock" size={48} color={colors.primary} style={styles.icon} />
      <Text style={[typography.title, { color: colors.textPrimary, textAlign: "center" }]}>
        App Lock Setup
      </Text>
      <Text
        style={[typography.body, { color: colors.textSecondary, textAlign: "center", marginTop: 4 }]}
      >
        Set a PIN to protect your data
      </Text>
      <Text
        style={[typography.caption, { color: colors.textSecondary, textAlign: "center", marginTop: 24 }]}
      >
        {phase === "create" ? "Create PIN" : "Confirm PIN"}
      </Text>

      <PinDots length={PIN_LENGTH} filled={pin.length} />

      {error ? (
        <Text style={[typography.caption, { color: colors.alert, textAlign: "center" }]}>
          {error}
        </Text>
      ) : null}

      <View style={styles.pad}>
        <NumericPad onDigit={handleDigit} onBackspace={handleBackspace} />
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
  icon: {
    alignSelf: "center",
    marginBottom: 16,
  },
  pad: {
    marginTop: 24,
  },
});
